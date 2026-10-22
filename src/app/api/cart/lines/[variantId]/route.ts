import { EMPTY_CART } from "@/lib/cart/pricing";
import { guarded, json, parseMode, readCartId, readCartView, readJson } from "@/lib/cart/server";
import { isMissing, removeLine, setLineQuantity } from "@/lib/medusa/cart";
import type { CartMutation } from "@/types/cart";

type Context = RouteContext<"/api/cart/lines/[variantId]">;

/** Runs a change on an existing cart; a vanished cart or line just means "nothing to change". */
async function onExistingCart(
  mode: ReturnType<typeof parseMode>,
  run: (cartId: string) => Promise<CartMutation>,
): Promise<CartMutation> {
  const cartId = await readCartId(mode);
  if (!cartId) return { cart: EMPTY_CART, outcome: "removed" };
  try {
    return await run(cartId);
  } catch (error) {
    if (!isMissing(error)) throw error;
    return { cart: await readCartView(mode), outcome: "removed" };
  }
}

/** PATCH /api/cart/lines/:variantId { quantity, mode? }: set a quantity (0 removes the line). */
export function PATCH(request: Request, context: Context) {
  return guarded(async () => {
    const { variantId } = await context.params;
    const body = await readJson(request);
    const quantity = Number(body?.quantity);
    if (!Number.isFinite(quantity) || quantity < 0) {
      return json({ error: "Enter a valid quantity." }, 400);
    }
    return json(
      await onExistingCart(parseMode(body?.mode), (cartId) =>
        setLineQuantity(cartId, variantId, quantity),
      ),
    );
  });
}

/** DELETE /api/cart/lines/:variantId?mode=: remove a line. */
export function DELETE(request: Request, context: Context) {
  return guarded(async () => {
    const { variantId } = await context.params;
    const mode = parseMode(new URL(request.url).searchParams.get("mode"));
    return json(await onExistingCart(mode, (cartId) => removeLine(cartId, variantId)));
  });
}
