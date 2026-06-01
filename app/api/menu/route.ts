import { NextResponse } from 'next/server';

const DWARS_MENU_URL =
  'https://www.afhaal.cafedwars.nl/system/cm:booqModules:menu:getCategories';

const DWARS_ADDITIONALS_URL =
  'https://www.afhaal.cafedwars.nl/system/cm:booqModules:menu:getAdditionals';

const CACHE_TIME_MS = 5 * 60 * 1000;

let cachedMenu: any = null;
let cachedAt = 0;

function price(value: unknown) {
  const number = Number(String(value ?? '0').replace(',', '.'));
  return Number.isFinite(number) ? number : 0;
}

async function getAdditionals(productId: string) {
  try {
    const response = await fetch(DWARS_ADDITIONALS_URL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json'
      },
      body: new URLSearchParams({
        articleId: productId
      })
    });

    const data = await response.json();

    if (!Array.isArray(data.additionalCategories)) {
      return [];
    }

    return data.additionalCategories
      .map((group: any) => {
        const options = Array.isArray(group.additionals)
          ? group.additionals
              .filter((additional: any) => additional.deleted !== 'true')
              .filter((additional: any) => additional.nietTonen !== 'true')
              .map((additional: any) => ({
                name: additional.title || '',
                price: price(
                  additional.calculatedPrice ?? additional.price ?? additional.prijs
                )
              }))
              .filter((option: any) => option.name)
          : [];

        return {
          name: group.title || 'Opties',
          min: price(group.minsel),
          max: price(group.maxsel) || 1,
          options
        };
      })
      .filter((group: any) => group.options.length > 0);
  } catch {
    return [];
  }
}

async function buildMenu() {
  const response = await fetch(DWARS_MENU_URL, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json'
    }
  });

  const categories = await response.json();

  const rawProducts = categories.flatMap((category: any) =>
    (category.products || [])
      .filter((product: any) => product.deleted !== 'true')
      .filter((product: any) => product.nietTonen !== 'true')
      .map((product: any) => ({
        id: String(product.id),
        category: category.title || '',
        name: product.title || '',
        price: price(product.calculatedPrice ?? product.prijs),
        hasAdditionals:
          product.hasAdditionals === true ||
          product.hasAdditionals === 'true' ||
          Boolean(product.extra) ||
          Boolean(product.extraCategorie)
      }))
  );

  const products = await Promise.all(
    rawProducts.map(async (product: any) => ({
      ...product,
      optionGroups: product.hasAdditionals ? await getAdditionals(product.id) : []
    }))
  );

  return {
    updatedAt: new Date().toISOString(),
    source: 'live-dwars-with-additionals-cached-5-min',
    cacheSeconds: CACHE_TIME_MS / 1000,
    products
  };
}

export async function GET() {
  const now = Date.now();

  if (cachedMenu && now - cachedAt < CACHE_TIME_MS) {
    return NextResponse.json({
      ...cachedMenu,
      cache: 'hit'
    });
  }

  const menu = await buildMenu();

  cachedMenu = menu;
  cachedAt = now;

  return NextResponse.json({
    ...menu,
    cache: 'miss'
  });
}