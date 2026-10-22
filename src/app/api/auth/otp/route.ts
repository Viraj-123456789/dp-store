import { accountJson, failure } from "@/lib/account/server";
import { readJson } from "@/lib/cart/server";
import { requestOtp } from "@/lib/medusa/account";

/** POST /api/auth/otp { phone }: { resendInSeconds, devCode? }. Sends the sign-in code by SMS. */
export async function POST(request: Request) {
  const body = await readJson(request);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  if (!phone) return accountJson({ error: "Enter your mobile number." }, 400);

  try {
    return accountJson(await requestOtp(phone));
  } catch (error) {
    return failure(error);
  }
}
