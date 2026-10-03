import { buildCartLine } from "@/lib/cart/lines";
import { productDetails } from "@/lib/data/product-details";
import type { QuickViewItem } from "@/types/quick-view";

const TEASER_LENGTH = 160;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Tags become spaces (as the storefront does), entities are decoded, then the text is cut short. */
function teaser(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity]);
  return `${text.slice(0, TEASER_LENGTH)}…`;
}

/**
 * Looks up a product's quick-view content (first variant, first image).
 * Async so the call site stays the same when this is backed by Medusa.
 */
export async function getQuickViewItem(handle: string): Promise<QuickViewItem | null> {
  const product = productDetails[handle];
  if (!product) return null;

  const variant = product.variants[0];
  const image = product.media.find((media) => media.type === "image") ?? product.media[0];
  const description = product.accordions.find((accordion) => accordion.kind === "html");

  return {
    handle: product.handle,
    title: product.title,
    description: teaser(description?.kind === "html" ? description.html : ""),
    image: image.src,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    currency: product.currency,
    available: variant.available,
    line: buildCartLine(product, variant),
  };
}
