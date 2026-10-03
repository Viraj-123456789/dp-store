"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  clampQuantity,
  MAX_QUANTITY_PER_VARIANT,
  MAX_REACHED_MESSAGE,
  partialAddMessage,
} from "@/lib/cart/limits";
import type { CartLineInput } from "@/lib/cart/lines";
import { summarizeCart } from "@/lib/cart/pricing";
import { reconcileLines } from "@/lib/cart/reconcile";
import { cartStore, couponStore } from "@/lib/cart/storage";
import type { CartLine, CartSummary } from "@/types/cart";

const TOAST_MS = 2200;

/** Outcome of an add: complete, trimmed to the stock limit, or refused because already at it. */
export type AddLineResult = "added" | "partial" | "max";

interface CartContextValue {
  /** False during server render / hydration, true once localStorage has been read. */
  ready: boolean;
  /** Every purchasable variant, e.g. to resolve a "buy it now" link without touching the cart. */
  catalog: Record<string, CartLineInput>;
  lines: CartLine[];
  summary: CartSummary;
  couponCode: string;
  drawerOpen: boolean;
  toast: { message: string; id: number } | null;
  addLine: (line: CartLineInput, quantity?: number, options?: { openDrawer?: boolean }) => AddLineResult;
  setQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  /** Empties the cart and forgets any coupon, e.g. after an order is placed. */
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  applyCoupon: (code: string) => void;
  clearCoupon: () => void;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const subscribeCart = cartStore.subscribe;
const subscribeCoupon = couponStore.subscribe;
const serverLines = () => cartStore.empty;
const serverCoupon = () => couponStore.empty;
const subscribeNothing = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

interface CartProviderProps {
  children: React.ReactNode;
  /** Every purchasable variant, used to validate and refresh whatever is stored in the browser. */
  catalog: Record<string, CartLineInput>;
}

export function CartProvider({ children, catalog }: CartProviderProps) {
  const storedLines = useSyncExternalStore(subscribeCart, cartStore.getSnapshot, serverLines);
  const lines = useMemo(() => reconcileLines(storedLines, catalog), [storedLines, catalog]);
  const couponCode = useSyncExternalStore(
    subscribeCoupon,
    couponStore.getSnapshot,
    serverCoupon,
  );
  const ready = useSyncExternalStore(subscribeNothing, clientReady, serverReady);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<CartContextValue["toast"]>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastId = useRef(0);

  const showToast = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    toastId.current += 1;
    setToast({ message, id: toastId.current });
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const write = (next: CartLine[]) => cartStore.write(next.length > 0 ? next : null);

    return {
      ready,
      catalog,
      lines,
      summary: summarizeCart(lines),
      couponCode,
      drawerOpen,
      toast,
      addLine: (line, quantity = 1, options) => {
        const wanted = clampQuantity(quantity);
        const existing = lines.find((item) => item.variantId === line.variantId);
        const room = MAX_QUANTITY_PER_VARIANT - (existing?.quantity ?? 0);

        // At the limit nothing changes; the storefront only explains why.
        if (room <= 0) {
          showToast(MAX_REACHED_MESSAGE);
          return "max";
        }

        const added = Math.min(wanted, room);
        write(
          existing
            ? lines.map((item) =>
                item.variantId === line.variantId
                  ? { ...item, quantity: item.quantity + added }
                  : item,
              )
            : [...lines, { ...line, quantity: added }],
        );

        // A trimmed add reports the shortfall and leaves the drawer closed.
        if (added < wanted) {
          showToast(partialAddMessage(added));
          return "partial";
        }
        showToast("Added to cart");
        if (options?.openDrawer !== false) setDrawerOpen(true);
        return "added";
      },
      setQuantity: (variantId, quantity) =>
        write(
          !(quantity > 0)
            ? lines.filter((item) => item.variantId !== variantId)
            : lines.map((item) =>
                item.variantId === variantId ? { ...item, quantity: clampQuantity(quantity) } : item,
              ),
        ),
      removeLine: (variantId) =>
        write(lines.filter((item) => item.variantId !== variantId)),
      clearCart: () => {
        cartStore.write(null);
        couponStore.write(null);
      },
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      applyCoupon: (code) => {
        const normalized = code.trim().toUpperCase();
        if (!normalized) return;
        couponStore.write(normalized);
        showToast(`Coupon ${normalized} will be applied at checkout`);
      },
      clearCoupon: () => couponStore.write(null),
      showToast,
    };
  }, [ready, catalog, lines, couponCode, drawerOpen, toast, showToast]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
