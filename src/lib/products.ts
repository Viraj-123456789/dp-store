import { fetchProductDetail, fetchProductSummaries, listProductHandles } from "@/lib/medusa/products";
import type { ProductSummary } from "@/types/home";
import type { ProductDetail } from "@/types/product";

/** A product's full detail content, or null when it does not exist. */
export async function getProductDetail(
  handle: string,
): Promise<ProductDetail | null> {
  return fetchProductDetail(handle);
}

export async function getRelatedProducts(
  handles: string[],
): Promise<ProductSummary[]> {
  return fetchProductSummaries(handles);
}

/**
 * Handles to prerender at build time. If the backend is unreachable the build still
 * succeeds and pages render on first request instead.
 */
export async function getProductHandles(): Promise<string[]> {
  try {
    return await listProductHandles();
  } catch (error) {
    console.warn("Could not list product handles for static generation:", error);
    return [];
  }
}
