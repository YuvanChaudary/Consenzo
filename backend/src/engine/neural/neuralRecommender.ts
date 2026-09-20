import { ParticipantPreferenceProfile } from '@shared/types/preferences';
import { ProductScore, UtilityBreakdown } from '@shared/types/scoring';
import { resolveProductAttribute } from '../../utils/attributeResolver';
import { neuralVectorizer, LATENT_DIM } from './vectorizer';
import { attentionAggregator, GroupAttentionResult } from './attentionAggregator';

export interface NeuralConsensusScoreResult {
  groupScore: number; // [0, 10]
  individualUtilities: number[];
  attentionResult: GroupAttentionResult;
}

export class NeuralRecommender {
  private readonly W_mlp1: number[][]; // 64 x 128
  private readonly b_mlp1: number[]; // 64
  private readonly w_out: number[]; // 64
  private readonly b_out: number;

  constructor() {
    // Deterministic Xavier initialization for NeuMF interaction layers
    const inDim = LATENT_DIM * 4; // [g, v, g*v, |g-v|] = 128
    const hiddenDim = 64;
    this.W_mlp1 = this.initWeightMatrix(hiddenDim, inDim, 777);
    this.b_mlp1 = new Array(hiddenDim).fill(0.01);
    this.w_out = this.initWeightVector(hiddenDim, 999);
    this.b_out = 0.2;
  }

  private initWeightMatrix(rows: number, cols: number, seed: number): number[][] {
    const matrix: number[][] = [];
    const scale = Math.sqrt(2.0 / (rows + cols));
    let s = seed;
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        s = (s * 1664525 + 1013904223) % 4294967296;
        const uniform = (s / 4294967296.0) * 2.0 - 1.0;
        row.push(uniform * scale);
      }
      matrix.push(row);
    }
    return matrix;
  }

  private initWeightVector(size: number, seed: number): number[] {
    const vec: number[] = [];
    const scale = Math.sqrt(1.0 / size);
    let s = seed;
    for (let i = 0; i < size; i++) {
      s = (s * 1664525 + 1013904223) % 4294967296;
      const uniform = (s / 4294967296.0) * 2.0 - 1.0;
      vec.push(uniform * scale);
    }
    return vec;
  }

  /**
   * GELU (Gaussian Error Linear Unit) activation function
   */
  private gelu(x: number): number {
    return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
  }

  /**
   * Sigmoid function: maps R to [0, 1]
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x))));
  }

  /**
   * Compute individual participant utility using continuous metric space alignment.
   * Eliminates hardcoded piecewise thresholds with vector cosine + RBF distance kernels.
   */
  public computeIndividualUtility(
    product: any,
    profile: ParticipantPreferenceProfile
  ): ProductScore {
    const u_vec = neuralVectorizer.vectorizeProfile(profile);
    const v_vec = neuralVectorizer.vectorizeProduct(product);

    // 1. Vector Cosine Similarity
    let dot = 0;
    let normU = 0;
    let normV = 0;
    let distSq = 0;
    for (let d = 0; d < LATENT_DIM; d++) {
      dot += u_vec[d] * v_vec[d];
      normU += u_vec[d] * u_vec[d];
      normV += v_vec[d] * v_vec[d];
      const diff = u_vec[d] - v_vec[d];
      distSq += diff * diff;
    }
    const cosSim = (normU > 0 && normV > 0) ? dot / (Math.sqrt(normU) * Math.sqrt(normV)) : 0;
    const rbfSim = Math.exp(-distSq / (2.0 * 0.8 * 0.8));

    // 2. Continuous attribute satisfaction breakdown
    const breakdown: UtilityBreakdown[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const constraint of profile.constraints || []) {
      const isBudget = constraint.attribute === 'priceInr' || constraint.attribute === 'price' || constraint.attribute === 'budget';
      const weight = constraint.weight ?? (isBudget ? 1.0 : 0.8);
      const actualValue = resolveProductAttribute(product, constraint.attribute);

      const sim = neuralVectorizer.attributeSimilarity(
        actualValue,
        constraint.value,
        constraint.attribute,
        constraint.operator || 'EQ'
      );

      breakdown.push({
        attribute: constraint.attribute,
        score: Number(sim.toFixed(3)),
        weight,
      });

      totalWeightedScore += sim * weight;
      totalWeight += weight;
    }

    // 3. Mathematical Utility Blend:
    // Blend the micro-attribute similarity with the macro continuous latent space projection
    const microUtility = totalWeight > 0 ? totalWeightedScore / totalWeight : (Number(product.rating || 4.2) / 5.0);
    const macroLatentScore = this.sigmoid(2.0 * cosSim + 1.5 * rbfSim - 0.4);

    const blendedUtility = 0.65 * microUtility + 0.35 * macroLatentScore;
    const finalUtility = Math.min(10.0, Math.max(0.5, blendedUtility * 10.0));

    return {
      productId: product.id || product.asin,
      totalUtility: Number(finalUtility.toFixed(1)),
      breakdown: breakdown.map((b) => ({
        ...b,
        weight: totalWeight > 0 ? b.weight / totalWeight : 0,
      })),
    };
  }

  /**
   * Neural Group Consensus Score:
   * Aggregates member preferences using dynamic attention network, then runs
   * NeuMF non-linear interaction over the candidate item.
   */
  public evaluateGroupCandidate(
    product: any,
    profiles: ParticipantPreferenceProfile[]
  ): NeuralConsensusScoreResult {
    const v_vec = neuralVectorizer.vectorizeProduct(product);
    const memberEmbeddings = profiles.map((p) => ({
      participantId: p.participantId,
      embedding: neuralVectorizer.vectorizeProfile(p),
    }));

    // AGREE Attention Aggregation
    const attentionResult = attentionAggregator.aggregate(memberEmbeddings, v_vec);
    const g_vec = attentionResult.groupVector;

    // Construct interaction tensor: z_0 = [g || v || g*v || |g-v|]
    const z_0 = new Array(LATENT_DIM * 4);
    for (let d = 0; d < LATENT_DIM; d++) {
      z_0[d] = g_vec[d];
      z_0[LATENT_DIM + d] = v_vec[d];
      z_0[LATENT_DIM * 2 + d] = g_vec[d] * v_vec[d];
      z_0[LATENT_DIM * 3 + d] = Math.abs(g_vec[d] - v_vec[d]);
    }

    // Forward MLP Layer 1 with GELU
    const hidden = new Array(64).fill(0);
    for (let r = 0; r < 64; r++) {
      let sum = this.b_mlp1[r];
      const row = this.W_mlp1[r];
      for (let c = 0; c < z_0.length; c++) {
        sum += row[c] * z_0[c];
      }
      hidden[r] = this.gelu(sum);
    }

    // Output Prediction Layer
    let outLogit = this.b_out;
    for (let i = 0; i < 64; i++) {
      outLogit += this.w_out[i] * hidden[i];
    }
    const rawNeuralScore = this.sigmoid(outLogit) * 10.0;

    // Individual utilities
    const individualUtilities = profiles.map(
      (p) => this.computeIndividualUtility(product, p).totalUtility
    );

    // Weighted mean utility according to attention influence
    let attnWeightedSum = 0;
    for (let m = 0; m < profiles.length; m++) {
      const alpha = attentionResult.attentionWeights[m]?.weight ?? (1.0 / profiles.length);
      attnWeightedSum += alpha * individualUtilities[m];
    }

    // Net neural group score combining NeuMF interaction and attention-weighted satisfaction
    const groupScore = Number((0.5 * rawNeuralScore + 0.5 * attnWeightedSum).toFixed(2));

    return {
      groupScore,
      individualUtilities,
      attentionResult,
    };
  }
}

export const neuralRecommender = new NeuralRecommender();
