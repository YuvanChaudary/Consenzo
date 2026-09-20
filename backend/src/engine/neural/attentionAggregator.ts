import { LATENT_DIM, unitNorm } from './vectorizer';

export interface AttentionMemberResult {
  participantId: string;
  weight: number; // Normalized attention alpha_{m, i} in [0, 1], sum = 1.0
  rawEnergy: number;
}

export interface GroupAttentionResult {
  groupVector: number[]; // g_i in R^d
  attentionWeights: AttentionMemberResult[];
}

export class AttentionAggregator {
  private readonly dim: number;
  private readonly W_u: number[][];
  private readonly W_v: number[][];
  private readonly w_attn: number[];
  private readonly temperature: number;

  constructor(dim: number = LATENT_DIM, temperature: number = 0.8) {
    this.dim = dim;
    this.temperature = temperature;

    // Deterministic orthogonal/Xavier weight initialization
    this.W_u = this.initWeightMatrix(dim, dim, 42);
    this.W_v = this.initWeightMatrix(dim, dim, 137);
    this.w_attn = this.initWeightVector(dim, 256);
  }

  /**
   * Deterministic pseudo-random pseudo-orthogonal weight initialization (Xavier/Glorot)
   */
  private initWeightMatrix(rows: number, cols: number, seed: number): number[][] {
    const matrix: number[][] = [];
    const scale = Math.sqrt(2.0 / (rows + cols));
    let s = seed;
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        // Linear congruential generator for deterministic weights
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
   * Matrix-vector product: W * x
   */
  private matVec(W: number[][], x: number[]): number[] {
    const out = new Array(W.length).fill(0);
    for (let r = 0; r < W.length; r++) {
      let sum = 0;
      for (let c = 0; c < x.length; c++) {
        sum += W[r][c] * x[c];
      }
      out[r] = sum;
    }
    return out;
  }

  /**
   * Dot product: a . b
   */
  private dot(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
    return sum;
  }

  /**
   * LeakyReLU non-linear activation
   */
  private leakyRelu(x: number, alpha: number = 0.01): number {
    return x >= 0 ? x : alpha * x;
  }

  /**
   * AGREE Neural Attention Aggregation (Cao et al., SIGIR 2018):
   * For each member m, compute attention energy a(m, i) conditioned on candidate product v_i.
   * Apply softmax to get normalized influence weights alpha_{m, i}.
   * Aggregate: g_i = sum_m (alpha_{m, i} * u_m).
   */
  public aggregate(
    memberEmbeddings: Array<{ participantId: string; embedding: number[] }>,
    productEmbedding: number[]
  ): GroupAttentionResult {
    if (memberEmbeddings.length === 0) {
      return {
        groupVector: new Array(this.dim).fill(0),
        attentionWeights: [],
      };
    }

    if (memberEmbeddings.length === 1) {
      return {
        groupVector: memberEmbeddings[0].embedding.slice(),
        attentionWeights: [
          {
            participantId: memberEmbeddings[0].participantId,
            weight: 1.0,
            rawEnergy: 1.0,
          },
        ],
      };
    }

    // Precompute product projection W_v * v_i
    const vProj = this.matVec(this.W_v, productEmbedding);

    // Compute attention energy a(m, i) for each member
    const energies: Array<{ participantId: string; energy: number }> = [];
    let maxEnergy = -Infinity;

    for (const member of memberEmbeddings) {
      const uProj = this.matVec(this.W_u, member.embedding);
      // Joint projection: h_m = LeakyReLU(W_u * u_m + W_v * v_i)
      const h_m: number[] = new Array(this.dim);
      for (let d = 0; d < this.dim; d++) {
        h_m[d] = this.leakyRelu(uProj[d] + vProj[d]);
      }
      // a(m, i) = w_attn^T * h_m
      const rawEnergy = this.dot(this.w_attn, h_m);
      energies.push({ participantId: member.participantId, energy: rawEnergy });
      if (rawEnergy > maxEnergy) maxEnergy = rawEnergy;
    }

    // Softmax with numerical stability (subtract max) and temperature
    const expEnergies: number[] = [];
    let sumExp = 0;
    for (const e of energies) {
      const scaledExp = Math.exp((e.energy - maxEnergy) / this.temperature);
      expEnergies.push(scaledExp);
      sumExp += scaledExp;
    }

    const attentionWeights: AttentionMemberResult[] = [];
    const groupVector = new Array(this.dim).fill(0);

    for (let m = 0; m < memberEmbeddings.length; m++) {
      const alpha = sumExp > 0 ? expEnergies[m] / sumExp : 1.0 / memberEmbeddings.length;
      attentionWeights.push({
        participantId: memberEmbeddings[m].participantId,
        weight: Number(alpha.toFixed(4)),
        rawEnergy: energies[m].energy,
      });

      // Group representation: g_i = sum (alpha_{m, i} * u_m)
      const u_m = memberEmbeddings[m].embedding;
      for (let d = 0; d < this.dim; d++) {
        groupVector[d] += alpha * u_m[d];
      }
    }

    return {
      groupVector: unitNorm(groupVector),
      attentionWeights,
    };
  }
}

export const attentionAggregator = new AttentionAggregator();
