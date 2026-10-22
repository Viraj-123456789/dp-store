/**
 * Most units of one variant a cart can hold. The reference store reports 50 as the available stock
 * for the variants checked (Neem & Tea Tree Face Wash, Moroccan Mirage Body Butter).
 * The backend enforces the same cap and also the real stock; this copy lets the cart answer
 * instantly. The backend's answer wins when stock is lower.
 */
export const MAX_QUANTITY_PER_VARIANT = 50;

/** Shown when the backend reports a variant is sold out. */
export const OUT_OF_STOCK_MESSAGE = "Sorry, this item is currently out of stock.";

/** Shown when a variant is already at its limit and more is added. */
export const MAX_REACHED_MESSAGE = "The maximum quantity of this item is already in your cart.";

/** Shown when an add is trimmed to what is still available. */
export function partialAddMessage(added: number) {
  return `Only ${added} ${added === 1 ? "item was" : "items were"} added to your cart due to availability.`;
}

/** Whole-number quantity between 1 and the per-variant limit; anything unusable becomes 1. */
export function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY_PER_VARIANT, Math.max(1, Math.floor(quantity)));
}
