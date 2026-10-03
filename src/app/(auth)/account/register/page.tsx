import type { Metadata } from "next";

import { SignInForm } from "@/components/account/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in - DPetals",
  robots: { index: false },
};

/** Registration and sign-in share one screen ("Sign in or create an account"). */
export default function RegisterPage() {
  return <SignInForm />;
}
