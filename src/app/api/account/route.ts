import { accountJson, readSessionToken, withSession } from "@/lib/account/server";
import { readJson } from "@/lib/cart/server";
import { getSession, updateProfile } from "@/lib/medusa/account";

const text = (value: unknown) => (typeof value === "string" ? value : undefined);

/** GET /api/account: AccountSession, or null when signed out (a 200, so guests see no console error). */
export async function GET() {
  if (!(await readSessionToken())) return accountJson(null);
  const response = await withSession(async (token) => accountJson(await getSession(token)));
  return response.status === 401 ? accountJson(null) : response;
}

/** PATCH /api/account { firstName?, lastName?, email? }: AccountSession. */
export function PATCH(request: Request) {
  return withSession(async (token) => {
    const body = await readJson(request);
    const patch = {
      ...(text(body?.firstName) !== undefined && { firstName: text(body?.firstName) }),
      ...(text(body?.lastName) !== undefined && { lastName: text(body?.lastName) }),
      ...(text(body?.email) !== undefined && { email: text(body?.email) }),
    };
    return accountJson(await updateProfile(token, patch));
  });
}
