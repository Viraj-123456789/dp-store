import { fetchCollectionIndex, fetchCollectionPage } from "@/lib/medusa/collections";
import type {
  CollectionIndexEntry,
  CollectionPage,
  CollectionRecord,
} from "@/types/collections";

export type { CollectionIndexEntry, CollectionPage, CollectionRecord };

export const COLLECTION_PAGE_SIZE = 24;

/** A collection and one page of its products, or null when either does not exist. */
export async function getCollectionPage(
  handle: string,
  page = 1,
): Promise<CollectionPage | null> {
  if (!Number.isInteger(page) || page < 1) return null;
  return fetchCollectionPage(handle, page);
}

/** Every collection that has a card image, sorted by title as the storefront lists them. */
export async function getCollectionIndex(): Promise<CollectionIndexEntry[]> {
  return fetchCollectionIndex();
}

/**
 * Handles to prerender at build time: every collection with a card image, plus the
 * catch-all "all". If the backend is unreachable the pages render on first request.
 */
export async function getCollectionHandles(): Promise<string[]> {
  try {
    const entries = await fetchCollectionIndex();
    return [...entries.map((entry) => entry.handle), "all"];
  } catch (error) {
    console.warn("Could not list collection handles for static generation:", error);
    return [];
  }
}
