import { resolveProductAttribute } from '../utils/attributeResolver';

/**
 * FitStats — Robust data-distribution statistics computed from the live catalog.
 *
 * Purpose: the recommendation engine must express "how far is the requested
 * parameter from the nearest product that exists" in units derived from the
 * actual data distribution (median / MAD / IQR), not from hardcoded guesses.
 *
 * Robust estimators are used deliberately:
 *  - median + MAD (Median Absolute Deviation) are immune to the long premium
 *    price tail that inflates mean/stdDev estimates in product catalogs.
 *  - When MAD degenerates to 0 (discrete tiers like 60/120 Hz), the estimator
 *    falls back to IQR/1.349, then to a 5%-of-median floor.
 */

export interface NumericStats {
  attribute: string;
  n: number;
  min: number;
  max: number;
  median: number;
  mad: number;          // median absolute deviation (raw)
  sigma: number;        // robust sigma: 1.4826*MAD, or IQR/1.349 fallback, or 5%-of-median floor
  estimator: 'MAD' | 'IQR' | 'FLOOR';
  q1: number;
  q3: number;
  iqr: number;
  mean: number;
}

export interface CategoricalStats {
  attribute: string;
  n: number;
  valueCounts: Record<string, number>;
  distinctValues: string[];
  /** Mean priceInr per value — used to derive market-segment adjacency (e.g. brand tiers). */
  meanPriceByValue: Record<string, number>;
}

export interface BooleanStats {
  attribute: string;
  n: number;
  trueCount: number;
  falseCount: number;
}

export interface AttributeAvailability {
  attribute: string;
  availableValues: Array<string | number | boolean>;
  counts: Record<string, number>;
}

const KNOWN_NOISE_KEYS = new Set([
  'asin', 'id', 'slug', 'name', 'modelName', 'images', 'specs', 'tags',
  'embedding', 'badge', 'category', 'url', 'description', 'title',
]);

export class FitStatsService {
  /** Cache: catalog array reference -> per-attribute stats. */
  private cache = new WeakMap<object, Map<string, any>>();

  private cacheFor(catalog: object[]): Map<string, any> {
    let m = this.cache.get(catalog);
    if (!m) {
      m = new Map<string, any>();
      this.cache.set(catalog, m);
    }
    return m;
  }

  /** Resolve a raw attribute value for a product through the canonical resolver. */
  private resolve(product: any, attribute: string): any {
    return resolveProductAttribute(product, attribute);
  }

  /**
   * Discover which attributes are actually measurable on this catalog
   * (direct fields on >=30% of products, plus priceInr). Used by the
   * proximity engine to know what it can meaningfully compare.
   */
  public discoverAttributes(catalog: any[]): string[] {
    if (catalog.length === 0) return [];
    const hit = new Map<string, number>();
    for (const p of catalog) {
      for (const [k, v] of Object.entries(p)) {
        if (KNOWN_NOISE_KEYS.has(k)) continue;
        if (v === null || v === undefined) continue;
        hit.set(k, (hit.get(k) || 0) + 1);
      }
    }
    const attrs = [...hit.entries()]
      .filter(([k, c]) => c >= catalog.length * 0.3 || k === 'priceInr')
      .map(([k]) => k);
    return attrs.sort();
  }

  public getNumericStats(catalog: any[], attribute: string): NumericStats | null {
    const cache = this.cacheFor(catalog);
    const key = `num:${attribute}`;
    if (cache.has(key)) return cache.get(key);

    const values: number[] = [];
    for (const p of catalog) {
      const v = this.resolve(p, attribute);
      if (typeof v === 'number' && Number.isFinite(v)) values.push(v);
    }
    if (values.length < 3) {
      cache.set(key, null);
      return null;
    }

    values.sort((a, b) => a - b);
    const n = values.length;
    const median = this.quantile(values, 0.5);
    const q1 = this.quantile(values, 0.25);
    const q3 = this.quantile(values, 0.75);
    const iqr = q3 - q1;
    const absDevs = values.map(v => Math.abs(v - median)).sort((a, b) => a - b);
    const mad = this.quantile(absDevs, 0.5);

    let sigma: number;
    let estimator: NumericStats['estimator'];
    const madSigma = 1.4826 * mad;
    if (madSigma > 1e-9) {
      sigma = madSigma;
      estimator = 'MAD';
    } else if (iqr > 1e-9) {
      sigma = iqr / 1.349; // IQR of a normal ~ 1.349 sigma
      estimator = 'IQR';
    } else {
      sigma = Math.max(1, Math.abs(median) * 0.05);
      estimator = 'FLOOR';
    }

    const mean = values.reduce((a, b) => a + b, 0) / n;

    const stats: NumericStats = {
      attribute, n,
      min: values[0], max: values[n - 1],
      median, mad, sigma, estimator,
      q1, q3, iqr, mean,
    };
    cache.set(key, stats);
    return stats;
  }

  public getCategoricalStats(catalog: any[], attribute: string): CategoricalStats | null {
    const cache = this.cacheFor(catalog);
    const key = `cat:${attribute}`;
    if (cache.has(key)) return cache.get(key);

    const valueCounts: Record<string, number> = {};
    const priceSum: Record<string, { sum: number; n: number }> = {};
    let n = 0;

    for (const p of catalog) {
      const v = this.resolve(p, attribute);
      if (v === undefined || v === null || typeof v === 'object') continue;
      const s = String(v).trim();
      if (!s) continue;
      n++;
      valueCounts[s] = (valueCounts[s] || 0) + 1;
      const price = Number(p.priceInr) || 0;
      if (price > 0) {
        priceSum[s] = priceSum[s] || { sum: 0, n: 0 };
        priceSum[s].sum += price;
        priceSum[s].n += 1;
      }
    }

    if (n < 3) {
      cache.set(key, null);
      return null;
    }

    const meanPriceByValue: Record<string, number> = {};
    for (const [val, { sum, n: cnt }] of Object.entries(priceSum)) {
      meanPriceByValue[val] = sum / cnt;
    }

    const stats: CategoricalStats = {
      attribute, n, valueCounts,
      distinctValues: Object.keys(valueCounts).sort(),
      meanPriceByValue,
    };
    cache.set(key, stats);
    return stats;
  }

  public getBooleanStats(catalog: any[], attribute: string): BooleanStats | null {
    const cache = this.cacheFor(catalog);
    const key = `bool:${attribute}`;
    if (cache.has(key)) return cache.get(key);

    let trueCount = 0, falseCount = 0;
    for (const p of catalog) {
      const v = this.resolve(p, attribute);
      if (typeof v === 'boolean') v ? trueCount++ : falseCount++;
    }
    if (trueCount + falseCount < 3) {
      cache.set(key, null);
      return null;
    }
    const stats: BooleanStats = { attribute, n: trueCount + falseCount, trueCount, falseCount };
    cache.set(key, stats);
    return stats;
  }

  /** Full availability census of an attribute across the catalog. */
  public getAvailability(catalog: any[], attribute: string): AttributeAvailability | null {
    const counts: Record<string, number> = {};
    for (const p of catalog) {
      const v = this.resolve(p, attribute);
      if (v === undefined || v === null) continue;
      const key = String(v);
      counts[key] = (counts[key] || 0) + 1;
    }
    if (Object.keys(counts).length === 0) return null;

    const availableValues = Object.keys(counts)
      .map(k => (isNaN(Number(k)) || k.trim() === '' ? k : Number(k)))
      .sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      });

    return { attribute, availableValues, counts };
  }

  /**
   * Market-segment tier of a categorical value (e.g. a brand), derived from
   * mean price positioning within this catalog. Returns tercile index 0..2
   * (0 = value segment, 2 = premium segment), or -1 if unknown.
   */
  public getMarketTier(catalog: any[], attribute: string, value: string): number {
    const stats = this.getCategoricalStats(catalog, attribute);
    if (!stats) return -1;
    const entries = Object.entries(stats.meanPriceByValue)
      .filter(([v]) => stats.valueCounts[v] >= 2 || Object.keys(stats.meanPriceByValue).length <= 3)
      .sort((a, b) => a[1] - b[1]);
    if (entries.length === 0) return -1;
    const idx = entries.findIndex(([v]) => v.toLowerCase() === value.toLowerCase());
    if (idx === -1) return -1;
    // Tercile positioning: 0 / 1 / 2
    return Math.min(2, Math.floor((idx / Math.max(1, entries.length - 1)) * 2 + 0.0001));
  }

  private quantile(sorted: number[], q: number): number {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (base + 1 < sorted.length) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  }
}

export const fitStats = new FitStatsService();
