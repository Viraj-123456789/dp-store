"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import { cartApi, CartApiError } from "@/lib/cart/client";
import {
  clampQuantity,
  MAX_QUANTITY_PER_VARIANT,
  MAX_REACHED_MESSAGE,
  OUT_OF_STOCK_MESSAGE,
  partialAddMessage,
} from "@/lib/cart/limits";
import type { CartLineInput } from "@/lib/cart/lines";
import { EMPTY_CART, summarizeCart } from "@/lib/cart/pricing";
import type { CartLine, CartMutation, CartSummary, CartView } from "@/types/cart";

const TOAST_MS = 2200;
const CART_KEY = ["cart", "cart"] as const;
const CHANGE_KEY = ["cart-change"] as const;
const UPDATE_FAILED = "We couldn't update your cart. Please try again.";

/** Outcome of an add: complete, trimmed to the stock limit, or refused because already at it. */
export type AddLineResult = "added" | "partial" | "max";

interface CartContextValue {
  /** False during server render / hydration, true once the cart has been loaded. */
  ready: boolean;
  lines: CartLine[];
  summary: CartSummary;
  couponCode: string;
  /** Why the last coupon was refused, until the next change. */
  couponError: string | null;
  drawerOpen: boolean;
  toast: { message: string; id: number } | null;
  addLine: (line: CartLineInput, quantity?: number, options?: { openDrawer?: boolean }) => AddLineResult;
  setQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  /** Forgets the cart, e.g. after an order is placed (the server already retired it). */
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  applyCoupon: (code: string) => void;
  clearCoupon: () => void;
  clearCouponError: () => void;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** A cart change: what to show at once, the request that makes it real, and how to react to the reply. */
interface Change {
  optimistic?: (cart: CartView) => CartView;
  request: () => Promise<{ cart: CartView }>;
  onResult?: (result: { cart: CartView } & Partial<CartMutation> & { error?: string }) => void;
}

const withLines = (cart: CartView, lines: CartLine[]): CartView => ({
  ...cart,
  lines,
  summary: summarizeCart(lines, cart.summary.couponDiscount),
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: CART_KEY,
    queryFn: () => cartApi.get("cart"),
  });
  const cart = data ?? EMPTY_CART;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<CartContextValue["toast"]>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastId = useRef(0);

  const showToast = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    toastId.current += 1;
    setToast({ message, id: toastId.current });
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  // The freshest cart, including changes that are still on their way to the server.
  const current = useCallback(
    () => queryClient.getQueryData<CartView>(CART_KEY) ?? EMPTY_CART,
    [queryClient],
  );

  // Changes run one at a time (same scope), each showing its result instantly. The server's
  // answer replaces the screen only when it is the last change still pending, so quick
  // successive clicks never flicker back to an older state.
  const { mutate } = useMutation({
    mutationKey: CHANGE_KEY,
    scope: { id: "cart" },
    mutationFn: (change: Change) => change.request(),
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<CartView>(CART_KEY);
      if (change.optimistic) {
        queryClient.setQueryData<CartView>(CART_KEY, (old) => change.optimistic!(old ?? EMPTY_CART));
      }
      return { previous };
    },
    onError: (error, _change, context) => {
      if (context?.previous) queryClient.setQueryData(CART_KEY, context.previous);
      showToast(error instanceof CartApiError ? error.message : UPDATE_FAILED);
    },
    onSuccess: (result, change) => {
      if (queryClient.isMutating({ mutationKey: CHANGE_KEY }) <= 1) {
        queryClient.setQueryData(CART_KEY, result.cart);
      }
      change.onResult?.(result);
    },
  });

  const value = useMemo<CartContextValue>(() => {
    const removeLine = (variantId: string) =>
      mutate({
        optimistic: (c) => withLines(c, c.lines.filter((line) => line.variantId !== variantId)),
        request: () => cartApi.remove(variantId),
      });

    return {
      ready: !isPending,
      lines: cart.lines,
      summary: cart.summary,
      couponCode: cart.couponCode,
      couponError,
      drawerOpen,
      toast,
      addLine: (line, quantity = 1, options) => {
        const wanted = clampQuantity(quantity);
        const existing = current().lines.find((item) => item.variantId === line.variantId);
        const room = MAX_QUANTITY_PER_VARIANT - (existing?.quantity ?? 0);

        // At the limit nothing changes; the storefront only explains why.
        if (room <= 0) {
          showToast(MAX_REACHED_MESSAGE);
          return "max";
        }

        const added = Math.min(wanted, room);
        const expected: AddLineResult = added < wanted ? "partial" : "added";
        mutate({
          optimistic: (c) =>
            withLines(
              c,
              existing
                ? c.lines.map((item) =>
                    item.variantId === line.variantId
                      ? { ...item, quantity: item.quantity + added }
                      : item,
                  )
                : [...c.lines, { ...line, quantity: added }],
            ),
          request: () => cartApi.add(line.variantId, added),
          // Stock can be lower than the shared limit: correct the message when the server trimmed more.
          onResult: (result) => {
            if (result.outcome === "unavailable") showToast(OUT_OF_STOCK_MESSAGE);
            else if (result.outcome === "max" && expected !== "partial") showToast(MAX_REACHED_MESSAGE);
            else if (result.outcome === "partial" && expected === "added") {
              showToast(partialAddMessage(result.added ?? 0));
            }
          },
        });

        // A trimmed add reports the shortfall and leaves the drawer closed.
        if (expected === "partial") {
          showToast(partialAddMessage(added));
          return "partial";
        }
        showToast("Added to cart");
        if (options?.openDrawer !== false) setDrawerOpen(true);
        return "added";
      },
      setQuantity: (variantId, quantity) => {
        if (!(quantity > 0)) return removeLine(variantId);
        const target = clampQuantity(quantity);
        mutate({
          optimistic: (c) =>
            withLines(
              c,
              c.lines.map((line) => (line.variantId === variantId ? { ...line, quantity: target } : line)),
            ),
          request: () => cartApi.setQuantity(variantId, target),
        });
      },
      removeLine,
      clearCart: () => {
        queryClient.setQueryData(CART_KEY, EMPTY_CART);
        setCouponError(null);
      },
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      applyCoupon: (code) => {
        const normalized = code.trim().toUpperCase();
        if (!normalized) return;
        setCouponError(null);
        mutate({
          request: () => cartApi.applyCoupon(normalized),
          onResult: (result) => {
            if (result.error) setCouponError(result.error);
            else showToast(`Coupon ${normalized} applied`);
          },
        });
      },
      clearCoupon: () => {
        setCouponError(null);
        mutate({
          optimistic: (c) => ({
            ...c,
            couponCode: "",
            summary: summarizeCart(c.lines, 0),
          }),
          request: () => cartApi.removeCoupon(),
        });
      },
      clearCouponError: () => setCouponError(null),
      showToast,
    };
  }, [cart, isPending, couponError, drawerOpen, toast, current, mutate, queryClient, showToast]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
