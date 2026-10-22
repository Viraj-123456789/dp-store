import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { badRequestMessage, createCart, getCart, isCompleted, isMissing } from "@/lib/medusa/cart";
import { parseCartMode } from "@/lib/cart/mode";
import { EMPTY_CART } from "@/lib/cart/pricing";
import type { CartMode, CartView } from "@/types/cart";

// The cart id is the visitor's key to their cart, so it lives in an httpOnly cookie that
// scripts cannot read; the browser only ever talks to /api/cart*.

const COOKIE_NAMES: Record<CartMode, string> = { cart: "dp_cart", buy: "dp_buy_cart" };
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const parseMode = parseCartMode;

export async function readCartId(mode: CartMode): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAMES[mode])?.value;
}

async function writeCartId(mode: CartMode, id: string) {
  (await cookies()).set(COOKIE_NAMES[mode], id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function dropCartId(mode: CartMode) {
  (await cookies()).delete(COOKIE_NAMES[mode]);
}

/** Creates a fresh cart and remembers it. */
export async function startCart(mode: CartMode): Promise<string> {
  const cart = await createCart();
  await writeCartId(mode, cart.id);
  return cart.id;
}

/**
 * Runs a cart change against the visitor's cart, creating one first if they have none.
 * A stale cookie (cart gone or already an order) is replaced and the change retried once.
 */
export async function withCart<T>(mode: CartMode, run: (cartId: string) => Promise<T>): Promise<T> {
  const existing = await readCartId(mode);
  const cartId = existing ?? (await startCart(mode));
  try {
    return await run(cartId);
  } catch (error) {
    if (!existing || !isMissing(error)) throw error;
    return run(await startCart(mode));
  }
}

/** The visitor's cart for display; an empty one when there is none (the cookie is cleaned up). */
export async function readCartView(mode: CartMode): Promise<CartView> {
  const cartId = await readCartId(mode);
  if (!cartId) return EMPTY_CART;
  try {
    return await getCart(cartId);
  } catch (error) {
    // A cart that became an order shows as empty but keeps its cookie (see isCompleted).
    if (isCompleted(error)) return EMPTY_CART;
    if (!isMissing(error)) throw error;
    await dropCartId(mode);
    return EMPTY_CART;
  }
}

const NO_STORE = { "Cache-Control": "private, no-store" };

/** JSON response that is never cached by the browser or a CDN. */
export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/**
 * Turns a failure into a clean JSON error: a validation message the customer can read
 * (400), or a generic one (502) with the details kept in the server log.
 */
export async function guarded(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    const message = badRequestMessage(error);
    if (message) return json({ error: message }, 400);
    console.error("Cart request failed:", error);
    return json({ error: "Something went wrong. Please try again." }, 502);
  }
}

/** A request body as a plain object, or null when it is not JSON. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const body: unknown = await request.json().catch(() => null);
  return typeof body === "object" && body !== null && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : null;
}
