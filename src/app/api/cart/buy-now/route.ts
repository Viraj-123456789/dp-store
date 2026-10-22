import { guarded, json, readJson, startCart } from "@/lib/cart/server";
import { addLine } from "@/lib/medusa/cart";

/**
 * POST /api/cart/buy-now { variantId, quantity }: a throwaway cart holding just this product,
 * so "Buy it now" never touches the shopping cart. Returns the same reply as adding a line.
 */
export function POST(request: Request) {
  return guarded(async () => {
    const body = await readJson(request);
    const variantId = typeof body?.variantId === "string" ? body.variantId : "";
    const quantity = Number(body?.quantity ?? 1);
    if (!variantId || !Number.isFinite(quantity) || quantity < 1) {
      return json({ error: "Choose a product to buy." }, 400);
    }
    const cartId = await startCart("buy");
    return json(await addLine(cartId, variantId, quantity));
  });
}
