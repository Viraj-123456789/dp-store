import type { ProductSummary } from "@/types/home";

export interface CollectionRecord {
  handle: string;
  title: string;
  /** Full <title> shown in the browser tab. */
  seoTitle: string;
  intro: string | null;
  /** Card image on the collections index (omitted for the catch-all "all" collection). */
  image?: { src: string; alt: string };
  /** In merchandised order. */
  productHandles: string[];
}

export interface CollectionPage {
  collection: CollectionRecord;
  products: ProductSummary[];
  page: number;
  pageCount: number;
  totalProducts: number;
}

export interface CollectionIndexEntry {
  handle: string;
  title: string;
  image: NonNullable<CollectionRecord["image"]>;
  productCount: number;
}
