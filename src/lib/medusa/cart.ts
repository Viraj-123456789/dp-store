import "server-only";

import { FetchError } from "@medusajs/js-sdk";

import type { Order } from "@/types/account";
import type {
  CartMutation,
  CartView,
  CheckoutInput,
  CompleteCartResult,
  PlaceOrderResult,
} from "@/types/cart";

import { sdk } from "./client";
import { visitorHeaders } from "./visitor";

// Cart, checkout and order calls to the backend's /store/dp routes. Never cached: they are
// per visitor. Each call returns the updated cart, so one round trip is enough per change.

/** The backend no longer has this cart (never existed, or it became an order). */
export function isMissing(error: unknown): boolean {
  return error instanceof FetchError && error.status === 404;
}

/**
 * The cart already became an order (HTTP 409). Its id must be kept: the checkout return page
 * still needs it to show the order when the payment webhook finished first.
 */
export function isCompleted(error: unknown): boolean {
  return error instanceof FetchError && error.status === 409;
}

/** The backend refused the request as invalid (a message safe to show the customer). */
export function badRequestMessage(error: unknown): string | null {
  return error instanceof FetchError && (error.status === 400 || error.status === 403 || error.status === 429)
    ? error.message
    : null;
}

async function request<T>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: object) {
  return sdk.client.fetch<T>(`/store/dp${path}`, {
    method,
    cache: "no-store",
    headers: await visitorHeaders(),
    ...(body ? { body } : {}),
  });
}

const cartPath = (cartId: string, suffix = "") => `/carts/${encodeURIComponent(cartId)}${suffix}`;

export const createCart = () => request<CartView>("POST", "/carts", {});

export const getCart = (cartId: string) => request<CartView>("GET", cartPath(cartId));

export const addLine = (cartId: string, variantId: string, quantity: number) =>
  request<CartMutation>("POST", cartPath(cartId, "/lines"), { variantId, quantity });

export const setLineQuantity = (cartId: string, variantId: string, quantity: number) =>
  request<CartMutation>("PATCH", cartPath(cartId, `/lines/${encodeURIComponent(variantId)}`), {
    quantity,
  });

export const removeLine = (cartId: string, variantId: string) =>
  request<CartMutation>("DELETE", cartPath(cartId, `/lines/${encodeURIComponent(variantId)}`));

export const applyCoupon = (cartId: string, code: string) =>
  request<{ cart: CartView; error?: string }>("POST", cartPath(cartId, "/coupon"), { code });

export const removeCoupon = (cartId: string) =>
  request<{ cart: CartView }>("DELETE", cartPath(cartId, "/coupon"));

/** `sessionToken` links the order to the signed-in customer (and saves their details). */
export const checkout = async (cartId: string, input: CheckoutInput, sessionToken?: string) =>
  sdk.client.fetch<PlaceOrderResult>(`/store/dp${cartPath(cartId, "/checkout")}`, {
    method: "POST",
    cache: "no-store",
    body: input,
    headers: {
      ...(await visitorHeaders()),
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
  });

export const completeCart = (cartId: string) =>
  request<CompleteCartResult>("POST", cartPath(cartId, "/complete"), {});

/**
 * A placed order; null when the id is unknown or neither the link token nor the signed-in
 * customer may see it (the backend answers 404 for all of these).
 */
export async function fetchOrder(
  orderId: string,
  linkToken?: string,
  sessionToken?: string,
): Promise<Order | null> {
  if (!linkToken && !sessionToken) return null;
  try {
    return await sdk.client.fetch<Order>(`/store/dp/orders/${encodeURIComponent(orderId)}`, {
      ...(linkToken ? { query: { t: linkToken } } : {}),
      cache: "no-store",
      headers: {
        ...(await visitorHeaders()),
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
    });
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}
