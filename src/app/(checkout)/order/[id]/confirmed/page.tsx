import type { Metadata } from "next";

import { OrderConfirmation } from "@/components/order/order-confirmation";
import { readSessionToken } from "@/lib/account/server";
import { fetchOrder } from "@/lib/medusa/cart";

export const metadata: Metadata = {
  title: "Order confirmed - DPetals",
  robots: { index: false },
};

/**
 * The order is read with the access token from the link the customer was sent to (a guest
 * has no account to prove ownership), or as its owner when signed in. A wrong or missing token shows the same "not found"
 * page as an unknown order.
 */
export default async function OrderConfirmedPage(props: PageProps<"/order/[id]/confirmed">) {
  const { id } = await props.params;
  const { t } = await props.searchParams;
  const token = Array.isArray(t) ? t[0] : t;
  const order = await fetchOrder(id, token, await readSessionToken());

  return <OrderConfirmation order={order} />;
}
