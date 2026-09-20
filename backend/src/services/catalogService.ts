import * as fs from 'fs';
import * as path from 'path';
import { SmartTvProduct, NexusProduct, CategorySchema, ProductSpec } from '@shared/types/catalog';

export class CatalogService {
  private catalogs: Map<string, any[]> = new Map();
  private schemas: Map<string, CategorySchema> = new Map();

  constructor() {
    this.loadAllSchemas();
    this.loadAllCatalogs();
  }

  private resolveCatalogPath(filename: string): string | null {
    const candidates = [
      path.join(process.cwd(), 'catalog', filename),
      path.join(process.cwd(), '..', 'catalog', filename),
      path.resolve(__dirname, '../../../catalog', filename),
      path.resolve(__dirname, '../../catalog', filename),
      path.resolve(__dirname, '../catalog', filename),
      path.resolve('/var/task/catalog', filename),
      path.resolve('/var/task/dist/catalog', filename),
      path.join(__dirname, filename),
    ];
    return candidates.find(p => fs.existsSync(p)) || null;
  }

  private loadAllSchemas() {
    const schemaCategories = ['smart_tvs', 'laptops', 'soundbars', 'headphones', 'chairs'];
    for (const cat of schemaCategories) {
      const schemaPath = this.resolveCatalogPath(`schema/${cat}.json`);
      if (schemaPath) {
        try {
          const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8')) as CategorySchema;
          this.schemas.set(cat, schema);
          // Also set kebab-case alias
          this.schemas.set(cat.replace(/_/g, '-'), schema);
        } catch (e) {
          console.warn(`Failed to parse schema/${cat}.json:`, e);
        }
      }
    }
  }

  private loadAllCatalogs() {
    const files: Record<string, string> = {
      smart_tvs: 'smart_tvs_v1.json',
      laptops: 'laptops_v1.json',
      soundbars: 'soundbars_v1.json',
      headphones: 'headphones_v1.json',
    };

    for (const [cat, filename] of Object.entries(files)) {
      const filePath = this.resolveCatalogPath(filename);
      if (filePath) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.catalogs.set(cat, data);
          this.catalogs.set(cat.replace(/_/g, '-'), data);
        } catch (e) {
          console.warn(`Failed to parse ${filename}:`, e);
        }
      }
    }
  }

  public getCategorySchema(category: string): CategorySchema | undefined {
    const normalized = category.toLowerCase().replace(/-/g, '_');
    return this.schemas.get(normalized) || this.schemas.get(category);
  }

  public getAllSchemas(): CategorySchema[] {
    const unique = new Set<string>();
    const res: CategorySchema[] = [];
    for (const [key, schema] of this.schemas.entries()) {
      if (!unique.has(schema.categoryId)) {
        unique.add(schema.categoryId);
        res.push(schema);
      }
    }
    return res;
  }

  /**
   * Normalize any legacy or new product into the unified NexusProduct format with ProductSpec[]
   */
  public normalizeProduct(raw: any): NexusProduct {
    const category = (raw.category || 'smart_tvs').toLowerCase().replace(/-/g, '_');
    const schema = this.getCategorySchema(category);

    const specs: ProductSpec[] = raw.specs ? [...raw.specs] : [];

    // If specs array is not present, derive it from the object fields using the schema
    if (specs.length === 0 && schema) {
      for (const def of schema.specDefinitions) {
        const val = raw[def.key];
        if (val !== undefined && val !== null) {
          specs.push({
            key: def.key,
            label: def.label,
            value: val,
            unit: def.unit,
            displayGroup: def.displayGroup,
          });
        }
      }
    }

    // Default fallback images
    const defaultImages = [
      'https://images.unsplash.com/photo-1593784566293-b6b72e35cbf2?w=800&q=80',
      'https://images.unsplash.com/photo-1598986796012-a3d1e58c4b46?w=800&q=80',
      'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800&q=80',
    ];

    return {
      id: raw.id || raw.asin || `prod_${Math.random().toString(36).substr(2, 9)}`,
      asin: raw.asin || raw.id,
      name: raw.name || raw.modelName || 'Nexus Product',
      modelName: raw.modelName || raw.name || 'Nexus Product',
      slug: raw.slug || (raw.name || raw.modelName || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand: raw.brand || 'Nexus',
      category: category,
      priceInr: Number(raw.priceInr || raw.price || 0),
      originalPriceInr: raw.originalPriceInr ? Number(raw.originalPriceInr) : undefined,
      images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : defaultImages,
      rating: raw.rating ? Number(raw.rating) : 4.5,
      reviewCount: raw.reviewCount ? Number(raw.reviewCount) : 120,
      primeEligible: raw.primeEligible !== false,
      inStock: raw.inStock !== false,
      badge: raw.badge,
      specs,
      tags: raw.tags || [raw.brand, category],
    };
  }

  public getAll(category: string = 'smart_tvs'): SmartTvProduct[] {
    const normalized = (category || 'smart_tvs').toLowerCase().replace(/-/g, '_');
    // No silent cross-category fallback: an unknown/unsupported category
    // returns an empty set so callers (and the analysis engine) fail loudly
    // instead of recommending TVs for a soundbar/laptop request.
    return (this.catalogs.get(normalized) || []) as SmartTvProduct[];
  }

  public getAllNormalized(category?: string): NexusProduct[] {
    if (category) {
      const items = this.getAll(category);
      return items.map(p => this.normalizeProduct(p));
    }
    const all: NexusProduct[] = [];
    const seen = new Set<string>();
    for (const items of this.catalogs.values()) {
      for (const item of items) {
        const id = item.id || item.asin;
        if (!seen.has(id)) {
          seen.add(id);
          all.push(this.normalizeProduct(item));
        }
      }
    }
    return all;
  }

  public getAllCategoriesData(): Record<string, any[]> {
    const result: Record<string, any[]> = {};
    for (const [cat, items] of this.catalogs.entries()) {
      if (!cat.includes('-')) {
        result[cat] = items;
      }
    }
    return result;
  }

  public getCategories(): Array<{ id: string; name: string; count: number; icon: string }> {
    return [
      { id: 'smart_tvs', name: 'Smart TVs & Displays', count: this.catalogs.get('smart_tvs')?.length || 0, icon: '📺' },
      { id: 'laptops', name: 'Laptops & Workstations', count: this.catalogs.get('laptops')?.length || 0, icon: '💻' },
      { id: 'soundbars', name: 'Soundbars & Home Audio', count: this.catalogs.get('soundbars')?.length || 0, icon: '🔊' },
      { id: 'headphones', name: 'Headphones & Audio', count: this.catalogs.get('headphones')?.length || 0, icon: '🎧' },
      { id: 'chairs', name: 'Ergonomic Chairs', count: 0, icon: '🪑' },
    ];
  }

  public getById(idOrAsin: string): any | undefined {
    for (const items of this.catalogs.values()) {
      const found = items.find((p: any) => p.asin === idOrAsin || p.id === idOrAsin);
      if (found) return found;
    }
    return undefined;
  }

  public filter(predicate: (p: SmartTvProduct) => boolean, category: string = 'smart_tvs'): SmartTvProduct[] {
    const items = this.getAll(category);
    return items.filter(predicate);
  }
}

export const catalogService = new CatalogService();
