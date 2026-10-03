import type { Metadata } from "next";

import { AccountShell } from "@/components/account/account-shell";
import { DashboardView } from "@/components/account/dashboard-view";

export const metadata: Metadata = {
  title: "Account - DPetals",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <AccountShell>
      <DashboardView />
    </AccountShell>
  );
}
