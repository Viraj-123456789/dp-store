import "server-only";

import type { CollectionIndexEntry, CollectionPage } from "@/types/collections";

import { dpFetch } from "./dp";

/** GET /store/dp/collections/:handle/products?page= (null when the collection or page is unknown). */
export function fetchCollectionPage(handle: string, page: number): Promise<CollectionPage | null> {
  return dpFetch<CollectionPage>(`/collections/${encodeURIComponent(handle)}/products`, {
    query: { page },
    tags: ["collections", "products"],
  });
}

/** GET /store/dp/collections */
export async function fetchCollectionIndex(): Promise<CollectionIndexEntry[]> {
  const entries = await dpFetch<CollectionIndexEntry[]>("/collections", {
    tags: ["collections"],
  });
  return entries ?? [];
}

/** Every product handle in a collection (page 1 carries the full ordered list). */
export async function listCollectionProductHandles(handle: string): Promise<string[]> {
  const page = await fetchCollectionPage(handle, 1);
  return page?.collection.productHandles ?? [];
}
