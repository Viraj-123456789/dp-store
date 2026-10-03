import type { Metadata } from "next";

import { SignInForm } from "@/components/account/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in - DPetals",
  robots: { index: false },
};

export default function LoginPage() {
  return <SignInForm />;
}
