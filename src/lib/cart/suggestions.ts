import { fetchHomeContent } from "@/lib/medusa/content";

import type { CartLineInput } from "./lines";

/**
 * Candidates for "Pairs well with your ritual": the best sellers, in the storefront's order.
 * The drawer shows the first few that are not already in the cart, so a handful of spares
 * covers a cart that already holds some of them.
 */
const CANDIDATE_COUNT = 9;

/** Server-side: cart lines for the cross-sell suggestions (small, serialisable). */
export async function getCartSuggestions(): Promise<CartLineInput[]> {
  const { bestsellers } = await fetchHomeContent();
  return bestsellers
    .slice(0, CANDIDATE_COUNT)
    .flatMap((product) => (product.line ? [product.line] : []));
}
