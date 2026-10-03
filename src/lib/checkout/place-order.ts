import type { Order } from "@/types/account";
import type { CartLine } from "@/types/cart";

import type { CheckoutValues } from "./validation";

export type PlaceOrderResult =
  | { status: "redirect"; url: string }
  /** Payment already captured; the order is ready to show on the confirmation page. */
  | { status: "placed"; order: Order }
  | { status: "unavailable"; message: string };

/**
 * Hands the order to the payment provider.
 * Payments are not connected until the Medusa backend (payment sessions) is wired up,
 * so this reports that clearly instead of pretending an order was placed.
 */
export async function placeOrder(
  _values: CheckoutValues,
  _lines: CartLine[],
): Promise<PlaceOrderResult> {
  void _values;
  void _lines;
  return {
    status: "unavailable",
    message:
      "Online payments aren't connected to this storefront yet, so the order couldn't be placed.",
  };
}
