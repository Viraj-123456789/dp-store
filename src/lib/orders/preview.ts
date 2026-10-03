import { cdn } from "@/lib/cdn";
import { catalog } from "@/lib/data/collections";
import type { Order, OrderLine } from "@/types/account";

/** Order id that renders a sample order on the confirmation page (development only). */
export const PREVIEW_ORDER_ID = "preview";

function previewLine(handle: string, quantity: number): OrderLine {
  const product = catalog[handle];
  return {
    title: product.title,
    variantTitle: null,
    quantity,
    image: cdn(product.image.src),
    unitPrice: product.price,
  };
}

/** A realistic order built from catalogue products, used to design and test the confirmation page. */
export function getPreviewOrder(): Order {
  const lines = [previewLine("neem-tea-tree-face-wash", 2), previewLine("rose-mint-aloe-vera-gel", 1)];
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const address = {
    firstName: "Asha",
    lastName: "Patel",
    address1: "12 Rose Lane, Satellite",
    address2: "",
    city: "Ahmedabad",
    state: "Gujarat",
    pin: "380015",
    phone: "9876543210",
  };

  return {
    id: PREVIEW_ORDER_ID,
    number: "DP1042",
    placedAt: new Date().toISOString(),
    status: "processing",
    currency: "INR",
    lines,
    email: "asha@example.com",
    subtotal,
    discount: 0,
    shippingTotal: 0,
    total: subtotal,
    shippingAddress: address,
    billingAddress: address,
    shippingMethod: "Standard shipping",
    paymentMethod: "Razorpay Secure (UPI, Card, Int'l Card, Apple Pay)",
  };
}
