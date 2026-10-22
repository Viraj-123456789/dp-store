"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { cartApi } from "@/lib/cart/client";
import { clampQuantity } from "@/lib/cart/limits";
import { EMPTY_CART } from "@/lib/cart/pricing";
import type { CartLine, CartMode, CartSummary, CartView } from "@/types/cart";

export interface CheckoutCoupon {
  code: string;
  /** Why the last code was refused. */
  error: string | null;
  apply: (code: string) => void;
  clear: () => void;
}

interface CheckoutCart {
  ready: boolean;
  lines: CartLine[];
  summary: CartSummary;
  /** True when checking out one product directly, leaving the cart untouched. */
  isBuyNow: boolean;
  /** Which backend cart the order is placed from. */
  mode: CartMode;
  coupon: CheckoutCoupon;
}

/**
 * What checkout charges for: the cart, or, for /checkout?buy=<variantId>&qty=<n>, a throwaway
 * cart holding just that product (the shopping cart stays untouched, and coupons typed here
 * apply to the throwaway cart). A link naming an unknown or sold-out variant falls back to the cart.
 */
export function useCheckoutCart(): CheckoutCart {
  const cart = useCart();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const variantId = params.get("buy");
  const quantity = clampQuantity(Number(params.get("qty") ?? 1));
  const [buyCouponError, setBuyCouponError] = useState<string | null>(null);

  const buyKey = ["buy-cart", variantId, quantity] as const;
  const buy = useQuery({
    queryKey: buyKey,
    enabled: Boolean(variantId),
    queryFn: async () => (await cartApi.buyNow(variantId as string, quantity)).cart,
    // One throwaway cart per link: never refetch it, or a second cart would replace the first.
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
  });

  const buyCart = buy.data && buy.data.lines.length > 0 ? buy.data : null;
  const buying = Boolean(variantId) && (buy.isPending || buyCart !== null);

  const setBuyCart = (next: CartView) => queryClient.setQueryData(buyKey, next);

  if (buying) {
    const view = buyCart ?? EMPTY_CART;
    return {
      ready: !buy.isPending,
      lines: view.lines,
      summary: view.summary,
      isBuyNow: true,
      mode: "buy",
      coupon: {
        code: view.couponCode,
        error: buyCouponError,
        apply: async (code) => {
          setBuyCouponError(null);
          const result = await cartApi.applyCoupon(code, "buy");
          setBuyCart(result.cart);
          setBuyCouponError(result.error ?? null);
        },
        clear: async () => {
          setBuyCouponError(null);
          setBuyCart((await cartApi.removeCoupon("buy")).cart);
        },
      },
    };
  }

  return {
    ready: cart.ready,
    lines: cart.lines,
    summary: cart.summary,
    isBuyNow: false,
    mode: "cart",
    coupon: {
      code: cart.couponCode,
      error: cart.couponError,
      apply: cart.applyCoupon,
      clear: cart.clearCoupon,
    },
  };
}
