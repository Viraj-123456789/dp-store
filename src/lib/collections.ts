import { catalog, collections, type CollectionRecord } from "@/lib/data/collections";
import type { ProductSummary } from "@/types/home";

export const COLLECTION_PAGE_SIZE = 24;

export interface CollectionPage {
  collection: CollectionRecord;
  products: ProductSummary[];
  page: number;
  pageCount: number;
  totalProducts: number;
}

/**
 * Looks up a collection and one page of its products.
 * Async so the call site stays the same when this is backed by Medusa.
 */
export async function getCollectionPage(
  handle: string,
  page = 1,
): Promise<CollectionPage | null> {
  const collection = collections[handle];
  if (!collection) return null;

  const totalProducts = collection.productHandles.length;
  const pageCount = Math.max(1, Math.ceil(totalProducts / COLLECTION_PAGE_SIZE));
  if (page < 1 || page > pageCount) return null;

  const start = (page - 1) * COLLECTION_PAGE_SIZE;
  const products = collection.productHandles
    .slice(start, start + COLLECTION_PAGE_SIZE)
    .map((productHandle) => catalog[productHandle])
    .filter((product): product is ProductSummary => Boolean(product));

  return { collection, products, page, pageCount, totalProducts };
}

export interface CollectionIndexEntry {
  handle: string;
  title: string;
  image: NonNullable<CollectionRecord["image"]>;
  productCount: number;
}

/** Every collection that has a card image, sorted by title as the storefront lists them. */
export async function getCollectionIndex(): Promise<CollectionIndexEntry[]> {
  return Object.values(collections)
    .flatMap((collection) =>
      collection.image
        ? [
            {
              handle: collection.handle,
              title: collection.title,
              image: collection.image,
              productCount: collection.productHandles.length,
            },
          ]
        : [],
    )
    .sort((a, b) => a.title.localeCompare(b.title, "en"));
}

export function getCollectionHandles() {
  return Object.keys(collections);
}
