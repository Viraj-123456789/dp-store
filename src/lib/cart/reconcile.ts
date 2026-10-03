import type { CartLine } from "@/types/cart";

import type { CartLineInput } from "./lines";
import { clampQuantity } from "./limits";

/**
 * Brings stored cart lines in step with the current catalogue: prices, titles and images are
 * refreshed, lines for variants that no longer exist are dropped, quantities are kept within
 * limits, and duplicate variants are merged. Never trust localStorage to be well-formed.
 */
export function reconcileLines(stored: unknown, catalog: Record<string, CartLineInput>): CartLine[] {
  if (!Array.isArray(stored)) return [];

  const merged = new Map<string, CartLine>();
  for (const entry of stored) {
    if (!entry || typeof entry !== "object") continue;
    const { variantId, quantity } = entry as Partial<CartLine>;
    if (typeof variantId !== "string") continue;
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 1) continue;

    const current = catalog[variantId];
    if (!current) continue;

    const previous = merged.get(variantId);
    merged.set(variantId, {
      ...current,
      quantity: clampQuantity((previous?.quantity ?? 0) + quantity),
    });
  }
  return [...merged.values()];
}
