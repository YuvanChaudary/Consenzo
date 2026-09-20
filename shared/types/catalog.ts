export interface ProductSpec {
  key: string;           // e.g. 'screenSize', 'refreshRate', 'ramGb'
  label: string;         // Display label: "Screen Size"
  value: string | number | boolean;
  unit?: string;         // e.g. 'inches', 'Hz', 'GB'
  displayGroup?: string; // For specs table grouping: "Display", "Performance"
}

export interface SpecDefinition {
  key: string;
  label: string;
  type: 'numeric' | 'categorical' | 'boolean' | 'currency';
  unit?: string;
  options?: string[];    // For categorical options
  min?: number;          // For numeric bounds
  max?: number;
  filterable: boolean;
  sortable: boolean;
  displayGroup: string;
  weight: number;        // Default weight for consensus scoring (0–1)
  hardConstraintEligible: boolean;
}

export interface CategorySchema {
  categoryId: string;
  displayName: string;
  description?: string;
  icon?: string;
  specDefinitions: SpecDefinition[];
}

export interface ShippyfyProduct {
  id: string;            // Primary identifier (replaces asin)
  asin?: string;         // Backward-compatible alias
  slug: string;          // URL-friendly slug
  name: string;          // Product title (replaces modelName)
  modelName?: string;    // Backward-compatible alias
  brand: string;
  category: string;      // e.g. 'smart_tvs', 'laptops', 'headphones', 'soundbars'
  priceInr: number;
  originalPriceInr?: number;
  images: string[];      // Array of high quality image URLs (min 3)
  rating?: number;
  reviewCount?: number;
  primeEligible?: boolean;
  inStock: boolean;
  specs: ProductSpec[];  // Generic dynamic specs
  tags?: string[];
  embedding?: number[];  // For vector similarity search / recommendations
  badge?: string;
}

// Backward-compatible alias for legacy references
export type NexusProduct = ShippyfyProduct;

export interface BaseProductItem {
  asin: string;
  modelName: string;
  brand: string;
  category?: string;
  priceInr: number;
  rating?: number;
  reviewCount?: number;
  primeEligible?: boolean;
  inStock?: boolean;
  warrantyYears?: number;
  imageUrl?: string;   // Real scraped Amazon product image (m.media-amazon.com)
}

export interface SmartTvProduct extends BaseProductItem {
  screenSizeInches: number;
  panelType: 'OLED' | 'QLED' | 'LED' | 'MiniLED';
  refreshRateHz: number;
  resolution: '4K' | '8K' | 'FullHD';
  hasHdmi21: boolean;
  bezelColor: string;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  energyRating: string;
  os: string;
  id?: string;
  name?: string;
  images?: string[];
  specs?: ProductSpec[];
}

export interface LaptopProduct extends BaseProductItem {
  screenSizeInches: number;
  processor: string;
  ramGb: number;
  storageGb: number;
  os: string;
  batteryHours: number;
  weightKg: number;
  id?: string;
  name?: string;
  images?: string[];
  specs?: ProductSpec[];
}

export interface SoundbarProduct extends BaseProductItem {
  totalPowerWatts: number;
  channels: string;
  audioFormat: string;
  connectivity: string;
  subwoofer: string;
  id?: string;
  name?: string;
  images?: string[];
  specs?: ProductSpec[];
}

export type CatalogProduct = NexusProduct | SmartTvProduct | LaptopProduct | SoundbarProduct;

export interface CategoryAdapter<T> {
  readonly schemaDefinition: any;
  normalizeAttributes(raw: any): T;
  validateProduct(item: any): boolean;
  distanceMetric(attribute: string, target: any, actual: any): number;
}

