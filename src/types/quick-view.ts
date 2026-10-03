import type { CartLineInput } from "@/lib/cart/lines";

/** What the quick-view modal needs to show and add a product's first variant. */
export interface QuickViewItem {
  handle: string;
  title: string;
  /** Plain-text teaser, already trimmed. */
  description: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  available: boolean;
  line: CartLineInput;
}
