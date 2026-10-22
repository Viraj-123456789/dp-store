import { readSessionToken } from "@/lib/account/server";
import { dropCartId, guarded, json, parseMode, readCartId, readJson } from "@/lib/cart/server";
import { badRequestMessage, checkout, isMissing } from "@/lib/medusa/cart";
import type { CheckoutAddress, CheckoutInput } from "@/types/cart";

const text = (value: unknown) => (typeof value === "string" ? value : "");

function toAddress(value: unknown): CheckoutAddress {
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return {
    firstName: text(source.firstName),
    lastName: text(source.lastName),
    address1: text(source.address1),
    address2: text(source.address2),
    city: text(source.city),
    state: text(source.state),
    pin: text(source.pin),
    phone: text(source.phone),
  };
}

/** Where the payment gateway sends the customer back to: always this storefront. */
function siteOrigin(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? new URL(request.url).origin;
}

/**
 * POST /api/checkout { mode, email, shipping, billing, payment }: PlaceOrderResult.
 * "redirect" sends the customer to the gateway; "placed" means the order exists already.
 */
export function POST(request: Request) {
  return guarded(async () => {
    const body = await readJson(request);
    const mode = parseMode(body?.mode);
    const cartId = await readCartId(mode);
    if (!body || !cartId) {
      return json({ status: "unavailable", message: "Your cart is empty." });
    }

    const input: CheckoutInput = {
      email: text(body.email),
      shipping: toAddress(body.shipping),
      billing: body.billing ? toAddress(body.billing) : null,
      payment: body.payment === "phonepe" ? "phonepe" : "razorpay",
      returnUrl: `${siteOrigin(request)}/checkout/return?mode=${mode}`,
    };

    try {
      const result = await checkout(cartId, input, await readSessionToken());
      // A placed order consumed the cart; a redirect keeps it until the customer returns.
      if (result.status === "placed") await dropCartId(mode);
      return json(result);
    } catch (error) {
      const message = badRequestMessage(error);
      if (message) return json({ status: "unavailable", message });
      if (isMissing(error)) {
        await dropCartId(mode);
        return json({ status: "unavailable", message: "Your cart is empty." });
      }
      throw error;
    }
  });
}
