import * as fs from 'fs';
import * as path from 'path';
import { SmartTvProduct, CatalogProduct } from '@shared/types/catalog';

export class CatalogService {
  private catalogs: Map<string, any[]> = new Map();

  constructor() {
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

  private loadAllCatalogs() {
    // 1. Primary Smart TVs
    const tvPath = this.resolveCatalogPath('smart_tvs_v1.json');
    if (!tvPath) {
      throw new Error('Catalog file smart_tvs_v1.json not found in candidate paths');
    }
    const tvData = JSON.parse(fs.readFileSync(tvPath, 'utf8'));
    this.catalogs.set('smart_tvs', tvData);

    // 2. Laptops
    const laptopPath = this.resolveCatalogPath('laptops_v1.json');
    if (laptopPath) {
      try {
        const laptopData = JSON.parse(fs.readFileSync(laptopPath, 'utf8'));
        this.catalogs.set('laptops', laptopData);
      } catch (e) {
        console.warn('Failed to parse laptops_v1.json:', e);
      }
    }

    // 3. Soundbars
    const soundbarPath = this.resolveCatalogPath('soundbars_v1.json');
    if (soundbarPath) {
      try {
        const soundbarData = JSON.parse(fs.readFileSync(soundbarPath, 'utf8'));
        this.catalogs.set('soundbars', soundbarData);
      } catch (e) {
        console.warn('Failed to parse soundbars_v1.json:', e);
      }
    }
  }

  public getAll(category: string = 'smart_tvs'): SmartTvProduct[] {
    return (this.catalogs.get(category) || this.catalogs.get('smart_tvs') || []) as SmartTvProduct[];
  }

  public getAllCategoriesData(): Record<string, any[]> {
    const result: Record<string, any[]> = {};
    for (const [cat, items] of this.catalogs.entries()) {
      result[cat] = items;
    }
    return result;
  }

  public getCategories(): Array<{ id: string; name: string; count: number; icon: string }> {
    return [
      { id: 'smart_tvs', name: 'Smart TVs & Displays', count: this.catalogs.get('smart_tvs')?.length || 0, icon: '📺' },
      { id: 'laptops', name: 'Laptops & Workstations', count: this.catalogs.get('laptops')?.length || 0, icon: '💻' },
      { id: 'soundbars', name: 'Soundbars & Home Audio', count: this.catalogs.get('soundbars')?.length || 0, icon: '🔊' },
    ];
  }

  public getById(asin: string): any | undefined {
    for (const items of this.catalogs.values()) {
      const found = items.find((p: any) => p.asin === asin);
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
