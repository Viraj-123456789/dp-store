import { NextResponse } from "next/server";

import { searchCatalog } from "@/lib/search";

const MAX_SUGGESTIONS = 7;

/** Live-search suggestions for the header overlay. */
export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const { products } = searchCatalog(query);

  return NextResponse.json({
    total: products.length,
    products: products.slice(0, MAX_SUGGESTIONS).map((product) => ({
      handle: product.handle,
      title: product.title,
      image: product.image,
      price: product.price,
      mrp: product.mrp,
      currency: product.currency,
    })),
  });
}
