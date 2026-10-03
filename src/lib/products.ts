import { catalog } from "@/lib/data/collections";
import { productDetails } from "@/lib/data/product-details";
import type { ProductSummary } from "@/types/home";
import type { ProductDetail } from "@/types/product";

/**
 * Looks up a product's full detail content.
 * Async so the call site stays the same when this is backed by Medusa.
 */
export async function getProductDetail(
  handle: string,
): Promise<ProductDetail | null> {
  return productDetails[handle] ?? null;
}

export async function getRelatedProducts(
  handles: string[],
): Promise<ProductSummary[]> {
  return handles
    .map((handle) => catalog[handle])
    .filter((product): product is ProductSummary => Boolean(product));
}

export function getProductHandles() {
  return Object.keys(productDetails);
}
