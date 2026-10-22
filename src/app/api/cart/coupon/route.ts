import { guarded, json, parseMode, readCartId, readCartView, readJson, withCart } from "@/lib/cart/server";
import { applyCoupon, isMissing, removeCoupon } from "@/lib/medusa/cart";

/** POST /api/cart/coupon { code, mode? }: { cart, error? }. A bad code leaves the cart as it was. */
export function POST(request: Request) {
  return guarded(async () => {
    const body = await readJson(request);
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    if (!code) return json({ error: "Enter a coupon code." }, 400);
    return json(await withCart(parseMode(body?.mode), (cartId) => applyCoupon(cartId, code)));
  });
}

/** DELETE /api/cart/coupon?mode=: remove the manual coupon. */
export function DELETE(request: Request) {
  return guarded(async () => {
    const mode = parseMode(new URL(request.url).searchParams.get("mode"));
    const cartId = await readCartId(mode);
    if (!cartId) return json({ cart: await readCartView(mode) });
    try {
      return json(await removeCoupon(cartId));
    } catch (error) {
      if (!isMissing(error)) throw error;
      return json({ cart: await readCartView(mode) });
    }
  });
}
