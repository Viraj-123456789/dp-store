import type { Metadata } from "next";

import { CartPage } from "@/components/cart/cart-page";
import { fetchSiteContent } from "@/lib/medusa/content";

export const metadata: Metadata = {
  title: "Your Shopping Cart | DPetals",
};

export default async function Page() {
  const { coupons } = await fetchSiteContent();
  return <CartPage coupons={coupons} />;
}
