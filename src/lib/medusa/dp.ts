import "server-only";

import { FetchError } from "@medusajs/js-sdk";

import { sdk } from "./client";

/**
 * Cache tags. The backend's revalidation subscriber invalidates them (app/api/revalidate):
 * "products" and "collections" for the catalogue, "content" for the home page, navigation,
 * pages, journal and testimonials.
 */
export const CACHE_TAGS = ["products", "collections", "content"] as const;
export type CacheTag = (typeof CACHE_TAGS)[number];

/** Seconds a catalogue response may be reused before the next request refreshes it. */
const DEFAULT_REVALIDATE_SECONDS = 300;

interface DpFetchOptions {
  query?: Record<string, string | number | undefined>;
  tags: CacheTag[];
  revalidate?: number;
}

/**
 * Reads a custom /store/dp route through the Medusa SDK and caches it with Next's fetch
 * cache. The routes already return the storefront's own types, so nothing is mapped here.
 * Returns null on 404 so callers can show notFound(); any other failure throws.
 */
export async function dpFetch<T>(
  path: string,
  { query, tags, revalidate = DEFAULT_REVALIDATE_SECONDS }: DpFetchOptions,
): Promise<T | null> {
  try {
    return await sdk.client.fetch<T>(`/store/dp${path}`, {
      query,
      next: { tags: [...tags], revalidate },
    });
  } catch (error) {
    if (error instanceof FetchError && error.status === 404) return null;
    throw error;
  }
}
