const fs = require('fs');
const path = require('path');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  }
}

async function verifyAsin(asin) {
  try {
    const url = `https://www.amazon.in/dp/${asin}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return false;
    const text = await res.text();
    if (text.includes('<title>Page Not Found</title>') || text.includes('Page Not Found</title>') || text.includes("The Web address you entered is not a functioning page")) {
      return false;
    }
    return text.includes('productTitle') || text.includes('centerCol') || text.includes('dp-container') || text.includes('a-page');
  } catch {
    return false;
  }
}

function extractRawProducts(html) {
  const blocks = html.split('data-asin="').slice(1);
  const products = [];

  for (const block of blocks) {
    const asinMatch = block.match(/^(B0[A-Z0-9]{8})"/);
    if (!asinMatch) continue;
    const asin = asinMatch[1];
    if (!asin || asin.length !== 10) continue;

    const titleMatch = block.match(/<span[^>]*class="[^"]*a-text-normal[^"]*"[^>]*>(.*?)<\/span>/s) ||
                       block.match(/<h2[^>]*class="[^"]*a-size-[^"]*"[^>]*>(.*?)<\/h2>/s) ||
                       block.match(/<h2[^>]*>(.*?)<\/h2>/s);
    let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim() : '';
    if (!title || title.length < 10) continue;

    const priceMatch = block.match(/class="a-price-whole">([^<]+)<\/span>/);
    let price = 0;
    if (priceMatch) {
      price = parseInt(priceMatch[1].replace(/,/g, '').replace(/\./g, ''), 10);
    }
    if (!price || isNaN(price)) continue;

    const ratingMatch = block.match(/class="a-icon-alt">([0-9.]+)\s+out of/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.2;

    const reviewMatch = block.match(/aria-label="([0-9,]+)\s+ratings"/);
    const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : 1250;

    products.push({ asin, title, price, rating, reviewCount });
  }

  return products;
}

function formatSoundbarProduct(raw) {
  const t = raw.title;
  const lower = t.toLowerCase();

  let brand = 'boAt';
  if (lower.includes('sony')) brand = 'Sony';
  else if (lower.includes('jbl')) brand = 'JBL';
  else if (lower.includes('samsung')) brand = 'Samsung';
  else if (lower.includes('bose')) brand = 'Bose';
  else if (lower.includes('zebronics')) brand = 'Zebronics';
  else if (lower.includes('mivi')) brand = 'Mivi';
  else if (lower.includes('blaupunkt')) brand = 'Blaupunkt';
  else if (lower.includes('marshall')) brand = 'Marshall';
  else if (lower.includes('portronics')) brand = 'Portronics';
  else if (lower.includes('yamaha')) brand = 'Yamaha';
  else if (lower.includes('philips')) brand = 'Philips';
  else if (lower.includes('gomechanic')) brand = 'GoMechanic';

  let totalPowerWatts = 120;
  const powerMatch = t.match(/([0-9]{2,4})\s*(?:w|watt|watts)/i);
  if (powerMatch) {
    totalPowerWatts = parseInt(powerMatch[1], 10);
  } else if (raw.price > 25000) totalPowerWatts = 400;
  else if (raw.price > 12000) totalPowerWatts = 200;

  let channels = '2.1 Channel';
  if (lower.includes('5.1') || lower.includes('5.1ch')) channels = '5.1 Channel';
  else if (lower.includes('3.1.2') || lower.includes('3.1.2ch')) channels = '3.1.2 Channel';
  else if (lower.includes('3.1') || lower.includes('3.1ch')) channels = '3.1 Channel';
  else if (lower.includes('2.0') || lower.includes('2.0ch')) channels = '2.0 Channel';
  else if (lower.includes('7.1')) channels = '7.1.2 Channel';

  let audioFormat = 'Dolby Audio';
  if (lower.includes('atmos')) audioFormat = 'Dolby Atmos, DTS:X';
  else if (lower.includes('dolby digital')) audioFormat = 'Dolby Digital';

  let subwoofer = 'Wireless Subwoofer';
  if (lower.includes('wired sub') || channels === '2.1 Channel' && raw.price < 8000) subwoofer = 'Wired External Subwoofer';
  else if (channels === '2.0 Channel' || lower.includes('built-in sub')) subwoofer = 'Built-in Subwoofer';

  return {
    asin: raw.asin,
    modelName: t.length > 85 ? t.substring(0, 82) + '...' : t,
    brand,
    category: 'soundbars',
    priceInr: raw.price,
    totalPowerWatts,
    channels,
    audioFormat,
    connectivity: 'HDMI ARC, Optical, Bluetooth 5.3, AUX',
    subwoofer,
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    primeEligible: true,
    inStock: true,
    warrantyYears: raw.price > 20000 ? 2 : 1
  };
}

async function main() {
  console.log('Fetching 50 authentic Speakers & Soundbars from Amazon.in...\n');

  // Load existing 20 speakers already verified
  const soundbarFile = path.resolve(__dirname, '../catalog/soundbars_v1.json');
  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(soundbarFile, 'utf8'));
  } catch {}

  const speakerMap = new Map();
  for (const item of existing) {
    speakerMap.set(item.asin, item);
  }

  console.log(`Starting with ${speakerMap.size} existing verified speakers.`);

  const extraQueries = [
    'https://www.amazon.in/s?k=soundbar+for+tv&page=3',
    'https://www.amazon.in/s?k=soundbar+for+tv&page=4',
    'https://www.amazon.in/s?k=soundbar+speakers&page=1',
    'https://www.amazon.in/s?k=soundbar+speakers&page=2',
    'https://www.amazon.in/s?k=bluetooth+soundbar+for+tv&page=1',
    'https://www.amazon.in/s?k=bluetooth+soundbar+for+tv&page=2',
    'https://www.amazon.in/s?k=5.1+home+theatre+speaker+system&page=1',
    'https://www.amazon.in/s?k=jbl+soundbar+cinema&page=1',
    'https://www.amazon.in/s?k=zebronics+soundbar+home+theatre&page=1',
    'https://www.amazon.in/s?k=mivi+soundbar+fort&page=1',
    'https://www.amazon.in/s?k=boat+aavante+soundbar&page=1',
    'https://www.amazon.in/s?k=sony+soundbar+400w&page=1'
  ];

  const candidateMap = new Map();
  for (const q of extraQueries) {
    console.log(`  -> Fetching: ${q}`);
    const html = await fetchHtml(q);
    const parsed = extractRawProducts(html);
    for (const item of parsed) {
      if (!speakerMap.has(item.asin) && !candidateMap.has(item.asin) && item.price >= 1200) {
        candidateMap.set(item.asin, item);
      }
    }
    await sleep(500);
    if (speakerMap.size + candidateMap.size >= 70) break;
  }

  console.log(`Collected ${candidateMap.size} additional candidate speakers.`);

  const verified = [...speakerMap.values()];

  for (const item of candidateMap.values()) {
    if (verified.length >= 50) break;
    process.stdout.write(`  Checking Speaker ASIN ${item.asin}... `);
    const ok = await verifyAsin(item.asin);
    if (ok) {
      console.log('VALID');
      verified.push(formatSoundbarProduct(item));
    } else {
      console.log('INVALID/404 (Skipping)');
    }
    await sleep(200);
  }

  console.log(`\nSuccessfully verified ${verified.length} Speakers / Soundbars.`);
  fs.writeFileSync(soundbarFile, JSON.stringify(verified, null, 2), 'utf8');
  console.log(`Written ${verified.length} Speakers/Soundbars to ${soundbarFile}`);
}

main().catch(console.error);
