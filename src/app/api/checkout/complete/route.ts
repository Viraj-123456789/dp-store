import { dropCartId, guarded, json, parseMode, readCartId, readJson } from "@/lib/cart/server";
import { completeCart } from "@/lib/medusa/cart";

/**
 * POST /api/checkout/complete { mode }: CompleteCartResult. The checkout return page calls it
 * when the customer comes back from the gateway. Safe to repeat: an order the payment webhook
 * already placed is simply returned.
 */
export function POST(request: Request) {
  return guarded(async () => {
    const body = await readJson(request);
    const mode = parseMode(body?.mode);
    const cartId = await readCartId(mode);
    if (!cartId) {
      return json({ status: "failed", message: "We couldn't find your checkout. If you were charged, check your email for a confirmation." });
    }
    const result = await completeCart(cartId);
    if (result.status === "placed") await dropCartId(mode);
    return json(result);
  });
}
