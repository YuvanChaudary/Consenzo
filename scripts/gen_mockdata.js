const fs = require('fs');

const tvs = require(process.cwd() + '/catalog/smart_tvs_v1.json');
const laptops = require(process.cwd() + '/catalog/laptops_v1.json');
const soundbars = require(process.cwd() + '/catalog/soundbars_v1.json');

function tvSpecs(p) {
  return [
    { key: 'screenSizeInches', label: 'Screen Size', value: p.screenSizeInches, unit: 'inches' },
    { key: 'panelType', label: 'Panel Type', value: p.panelType },
    { key: 'resolution', label: 'Resolution', value: p.resolution },
    { key: 'refreshRateHz', label: 'Refresh Rate', value: p.refreshRateHz, unit: 'Hz' },
    { key: 'hasHdmi21', label: 'HDMI 2.1', value: !!p.hasHdmi21 },
    { key: 'os', label: 'Smart Platform', value: p.os || 'Smart' },
    { key: 'energyRating', label: 'Energy Rating', value: p.energyRating || '3 Star' },
    { key: 'warrantyYears', label: 'Warranty', value: p.warrantyYears || 1, unit: 'year(s)' },
  ];
}
function laptopSpecs(p) {
  return [
    { key: 'processor', label: 'Processor', value: p.processor || 'Intel Core' },
    { key: 'ramGb', label: 'RAM', value: p.ramGb, unit: 'GB' },
    { key: 'storageGb', label: 'Storage', value: p.storageGb, unit: 'GB SSD' },
    { key: 'screenSizeInches', label: 'Display', value: p.screenSizeInches, unit: 'inches' },
    { key: 'batteryHours', label: 'Battery Life', value: p.batteryHours, unit: 'hrs' },
    { key: 'weightKg', label: 'Weight', value: p.weightKg, unit: 'kg' },
    { key: 'os', label: 'OS', value: p.os || 'Windows 11' },
    { key: 'warrantyYears', label: 'Warranty', value: p.warrantyYears || 1, unit: 'year(s)' },
  ];
}
function soundbarSpecs(p) {
  return [
    { key: 'totalPowerWatts', label: 'Total Power', value: p.totalPowerWatts, unit: 'W' },
    { key: 'channels', label: 'Channels', value: p.channels || '2.1' },
    { key: 'audioFormat', label: 'Audio Formats', value: p.audioFormat || 'Dolby Audio' },
    { key: 'connectivity', label: 'Connectivity', value: p.connectivity || 'HDMI, Bluetooth' },
    { key: 'subwoofer', label: 'Subwoofer', value: p.subwoofer ? 'Wireless Subwoofer' : 'Built-in' },
    { key: 'warrantyYears', label: 'Warranty', value: p.warrantyYears || 1, unit: 'year(s)' },
  ];
}

function toMock(p, category, specs) {
  const mrp = Math.round((p.priceInr * 1.18) / 100) * 100;
  const badge = p.rating >= 4.3 ? 'Highly Rated' : (p.reviewCount > 8000 ? 'Best Seller' : undefined);
  return {
    id: p.asin,
    name: p.modelName,
    brand: p.brand,
    category,
    priceInr: p.priceInr,
    originalPriceInr: mrp > p.priceInr ? mrp : undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: [p.imageUrl],
    specs,
    tags: [p.brand, p.primeEligible ? 'Prime' : 'Standard Delivery'].filter(Boolean),
    inStock: p.inStock !== false,
    badge,
  };
}

const products = [
  ...tvs.map(p => toMock(p, 'smart-tvs', tvSpecs(p))),
  ...laptops.map(p => toMock(p, 'laptops', laptopSpecs(p))),
  ...soundbars.map(p => toMock(p, 'soundbars', soundbarSpecs(p))),
];

const categories = [
  { id: 'smart-tvs', name: 'Smart TVs', icon: 'Tv2', count: tvs.length },
  { id: 'laptops', name: 'Laptops', icon: 'Laptop', count: laptops.length },
  { id: 'soundbars', name: 'Soundbars', icon: 'Speaker', count: soundbars.length },
];

const header = `// ─── Consenzo Storefront Catalog Data ────────────────────────────────────────
// AUTO-GENERATED from the real scraped catalog (backend/catalog/*_v1.json).
// Every product carries its REAL Amazon title, price, rating, review count and
// the exact scraped hi-res product image. Do not hand-edit product entries —
// regenerate via scripts/gen_mockdata.js instead.
// Product ids are Amazon ASINs, so storefront URLs stay stable.

export interface MockProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceInr: number;
  originalPriceInr?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  specs: { key: string; label: string; value: string | number | boolean; unit?: string }[];
  tags: string[];
  inStock: boolean;
  badge?: string;
}

export interface MockCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

`;

const body = `export const MOCK_PRODUCTS: MockProduct[] = ${JSON.stringify(products, null, 2)};

export const MOCK_CATEGORIES: MockCategory[] = ${JSON.stringify(categories, null, 2)};
`;

fs.writeFileSync('frontend/src/lib/mockData.ts', header + body);
console.log('Written:', products.length, 'products,', categories.length, 'categories');
console.log('TV imgs:', products.filter(p=>p.category==='smart-tvs' && p.images[0]).length);
console.log('Laptop imgs:', products.filter(p=>p.category==='laptops' && p.images[0]).length);
console.log('Soundbar imgs:', products.filter(p=>p.category==='soundbars' && p.images[0]).length);
