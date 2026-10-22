import type {
  CartMode,
  CartMutation,
  CartView,
  CompleteCartResult,
  PlaceOrderResult,
} from "@/types/cart";
import type { CheckoutValues } from "@/lib/checkout/validation";

// Browser-side calls to the storefront's own /api/cart and /api/checkout routes.

export class CartApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const GENERIC_ERROR = "Something went wrong. Please try again.";

async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const response = await fetch(path, {
    method: init?.method ?? "GET",
    cache: "no-store",
    ...(init?.body === undefined
      ? {}
      : { headers: { "content-type": "application/json" }, body: JSON.stringify(init.body) }),
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : GENERIC_ERROR;
    throw new CartApiError(message, response.status);
  }
  return data as T;
}

export const cartApi = {
  get: (mode: CartMode = "cart") => api<CartView>(`/api/cart?mode=${mode}`),

  add: (variantId: string, quantity: number, mode: CartMode = "cart") =>
    api<CartMutation>("/api/cart/lines", { method: "POST", body: { variantId, quantity, mode } }),

  setQuantity: (variantId: string, quantity: number, mode: CartMode = "cart") =>
    api<CartMutation>(`/api/cart/lines/${encodeURIComponent(variantId)}`, {
      method: "PATCH",
      body: { quantity, mode },
    }),

  remove: (variantId: string, mode: CartMode = "cart") =>
    api<CartMutation>(`/api/cart/lines/${encodeURIComponent(variantId)}?mode=${mode}`, {
      method: "DELETE",
    }),

  applyCoupon: (code: string, mode: CartMode = "cart") =>
    api<{ cart: CartView; error?: string }>("/api/cart/coupon", {
      method: "POST",
      body: { code, mode },
    }),

  removeCoupon: (mode: CartMode = "cart") =>
    api<{ cart: CartView }>(`/api/cart/coupon?mode=${mode}`, { method: "DELETE" }),

  /** Starts a throwaway cart holding one product, for "Buy it now". */
  buyNow: (variantId: string, quantity: number) =>
    api<CartMutation>("/api/cart/buy-now", { method: "POST", body: { variantId, quantity } }),

  checkout: (values: CheckoutValues, mode: CartMode) =>
    api<PlaceOrderResult>("/api/checkout", {
      method: "POST",
      body: {
        mode,
        email: values.contact.trim(),
        shipping: values.shipping,
        billing: values.billingSame ? null : values.billing,
        payment: values.payment,
      },
    }),

  complete: (mode: CartMode) =>
    api<CompleteCartResult>("/api/checkout/complete", { method: "POST", body: { mode } }),
};
