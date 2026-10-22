import { accountJson, failure, writeSessionToken } from "@/lib/account/server";
import { readJson } from "@/lib/cart/server";
import { getSession, verifyOtp } from "@/lib/medusa/account";

/** POST /api/auth/verify { phone, code }: AccountSession. Signs in and sets the session cookie. */
export async function POST(request: Request) {
  const body = await readJson(request);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!phone || !code) return accountJson({ error: "Enter the code we sent you." }, 400);

  try {
    const token = await verifyOtp(phone, code);
    await writeSessionToken(token);
    return accountJson(await getSession(token));
  } catch (error) {
    return failure(error);
  }
}
