/**
 * Consenzo — Catalog Image Scraper
 * ---------------------------------------------------------------
 * For every ASIN in the catalog JSONs, fetch the Amazon.in search page
 * (same technique as fetch_real_catalog.js) and extract the product's
 * main image URL from m.media-amazon.com. Merges `imageUrl` into the
 * catalog files in place. No other fields are touched.
 *
 * Usage:  node scripts/scrape_catalog_images.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Decompress gzip/br/deflate responses (curl --compressed equivalent)
async function decompress(res) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('html') && !contentType.includes('text')) {
    // still try text
  }
  const contentEncoding = res.headers.get('content-encoding') || '';
  if (typeof DecompressionStream === 'function' && contentEncoding) {
    const ds = new DecompressionStream(contentEncoding);
    const stream = res.body.pipeThrough(ds);
    return await new Response(stream).text();
  }
  return await res.text();
}

// Node's undici fetch is blocked by Amazon's CDN (TLS fingerprinting), but curl passes.
// Shell out to curl with --compressed (handles gzip/br) and the browser-like headers.
function fetchHtml(url) {
  const tmpOut = path.join(require('os').tmpdir(), `consenzo_scrape_${Date.now()}_${Math.random().toString(36).slice(2)}.html`);
  try {
    execFileSync('curl', [
      '-s', '--compressed', '-m', '20', '-o', tmpOut, '-w', '%{http_code}',
      '-H', `User-Agent: ${HEADERS['User-Agent']}`,
      '-H', `Accept: ${HEADERS['Accept']}`,
      '-H', `Accept-Language: ${HEADERS['Accept-Language']}`,
      url,
    ], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
    const html = fs.readFileSync(tmpOut, 'utf-8');
    if (html.length < 5000) {
      console.warn(`  [warn] ${url} -> suspiciously small response (${html.length} bytes)`);
      return '';
    }
    return html;
  } catch (err) {
    console.warn(`  [warn] curl failed: ${err.message?.slice(0, 100)}`);
    return '';
  } finally {
    try { fs.unlinkSync(tmpOut); } catch {}
  }
}

function extractImagesFromSearch(html) {
  const map = new Map(); // asin -> imageUrl
  const blocks = html.split('data-asin=').slice(1);
  for (const block of blocks) {
    const asinMatch = block.match(/^(B0[A-Z0-9]{8})/);
    if (!asinMatch) continue;
    const asin = asinMatch[1];

    // Prefer hi-res srcset entries, then plain src
    let img =
      block.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+._%-]+?\._AC_SX416_[A-Za-z0-9._%-]*?\.jpg/)?.[0] ||
      block.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+._%-]+?\._AC_SX385_[A-Za-z0-9._%-]*?\.jpg/)?.[0] ||
      block.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+._%-]+?\._AC_[A-Za-z0-9._%-]*?\.jpg /)?.[0] ||
      block.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+._%-]+?\.jpg/)?.[0];

    if (!img) continue;
    // Clean up trailing escapes and normalize size to a crisp card size
    img = img.replace(/\\\//g, '/').replace(/[",].*$/, '');
    // Upgrade to a larger card rendition if it is a thumbnail variant
    img = img.replace(/\._AC_SX\d+_/, '._AC_SX416_');
    if (!map.has(asin)) map.set(asin, img);
    map.set('__page__', img); // remember any image seen on the page as last-resort fallback
  }
  return map;
}

function extractImagesFromProductPage(html) {
  // hiRes / large image from the product detail page
  const hiRes =
    html.match(/"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+?)"/)?.[1] ||
    html.match(/"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+?)"/)?.[1];
  if (hiRes) return hiRes.replace(/\\\//g, '/');
  const anyImg = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+._%-]+?\.jpg/)?.[0];
  return anyImg ? anyImg.replace(/\._AC_SX\d+_/, '._AC_SX416_') : null;
}

async function main() {
  const catalogDir = path.resolve(__dirname, '../backend/catalog');
  // Resumable + category-selectable:  node scripts/scrape_catalog_images.js [tvs] [laptops] [soundbars]
  const wanted = process.argv.slice(2).map((a) => a.toLowerCase());
  const ALL = { tvs: 'smart_tvs_v1.json', laptops: 'laptops_v1.json', soundbars: 'soundbars_v1.json' };
  const files = wanted.length ? wanted.map((w) => ALL[w]).filter(Boolean) : Object.values(ALL);
  const summary = [];

  for (const file of files) {
    const filePath = path.join(catalogDir, file);
    const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`\n=== ${file} (${products.length} products) ===`);

    // Collect unique ASINs needing work (skip ones that already carry an imageUrl — resumable)
    const uniqueAsins = [...new Set(products.filter((p) => !p.imageUrl).map((p) => p.asin))];
    const alreadyDone = products.filter((p) => p.imageUrl).length;
    console.log(`Unique ASINs to fetch: ${uniqueAsins.length} (${alreadyDone} already have images — skipped)`);
    if (!uniqueAsins.length) {
      console.log('  => nothing to do for this file');
      summary.push({ file, withImage: alreadyDone, total: products.length });
      continue;
    }

    const imageByAsin = new Map();
    const BATCH = 8; // one search page per batch of ASINs

    for (let i = 0; i < uniqueAsins.length; i += BATCH) {
      const batch = uniqueAsins.slice(i, i + BATCH);
      const query = batch.map((a) => a).join(' ');
      // Amazon can take up to ~20 ASINs per search via field-availability filter
      const url = `https://www.amazon.in/s?k=${batch.map(encodeURIComponent).join('+')}`;
      console.log(`  [batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(uniqueAsins.length / BATCH)}] ${batch.join(',')}`);
      const html = fetchHtml(url);
      if (html) {
        const found = extractImagesFromSearch(html);
        let hit = 0;
        for (const asin of batch) {
          const img = found.get(asin) || null;
          if (img) {
            imageByAsin.set(asin, img);
            hit++;
          }
        }
        console.log(`    matched ${hit}/${batch.length}`);
      }
      await sleep(450 + Math.floor(Math.random() * 300));
    }

    // Second pass: per-ASIN product-page fetch for stragglers
    const missing = uniqueAsins.filter((a) => !imageByAsin.has(a));
    if (missing.length) {
      console.log(`  Second pass (product pages) for ${missing.length} missing...`);
      for (const asin of missing) {
        const html = fetchHtml(`https://www.amazon.in/dp/${asin}`);
        if (html) {
          const img = extractImagesFromProductPage(html);
          if (img) {
            imageByAsin.set(asin, img);
            console.log(`    ${asin}: found on product page`);
          }
        }
        await sleep(300 + Math.random() * 200);
      }
    }

    // Merge into catalog
    let withImage = 0;
    for (const p of products) {
      const img = imageByAsin.get(p.asin);
      if (img) {
        p.imageUrl = img;
        withImage++;
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2) + '\n', 'utf-8');
    console.log(`  => ${withImage}/${products.length} products now carry imageUrl`);
    summary.push({ file, withImage, total: products.length });
  }

  console.log('\n=== SUMMARY ===');
  for (const s of summary) console.log(`${s.file}: ${s.withImage}/${s.total}`);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
