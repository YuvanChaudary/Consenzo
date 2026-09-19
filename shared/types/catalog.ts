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
}

export interface LaptopProduct extends BaseProductItem {
  screenSizeInches: number;
  processor: string;
  ramGb: number;
  storageGb: number;
  os: string;
  batteryHours: number;
  weightKg: number;
}

export interface SoundbarProduct extends BaseProductItem {
  totalPowerWatts: number;
  channels: string;
  audioFormat: string;
  connectivity: string;
  subwoofer: string;
}

export type CatalogProduct = SmartTvProduct | LaptopProduct | SoundbarProduct;

export interface CategoryAdapter<T> {
  readonly schemaDefinition: any;
  normalizeAttributes(raw: any): T;
  validateProduct(item: any): boolean;
  distanceMetric(attribute: string, target: any, actual: any): number;
}

