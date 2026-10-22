import { toAddressInput } from "@/lib/account/address-input";
import { accountJson, withSession } from "@/lib/account/server";
import { readJson } from "@/lib/cart/server";
import { deleteAddress, updateAddress } from "@/lib/medusa/account";

/** PATCH /api/account/addresses/:id: SavedAddress. */
export function PATCH(request: Request, context: RouteContext<"/api/account/addresses/[id]">) {
  return withSession(async (token) => {
    const { id } = await context.params;
    const address = toAddressInput(await readJson(request));
    return accountJson(await updateAddress(token, id, address));
  });
}

/** DELETE /api/account/addresses/:id: the remaining SavedAddress[]. */
export function DELETE(_request: Request, context: RouteContext<"/api/account/addresses/[id]">) {
  return withSession(async (token) => {
    const { id } = await context.params;
    return accountJson(await deleteAddress(token, id));
  });
}
