"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { clampQuantity } from "@/lib/cart/limits";
import { summarizeCart } from "@/lib/cart/pricing";
import type { CartLine, CartSummary } from "@/types/cart";

interface CheckoutCart {
  ready: boolean;
  lines: CartLine[];
  summary: CartSummary;
  /** True when checking out one product directly, leaving the cart untouched. */
  isBuyNow: boolean;
}

/**
 * What checkout charges for: the cart, or, for /checkout?buy=<variantId>&qty=<n>,
 * just that one product. A link naming an unknown variant falls back to the cart.
 */
export function useCheckoutCart(): CheckoutCart {
  const { ready, catalog, lines: cartLines, summary: cartSummary } = useCart();
  const params = useSearchParams();
  const variantId = params.get("buy");
  const quantity = params.get("qty");

  return useMemo(() => {
    const product = variantId ? catalog[variantId] : undefined;
    if (!product) return { ready, lines: cartLines, summary: cartSummary, isBuyNow: false };

    const lines = [{ ...product, quantity: clampQuantity(Number(quantity ?? 1)) }];
    return { ready, lines, summary: summarizeCart(lines), isBuyNow: true };
  }, [ready, catalog, cartLines, cartSummary, variantId, quantity]);
}
