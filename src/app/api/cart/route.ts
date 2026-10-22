import { guarded, json, parseMode, readCartView } from "@/lib/cart/server";

/** GET /api/cart?mode=cart|buy: the visitor's cart (empty when they have none). */
export function GET(request: Request) {
  return guarded(async () => {
    const mode = parseMode(new URL(request.url).searchParams.get("mode"));
    return json(await readCartView(mode));
  });
}
