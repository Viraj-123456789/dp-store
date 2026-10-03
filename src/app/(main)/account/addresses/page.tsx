import type { Metadata } from "next";

import { AccountShell } from "@/components/account/account-shell";
import { AddressesView } from "@/components/account/addresses-view";

export const metadata: Metadata = {
  title: "Addresses - DPetals",
  robots: { index: false },
};

export default function AddressesPage() {
  return (
    <AccountShell>
      <AddressesView />
    </AccountShell>
  );
}
