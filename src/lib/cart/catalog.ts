import { productDetails } from "@/lib/data/product-details";

import { buildCartLine, type CartLineInput } from "./lines";

/** Server-side: the cart line for a product's default (first) variant. */
export function getDefaultCartLine(handle: string): CartLineInput | null {
  const product = productDetails[handle];
  return product ? buildCartLine(product) : null;
}

/** Server-side: every purchasable variant keyed by id, so the client can validate stored carts. */
export function getVariantCatalog(): Record<string, CartLineInput> {
  const catalog: Record<string, CartLineInput> = {};
  for (const product of Object.values(productDetails)) {
    for (const variant of product.variants) {
      if (variant.available) catalog[variant.id] = buildCartLine(product, variant);
    }
  }
  return catalog;
}
