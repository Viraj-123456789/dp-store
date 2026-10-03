import { collections } from "@/lib/data/collections";

import { getDefaultCartLine } from "./catalog";
import type { CartLineInput } from "./lines";

/**
 * Candidates for "Pairs well with your ritual": the best sellers, in the storefront's order.
 * The drawer shows the first few that are not already in the cart, so a handful of spares
 * covers a cart that already holds some of them.
 */
const CANDIDATE_COUNT = 9;

/** Server-side: cart lines for the cross-sell suggestions (small, serialisable). */
export function getCartSuggestions(): CartLineInput[] {
  return collections.bestsellers.productHandles.slice(0, CANDIDATE_COUNT).flatMap((handle) => {
    const line = getDefaultCartLine(handle);
    return line ? [line] : [];
  });
}
