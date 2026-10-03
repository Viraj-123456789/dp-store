import type { Metadata } from "next";

import { OrderConfirmation } from "@/components/order/order-confirmation";
import { getPreviewOrder, PREVIEW_ORDER_ID } from "@/lib/orders/preview";

export const metadata: Metadata = {
  title: "Order confirmed - DPetals",
  robots: { index: false },
};

export default async function OrderConfirmedPage(props: PageProps<"/order/[id]/confirmed">) {
  const { id } = await props.params;
  // The sample order exists only so the page can be reviewed before payments are connected.
  const previewOrder =
    process.env.NODE_ENV !== "production" && id === PREVIEW_ORDER_ID ? getPreviewOrder() : undefined;

  return <OrderConfirmation orderId={id} previewOrder={previewOrder} />;
}
