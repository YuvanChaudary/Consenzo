// ─── Consenzo Storefront Catalog Data ────────────────────────────────────────
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

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    "id": "B0GXNND5DS",
    "name": "VW 101 cm (40 inches) Spectra Series Full HD Smart QLED Android TV VW40AQ3",
    "brand": "VW",
    "category": "smart-tvs",
    "priceInr": 13499,
    "originalPriceInr": 15900,
    "rating": 3.9,
    "reviewCount": 16444,
    "images": [
      "https://m.media-amazon.com/images/I/81KvQUwuSkL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 40,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "FullHD"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Android TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "VW",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Best Seller"
  },
  {
    "id": "B0GXB76VRW",
    "name": "Samsung 43 inch (108cm) Crystal UHD 4K Vision AI 2026 Smart TV | 30W Speakers...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 34990,
    "originalPriceInr": 41300,
    "rating": 4.3,
    "reviewCount": 669,
    "images": [
      "https://m.media-amazon.com/images/I/81pgMfiak0L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GGR9DCCB",
    "name": "VW Visio World 109 cm (43 inches) Pro Series 4K Ultra HD Smart QLED Google TV...",
    "brand": "VW",
    "category": "smart-tvs",
    "priceInr": 24999,
    "originalPriceInr": 29500,
    "rating": 4.1,
    "reviewCount": 2607,
    "images": [
      "https://m.media-amazon.com/images/I/81u4bOvKKuL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "VW",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GQBX1NZB",
    "name": "Onida 108 cm (43 inch) Ultra HD 4K Smart LED Fire TV 43UFD",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 24199,
    "originalPriceInr": 28600,
    "rating": 4.3,
    "reviewCount": 3205,
    "images": [
      "https://m.media-amazon.com/images/I/81maABgCwxL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0DZHRYFG7",
    "name": "TCL 101 cms (40 inches) Full HD Smart QLED Google TV | Dolby Audio 24 watts |...",
    "brand": "TCL",
    "category": "smart-tvs",
    "priceInr": 24990,
    "originalPriceInr": 29500,
    "rating": 4,
    "reviewCount": 2698,
    "images": [
      "https://m.media-amazon.com/images/I/71keqeuJ0eL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 40,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "FullHD"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "TCL",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0FDQY49H8",
    "name": "PHILIPS 109 cm (43 inches) 8100 Series 4K Ultra HD Smart QLED Google TV 43PQT...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 29999,
    "originalPriceInr": 35400,
    "rating": 4.1,
    "reviewCount": 1730,
    "images": [
      "https://m.media-amazon.com/images/I/81gySF32x7L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GTZ9TSDJ",
    "name": "LG 108 cms (43 inches) NU87 AI Series Nano 4K Ultra HD (3840 x 2160) Smart we...",
    "brand": "LG",
    "category": "smart-tvs",
    "priceInr": 33990,
    "originalPriceInr": 40100,
    "rating": 3.9,
    "reviewCount": 5228,
    "images": [
      "https://m.media-amazon.com/images/I/81pUEPL2Z-L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "webOS"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "LG",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GK9D99SG",
    "name": "VW Visio World 127 cm (50 inches) Pro Series 4K Ultra HD Smart QLED Google TV...",
    "brand": "VW",
    "category": "smart-tvs",
    "priceInr": 29999,
    "originalPriceInr": 35400,
    "rating": 4.1,
    "reviewCount": 2607,
    "images": [
      "https://m.media-amazon.com/images/I/81-1mnN4ExL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 50,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "VW",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GXZ3JVSG",
    "name": "Samsung 43 inch (108cm) Mini LED 4K Vision AI 2026 Smart TV | 30W Speakers | ...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 39990,
    "originalPriceInr": 47200,
    "rating": 4.1,
    "reviewCount": 601,
    "images": [
      "https://m.media-amazon.com/images/I/81Xi-L3MW7L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "MiniLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0F6ZLFNVT",
    "name": "Xiaomi (108 cm) 43 inch X 4K Ultra HD Smart | Dolby Vision | Eye Care Mode | ...",
    "brand": "Xiaomi",
    "category": "smart-tvs",
    "priceInr": 27499,
    "originalPriceInr": 32400,
    "rating": 4.1,
    "reviewCount": 357,
    "images": [
      "https://m.media-amazon.com/images/I/81jqJ8elaHL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Xiaomi",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GHR3DQT8",
    "name": "Toshiba 126 cm (50 inches) E350SP Series 4K Ultra HD Smart LED Google TV 50E3...",
    "brand": "Toshiba",
    "category": "smart-tvs",
    "priceInr": 33990,
    "originalPriceInr": 40100,
    "rating": 4,
    "reviewCount": 15,
    "images": [
      "https://m.media-amazon.com/images/I/81faHTLvhQL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 50,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Toshiba",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0F43H82FW",
    "name": "Samsung 108 cm (43 inches) Crystal 4K Vista Pro Ultra HD Smart LED TV UA43UE8...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 31490,
    "originalPriceInr": 37200,
    "rating": 4.2,
    "reviewCount": 1008,
    "images": [
      "https://m.media-amazon.com/images/I/81fjbJDYPEL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0HBQBNXQ7",
    "name": "400Nits Glo Brightness Dolby Vision Picture I Dolby Atmos 30W VuFX Sound",
    "brand": "Vu",
    "category": "smart-tvs",
    "priceInr": 29990,
    "originalPriceInr": 35400,
    "rating": 4.8,
    "reviewCount": 9,
    "images": [
      "https://m.media-amazon.com/images/I/815GOQlOg4L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Vu",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GL7R67XP",
    "name": "Hisense 108 cm (43 inches) E6S Series 4K Ultra HD Smart LED Google TV 43E6S",
    "brand": "Hisense",
    "category": "smart-tvs",
    "priceInr": 26990,
    "originalPriceInr": 31800,
    "rating": 4,
    "reviewCount": 894,
    "images": [
      "https://m.media-amazon.com/images/I/81l4NBRY-1L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Hisense",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GXV5313B",
    "name": "Samsung 55 inch (138cm) Mini LED 4K Vision AI 2026 Smart TV | 30W Speakers | ...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 53900,
    "originalPriceInr": 63600,
    "rating": 4.1,
    "reviewCount": 601,
    "images": [
      "https://m.media-amazon.com/images/I/81Akj2iQo+L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "MiniLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "4 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0FBW5S6H2",
    "name": "PHILIPS 108 cm (43 inches) 6100 Series Frameless Full HD Smart LED Google TV ...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 24999,
    "originalPriceInr": 29500,
    "rating": 4.2,
    "reviewCount": 983,
    "images": [
      "https://m.media-amazon.com/images/I/71uW0NH6EUL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "FullHD"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0F84DKX8K",
    "name": "Samsung 108 cm (43 inches) FHD Smart LED TV UA43F5550FUXXL",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 26000,
    "originalPriceInr": 30700,
    "rating": 4.1,
    "reviewCount": 2216,
    "images": [
      "https://m.media-amazon.com/images/I/81wj0iahGCL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "FullHD"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GJGGYPJW",
    "name": "Voice Command, Screen Mirror, 30W Speakers, A+ Grade Panel, Wi-Fi, HDMI, USB,...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 14999,
    "originalPriceInr": 17700,
    "rating": 3.9,
    "reviewCount": 64,
    "images": [
      "https://m.media-amazon.com/images/I/61n5tyjRy8L._SL1000_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GWDSYNHT",
    "name": "Lumio Vision 7 2026 109cm (43 inches) 4K Ultra HD Smart QLED Google TV FTW1-ADSJ",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 32999,
    "originalPriceInr": 38900,
    "rating": 4.4,
    "reviewCount": 169,
    "images": [
      "https://m.media-amazon.com/images/I/71okHgRJuoL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0FJFQ99FH",
    "name": "Xiaomi 80 cm (32 inches) A Pro QLED Series Smart TV L32MB-APIN",
    "brand": "Xiaomi",
    "category": "smart-tvs",
    "priceInr": 15499,
    "originalPriceInr": 18300,
    "rating": 4,
    "reviewCount": 311,
    "images": [
      "https://m.media-amazon.com/images/I/81JPHbfsLlL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 32,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Xiaomi",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GVK5Q87C",
    "name": "TCL 108 cm (43 inches) 4K Ultra HD Smart QLED Google TV | HDR 10+ | Dolby Vis...",
    "brand": "TCL",
    "category": "smart-tvs",
    "priceInr": 36990,
    "originalPriceInr": 43600,
    "rating": 4.1,
    "reviewCount": 140,
    "images": [
      "https://m.media-amazon.com/images/I/71jKovpCuxL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "TCL",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GYDH8JG3",
    "name": "iFFALCON 164 cm (65 Inches) 4K UHD Smart LED Google TV | 120Hz VRR | Dolby Vi...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 39999,
    "originalPriceInr": 47200,
    "rating": 4.5,
    "reviewCount": 2,
    "images": [
      "https://m.media-amazon.com/images/I/71cIYgq+qpL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 65,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 120,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": true
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0FDBJB455",
    "name": "VW 108 cm (43 inches) Nano Sync Series 4K Ultra HD Smart JioTele OS QLED TV V...",
    "brand": "VW",
    "category": "smart-tvs",
    "priceInr": 19999,
    "originalPriceInr": 23600,
    "rating": 3.5,
    "reviewCount": 315,
    "images": [
      "https://m.media-amazon.com/images/I/81Dc7MGS3YL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "VW",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GS8X7H59",
    "name": "Xiaomi (108 cm) 43 inch X Pro 4K QLED | Dolby Vision & HDR10+| Filmmaker Mode...",
    "brand": "Xiaomi",
    "category": "smart-tvs",
    "priceInr": 31999,
    "originalPriceInr": 37800,
    "rating": 4.1,
    "reviewCount": 211,
    "images": [
      "https://m.media-amazon.com/images/I/711fcrtVLPL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Xiaomi",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0F84FBWQM",
    "name": "Samsung 80 cm (32 inches) HD Smart LED TV UA32H4550FUXXL",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 17400,
    "originalPriceInr": 20500,
    "rating": 4.2,
    "reviewCount": 20231,
    "images": [
      "https://m.media-amazon.com/images/I/71XA+N8Xj1L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 32,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Best Seller"
  },
  {
    "id": "B0GYRQ79V4",
    "name": "Samsung 50 inch (125cm) Crystal UHD 4K Vision AI 2026 Smart TV | 30W Speakers...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 42990,
    "originalPriceInr": 50700,
    "rating": 4.3,
    "reviewCount": 669,
    "images": [
      "https://m.media-amazon.com/images/I/81AIsrIGCGL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 50,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0FD3YPJB2",
    "name": "NU 108 cm (43 Inches) New 2025 Borderless Series 4K UHD Smart Google TV LED43...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 21999,
    "originalPriceInr": 26000,
    "rating": 4.4,
    "reviewCount": 8,
    "images": [
      "https://m.media-amazon.com/images/I/61iSiA5CBhL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0FQNP8XVR",
    "name": "Haier H5E Series 108cm (43) 4K Ultra HD Smart LED Google TV 43H5E",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 30490,
    "originalPriceInr": 36000,
    "rating": 4.3,
    "reviewCount": 19,
    "images": [
      "https://m.media-amazon.com/images/I/61yP-fcmfEL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0F7X29WXX",
    "name": "Sony 108 cm (43 inches) BRAVIA 2M2 Series 4K Ultra HD Smart LED Google TV K-4...",
    "brand": "Sony",
    "category": "smart-tvs",
    "priceInr": 50990,
    "originalPriceInr": 60200,
    "rating": 4.5,
    "reviewCount": 1611,
    "images": [
      "https://m.media-amazon.com/images/I/81qddOopy4L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "4 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Sony",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0FJLR7CHW",
    "name": "Hisense 108 cm (43 Inches) 4K Ultra HD Smart Hi-QLED TV | 48W Speakers | Dolb...",
    "brand": "Hisense",
    "category": "smart-tvs",
    "priceInr": 31990,
    "originalPriceInr": 37700,
    "rating": 4,
    "reviewCount": 2159,
    "images": [
      "https://m.media-amazon.com/images/I/71cJYJywmbL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Hisense",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GYRRLP87",
    "name": "Samsung 55 inch (138cm) Crystal UHD 4K Vision AI 2026 Smart TV | 30W Speakers...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 48990,
    "originalPriceInr": 57800,
    "rating": 4.3,
    "reviewCount": 669,
    "images": [
      "https://m.media-amazon.com/images/I/81tilPzs7sL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GX52LD7V",
    "name": "VW 109 cm (43 inches) Spectra Series Full HD Smart QLED Android TV VW43AQ3",
    "brand": "VW",
    "category": "smart-tvs",
    "priceInr": 15499,
    "originalPriceInr": 18300,
    "rating": 3.9,
    "reviewCount": 16444,
    "images": [
      "https://m.media-amazon.com/images/I/817R+GUhSXL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "FullHD"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Android TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "VW",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Best Seller"
  },
  {
    "id": "B0GGRDG6GG",
    "name": "VW Visio World 140 cm (55 inches) Pro Series 4K Ultra HD Smart QLED Google TV...",
    "brand": "VW",
    "category": "smart-tvs",
    "priceInr": 34999,
    "originalPriceInr": 41300,
    "rating": 4.1,
    "reviewCount": 2607,
    "images": [
      "https://m.media-amazon.com/images/I/81o7aCBnHQL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "VW",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0F3JL33DW",
    "name": "Xiaomi (139 cm) 55 inch FX Pro 4K QLED Smart | HDR10+ | 34W Box Speakers | 12...",
    "brand": "Xiaomi",
    "category": "smart-tvs",
    "priceInr": 39999,
    "originalPriceInr": 47200,
    "rating": 4.2,
    "reviewCount": 2152,
    "images": [
      "https://m.media-amazon.com/images/I/81G7HkMBe1L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 120,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": true
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Fire TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Xiaomi",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GQCF2TCZ",
    "name": "Onida 139 cm (55 inches) Ultra HD 4K Smart LED Fire TV 55UFD",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 32999,
    "originalPriceInr": 38900,
    "rating": 4.3,
    "reviewCount": 3205,
    "images": [
      "https://m.media-amazon.com/images/I/81REdiu1BcL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GTZ8WM5W",
    "name": "LG 139 cms (55 inches) NU87 AI Series Nano 4K Ultra HD (3840 x 2160) Smart we...",
    "brand": "LG",
    "category": "smart-tvs",
    "priceInr": 45990,
    "originalPriceInr": 54300,
    "rating": 3.9,
    "reviewCount": 5228,
    "images": [
      "https://m.media-amazon.com/images/I/81IdR5bYsrL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "webOS"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "LG",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0FDQVJQKB",
    "name": "PHILIPS 139 cm (55 inches) 8100 Series 4K Ultra HD Smart QLED Google TV 55PQT...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 44499,
    "originalPriceInr": 52500,
    "rating": 4.1,
    "reviewCount": 1730,
    "images": [
      "https://m.media-amazon.com/images/I/81Gt9lHju6L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0F6YVKDR2",
    "name": "Xiaomi (139 cm) 55 inch X 4K Ultra HD Smart | Dolby Vision | 120Hz Game Boost...",
    "brand": "Xiaomi",
    "category": "smart-tvs",
    "priceInr": 37999,
    "originalPriceInr": 44800,
    "rating": 4.1,
    "reviewCount": 357,
    "images": [
      "https://m.media-amazon.com/images/I/81iQ+ctbEzL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 120,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": true
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Xiaomi",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0FVFX1135",
    "name": "coocaa 138 cm (55 inch) Frameless QLED Ultra Smart Google TV 55Y74 Pro",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 32999,
    "originalPriceInr": 38900,
    "rating": 4.2,
    "reviewCount": 130,
    "images": [
      "https://m.media-amazon.com/images/I/81VLgSp5WNL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0D3DW1CJF",
    "name": "Sony BRAVIA 3 Series 139 cm (55 inches) 4K Ultra HD AI Smart LED Google TV K-...",
    "brand": "Sony",
    "category": "smart-tvs",
    "priceInr": 74990,
    "originalPriceInr": 88500,
    "rating": 4.4,
    "reviewCount": 530,
    "images": [
      "https://m.media-amazon.com/images/I/81lheSoBIYL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "4 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Sony",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GVJSTKS6",
    "name": "TCL 139 cm (55 inches) 4K Ultra HD Smart QLED Google TV | HDR 10+ | Dolby Vis...",
    "brand": "TCL",
    "category": "smart-tvs",
    "priceInr": 43990,
    "originalPriceInr": 51900,
    "rating": 4.1,
    "reviewCount": 140,
    "images": [
      "https://m.media-amazon.com/images/I/71jRZx43cNL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "TCL",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GL7G3KWM",
    "name": "Hisense 139 cm (55 inches) E6S Series 4K Ultra HD Smart LED Google TV 55E6S",
    "brand": "Hisense",
    "category": "smart-tvs",
    "priceInr": 36990,
    "originalPriceInr": 43600,
    "rating": 4,
    "reviewCount": 894,
    "images": [
      "https://m.media-amazon.com/images/I/81J+NVx6NcL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Hisense",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0D9BW9PPP",
    "name": "Acer 139 cm (55 inches) Super Series 4K Ultra HD Smart QLED Google TV AR55QDX...",
    "brand": "Acer",
    "category": "smart-tvs",
    "priceInr": 37999,
    "originalPriceInr": 44800,
    "rating": 3.7,
    "reviewCount": 702,
    "images": [
      "https://m.media-amazon.com/images/I/71qXk3dq7mL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0G6LTHMLF",
    "name": "PHILIPS 138 cm (55 inches) 4K Ultra HD QLED Smart QD-Mini LED Google TV 55MLE...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 45990,
    "originalPriceInr": 54300,
    "rating": 4.2,
    "reviewCount": 289,
    "images": [
      "https://m.media-amazon.com/images/I/81Ws1OwXz1L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0F6ZCRGG5",
    "name": "Xiaomi (108 cm) 43 inch A FHD Smart LED | Google Assistant | Chromecast Built...",
    "brand": "Xiaomi",
    "category": "smart-tvs",
    "priceInr": 21999,
    "originalPriceInr": 26000,
    "rating": 4,
    "reviewCount": 546,
    "images": [
      "https://m.media-amazon.com/images/I/81liqnTzUrL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "FullHD"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Google TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Xiaomi",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0FCM6J32P",
    "name": "VW 109 cm (43 inches) OptimaX Series Full HD Smart QLED Android TV VW43AQ1",
    "brand": "VW",
    "category": "smart-tvs",
    "priceInr": 16599,
    "originalPriceInr": 19600,
    "rating": 3.8,
    "reviewCount": 3437,
    "images": [
      "https://m.media-amazon.com/images/I/81gqvGIGoYL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "FullHD"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Android TV"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "VW",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GX2HVQD3",
    "name": "Voice Command, Screen Mirror, 30W Speakers, A+ Grade Panel, Wi-Fi, HDMI, USB,...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 15490,
    "originalPriceInr": 18300,
    "rating": 4,
    "reviewCount": 56,
    "images": [
      "https://m.media-amazon.com/images/I/61XyE1eiOwL._SL1000_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0FN7NVFPM",
    "name": "Kodak QLED SE 108 cm (43 inch) Full HD Smart Linux TV 2025 Edition (43QSE5073)",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 16499,
    "originalPriceInr": 19500,
    "rating": 3.3,
    "reviewCount": 94,
    "images": [
      "https://m.media-amazon.com/images/I/71jpCjWoz0L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 43,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "QLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "FullHD"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "3 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true
  },
  {
    "id": "B0GXKKRVZJ",
    "name": "Samsung 55 inches OLED 4K Samsung Vision AI Smart TV QA55S85HAELXL",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 114990,
    "originalPriceInr": 135700,
    "rating": 4.8,
    "reviewCount": 27,
    "images": [
      "https://m.media-amazon.com/images/I/81YlBU00kVL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 55,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "OLED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 120,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": true
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "4 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GZKCC5TZ",
    "name": "Samsung 65 inch (163cm) Crystal UHD 4K Vision AI 2026 Smart TV | 30W Speakers...",
    "brand": "Samsung",
    "category": "smart-tvs",
    "priceInr": 68990,
    "originalPriceInr": 81400,
    "rating": 4.3,
    "reviewCount": 669,
    "images": [
      "https://m.media-amazon.com/images/I/81Q-uqdUoeL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "screenSizeInches",
        "label": "Screen Size",
        "value": 65,
        "unit": "inches"
      },
      {
        "key": "panelType",
        "label": "Panel Type",
        "value": "LED"
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "value": "4K"
      },
      {
        "key": "refreshRateHz",
        "label": "Refresh Rate",
        "value": 60,
        "unit": "Hz"
      },
      {
        "key": "hasHdmi21",
        "label": "HDMI 2.1",
        "value": false
      },
      {
        "key": "os",
        "label": "Smart Platform",
        "value": "Tizen"
      },
      {
        "key": "energyRating",
        "label": "Energy Rating",
        "value": "4 Star"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Standard Delivery"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0F29HNJL1",
    "name": "15.6\" FHD Laptop 16GB DDR5 5500MHz RAM | 512GB NVMe SSD | Windows 11",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 58090,
    "originalPriceInr": 68500,
    "rating": 4,
    "reviewCount": 498,
    "images": [
      "https://m.media-amazon.com/images/I/61qL-lDAZEL._SL1254_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GV1L119H",
    "name": "Dell 15 (Previously Inspiron) Laptop, 14th Gen Intel Core i3/Core 3 100U Processor...",
    "brand": "Dell",
    "category": "laptops",
    "priceInr": 60490,
    "originalPriceInr": 71400,
    "rating": 4,
    "reviewCount": 1115,
    "images": [
      "https://m.media-amazon.com/images/I/61lqGPKKZAL._SL1254_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i3 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Dell",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FJYJ8LVY",
    "name": "HP 15 Smartchoice, AMD Ryzen 3 7320U (8GB LPDDR5, 512GB SSD) FHD, Anti-Glare, Micr...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 56990,
    "originalPriceInr": 67200,
    "rating": 4.2,
    "reviewCount": 138,
    "images": [
      "https://m.media-amazon.com/images/I/71JcEk00fqL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 3 7320U"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 15.6,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FZKZTXSN",
    "name": "Dell 15 (Previously Inspiron) Laptop, 14th Gen Intel Core i3/Core 3 100U Processor...",
    "brand": "Dell",
    "category": "laptops",
    "priceInr": 56490,
    "originalPriceInr": 66700,
    "rating": 4,
    "reviewCount": 367,
    "images": [
      "https://m.media-amazon.com/images/I/617L+f7pSrL._SL1254_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i3 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Dell",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0H45YFPJT",
    "name": "Acer Smartchoice Aspire One, AMD Ryzen 5-40, 8GB LPDDR5 RAM/ 256GB SSD, 14.0\"...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 42999,
    "originalPriceInr": 50700,
    "rating": 4.1,
    "reviewCount": 11,
    "images": [
      "https://m.media-amazon.com/images/I/71EiFZ4uOpL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 5 7520U"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 256,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GYRK1RZC",
    "name": "Acer Smartchoice Aspire One, AMD Ryzen 3-7320U, 8GB LPDDR5 RAM/ 256GB SSD, 14.0&qu...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 42990,
    "originalPriceInr": 50700,
    "rating": 3.6,
    "reviewCount": 96,
    "images": [
      "https://m.media-amazon.com/images/I/71MbIVSIhAL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 3 7320U"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 256,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0CL7CMTXS",
    "name": "Lenovo V15 G4 AMD Athlon Silver 7120U Laptop 8GB LPDDR5 Ram, 512 GB SSD PCIe, Wind...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 46999,
    "originalPriceInr": 55500,
    "rating": 4,
    "reviewCount": 388,
    "images": [
      "https://m.media-amazon.com/images/I/61AccNkmFFL._SL1350_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 15.6,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0H2J8DDKH",
    "name": "ASUS Chromebook CM1405 (2026), Smartchoice, MediaTek Kompanio 540 Processor, 4GB R...",
    "brand": "ASUS",
    "category": "laptops",
    "priceInr": 20990,
    "originalPriceInr": 24800,
    "rating": 4.1,
    "reviewCount": 12,
    "images": [
      "https://m.media-amazon.com/images/I/71UhRPa+WsL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 4,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "ASUS",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0D2Y1BLDT",
    "name": "Dell 15, Intel Core 13th Gen i5-1334U, FHD, 15.6\"/39.62cm, Windows 11, MSO&#x...",
    "brand": "Dell",
    "category": "laptops",
    "priceInr": 69990,
    "originalPriceInr": 82600,
    "rating": 3.8,
    "reviewCount": 398,
    "images": [
      "https://m.media-amazon.com/images/I/712WiT-wexL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Dell",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0DX1VZDTG",
    "name": "ASUS Vivobook 16, Snapdragon X, 16GB RAM, 512GB SSD, FHD+ 16\", Windows 11, Of...",
    "brand": "ASUS",
    "category": "laptops",
    "priceInr": 61990,
    "originalPriceInr": 73100,
    "rating": 4.1,
    "reviewCount": 100,
    "images": [
      "https://m.media-amazon.com/images/I/71oGM-26fZL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "ASUS",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FJYJP1L6",
    "name": "HP Smartchoice Victus, AMD Ryzen 7 7445HS, 6GB RTX 4050, 16GB DDR5(Upgradeable) 51...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 107990,
    "originalPriceInr": 127400,
    "rating": 4.1,
    "reviewCount": 132,
    "images": [
      "https://m.media-amazon.com/images/I/71r2ySSfgBL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 7 7735HS"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0F8P4Y7VF",
    "name": "HP OmniBook 5 OLED (Previously Pavilion), Snapdragon X Processor 45 Tops (16GB LPD...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 79990,
    "originalPriceInr": 94400,
    "rating": 4.1,
    "reviewCount": 133,
    "images": [
      "https://m.media-amazon.com/images/I/61aLy7kImQL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GHQ3F9MM",
    "name": "Intel UHD Graphics | Thin and Light Business Laptop | 15.6\" FHD Display | Cop...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 50400,
    "originalPriceInr": 59500,
    "rating": 5,
    "reviewCount": 1,
    "images": [
      "https://m.media-amazon.com/images/I/71xd8vySbcL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 15.6,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0H5VXC1CZ",
    "name": "HP 14 Laptop, Intel Core Ultra 7 155H (16GB DDR5, 512GB SSD) FHD, Anti-Glare, Micr...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 88990,
    "originalPriceInr": 105000,
    "rating": 4.5,
    "reviewCount": 2,
    "images": [
      "https://m.media-amazon.com/images/I/61NPnmrjKwL._SL1254_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core Ultra 7 155H"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0FFTLRYRV",
    "name": "HP 15 (i5 14th Gen), Intel Core 5, 16GB RAM (Upgradeable), 512GB SSD, FHD, Anti-Gl...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 74990,
    "originalPriceInr": 88500,
    "rating": 3.7,
    "reviewCount": 51,
    "images": [
      "https://m.media-amazon.com/images/I/714WVl1GG8L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GY82GDW2",
    "name": "HP Chromebook 14, MediaTek Kompanio 540 (4GB LPDDR5, 128GB UFS) HD, Anti-Glare, Mi...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 25990,
    "originalPriceInr": 30700,
    "rating": 2.2,
    "reviewCount": 5,
    "images": [
      "https://m.media-amazon.com/images/I/71MdmsrpaFL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 4,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0H7HQJKS3",
    "name": "Lenovo IdeaPad Slim 3 Ryzen 5 7520U 15.6\" (39.6cm) FHD Thin and Light Laptop ...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 64990,
    "originalPriceInr": 76700,
    "rating": 5,
    "reviewCount": 1,
    "images": [
      "https://m.media-amazon.com/images/I/71TpJsdzvCL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 5 7520U"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0HGM9DT58",
    "name": "𝗗𝗲𝗹𝗹ModeI 5420 Touch Laptop | Core i5 11th Gen (1145g7) | Fast 8GB DDR4 RAM | ...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 34599,
    "originalPriceInr": 40800,
    "rating": 4.3,
    "reviewCount": 1100,
    "images": [
      "https://m.media-amazon.com/images/I/51vIhMJreOL._SL1100_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 256,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0FF4QBNWM",
    "name": "Acer Aspire 3, Intel Core Celeron N4500, 12GB LPDDR4X RAM, 512GB SSD, HD, 15.6&quo...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 39890,
    "originalPriceInr": 47100,
    "rating": 3.2,
    "reviewCount": 54,
    "images": [
      "https://m.media-amazon.com/images/I/61+6C077NmL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 12,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 15.6,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0HJ22N456",
    "name": "𝗗𝗲𝗹𝗹Laptop 5410 Model| 𝗜𝗡𝗧𝗘𝗟i5 10th Gen | 8GB DDR4 RAM | Fast 512GB SSD |...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 29999,
    "originalPriceInr": 35400,
    "rating": 4.3,
    "reviewCount": 1100,
    "images": [
      "https://m.media-amazon.com/images/I/51vIhMJreOL._SL1100_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0HGS2BS9C",
    "name": "HP 15 (2026), AMD Ryzen 5 Hexa Core 7535U - (8 GB DDR5/512 GB SSD/Radeon 660M Grap...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 54440,
    "originalPriceInr": 64200,
    "rating": 4.3,
    "reviewCount": 1100,
    "images": [
      "https://m.media-amazon.com/images/I/71gGeGiFNKL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 5 7520U"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 15.6,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Pro"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GW8JNM6J",
    "name": "Acer Smartchoice Aspire One, Intel Core Celeron N4500, Office 2024 + M365 Basic, 1...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 39990,
    "originalPriceInr": 47200,
    "rating": 2.5,
    "reviewCount": 31,
    "images": [
      "https://m.media-amazon.com/images/I/81BEfyD0qeL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 12,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GY82SJWT",
    "name": "HP Chromebook 14, MediaTek Kompanio 540 (4GB LPDDR5, 128GB UFS) HD, Touch, Anti-Gl...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 29990,
    "originalPriceInr": 35400,
    "rating": 3,
    "reviewCount": 3,
    "images": [
      "https://m.media-amazon.com/images/I/71e6f2c6zkL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 4,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0HFS6YCRY",
    "name": "𝗟𝗲𝗻𝗼𝘃𝗼_Model L490 Laptop| Core i5 8th Gen | 8GB Fast RAM | 512GB SSD | 14-in...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 29999,
    "originalPriceInr": 35400,
    "rating": 1,
    "reviewCount": 1,
    "images": [
      "https://m.media-amazon.com/images/I/51yQe-b+naL._SL1200_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0G2BHDDB8",
    "name": "HP 14 Smartchoice, Intel Core Ultra 5 125H 12 TOPS, 24GB DDR5 (Upgradeable) 1TB SS...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 88990,
    "originalPriceInr": 105000,
    "rating": 3.8,
    "reviewCount": 90,
    "images": [
      "https://m.media-amazon.com/images/I/71vhdLDaDQL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core Ultra 5 125H"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 24,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 1024,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GRHZDJBJ",
    "name": "Lenovo ThinkBook 16, Intel Core Ultra 9 185H, 16GB RAM, 512GB SSD, WUXGA IPS 16” (...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 98990,
    "originalPriceInr": 116800,
    "rating": 3.9,
    "reviewCount": 20,
    "images": [
      "https://m.media-amazon.com/images/I/511EukRBJzL._SL1080_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core Ultra 9"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GWQC4JGJ",
    "name": "HP 14 Smartchoice, Intel Core Ultra 5 125H 12 TOPS, 24GB DDR5 (Upgradeable) 1TB SS...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 89999,
    "originalPriceInr": 106200,
    "rating": 3.7,
    "reviewCount": 27,
    "images": [
      "https://m.media-amazon.com/images/I/81XstkrCA8L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core Ultra 5 125H"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 24,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 1024,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0H8S8QYXF",
    "name": "Acer Smartchoice Aspire One, Intel Core Celeron N4500, 8GB LPDDR4 RAM/ 256GB SSD, ...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 35990,
    "originalPriceInr": 42500,
    "rating": 1.7,
    "reviewCount": 8,
    "images": [
      "https://m.media-amazon.com/images/I/71UQqLGuRVL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 8,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 256,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0D5D7Z3JF",
    "name": "HP EliteBook 650 G10 (2026), Intel Core i3 13th Gen 1315U - (16 GB/512 GB SSD/Inte...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 59090,
    "originalPriceInr": 69700,
    "rating": 4.3,
    "reviewCount": 1100,
    "images": [
      "https://m.media-amazon.com/images/I/71J7yCWRWJL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i3 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.7,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Pro"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GWQ7MQ1Q",
    "name": "HP Smartchoice Victus, AMD Ryzen 7 7445HS, 6GB RTX 3050, 16GB DDR5(Upgradeable) 51...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 106990,
    "originalPriceInr": 126200,
    "rating": 3.8,
    "reviewCount": 114,
    "images": [
      "https://m.media-amazon.com/images/I/71y08xoW4WL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 7 7735HS"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0DXVGVNKN",
    "name": "Acer ALG, 13th Gen Intel Core i5-13420H, NVIDIA GeForce RTX 3050-6GB DDR6, 16GB RA...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 88888,
    "originalPriceInr": 104900,
    "rating": 4.1,
    "reviewCount": 368,
    "images": [
      "https://m.media-amazon.com/images/I/81G1L3nptrL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 6,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0HCP6FPH9",
    "name": "ASUS TUF 16 (2026),14th Gen,Intel Core i7 14650HX,RTX 5060-8GB,16GB RAM (Upgradeab...",
    "brand": "ASUS",
    "category": "laptops",
    "priceInr": 209990,
    "originalPriceInr": 247800,
    "rating": 1,
    "reviewCount": 1,
    "images": [
      "https://m.media-amazon.com/images/I/81FX76PgZTL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i7 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "ASUS",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GMRBPN88",
    "name": "Acer ALG, Intel Core7-240H Processor, NVIDIA GeForce RTX 3050-6GB DDR6, 16GB RAM, ...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 87999,
    "originalPriceInr": 103800,
    "rating": 4,
    "reviewCount": 3,
    "images": [
      "https://m.media-amazon.com/images/I/7164hQOfDuL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 6,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GVD8MRQ2",
    "name": "Lenovo LOQ Intel Core i5-13450HX| NVIDIA RTX 3050 6GB (16GB RAM/512GB SSD/144Hz Re...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 104990,
    "originalPriceInr": 123900,
    "rating": 4.1,
    "reviewCount": 9,
    "images": [
      "https://m.media-amazon.com/images/I/81sI6re6MPL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GT11NJ6T",
    "name": "HP Victus,13th Gen Intel core i7-13650HX, 6GB RTX 4050, 24GB DDR5(Upgradeable), 51...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 142990,
    "originalPriceInr": 168700,
    "rating": 4.2,
    "reviewCount": 5,
    "images": [
      "https://m.media-amazon.com/images/I/71fg+YsiT3L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i7 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 24,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B09BLFXHHY",
    "name": "ASUS ProArt P16 (2026),AMD Ryzen AI 9 HX 370,RTX 5080-16GB,32GB RAM,1TB SSD,4K OLE...",
    "brand": "ASUS",
    "category": "laptops",
    "priceInr": 469990,
    "originalPriceInr": 554600,
    "rating": 4.3,
    "reviewCount": 1100,
    "images": [
      "https://m.media-amazon.com/images/I/71F5SD-YmVL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 32,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 1024,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 2.3,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "ASUS",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0H6J8QQDZ",
    "name": "Acer ALG, Intel Core5-210H Processor, NVIDIA GeForceRTX 3050-4GB DDR6,16GB RAM/ 51...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 79990,
    "originalPriceInr": 94400,
    "rating": 3,
    "reviewCount": 1,
    "images": [
      "https://m.media-amazon.com/images/I/7164hQOfDuL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 4,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0DQD9JR98",
    "name": "ASUS ROG Strix G16, Intel Core Ultra 9 275HX, Gaming Laptop(RTX 5060-8GB/115W TGP/...",
    "brand": "ASUS",
    "category": "laptops",
    "priceInr": 199990,
    "originalPriceInr": 236000,
    "rating": 4.3,
    "reviewCount": 21,
    "images": [
      "https://m.media-amazon.com/images/I/81Gbez5e7fL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core Ultra 9"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 1024,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 2.3,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "ASUS",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0H6J2QR44",
    "name": "Acer ALG, Intel Core5-210H Processor, NVIDIA GeForceRTX 3050-4GB DDR6, Office 2024...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 82990,
    "originalPriceInr": 97900,
    "rating": 3.5,
    "reviewCount": 3,
    "images": [
      "https://m.media-amazon.com/images/I/7164hQOfDuL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 4,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FMFPW419",
    "name": "HP Omen Smartchoice, AMD Ryzen 9 8940HX, 8GB RTX 5070, 24GB DDR5(Upgradeable) 1TB ...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 234990,
    "originalPriceInr": 277300,
    "rating": 4.8,
    "reviewCount": 27,
    "images": [
      "https://m.media-amazon.com/images/I/71nNdnlAs2L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 9 7940HS"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 24,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 1024,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 2.3,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0DFHFCS4Y",
    "name": "Acer ALG, 13th Gen, Intel Core i7 13620H, NVIDIA GeForce RTX 3050-6GB, 16GB RAM, 5...",
    "brand": "Acer",
    "category": "laptops",
    "priceInr": 79990,
    "originalPriceInr": 94400,
    "rating": 3.8,
    "reviewCount": 106,
    "images": [
      "https://m.media-amazon.com/images/I/81sAOthl+7L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i7 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 8,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Acer",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FM3WC2QY",
    "name": "HP Omen Smartchoice, Intel Core i7-14650HX 14th Gen, 8GB RTX 5060, 24GB DDR5(Upgra...",
    "brand": "HP",
    "category": "laptops",
    "priceInr": 159990,
    "originalPriceInr": 188800,
    "rating": 3.6,
    "reviewCount": 25,
    "images": [
      "https://m.media-amazon.com/images/I/71Ev+vs5omL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i7 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 24,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 1024,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "HP",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0G4SQRY6T",
    "name": "MSI Thin 15, Intel 13th Gen. i5-13420H, 40CM FHD 144Hz Gaming Laptop (16GB/512GB N...",
    "brand": "MSI",
    "category": "laptops",
    "priceInr": 88990,
    "originalPriceInr": 105000,
    "rating": 4.6,
    "reviewCount": 18,
    "images": [
      "https://m.media-amazon.com/images/I/51w9ar5n+UL._SL1080_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "MSI",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GTZKGNM6",
    "name": "Lenovo LOQ Essential AMD Ryzen 7 170 | NVIDIA RTX 4050 6GB (16GB RAM/512GB SSD/144...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 125990,
    "originalPriceInr": 148700,
    "rating": 4,
    "reviewCount": 1,
    "images": [
      "https://m.media-amazon.com/images/I/81t8-5NQHYL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 7 7735HS"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FH58918R",
    "name": "MSI Thin 15, Intel 13th Gen. i7-13620H, 40CM FHD 144Hz Gaming Laptop (16GB/512GB N...",
    "brand": "MSI",
    "category": "laptops",
    "priceInr": 89990,
    "originalPriceInr": 106200,
    "rating": 2.9,
    "reviewCount": 2,
    "images": [
      "https://m.media-amazon.com/images/I/51RS-OyWu7L._SL1080_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i7 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "MSI",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0DPQGVH85",
    "name": "Lenovo LOQ 12th Gen Core i5-12450HX | NVIDIA RTX 3050 6GB (16GB RAM/512GB SSD/15.6...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 113900,
    "originalPriceInr": 134400,
    "rating": 4.2,
    "reviewCount": 210,
    "images": [
      "https://m.media-amazon.com/images/I/81tmCrtiRgL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 2.3,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B073XPHP94",
    "name": "Alienware 16 Aurora Gaming Laptop, Intel Core 7 240H Processor, 16GB DDR5, 1TB SSD...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 152990,
    "originalPriceInr": 180500,
    "rating": 4,
    "reviewCount": 4,
    "images": [
      "https://m.media-amazon.com/images/I/71k0o7G9MQL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 1024,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 2.3,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FN4MKG81",
    "name": "Lenovo LOQ 2025, AMD Ryzen 7-250, RTX 5050-8GB, 24GB RAM, 1TB SSD, 440 AI Tops, FH...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 164500,
    "originalPriceInr": 194100,
    "rating": 3.8,
    "reviewCount": 16,
    "images": [
      "https://m.media-amazon.com/images/I/813jrBDb2DL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 7 7735HS"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 24,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 1024,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FY2ZT5B3",
    "name": "Lenovo Legion 5 2025 AMD Ryzen 7 260 | NVIDIA RTX 5050 8GB (16GB RAM/1TB SSD/WUXGA...",
    "brand": "Lenovo",
    "category": "laptops",
    "priceInr": 169990,
    "originalPriceInr": 200600,
    "rating": 4.3,
    "reviewCount": 7,
    "images": [
      "https://m.media-amazon.com/images/I/81O1uCPS8lL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "AMD Ryzen 7 7735HS"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 1024,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 16,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 2.3,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Lenovo",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0H265CG8K",
    "name": "ASUS Gaming V16 (2026),Intel Core 5 210H (i5-14th Gen),RTX 5050-8GB,16GB RAM(Upgra...",
    "brand": "ASUS",
    "category": "laptops",
    "priceInr": 139990,
    "originalPriceInr": 165200,
    "rating": 4.3,
    "reviewCount": 1100,
    "images": [
      "https://m.media-amazon.com/images/I/71yYw4-W1XL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "processor",
        "label": "Processor",
        "value": "Intel Core i5 12th/13th Gen"
      },
      {
        "key": "ramGb",
        "label": "RAM",
        "value": 16,
        "unit": "GB"
      },
      {
        "key": "storageGb",
        "label": "Storage",
        "value": 512,
        "unit": "GB SSD"
      },
      {
        "key": "screenSizeInches",
        "label": "Display",
        "value": 14,
        "unit": "inches"
      },
      {
        "key": "batteryHours",
        "label": "Battery Life",
        "value": 12,
        "unit": "hrs"
      },
      {
        "key": "weightKg",
        "label": "Weight",
        "value": 1.35,
        "unit": "kg"
      },
      {
        "key": "os",
        "label": "OS",
        "value": "Windows 11 Home"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "ASUS",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B084685MT1",
    "name": "Sony HT-S20R Real 5.1ch Dolby Digital Soundbar for TV with subwoofer and Compact R...",
    "brand": "Sony",
    "category": "soundbars",
    "priceInr": 15989,
    "originalPriceInr": 18900,
    "rating": 4.6,
    "reviewCount": 20475,
    "images": [
      "https://m.media-amazon.com/images/I/71h7fLNEQPL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 400,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Digital"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Sony",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0F7XNF1QF",
    "name": "ZEBRONICS 90 Watts, Compact Soundbar, Home Theatre, Dual Driver Soundbar, 11.43cm ...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 3499,
    "originalPriceInr": 4100,
    "rating": 3.9,
    "reviewCount": 1131,
    "images": [
      "https://m.media-amazon.com/images/I/71+Y1B4HaqL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 90,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0797MY6JB",
    "name": "Sony HT-S100F 2.0 Ch Dolby Audio Soundbar with Bass Reflex Speaker for deep Bass, ...",
    "brand": "Sony",
    "category": "soundbars",
    "priceInr": 7989,
    "originalPriceInr": 9400,
    "rating": 4.4,
    "reviewCount": 9048,
    "images": [
      "https://m.media-amazon.com/images/I/510P8uQSOLL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 120,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.0 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Sony",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0BZ4DJ7GZ",
    "name": "boAt Aavante Bar 610, 25W Signature Sound, 2.0 CH with Dual Passive Radiators, 7 H...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 1999,
    "originalPriceInr": 2400,
    "rating": 4,
    "reviewCount": 5322,
    "images": [
      "https://m.media-amazon.com/images/I/51SFh0i5HHL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 25,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.0 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0DX74CK7R",
    "name": "ZEBRONICS 42 Watts Bluetooth Soundbar, 7 Hours Playback, Powerful Dual Drivers, LE...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 2099,
    "originalPriceInr": 2500,
    "rating": 4.4,
    "reviewCount": 109,
    "images": [
      "https://m.media-amazon.com/images/I/51qk387hEpL._SL1100_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 42,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0D45Y8313",
    "name": "JBL Cinema SB510, Dolby Audio Soundbar with Built-in Subwoofer for Deep Bass, 3.1 ...",
    "brand": "JBL",
    "category": "soundbars",
    "priceInr": 9999,
    "originalPriceInr": 11800,
    "rating": 3.8,
    "reviewCount": 917,
    "images": [
      "https://m.media-amazon.com/images/I/51-XdcfhCJL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 200,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "3.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "JBL",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GH1XW61R",
    "name": "ZEBRONICS 80W Soundbar with Dual Drivers, 2.0 Channel with Dual Drivers, BTv5.4, T...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 3499,
    "originalPriceInr": 4100,
    "rating": 3.8,
    "reviewCount": 38,
    "images": [
      "https://m.media-amazon.com/images/I/61XUoTsFj-L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 80,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.0 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FFHCZPWC",
    "name": "GOVO GOSURROUND 600 | 90W Soundbar | 2.1 Channel Home Theatre | Deep Bass from 4” ...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 3599,
    "originalPriceInr": 4200,
    "rating": 4,
    "reviewCount": 202,
    "images": [
      "https://m.media-amazon.com/images/I/61qFVWzwFYL._SL1200_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 90,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0DWWY1FVV",
    "name": "ZEBRONICS 120 Watts Soundbar, Home Theatre, Dual Racetrack Drivers Soundbar, 13.33...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 3999,
    "originalPriceInr": 4700,
    "rating": 4.1,
    "reviewCount": 468,
    "images": [
      "https://m.media-amazon.com/images/I/71FuYja3qaL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 120,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FPFGQ5HN",
    "name": "Samsung 300 W 2.1 ch Soundbar with Dolby Audio | DTS Virtual:X | Bass Boost | 3D s...",
    "brand": "Samsung",
    "category": "soundbars",
    "priceInr": 12990,
    "originalPriceInr": 15300,
    "rating": 4.4,
    "reviewCount": 129,
    "images": [
      "https://m.media-amazon.com/images/I/71WRbBfN6CL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 300,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0G7K5J9D8",
    "name": "Philips TAB4120BL/94 Wireless Bluetooth Soundbar, 20W, 8H Playtime, Bluetooth 5.1,...",
    "brand": "Philips",
    "category": "soundbars",
    "priceInr": 1699,
    "originalPriceInr": 2000,
    "rating": 3.7,
    "reviewCount": 242,
    "images": [
      "https://m.media-amazon.com/images/I/61-NXuLQCCL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 94,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Philips",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B09YV5LC7F",
    "name": "GOVO GOSURROUND 900 | 200W Soundbar | 2.1 Channel Home Theatre | Deep Bass from 6....",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 7149,
    "originalPriceInr": 8400,
    "rating": 4.4,
    "reviewCount": 3310,
    "images": [
      "https://m.media-amazon.com/images/I/51TEhp-YXzL._SL1200_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 200,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0GVK6WS2H",
    "name": "amazon basics 160W Soundbar with Subwoofer, 2.1 Channel Sound System for TV, 6.5&q...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 4199,
    "originalPriceInr": 5000,
    "rating": 3.6,
    "reviewCount": 23,
    "images": [
      "https://m.media-amazon.com/images/I/61cgyqrnA3L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 160,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FDFRGWLQ",
    "name": "boAt Aavante 2.1 1600D / Orion Plus, Dolby Audio, 160W Signature Sound, 2.1CH Wire...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 6999,
    "originalPriceInr": 8300,
    "rating": 4.2,
    "reviewCount": 812,
    "images": [
      "https://m.media-amazon.com/images/I/813Ru0LsF9L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 160,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0CR1NWYLD",
    "name": "ZEBRONICS Juke BAR 3902 Soundbar with 140 Watts, HDMI (ARC), Optical, USB, AUX, Bl...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 4299,
    "originalPriceInr": 5100,
    "rating": 4.2,
    "reviewCount": 880,
    "images": [
      "https://m.media-amazon.com/images/I/71btr99Q7XL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 140,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FVDX157R",
    "name": "CrossBeats Blaze B50 (2026) Bluetooth 50W Soundbar Gaming RGB Light, AUX, BT, SD C...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 2299,
    "originalPriceInr": 2700,
    "rating": 3.6,
    "reviewCount": 275,
    "images": [
      "https://m.media-amazon.com/images/I/61pVIQ4FZAL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 50,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FHKT61TK",
    "name": "boAt Aavante 2.1 2000D, Dolby Audio, 200W Signature Sound, 2.1CH Wired Subwoofer,M...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 7999,
    "originalPriceInr": 9400,
    "rating": 4.4,
    "reviewCount": 400,
    "images": [
      "https://m.media-amazon.com/images/I/7196lzgENgL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 200,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0D45ZCN3Y",
    "name": "JBL Newly Launched Cinema SB560, Dolby Audio Soundbar with Wireless Subwoofer for ...",
    "brand": "JBL",
    "category": "soundbars",
    "priceInr": 14999,
    "originalPriceInr": 17700,
    "rating": 4.1,
    "reviewCount": 534,
    "images": [
      "https://m.media-amazon.com/images/I/611ej28dP7L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 200,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "3.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "JBL",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0961X3R2H",
    "name": "Sony HT-S40R Real 5.1ch Dolby Audio Soundbar for TV with Subwoofer & Wireless Rear...",
    "brand": "Sony",
    "category": "soundbars",
    "priceInr": 24989,
    "originalPriceInr": 29500,
    "rating": 4.6,
    "reviewCount": 8879,
    "images": [
      "https://m.media-amazon.com/images/I/51m4NsZau4L._SL1212_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 600,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Sony",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0F4RFHMW3",
    "name": "iGear Immerse+ 30W Bluetooth Soundbar Speaker | Heavy Bass, TWS Function, 4 Hrs+ P...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 1799,
    "originalPriceInr": 2100,
    "rating": 4.2,
    "reviewCount": 56,
    "images": [
      "https://m.media-amazon.com/images/I/51UssXD6DJL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 30,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B09RQR84CC",
    "name": "Zebronics 400 Watts Soundbar, 5.1 CH, Dual Rear Satellites, Triple Driver Soundbar...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 7299,
    "originalPriceInr": 8600,
    "rating": 4.1,
    "reviewCount": 3203,
    "images": [
      "https://m.media-amazon.com/images/I/71gPoN7lOkL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 400,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0F5B7RTC7",
    "name": "boAt Aavante 2.1 2000, 200W, EQ Modes, Multi Compatibility, Premium Design, Remote...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 6999,
    "originalPriceInr": 8300,
    "rating": 3.9,
    "reviewCount": 409,
    "images": [
      "https://m.media-amazon.com/images/I/71Wrs49loGL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 200,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0B25LLHKF",
    "name": "Zebronics 130W Soundbar, Dual 7.62cm Subwoofers, Dual Drivers, BTv5.0, HDMI ARC, O...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 4999,
    "originalPriceInr": 5900,
    "rating": 3.8,
    "reviewCount": 509,
    "images": [
      "https://m.media-amazon.com/images/I/61U30tT8eJL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 130,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GVKJDFZ6",
    "name": "amazon basics 180W Soundbar with Subwoofer & Surround Speakers, 5.1 Channel Home T...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 5579,
    "originalPriceInr": 6600,
    "rating": 4,
    "reviewCount": 2,
    "images": [
      "https://m.media-amazon.com/images/I/61+LKhCcGfL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 180,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0CWLG22T2",
    "name": "Philips Audio TAB4228/94 Award Winning 160W Bluetooth Soundbar with Rich Bass,3 EQ...",
    "brand": "Philips",
    "category": "soundbars",
    "priceInr": 9499,
    "originalPriceInr": 11200,
    "rating": 4.2,
    "reviewCount": 73,
    "images": [
      "https://m.media-amazon.com/images/I/61aGN-2jUQL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 160,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Philips",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FPRC9RX8",
    "name": "Zebronics 200W Soundbar with Dual Drivers, Virtual 5.1 Surround, 5.2&quot; Subwoof...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 6299,
    "originalPriceInr": 7400,
    "rating": 4.2,
    "reviewCount": 151,
    "images": [
      "https://m.media-amazon.com/images/I/718GDZcyErL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 200,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B093SQBFM7",
    "name": "Samsung 150 W Dolby Digital Bluetooth Soundbar (HW-T42E/XL, Black, 2.1 Channel)",
    "brand": "Samsung",
    "category": "soundbars",
    "priceInr": 10490,
    "originalPriceInr": 12400,
    "rating": 4.1,
    "reviewCount": 1554,
    "images": [
      "https://m.media-amazon.com/images/I/71YUCeNf93L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 150,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Digital"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Samsung",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B09SQWQ4TC",
    "name": "Sony HT-S400 2.1ch soundbar with Powerful Wireless subwoofer, S-Force PRO Front Su...",
    "brand": "Sony",
    "category": "soundbars",
    "priceInr": 17989,
    "originalPriceInr": 21200,
    "rating": 4.5,
    "reviewCount": 2259,
    "images": [
      "https://m.media-amazon.com/images/I/61AvogxU+wL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 330,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Digital"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Sony",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0DRJ6L99Q",
    "name": "Blaupunkt SBA20+ 20W Bluetooth Soundbar for TV with Bluetooth/SD Card/Aux, Mini So...",
    "brand": "Blaupunkt",
    "category": "soundbars",
    "priceInr": 1227,
    "originalPriceInr": 1400,
    "rating": 3.8,
    "reviewCount": 137,
    "images": [
      "https://m.media-amazon.com/images/I/61tcYMhtzhL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 20,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Blaupunkt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GT5FKLYH",
    "name": "LG SF1A 30 Watts 2.0 Channel Mood Lighting, Compact Size Soundbar with Bluetooth W...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 6490,
    "originalPriceInr": 7700,
    "rating": 3.9,
    "reviewCount": 7,
    "images": [
      "https://m.media-amazon.com/images/I/51w-sGwrg+L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 30,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.0 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FBLXNT8T",
    "name": "Sony Bravia Theatre Bar 6 HT-BD60 5.1(3.1.2 ch) Dolby Atmos Soundbar with Wireless...",
    "brand": "Sony",
    "category": "soundbars",
    "priceInr": 35989,
    "originalPriceInr": 42500,
    "rating": 4.7,
    "reviewCount": 282,
    "images": [
      "https://m.media-amazon.com/images/I/71+94bk9oxL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 400,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Atmos, DTS:X"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Sony",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0C2Z5SQN9",
    "name": "GOVO GOSURROUND 950 | 500W Sound bar | 5.1 Channel Home Theatre with 6.5&quot; sub...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 10849,
    "originalPriceInr": 12800,
    "rating": 4.1,
    "reviewCount": 2698,
    "images": [
      "https://m.media-amazon.com/images/I/712ZgHThQEL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 500,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0D6W8XQ6J",
    "name": "Bose New Smart Dolby Atmos Soundbar, Bluetooth Soundbar Speaker with Voice Control...",
    "brand": "Bose",
    "category": "soundbars",
    "priceInr": 57900,
    "originalPriceInr": 68300,
    "rating": 4.4,
    "reviewCount": 807,
    "images": [
      "https://m.media-amazon.com/images/I/71vjvsZCiNL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 400,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Atmos, DTS:X"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Bose",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0H29SG4MQ",
    "name": "Zebronics Juke Bar 501 Soundbar, 200W RMS, Virtual 5.1, Dual Drivers, 13.33cm Subw...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 6499,
    "originalPriceInr": 7700,
    "rating": 4.2,
    "reviewCount": 880,
    "images": [
      "https://m.media-amazon.com/images/I/71SyW32YgwL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 200,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FPLD5WW6",
    "name": "4000mAH Battery, 8hrs Playtime, 52mm Dual Bass Driver, RGB Lights, BT V5.4",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 1599,
    "originalPriceInr": 1900,
    "rating": 4,
    "reviewCount": 38,
    "images": [
      "https://m.media-amazon.com/images/I/81mnNgagpVL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 120,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0DSSX42WX",
    "name": "ZEBRONICS VITA BAR 201, Wireless Bluetooth Soundbar, 30 Watts, Upto 8 Hours Playba...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 1699,
    "originalPriceInr": 2000,
    "rating": 3.7,
    "reviewCount": 142,
    "images": [
      "https://m.media-amazon.com/images/I/71ILk3DQPOL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 30,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B08X6LYPHK",
    "name": "2.0 Stereo Enhanced Auido Quality, Touch-Control Backlit, Volume Knob, Plug & Play...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 2188,
    "originalPriceInr": 2600,
    "rating": 4.3,
    "reviewCount": 5672,
    "images": [
      "https://m.media-amazon.com/images/I/71uxvFfkj-L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 120,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.0 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B09WDPV6YC",
    "name": "Sonos Beam (Gen 2) | Soundbar with Dolby Atmos, Amazon Alexa for TV and Music Stre...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 49999,
    "originalPriceInr": 59000,
    "rating": 4.4,
    "reviewCount": 96,
    "images": [
      "https://m.media-amazon.com/images/I/51K1eC2y7RL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 400,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Atmos, DTS:X"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0FHH1WRHJ",
    "name": "CrossBeats Blaze B50 (2024) Bluetooth 50W Soundbar Gaming RGB Light, AUX, BT, SD C...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 2299,
    "originalPriceInr": 2700,
    "rating": 3.6,
    "reviewCount": 39,
    "images": [
      "https://m.media-amazon.com/images/I/61GZja6YPiL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 50,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0B2KQFTG9",
    "name": "Sonos Ray Essential Soundbar for TV, Music and Video Games - Black",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 45878,
    "originalPriceInr": 54100,
    "rating": 4.4,
    "reviewCount": 984,
    "images": [
      "https://m.media-amazon.com/images/I/51BhCmbBNVL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 400,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 2,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B0BFRMRPBF",
    "name": "Zunate Soundbar, 3D Stereo Sound with USB Cable and 3.5 mm Input - Portable for De...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 8140,
    "originalPriceInr": 9600,
    "rating": 3.9,
    "reviewCount": 30,
    "images": [
      "https://m.media-amazon.com/images/I/61j7Jnl+w-L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 120,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0F5BC2161",
    "name": "boAt Aavante 2.0 150, 2.0 CH, 16W Signature Sound, RGB LEDs, Dual Full-Range Drive...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 1499,
    "originalPriceInr": 1800,
    "rating": 4,
    "reviewCount": 636,
    "images": [
      "https://m.media-amazon.com/images/I/81t+HbL-ESL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 16,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.0 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0CSYX5RF6",
    "name": "Blaupunkt Newly Launched SBA20 Pro 25W Bluetooth Soundbar with 2000mAh Battery I R...",
    "brand": "Blaupunkt",
    "category": "soundbars",
    "priceInr": 1408,
    "originalPriceInr": 1700,
    "rating": 3.9,
    "reviewCount": 1013,
    "images": [
      "https://m.media-amazon.com/images/I/51jjkYq3tbL._SL1440_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 25,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Blaupunkt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0BTDB3JYN",
    "name": "CrossBeats Blaze B24 Bluetooth Soundbar 24W, Gaming RGB Lights, AUX, Bluetooth, US...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 1499,
    "originalPriceInr": 1800,
    "rating": 4,
    "reviewCount": 1867,
    "images": [
      "https://m.media-amazon.com/images/I/617zMg4888L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 24,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FHJ281GB",
    "name": "boAt Aavante 2.1 1650, 160W Signature Sound, 2.1-Channel with Wireless Subwoofer, ...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 5999,
    "originalPriceInr": 7100,
    "rating": 4,
    "reviewCount": 21,
    "images": [
      "https://m.media-amazon.com/images/I/71HRfbtRc1L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 160,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0D4ZD52G5",
    "name": "GOVO GoSurround 990 Dolby Digital | 525W Sound bar, 5.1 Channel Home Theatre, 6.5&...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 15149,
    "originalPriceInr": 17900,
    "rating": 3.4,
    "reviewCount": 1177,
    "images": [
      "https://m.media-amazon.com/images/I/61u-PI9YTOL._SL1200_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 525,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Digital"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0FM43FR9D",
    "name": "Zebronics Wireless Bluetooth Soundbar, 42 Watts, Upto 7h Playback, Dual 57mm Drive...",
    "brand": "Zebronics",
    "category": "soundbars",
    "priceInr": 3499,
    "originalPriceInr": 4100,
    "rating": 3.9,
    "reviewCount": 1572,
    "images": [
      "https://m.media-amazon.com/images/I/91RCOb2QgEL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 42,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "2.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "Zebronics",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B0GKYXBS13",
    "name": "TRONICA 444 Superb 5.1 Bluetooth Home Theater System 45W with FM/PenDrive/Sd Card/...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 2443,
    "originalPriceInr": 2900,
    "rating": 4.3,
    "reviewCount": 28,
    "images": [
      "https://m.media-amazon.com/images/I/618vwVe4U2L._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 45,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true,
    "badge": "Highly Rated"
  },
  {
    "id": "B07BHVY55G",
    "name": "TRONICA Republic 5.1 Home Theatre System Speaker 40W with Subwoofer, Bluetooth v5....",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 2149,
    "originalPriceInr": 2500,
    "rating": 3.6,
    "reviewCount": 1516,
    "images": [
      "https://m.media-amazon.com/images/I/61nSOWjU-ML._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 40,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  },
  {
    "id": "B09HH9XJBV",
    "name": "Panasonic SC-HT550GW-K 5.1 Ch Home Theatre with Real Surround Sound, 150 W, Blueto...",
    "brand": "boAt",
    "category": "soundbars",
    "priceInr": 11480,
    "originalPriceInr": 13500,
    "rating": 3.9,
    "reviewCount": 228,
    "images": [
      "https://m.media-amazon.com/images/I/810MbgbSbcL._SL1500_.jpg"
    ],
    "specs": [
      {
        "key": "totalPowerWatts",
        "label": "Total Power",
        "value": 150,
        "unit": "W"
      },
      {
        "key": "channels",
        "label": "Channels",
        "value": "5.1 Channel"
      },
      {
        "key": "audioFormat",
        "label": "Audio Formats",
        "value": "Dolby Audio"
      },
      {
        "key": "connectivity",
        "label": "Connectivity",
        "value": "HDMI ARC, Optical, Bluetooth 5.3, AUX"
      },
      {
        "key": "subwoofer",
        "label": "Subwoofer",
        "value": "Wireless Subwoofer"
      },
      {
        "key": "warrantyYears",
        "label": "Warranty",
        "value": 1,
        "unit": "year(s)"
      }
    ],
    "tags": [
      "boAt",
      "Prime"
    ],
    "inStock": true
  }
];

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    "id": "smart-tvs",
    "name": "Smart TVs",
    "icon": "Tv2",
    "count": 50
  },
  {
    "id": "laptops",
    "name": "Laptops",
    "icon": "Laptop",
    "count": 50
  },
  {
    "id": "soundbars",
    "name": "Soundbars",
    "icon": "Speaker",
    "count": 50
  }
];
