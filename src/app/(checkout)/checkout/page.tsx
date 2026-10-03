import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutPage } from "@/components/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout - DPetals",
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense>
      <CheckoutPage />
    </Suspense>
  );
}
