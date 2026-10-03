import type { Metadata } from "next";

import { AccountShell } from "@/components/account/account-shell";
import { OrdersView } from "@/components/account/orders-view";

export const metadata: Metadata = {
  title: "Orders - DPetals",
  robots: { index: false },
};

export default function OrdersPage() {
  return (
    <AccountShell>
      <OrdersView />
    </AccountShell>
  );
}
