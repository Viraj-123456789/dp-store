import "server-only";

import type { ProductSummary } from "@/types/home";
import type { ProductDetail } from "@/types/product";

import { dpFetch } from "./dp";
import { listCollectionProductHandles } from "./collections";

/** GET /store/dp/products/:handle */
export function fetchProductDetail(handle: string): Promise<ProductDetail | null> {
  return dpFetch<ProductDetail>(`/products/${encodeURIComponent(handle)}`, { tags: ["products"] });
}

/** GET /store/dp/products?handles=a,b (requested order; unknown handles are skipped). */
export async function fetchProductSummaries(handles: string[]): Promise<ProductSummary[]> {
  if (handles.length === 0) return [];
  const products = await dpFetch<ProductSummary[]>("/products", {
    query: { handles: handles.join(",") },
    tags: ["products"],
  });
  return products ?? [];
}

/** Every published product handle, for generateStaticParams. */
export function listProductHandles(): Promise<string[]> {
  return listCollectionProductHandles("all");
}
