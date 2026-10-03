import type { Metadata } from "next";

import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Your Shopping Cart | DPetals",
};

export default function Page() {
  return <CartPage />;
}
