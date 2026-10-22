import "server-only";

import { FetchError } from "@medusajs/js-sdk";

import type { AccountSession, Order, SavedAddress } from "@/types/account";

import { sdk } from "./client";
import { visitorHeaders } from "./visitor";

// Phone-OTP sign-in and the signed-in customer's account, through the backend's /store/dp
// routes. The customer's JWT is passed in per call (the BFF keeps it in an httpOnly cookie).

/** The token is missing, expired or revoked (HTTP 401). */
export function isUnauthorized(error: unknown): boolean {
  return error instanceof FetchError && error.status === 401;
}

/** A message from the backend that is safe to show the customer (validation, OTP, rate limit). */
export function accountErrorMessage(error: unknown): string | null {
  const status = errorStatus(error);
  return status !== null && [400, 401, 403, 404, 429].includes(status)
    ? (error as FetchError).message
    : null;
}

export function errorStatus(error: unknown): number | null {
  return error instanceof FetchError ? (error.status ?? null) : null;
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

async function call<T>(method: Method, path: string, token?: string, body?: object) {
  return sdk.client.fetch<T>(path, {
    method,
    cache: "no-store",
    headers: {
      ...(await visitorHeaders()),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body } : {}),
  });
}

/** POST /store/dp/auth/phone/otp: sends the code by SMS. `devCode` only exists on dev servers. */
export async function requestOtp(
  phone: string,
): Promise<{ resendInSeconds: number; devCode?: string }> {
  const result = await call<{ sent: boolean; resend_in_seconds: number; dev_code?: string }>(
    "POST",
    "/store/dp/auth/phone/otp",
    undefined,
    { phone },
  );
  return {
    resendInSeconds: result.resend_in_seconds,
    ...(result.dev_code ? { devCode: result.dev_code } : {}),
  };
}

interface TokenResult {
  token: string;
}

/**
 * Checks the code and returns a customer-scoped JWT. A first login has no customer yet, so
 * one is created and the token refreshed to carry it.
 */
export async function verifyOtp(phone: string, code: string): Promise<string> {
  const { token } = await call<TokenResult>("POST", "/auth/customer/phone-otp", undefined, {
    phone,
    code,
  });
  const profile = decodeActorId(token);
  if (profile) return token;

  await call("POST", "/store/dp/customers", token, {});
  const refreshed = await call<TokenResult>("POST", "/auth/token/refresh", token);
  return refreshed.token;
}

/** Reads `actor_id` from the JWT payload (not verified: only used to see if a customer exists). */
function decodeActorId(token: string): string | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof parsed === "object" && parsed !== null && "actor_id" in parsed) {
      const id = (parsed as { actor_id: unknown }).actor_id;
      return typeof id === "string" && id ? id : null;
    }
  } catch {
    // fall through
  }
  return null;
}

export const getSession = (token: string) => call<AccountSession>("GET", "/store/dp/me", token);

export const updateProfile = (
  token: string,
  patch: Partial<Pick<AccountSession, "firstName" | "lastName" | "email">>,
) => call<AccountSession>("PATCH", "/store/dp/me", token, patch);

export const listAddresses = (token: string) =>
  call<SavedAddress[]>("GET", "/store/dp/me/addresses", token);

export type AddressInput = Omit<SavedAddress, "id">;

export const createAddress = (token: string, address: AddressInput) =>
  call<SavedAddress>("POST", "/store/dp/me/addresses", token, address);

export const updateAddress = (token: string, id: string, address: AddressInput) =>
  call<SavedAddress>("PATCH", `/store/dp/me/addresses/${encodeURIComponent(id)}`, token, address);

export const deleteAddress = (token: string, id: string) =>
  call<SavedAddress[]>("DELETE", `/store/dp/me/addresses/${encodeURIComponent(id)}`, token);

export const listOrders = (token: string) => call<Order[]>("GET", "/store/dp/me/orders", token);
