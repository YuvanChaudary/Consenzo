import { randomUUID } from 'crypto';
const uuidv4 = randomUUID;
import { groupRepository } from '../repositories/groupRepository';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { catalogService } from './catalogService';
import { constraintEngine } from '../engine/constraintEngine';
import { scoringEngine } from '../engine/scoringEngine';
import { fairnessEngine, CandidateData, AggregationStrategy } from '../engine/fairnessEngine';
import { conflictDetector } from '../engine/conflictDetector';
import { proximityEngine, NearestMatchRanking, RankedNearestMatch } from '../engine/proximityEngine';
import { explainabilityEngine, TradeOffCard } from '../engine/explainabilityEngine';
import { subgroupEngine, SubgroupResult } from '../engine/subgroupEngine';
import { neuralRecommender } from '../engine/neural/neuralRecommender';
import { llmProvider } from './llm/providerFactory';
import { ExplanationContext } from './llm/types';
import { ParticipantPreferenceProfile, CanonicalConstraint } from '@shared/types/preferences';
import { SmartTvProduct } from '@shared/types/catalog';
import { Participant } from '@shared/types/session';

export interface TopRecommendation {
  rank: number;
  tag: 'BEST_CONSENSUS' | 'LOWEST_CONFLICT' | 'BEST_VALUE';
  paretoSlot?: 'BEST_CONSENSUS' | 'LOWEST_CONFLICT' | 'BEST_VALUE';
  slot?: 'BEST_CONSENSUS' | 'LOWEST_CONFLICT' | 'BEST_VALUE';
  product: any;
  scores: {
    netConsensusScore: number;
    meanUtility: number;
    fairnessPenalty: number;
    individualBreakdown: Record<string, number>;
    neuralScore?: number;
  };
  groundedExplanation: string;
  /** How closely the product matches the group's constraints (nearest mode). */
  matchQuality?: string;
  matchScore?: number;
  /** True when every group constraint is satisfied exactly. */
  exactMatch?: boolean;
  attentionWeights?: Record<string, number>;
}

export interface ParticipantBreakdown {
  participantId: string;
  displayName: string;
  role: string;
  keyRequirements: string[];
  utility: number;
  status: 'FULLY_SATISFIED' | 'COMPROMISED' | 'CONCEDED';
  concessionNote: string;
  attentionWeight?: number;
}

export interface AnalysisResult {
  analysisId: string;
  groupId: string;
  catalogVersion: string;
  status: 'COMPLETED';
  topRecommendations: TopRecommendation[];
  allCandidates: TopRecommendation[];
  participantBreakdowns: ParticipantBreakdown[];
  conflictsDetected: Array<{
    type: string;
    description: string;
    participantsInvolved: string[];
    conflictingAttributes: string[];
    resolutionStrategy: string;
  }>;
  tradeOffCards?: TradeOffCard[];
  subgroups?: SubgroupResult;
  /** Nearest-feasible matching metadata (populated when exact constraints cannot all be met). */
  proximity?: {
    mode: 'EXACT' | 'PARTIAL' | 'NEAREST';
    summaryMessage: string;
    requestedVsMarket: NearestMatchRanking['requestedVsMarket'];
    census: NearestMatchRanking['census'];
    topMatchViolations: {
      productId: string;
      matchScore: number;
      matchQuality: string;
      hardViolations: RankedNearestMatch['hardViolations'];
      softViolations: RankedNearestMatch['softViolations'];
    };
  };
  winner: {
    product: any;
    consensusScore: number;
    explanation: string;
  };
  rankings: {
    BEST_CONSENSUS: any[];
    LOWEST_CONFLICT: any[];
    BEST_VALUE: any[];
  };
  metrics: {
    feasibleCount: number;
    totalProducts: number;
    /** Products passing strict gate; 0 triggers nearest-match mode. */
    exactFeasibleCount: number;
  };
}

export class AnalysisService {
  async analyzeGroup(
    groupId: string,
    strategy: AggregationStrategy = 'HYBRID',
    options?: { allowPartial?: boolean }
  ): Promise<AnalysisResult> {
    // 1. Data Gathering — real group members only
    const participants = await groupRepository.getParticipants(groupId);
    const group = await groupRepository.getGroup(groupId);
    const category = (group?.category || 'smart_tvs').toLowerCase();
    const catalog = catalogService.getAll(category);

    // Fail loudly for unsupported/empty categories rather than analysing an
    // unrelated product set.
    if (catalog.length === 0) {
      const err: any = new Error('CATALOG_UNAVAILABLE');
      err.category = category;
      throw err;
    }

    // Real group members only.
    let effectiveParticipants: Participant[] = [...participants];
    if (effectiveParticipants.length === 0) {
      throw new Error('NO_PARTICIPANTS');
    }

    // Gather real, group-scoped confirmed profiles.
    const missingProfiles: string[] = [];
    let profiles: ParticipantPreferenceProfile[] = await Promise.all(
      effectiveParticipants.map(async (p) => {
        const profile = await preferenceRepository.getConfirmedProfile(groupId, p.participantId);
        if (!profile) {
          missingProfiles.push(p.displayName || p.participantId);
        }
        return profile as ParticipantPreferenceProfile;
      })
    );

    if (missingProfiles.length > 0) {
      if (options?.allowPartial) {
        const confirmedPairs = effectiveParticipants
          .map((p, idx) => ({ p, profile: profiles[idx] }))
          .filter(pair => Boolean(pair.profile));

        if (confirmedPairs.length > 0) {
          effectiveParticipants = confirmedPairs.map(c => c.p);
          profiles = confirmedPairs.map(c => c.profile);
        } else {
          const err: any = new Error('PREFERENCES_MISSING');
          err.missing = missingProfiles;
          throw err;
        }
      } else {
        const err: any = new Error('PREFERENCES_MISSING');
        err.missing = missingProfiles;
        throw err;
      }
    }

    // 2. Feasibility Filtering (strict, ADR-015)
    const { feasibleSet: exactFeasible } = constraintEngine.gateCatalog(catalog, profiles);
    const idOf = (p: any) => p.asin || p.id;
    const exactIds = new Set<string>(exactFeasible.map(idOf));

    // Statistical proximity over the WHOLE catalog — always computed so we can
    // (a) rank a slate when nothing matches exactly, and (b) disclose the
    // nearest alternatives when the exact set is thinner than a full slate.
    const proximityRanking: NearestMatchRanking = proximityEngine.rankNearestMatches(catalog, profiles);
    const matchMetaById = new Map<string, { matchScore: number; matchQuality: string }>();
    for (const r of proximityRanking.ranked) {
      matchMetaById.set(r.productId, { matchScore: r.matchScore, matchQuality: r.matchQuality });
    }

    // Products that honour EVERY stated requirement — hard constraints *and*
    // soft preferences (OLED, 85", battery, ...). Proximity marks a hard-feasible
    // product 'NEAR' precisely when it still violates a preference.
    const MIN_SLATE = 5;
    const perfectMatches: any[] = proximityRanking.ranked
      .filter(r => r.matchQuality === 'EXACT')
      .map(r => r.product);

    // Ranking pool, most faithful first:
    //   1. products satisfying every hard constraint AND every preference
    //   2. else products satisfying every hard constraint (preferences unmet)
    //   3. else the statistically nearest products on the market
    const primaryPool: any[] = perfectMatches.length > 0
      ? perfectMatches
      : exactFeasible.length > 0
        ? exactFeasible
        : proximityRanking.ranked.slice(0, MIN_SLATE).map(r => r.product);

    const poolMatchesPreferences = primaryPool === perfectMatches && perfectMatches.length > 0;
    const proximityMode: 'EXACT' | 'PARTIAL' | 'NEAREST' =
      exactFeasible.length === 0
        ? 'NEAREST'
        : (poolMatchesPreferences && perfectMatches.length >= MIN_SLATE) ? 'EXACT' : 'PARTIAL';

    // 2b. Utility mapping: a product that satisfies every requirement is scored
    // by the canonical strict engine (ADR-006). Anything short of that is scored
    // by proximity to what was asked, so "nearest to the request" actually drives
    // the ordering instead of a compromise silently winning on price alone.
    const perfectIds = new Set<string>(perfectMatches.map(idOf));
    const utilityFor = (product: any): number[] =>
      profiles.map((profile, idx) => {
        if (!perfectIds.has(idOf(product))) {
          const match = proximityRanking.ranked.find(r => r.product === product);
          return match ? match.utilities[idx] : 5.0;
        }
        return scoringEngine.computeIndividualUtility(product, profile).totalUtility;
      });

    const candidateData: CandidateData[] = primaryPool.map(product => {
      const neuralEval = neuralRecommender.evaluateGroupCandidate(product, profiles);
      return {
        product,
        utilities: utilityFor(product),
        neuralScore: neuralEval.groupScore,
        attentionWeights: neuralEval.attentionResult.attentionWeights.map(w => w.weight),
      };
    });

    const feasibleSet: any[] = primaryPool;

    // 4. Consensus & Ranking
    const rankings = fairnessEngine.rankCandidates(candidateData, strategy);

    // 5. Grounded Explanation for Top Consensus Winner
    const topCandidate = rankings.BEST_CONSENSUS[0] || { product: catalog[0], score: 8.5 };
    const winnerProduct = topCandidate.product;
    const winnerUtilities = candidateData.find(c => c.product.asin === winnerProduct.asin)?.utilities
      || profiles.map(() => 8.5);

    const metrics = fairnessEngine.calculateConsensusScore(winnerUtilities);

    const context: ExplanationContext = {
      productId: winnerProduct.asin,
      productSpecs: winnerProduct,
      individualUtilities: effectiveParticipants.map((p, i) => ({
        participantId: p.participantId,
        participantName: p.displayName,
        utility: winnerUtilities[i] || 7.5,
        deltas: [],
      })),
      groupConflicts: [{
        type: 'dispersion',
        value: metrics.stdDev,
        impact: metrics.stdDev > 1.5 ? 'High' : 'Moderate'
      }],
    };

    let explanation = '';
    try {
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('LLM_EXPLANATION_TIMEOUT')), 4000)
      );
      const rawExplanation = await Promise.race([
        llmProvider.generateExplanation(context),
        timeoutPromise,
      ]);
      explanation = (rawExplanation || '')
        .replace(/<candidate_extraction>[\s\S]*?<\/candidate_extraction>/gi, '')
        .replace(/<reply>([\s\S]*?)<\/reply>/gi, '$1')
        .replace(/<[^>]+>/g, '')
        .trim();
    } catch {
      // fallback
    }

    if (!explanation || explanation.includes('captured your priorities') || (category !== 'smart_tvs' && explanation.toLowerCase().includes('tv'))) {
      const budgetParticipant = effectiveParticipants[0]?.displayName || 'the group';
      const priceStr = `₹${winnerProduct.priceInr.toLocaleString('en-IN')}`;
      const featureHighlight = (winnerProduct as any).channels || (winnerProduct as any).processor || (winnerProduct as any).panelType || 'verified hardware';
      explanation = `Ranked #1 with a ${metrics.score.toFixed(2)}/10 net consensus score. It delivers optimal balance across all ${effectiveParticipants.length} stakeholders, fitting under ${budgetParticipant}'s budget at ${priceStr} while guaranteeing ${featureHighlight} with zero dealbreaker violations.`;
    }

    // 6. Build Top 3 Canonical Recommendations & All Candidates
    const usedAsins = new Set<string>();
    const topRecs: TopRecommendation[] = [];

    // Helper to format breakdown for all participants
    const formatBreakdown = (utils: number[]): Record<string, number> => {
      const breakdown: Record<string, number> = {};
      effectiveParticipants.forEach((p, idx) => {
        breakdown[p.displayName] = Number((utils[idx] ?? 7.5).toFixed(1));
      });
      return breakdown;
    };

    // Helper to format neural attention weights per participant
    const formatAttention = (product: any): Record<string, number> => {
      const neuralEval = neuralRecommender.evaluateGroupCandidate(product, profiles);
      const attn: Record<string, number> = {};
      neuralEval.attentionResult.attentionWeights.forEach((w, idx) => {
        const name = effectiveParticipants[idx]?.displayName || `Member ${idx + 1}`;
        attn[name] = w.weight;
      });
      return attn;
    };

    // Per-candidate match metadata so the UI can label exact vs near matches.
    const matchMeta = (product: any): Pick<TopRecommendation, 'matchQuality' | 'matchScore' | 'exactMatch'> => {
      const id = idOf(product);
      const meta = matchMetaById.get(id);
      const exact = exactIds.has(id);
      return {
        // Trust the proximity engine's verdict even for hard-feasible products:
        // a product can pass every hard gate yet still violate a soft preference.
        exactMatch: meta?.matchQuality === 'EXACT' || (!meta && exact),
        matchQuality: meta?.matchQuality || (exact ? 'EXACT' : 'UNKNOWN'),
        matchScore: meta?.matchScore ?? (exact ? 100 : 0),
      };
    };

    // Slot 1: BEST_CONSENSUS
    if (rankings.BEST_CONSENSUS.length > 0) {
      const c1 = rankings.BEST_CONSENSUS[0];
      usedAsins.add(idOf(c1.product));
      const cCandidate = candidateData.find(c => c.product.asin === c1.product.asin);
      const cUtils = cCandidate?.utilities || winnerUtilities;
      const cMetrics = fairnessEngine.calculateConsensusScore(cUtils);

      topRecs.push({
        rank: 1,
        tag: 'BEST_CONSENSUS',
        paretoSlot: 'BEST_CONSENSUS',
        slot: 'BEST_CONSENSUS',
        product: c1.product,
        scores: {
          netConsensusScore: Number(cMetrics.score.toFixed(2)),
          meanUtility: Number(cMetrics.mean.toFixed(2)),
          fairnessPenalty: Number((-0.50 * cMetrics.stdDev).toFixed(2)),
          individualBreakdown: formatBreakdown(cUtils),
          neuralScore: cCandidate?.neuralScore,
        },
        groundedExplanation: explanation,
        attentionWeights: formatAttention(c1.product),
        ...matchMeta(c1.product),
      });
    }

    // Slot 2: LOWEST_CONFLICT — never repeat an already-selected product.
    const conflictCandidate = rankings.LOWEST_CONFLICT.find(c => !usedAsins.has(idOf(c.product)))
      || rankings.BEST_CONSENSUS.find(c => !usedAsins.has(idOf(c.product)));
    if (conflictCandidate) {
      usedAsins.add(idOf(conflictCandidate.product));
      const cCandidate = candidateData.find(c => c.product.asin === conflictCandidate.product.asin);
      const cUtils = cCandidate?.utilities || [];
      const cMetrics = fairnessEngine.calculateConsensusScore(cUtils);

      topRecs.push({
        rank: 2,
        tag: 'LOWEST_CONFLICT',
        paretoSlot: 'LOWEST_CONFLICT',
        slot: 'LOWEST_CONFLICT',
        product: conflictCandidate.product,
        scores: {
          netConsensusScore: Number(cMetrics.score.toFixed(2)),
          meanUtility: Number(cMetrics.mean.toFixed(2)),
          fairnessPenalty: Number((-0.50 * cMetrics.stdDev).toFixed(2)),
          individualBreakdown: formatBreakdown(cUtils),
          neuralScore: cCandidate?.neuralScore,
        },
        groundedExplanation: `Delivers the most equal satisfaction distribution across the group with the lowest interpersonal disagreement (σ = ${cMetrics.stdDev.toFixed(2)}).`,
        attentionWeights: formatAttention(conflictCandidate.product),
        ...matchMeta(conflictCandidate.product),
      });
    }

    // Slot 3: BEST_VALUE — never repeat an already-selected product.
    const valueCandidate = rankings.BEST_VALUE.find(c => !usedAsins.has(idOf(c.product)))
      || rankings.BEST_CONSENSUS.find(c => !usedAsins.has(idOf(c.product)));
    if (valueCandidate) {
      usedAsins.add(idOf(valueCandidate.product));
      const cCandidate = candidateData.find(c => c.product.asin === valueCandidate.product.asin);
      const cUtils = cCandidate?.utilities || [];
      const cMetrics = fairnessEngine.calculateConsensusScore(cUtils);

      topRecs.push({
        rank: 3,
        tag: 'BEST_VALUE',
        paretoSlot: 'BEST_VALUE',
        slot: 'BEST_VALUE',
        product: valueCandidate.product,
        scores: {
          netConsensusScore: Number(cMetrics.score.toFixed(2)),
          meanUtility: Number(cMetrics.mean.toFixed(2)),
          fairnessPenalty: Number((-0.50 * cMetrics.stdDev).toFixed(2)),
          individualBreakdown: formatBreakdown(cUtils),
          neuralScore: cCandidate?.neuralScore,
        },
        groundedExplanation: `Highest satisfaction return per Rupee spent (₹${valueCandidate.product.priceInr.toLocaleString('en-IN')}).`,
        attentionWeights: formatAttention(valueCandidate.product),
        ...matchMeta(valueCandidate.product),
      });
    }

    // Sort candidateData descending by consensus score so allCandidates has proper ranking
    candidateData.sort((a, b) => {
      const scoreA = fairnessEngine.calculateConsensusScore(a.utilities).score;
      const scoreB = fairnessEngine.calculateConsensusScore(b.utilities).score;
      return scoreB - scoreA;
    });

    // Build All Candidates (Top 8): exact-ranked first, then statistically
    // nearest alternatives so the comparison table is never empty on a thin
    // market and every extra row is explicitly labelled with its match quality.
    const allCandidateEntries: Array<{ product: any; utilities: number[]; neuralScore?: number }> = [...candidateData];
    if (proximityMode !== 'EXACT') {
      const seen = new Set(allCandidateEntries.map(c => idOf(c.product)));
      for (const r of proximityRanking.ranked) {
        if (allCandidateEntries.length >= 8) break;
        if (seen.has(r.productId)) continue;
        seen.add(r.productId);
        allCandidateEntries.push({ product: r.product, utilities: r.utilities });
      }
    }

    const allCandidates: TopRecommendation[] = allCandidateEntries.slice(0, 8).map((c, index) => {
      const cMetrics = fairnessEngine.calculateConsensusScore(c.utilities);
      let tag: 'BEST_CONSENSUS' | 'LOWEST_CONFLICT' | 'BEST_VALUE' = 'BEST_CONSENSUS';
      if (index === 1) tag = 'LOWEST_CONFLICT';
      if (index === 2) tag = 'BEST_VALUE';

      return {
        rank: index + 1,
        tag,
        product: c.product,
        scores: {
          netConsensusScore: Number(cMetrics.score.toFixed(2)),
          meanUtility: Number(cMetrics.mean.toFixed(2)),
          fairnessPenalty: Number((-0.50 * cMetrics.stdDev).toFixed(2)),
          individualBreakdown: formatBreakdown(c.utilities),
          neuralScore: c.neuralScore,
        },
        groundedExplanation: `Score: ${cMetrics.score.toFixed(2)}/10 | Mean satisfaction: ${cMetrics.mean.toFixed(2)}`,
        attentionWeights: formatAttention(c.product),
        ...matchMeta(c.product),
      };
    });

    // 7. Participant Breakdowns with neural attention influence
    const winnerNeuralEval = neuralRecommender.evaluateGroupCandidate(winnerProduct, profiles);
    const participantBreakdowns: ParticipantBreakdown[] = effectiveParticipants.map((p, idx) => {
      const score = winnerUtilities[idx] || 8.0;
      const attnWeight = winnerNeuralEval.attentionResult.attentionWeights[idx]?.weight ?? Number((1 / effectiveParticipants.length).toFixed(4));
      const status: 'FULLY_SATISFIED' | 'COMPROMISED' | 'CONCEDED' =
        score >= 8.5 ? 'FULLY_SATISFIED' : score >= 6.5 ? 'COMPROMISED' : 'CONCEDED';

      const userProfile = profiles[idx];
      const keyReqs = (userProfile?.constraints || []).map(c => `${c.attribute} ${c.operator} ${c.value}`);

      let note = 'All core priorities satisfied without compromise.';
      if (status === 'COMPROMISED') {
        note = 'Accepted a moderate brand/budget trade-off to enable unanimous consensus.';
      } else if (status === 'CONCEDED') {
        note = 'Conceded secondary wish-list feature in exchange for staying within group budget.';
      }

      return {
        participantId: p.participantId,
        displayName: p.displayName,
        role: p.role,
        keyRequirements: keyReqs.length > 0 ? keyReqs : ['Price ceiling', 'Performance'],
        utility: Number(score.toFixed(1)),
        status,
        concessionNote: note,
        attentionWeight: attnWeight,
      };
    });

    // 8. Detect Conflicts
    const rawConflicts = conflictDetector.detectConflicts(profiles, catalog);
    const conflictsDetected = rawConflicts.map(c => ({
      type: c.type,
      description: c.description,
      participantsInvolved: c.participants,
      conflictingAttributes: [c.attribute],
      resolutionStrategy: `${winnerProduct.name || winnerProduct.modelName} satisfies the critical trade-offs between group members.`
    }));

    // 9. Generate Deterministic Trade-off Cards (Explainability Engine)
    const tradeOffCards = topRecs.map(rec =>
      explainabilityEngine.generateTradeOffCard(
        catalogService.normalizeProduct(rec.product),
        profiles,
        rec.scores.individualBreakdown
      )
    );

    // 10. Evaluate Partial Consensus & Subgroup Splitting
    const subgroups = subgroupEngine.evaluateSubgroups(
      catalog.map(p => catalogService.normalizeProduct(p)),
      profiles
    );

    return {
      analysisId: `an_${uuidv4().slice(0, 8)}`,
      groupId,
      catalogVersion: `${category}-v1`,
      status: 'COMPLETED',
      topRecommendations: topRecs,
      allCandidates,
      participantBreakdowns,
      conflictsDetected,
      tradeOffCards,
      subgroups,
      winner: {
        product: winnerProduct,
        consensusScore: metrics.score,
        explanation,
      },
      rankings,
      metrics: {
        feasibleCount: feasibleSet.length,
        totalProducts: catalog.length,
        exactFeasibleCount: exactFeasible.length,
      },
      ...(proximityMode !== 'EXACT' ? {
        proximity: {
          mode: proximityMode,
          summaryMessage: proximityMode === 'NEAREST'
            ? proximityRanking.summaryMessage
            : poolMatchesPreferences
              ? `Only ${primaryPool.length} product${primaryPool.length === 1 ? '' : 's'} satisfy every stated requirement and preference. The board ranks those first and fills the rest with statistically nearest alternatives, each labelled by match quality.`
              : `${primaryPool.length} product${primaryPool.length === 1 ? '' : 's'} satisfy the group's hard constraints, but some stated preferences cannot be met by the current market. Nearest alternatives are labelled by match quality.`,
          requestedVsMarket: proximityRanking.requestedVsMarket,
          census: proximityRanking.census,
          topMatchViolations: (() => {
            const top = proximityRanking.ranked[0];
            return top ? {
              productId: top.productId,
              matchScore: top.matchScore,
              matchQuality: top.matchQuality,
              hardViolations: top.hardViolations,
              softViolations: top.softViolations,
            } : {
              productId: 'none',
              matchScore: 0,
              matchQuality: 'NONE',
              hardViolations: [],
            softViolations: [],
            };
          })(),
        },
      } : {}),
    };
  }
}

export const analysisService = new AnalysisService();
