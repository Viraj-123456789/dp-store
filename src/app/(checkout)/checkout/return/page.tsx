import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutReturn } from "@/components/checkout/checkout-return";

export const metadata: Metadata = {
  title: "Confirming your payment - DPetals",
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense>
      <CheckoutReturn />
    </Suspense>
  );
}
