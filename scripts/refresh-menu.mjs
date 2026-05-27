import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const URL = 'https://www.afhaal.cafedwars.nl/';

function parsePrice(text) {
  const m = String(text).match(/€\s*([0-9]+[,.][0-9]{2})/);
  return m ? Number(m[1].replace(',', '.')) : 0;
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

console.log('Browser openen...');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

console.log('Website openen...');
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);

const products = [];

async function extractVisibleCards(categoryName) {
  console.log('Categorie uitlezen:', categoryName);

  await page.waitForTimeout(2000);

  const cards = await page.locator('body *').evaluateAll((nodes) => {
    return nodes
      .map((node) => {
        const text = (node.textContent || '').trim();

        if (!text.includes('€')) return null;

        const lines = text
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);

        const priceLine = lines.find((l) =>
          /€\s*[0-9]+[,.][0-9]{2}/.test(l)
        );

        if (!priceLine) return null;

        const priceMatch = priceLine.match(/€\s*[0-9]+[,.][0-9]{2}/);
        const price = priceMatch ? priceMatch[0] : null;

        if (!price) return null;

        const priceIndex = lines.indexOf(priceLine);
        const possibleNames = lines.slice(0, priceIndex).reverse();

        const nameLine = possibleNames.find(
          (l) =>
            l.length > 2 &&
            l.length < 40 &&
            !l.includes('€') &&
            !l.includes('Toevoegen') &&
            !l.includes('Categorieën') &&
            !l.includes('Cafetaria Dwars') &&
            !l.includes('Openingstijden') &&
            !l.includes('Gesloten') &&
            !l.includes('winkelwagen')
        );

        if (!nameLine) return null;

        return {
          name: nameLine,
          priceLine: price,
        };
      })
      .filter(Boolean);
  });

  const seen = new Set();

  for (const c of cards) {
    const name = c.name.trim();
    const price = parsePrice(c.priceLine);
    const key = categoryName + name + price;

    if (seen.has(key) || !price) continue;

    seen.add(key);
    products.push({
      id: slug(categoryName + '-' + name),
      category: categoryName,
      name,
      price,
      optionGroups: [],
    });
  }

  console.log('Klaar met:', categoryName, 'producten totaal:', products.length);
}

const categoryNames = [
  'Patat',
  'Snacks',
  'Luxe gerechten',
  'Hamburgers',
  'Uitsmijters/broodjes',
  'Sauzen',
  'Frisdranken',
  'Bijlagen',
  'Bittergarnituur',
];

for (const cat of categoryNames) {
  console.log('Klik categorie:', cat);

  const link = page.getByText(cat, { exact: false }).first();

  if (await link.count()) {
    await link.click().catch(() => {});
    await extractVisibleCards(cat);
  } else {
    console.log('Categorie niet gevonden:', cat);
  }
}

console.log('Browser sluiten...');
await browser.close();

const dedup = Array.from(
  new Map(products.map((p) => [p.category + '-' + p.name + '-' + p.price, p])).values()
);

const menu = {
  updatedAt: new Date().toISOString(),
  source: URL,
  products: dedup.length ? dedup : [],
};

if (!menu.products.length) {
  throw new Error('Geen producten gevonden. Controleer of de site-layout is gewijzigd.');
}

await fs.mkdir('data', { recursive: true });
await fs.writeFile('data/menu.json', JSON.stringify(menu, null, 2), 'utf8');

console.log(`Menu bijgewerkt: ${menu.products.length} producten`);