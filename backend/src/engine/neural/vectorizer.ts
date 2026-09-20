import { ParticipantPreferenceProfile, CanonicalConstraint } from '@shared/types/preferences';
import { resolveProductAttribute } from '../../utils/attributeResolver';

export const LATENT_DIM = 32;

/**
 * Deterministic hash-based projection to continuous embedding vector.
 * Maps any string into an R^d vector with zero hardcoded magic tables.
 */
export function hashToVector(str: string, dim: number = 8): number[] {
  const vec = new Array(dim).fill(0);
  const normalized = (str || '').toLowerCase().trim();
  if (!normalized) return vec;

  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    for (let d = 0; d < dim; d++) {
      // Periodic trigonometric kernel mapping character sequences to smooth Fourier coordinates
      const angle = (charCode * (d + 1) * 17 + i * 31) % 360;
      vec[d] += Math.sin((angle * Math.PI) / 180);
    }
  }

  // Normalize to unit L2 norm
  let norm = 0;
  for (let d = 0; d < dim; d++) norm += vec[d] * vec[d];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let d = 0; d < dim; d++) vec[d] /= norm;
  }
  return vec;
}

/**
 * Smooth Gaussian Radial Basis Function (RBF) expansion for continuous scalar variables.
 * Translates a continuous scalar into multi-center distribution.
 */
export function rbfExpansion(value: number, centers: number[], bandwidth: number): number[] {
  return centers.map((c) => {
    const diff = (value - c) / (bandwidth || 1.0);
    return Math.exp(-0.5 * diff * diff);
  });
}

/**
 * Layer normalization across a float vector.
 */
export function layerNorm(vec: number[]): number[] {
  const n = vec.length;
  if (n === 0) return [];
  const mean = vec.reduce((sum, v) => sum + v, 0) / n;
  const variance = vec.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / n;
  const std = Math.sqrt(variance + 1e-6);
  return vec.map((v) => (v - mean) / std);
}

/**
 * L2 unit norm normalization.
 */
export function unitNorm(vec: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) sumSq += vec[i] * vec[i];
  const norm = Math.sqrt(sumSq);
  if (norm < 1e-9) return vec.slice();
  return vec.map((v) => v / norm);
}

export class NeuralVectorizer {
  private readonly dim: number;

  constructor(dim: number = LATENT_DIM) {
    this.dim = dim;
  }

  /**
   * Vectorize a product into a continuous dense latent vector v_i in R^d.
   */
  public vectorizeProduct(product: any): number[] {
    const raw = new Array(this.dim).fill(0);

    // 1. Numerical dimension encodings (indices 0..11)
    const price = Number(product.priceInr || product.price || 50000);
    // Log-price RBF projection over 4 price points (15k, 40k, 80k, 180k)
    const logPrice = Math.log(Math.max(1, price));
    const priceCenters = [Math.log(15000), Math.log(40000), Math.log(80000), Math.log(180000)];
    const priceRbfs = rbfExpansion(logPrice, priceCenters, 0.8);
    for (let i = 0; i < 4; i++) raw[i] = priceRbfs[i];

    // Screen size or dimension continuous encoding (indices 4..7)
    const size = Number(product.screenSizeInches || 55);
    const sizeCenters = [43, 55, 65, 75];
    const sizeRbfs = rbfExpansion(size, sizeCenters, 8);
    for (let i = 0; i < 4; i++) raw[4 + i] = sizeRbfs[i];

    // Refresh rate / performance metric (indices 8..11)
    const refresh = Number(product.refreshRateHz || 60);
    const refreshCenters = [60, 100, 120, 144];
    const refreshRbfs = rbfExpansion(refresh, refreshCenters, 20);
    for (let i = 0; i < 4; i++) raw[8 + i] = refreshRbfs[i];

    // 2. Rating & Quality continuous priors (indices 12..15)
    const rating = Number(product.rating || 4.2);
    const ratingNorm = (rating - 1.0) / 4.0; // [0, 1]
    raw[12] = ratingNorm;
    raw[13] = product.hasHdmi21 || product.inStock ? 1.0 : -0.5;
    raw[14] = product.warrantyYears ? Number(product.warrantyYears) / 3.0 : 0.33;
    raw[15] = Math.tanh(price / 100000);

    // 3. Categorical Latent Embeddings (indices 16..31)
    const brand = String(product.brand || '');
    const brandVec = hashToVector(brand, 8);
    for (let i = 0; i < 8; i++) raw[16 + i] = brandVec[i];

    const categoryOrPanel = String(product.panelType || product.category || product.os || '');
    const panelVec = hashToVector(categoryOrPanel, 8);
    for (let i = 0; i < 8; i++) raw[24 + i] = panelVec[i];

    // Layer-normalize and project to unit hypersphere
    return unitNorm(layerNorm(raw));
  }

  /**
   * Vectorize a participant's preference profile into continuous latent space u_m in R^d.
   */
  public vectorizeProfile(profile: ParticipantPreferenceProfile): number[] {
    const raw = new Array(this.dim).fill(0);

    if (!profile.constraints || profile.constraints.length === 0) {
      // Default neutral prior centered at moderate expectations
      raw[12] = 0.8; // Expect decent quality
      return unitNorm(layerNorm(raw));
    }

    let totalWeight = 0;

    for (const c of profile.constraints) {
      const isBudget = c.attribute === 'priceInr' || c.attribute === 'price' || c.attribute === 'budget';
      const weight = (c.weight ?? 1.0) * (c.type === 'DEALBREAKER' ? 1.6 : c.type === 'HARD_CONSTRAINT' ? 1.3 : 1.0);
      totalWeight += weight;

      if (isBudget) {
        const targetBudget = Number(c.value) || 50000;
        const logTarget = Math.log(Math.max(1, targetBudget));
        const priceCenters = [Math.log(15000), Math.log(40000), Math.log(80000), Math.log(180000)];
        const rbfs = rbfExpansion(logTarget, priceCenters, 0.8);
        for (let i = 0; i < 4; i++) raw[i] += rbfs[i] * weight;
      } else if (c.attribute === 'screenSizeInches' || c.attribute === 'size') {
        const targetSize = Number(c.value) || 55;
        const sizeCenters = [43, 55, 65, 75];
        const rbfs = rbfExpansion(targetSize, sizeCenters, 8);
        for (let i = 0; i < 4; i++) raw[4 + i] += rbfs[i] * weight;
      } else if (c.attribute === 'refreshRateHz' || c.attribute === 'refreshRate') {
        const targetRefresh = Number(c.value) || 60;
        const refreshCenters = [60, 100, 120, 144];
        const rbfs = rbfExpansion(targetRefresh, refreshCenters, 20);
        for (let i = 0; i < 4; i++) raw[8 + i] += rbfs[i] * weight;
      } else if (c.attribute === 'brand') {
        const brandVec = hashToVector(String(c.value), 8);
        for (let i = 0; i < 8; i++) raw[16 + i] += brandVec[i] * weight;
      } else if (c.attribute === 'panelType' || c.attribute === 'category' || c.attribute === 'os') {
        const catVec = hashToVector(String(c.value), 8);
        for (let i = 0; i < 8; i++) raw[24 + i] += catVec[i] * weight;
      } else {
        // Generic attribute continuous hash projection across categorical slots
        const genericVec = hashToVector(`${c.attribute}:${c.value}`, 8);
        for (let i = 0; i < 8; i++) raw[24 + i] += genericVec[i] * weight * 0.7;
      }
    }

    // Include quality bias
    raw[12] += 0.85 * (totalWeight > 0 ? totalWeight / profile.constraints.length : 1.0);

    return unitNorm(layerNorm(raw));
  }

  /**
   * Vectorize an individual constraint and the corresponding actual product attribute
   * into continuous sub-vectors to evaluate continuous mathematical similarity.
   */
  public attributeSimilarity(
    actualValue: any,
    targetValue: any,
    attribute: string,
    operator: string = 'EQ'
  ): number {
    if (actualValue === undefined || actualValue === null) return 0.5;

    const isPrice = attribute === 'priceInr' || attribute === 'price' || attribute === 'budget';

    // 1. Continuous Price Surplus / Constraint Utility Function
    if (isPrice) {
      const actual = Number(actualValue);
      const budget = Number(targetValue);
      if (budget <= 0) return 0.5;
      const ratio = actual / budget;
      // Continuous Generalized Logistic Surplus Curve:
      // If actual <= budget: smooth surplus bonus in [0.75, 1.0]
      // If actual > budget: smooth penalization decay curve
      if (ratio <= 1.0) {
        // Surplus function: 0.75 at ratio=1.0, asymptotically approaches 1.0 as price drops to 0.5*budget
        const surplus = Math.max(0, 1.0 - ratio);
        return Math.min(1.0, 0.75 + Math.tanh(surplus * 2.0) * 0.25);
      } else {
        // Continuous exponential penalty decay
        const overage = ratio - 1.0;
        return Math.max(0.1, 0.75 * Math.exp(-overage * 8.0));
      }
    }

    // 2. Numerical ordered / boundary evaluation
    if (typeof actualValue === 'number' && typeof targetValue === 'number') {
      const act = Number(actualValue);
      const tgt = Number(targetValue);
      if (operator === 'LTE') {
        if (act <= tgt) return 1.0;
        return Math.max(0.2, Math.exp(-(act - tgt) / Math.max(1, tgt * 0.2)));
      }
      if (operator === 'GTE') {
        if (act >= tgt) return 1.0;
        return Math.max(0.2, Math.exp(-(tgt - act) / Math.max(1, tgt * 0.2)));
      }
      // Proximity ratio via Gaussian kernel
      const diff = (act - tgt) / Math.max(1, tgt * 0.25);
      return Math.max(0.2, Math.exp(-0.5 * diff * diff));
    }

    // 3. Boolean exact representation
    if (typeof actualValue === 'boolean' || typeof targetValue === 'boolean') {
      return Boolean(actualValue) === Boolean(targetValue) ? 1.0 : 0.35;
    }

    // 4. Categorical embedding cosine similarity
    const actVec = hashToVector(String(actualValue), 12);
    const tgtVec = hashToVector(String(targetValue), 12);
    let dot = 0;
    for (let i = 0; i < 12; i++) dot += actVec[i] * tgtVec[i];
    // Scale dot in [-1, 1] to continuous satisfaction in [0.3, 1.0]
    return Math.min(1.0, Math.max(0.3, 0.3 + 0.7 * Math.max(0, dot)));
  }
}

export const neuralVectorizer = new NeuralVectorizer();
