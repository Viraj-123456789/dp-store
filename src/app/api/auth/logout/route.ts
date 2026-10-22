import { accountJson, clearSessionToken } from "@/lib/account/server";

/** POST /api/auth/logout: forgets the session cookie. */
export async function POST() {
  await clearSessionToken();
  return accountJson({ signedOut: true });
}
