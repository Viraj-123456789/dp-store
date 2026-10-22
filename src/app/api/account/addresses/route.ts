import { toAddressInput } from "@/lib/account/address-input";
import { accountJson, withSession } from "@/lib/account/server";
import { readJson } from "@/lib/cart/server";
import { createAddress, listAddresses } from "@/lib/medusa/account";

/** GET /api/account/addresses: SavedAddress[] (default first). */
export function GET() {
  return withSession(async (token) => accountJson(await listAddresses(token)));
}

/** POST /api/account/addresses: SavedAddress. */
export function POST(request: Request) {
  return withSession(async (token) => {
    const address = toAddressInput(await readJson(request));
    return accountJson(await createAddress(token, address), 201);
  });
}
