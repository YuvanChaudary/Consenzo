import { SmartTvProduct } from '@shared/types/catalog';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';
import { ProductScore } from '@shared/types/scoring';
import { neuralRecommender } from './neural/neuralRecommender';

export class ScoringEngine {
  /**
   * Neural Continuous Utility computation based on metric latent embedding alignment
   * and non-linear distance kernels (replaces manual piecewise constant heuristics).
   */
  public computeIndividualUtility(
    product: SmartTvProduct | any,
    profile: ParticipantPreferenceProfile
  ): ProductScore {
    return neuralRecommender.computeIndividualUtility(product, profile);
  }
}

export const scoringEngine = new ScoringEngine();
