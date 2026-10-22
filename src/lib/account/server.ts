import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { accountErrorMessage, errorStatus, isUnauthorized } from "@/lib/medusa/account";

// The customer's JWT lives in an httpOnly cookie, so page scripts never see it; the browser
// only talks to /api/auth* and /api/account*.

const COOKIE = "dp_session";
const FOURTEEN_DAYS = 60 * 60 * 24 * 14;
const NO_STORE = { "Cache-Control": "no-store" };

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

export async function writeSessionToken(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FOURTEEN_DAYS,
  });
}

export async function clearSessionToken() {
  (await cookies()).delete(COOKIE);
}

export function accountJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/**
 * Runs an account call with the visitor's token. No cookie, or a token the backend rejects,
 * is a 401 (and the dead cookie is dropped). Other failures become a readable message.
 */
export async function withSession(run: (token: string) => Promise<Response>): Promise<Response> {
  const token = await readSessionToken();
  if (!token) return accountJson({ error: "Please sign in to continue." }, 401);

  try {
    return await run(token);
  } catch (error) {
    if (isUnauthorized(error)) {
      await clearSessionToken();
      return accountJson({ error: "Please sign in to continue." }, 401);
    }
    return failure(error);
  }
}

/** A failure as JSON: the backend's message when it is safe to show, otherwise a generic one. */
export function failure(error: unknown): Response {
  const message = accountErrorMessage(error);
  const status = errorStatus(error);
  if (message && status) return accountJson({ error: message }, status);
  console.error("Account request failed:", error);
  return accountJson({ error: "Something went wrong. Please try again." }, 502);
}
