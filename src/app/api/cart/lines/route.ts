import { guarded, json, parseMode, readJson, withCart } from "@/lib/cart/server";
import { addLine } from "@/lib/medusa/cart";

/** POST /api/cart/lines { variantId, quantity, mode? }: add to the cart; the reply says how it went. */
export function POST(request: Request) {
  return guarded(async () => {
    const body = await readJson(request);
    const variantId = typeof body?.variantId === "string" ? body.variantId : "";
    const quantity = Number(body?.quantity ?? 1);
    if (!variantId || !Number.isFinite(quantity) || quantity < 1) {
      return json({ error: "Choose a product to add." }, 400);
    }
    return json(await withCart(parseMode(body?.mode), (cartId) => addLine(cartId, variantId, quantity)));
  });
}
