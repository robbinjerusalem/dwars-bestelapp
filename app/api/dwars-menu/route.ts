import { NextResponse } from "next/server";

const DWARS_MENU_URL =
  "https://www.afhaal.cafedwars.nl/system/cm:booqModules:menu:getCategories";

const BASE_URL = "https://www.afhaal.cafedwars.nl";

function fixImageUrl(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return "";

  const clean = value.trim();

  if (clean.startsWith("http")) return clean;
  if (clean.startsWith("/")) return `${BASE_URL}${clean}`;

  return `${BASE_URL}/${clean}`;
}

export async function GET() {
  try {
    const response = await fetch(DWARS_MENU_URL, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Menu ophalen mislukt" },
        { status: response.status }
      );
    }

    const categories = await response.json();

    const menu = categories
      .filter((category: any) => category?.deleted !== "true")
      .filter((category: any) => category?.nietTonen !== "true")
      .map((category: any) => ({
        id: String(category.id),
        title: category.title,
        image: fixImageUrl(category.afbeeldingOverzicht || category.afbeeldingHeader),
        products: (category.products || [])
          .filter((product: any) => product?.deleted !== "true")
          .filter((product: any) => product?.nietTonen !== "true")
          .map((product: any) => ({
            id: String(product.id),
            title: product.title,
            description:
              product.korteBeschrijving ||
              product.beschrijving ||
              "",
            price: Number(product.calculatedPrice ?? product.prijs ?? 0),
            formattedPrice:
              product.formattedPrice ||
              `€ ${Number(product.calculatedPrice ?? product.prijs ?? 0).toFixed(2)}`,
            image: fixImageUrl(product.afbeelding),
            categoryId: String(category.id),
            categoryTitle: category.title,
            soldOut: product.uitverkocht === "true",
          })),
      }))
      .filter((category: any) => category.products.length > 0);

    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json(
      { error: "Menu ophalen mislukt" },
      { status: 500 }
    );
  }
}