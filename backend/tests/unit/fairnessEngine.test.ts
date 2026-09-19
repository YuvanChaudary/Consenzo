import { fairnessEngine } from '../../src/engine/fairnessEngine';

describe('FairnessEngine', () => {
  test('Reference Scenario: Product C beats Product A', () => {
    const productA_utils = [9.5, 10.0, 6.8, 8.0];
    const productC_utils = [9.2, 6.5, 9.8, 9.6];

    const scoreA = fairnessEngine.calculateConsensusScore(productA_utils);
    const scoreC = fairnessEngine.calculateConsensusScore(productC_utils);

    console.log(`Product A: ${scoreA.score}, Product C: ${scoreC.score}`);
    expect(scoreC.score).toBeGreaterThan(scoreA.score);
  });

  test('Tyranny of the Majority: Product Y beats Product X', () => {
    const productX_utils = [9.8, 9.8, 9.8, 2.0];
    const productY_utils = [7.8, 7.8, 7.8, 7.5];

    const scoreX = fairnessEngine.calculateConsensusScore(productX_utils);
    const scoreY = fairnessEngine.calculateConsensusScore(productY_utils);

    console.log(`Product X: ${scoreX.score}, Product Y: ${scoreY.score}`);
    expect(scoreY.score).toBeGreaterThan(scoreX.score);
  });

  test('Maximin Floor: Product with < 4.0 is heavily penalized', () => {
    const healthyUtils = [5.0, 5.0, 5.0, 5.0];
    const unhealthyUtils = [5.0, 5.0, 5.0, 3.0];

    const scoreHealthy = fairnessEngine.calculateConsensusScore(healthyUtils);
    const scoreUnhealthy = fairnessEngine.calculateConsensusScore(unhealthyUtils);

    expect(scoreHealthy.score).toBeGreaterThan(scoreUnhealthy.score);
  });
});
