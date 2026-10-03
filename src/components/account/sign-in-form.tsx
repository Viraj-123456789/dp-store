"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CheckboxRow, TextField } from "@/components/checkout/fields";
import { signIn } from "@/lib/account/storage";
import { validateContact } from "@/lib/checkout/validation";

import { useHydrated, useSession } from "./hooks";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [offers, setOffers] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Already signed in: go straight to the account.
  useEffect(() => {
    if (hydrated && session) router.replace("/account");
  }, [hydrated, session, router]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError(validateContact(trimmed) ? "Enter an email" : "Enter a valid email");
      return;
    }
    signIn(trimmed.toLowerCase());
    router.push("/account");
  };

  return (
    <div className="w-full max-w-[427px] px-6 py-10">
      <h1 className="font-system text-[20px] font-semibold leading-6">Sign in</h1>
      <p className="mt-1.5 text-ck-muted-soft">Sign in or create an account</p>

      <form onSubmit={onSubmit} noValidate className="mt-[41px]">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          error={error}
          onChange={(value) => {
            setEmail(value);
            setError(undefined);
          }}
          trailing={
            <button
              type="submit"
              aria-label="Continue"
              className="absolute right-[7px] grid h-[35px] w-[34px] place-items-center rounded-sm bg-card"
            >
              <ArrowRight size={18} strokeWidth={2} />
            </button>
          }
        />
        <div className="mt-2.5">
          <CheckboxRow label="Email me with news and offers" checked={offers} onChange={setOffers} />
        </div>
      </form>

      <p className="mt-[25px] text-center text-[12px] text-ck-muted-soft">
        By continuing, you agree to our{" "}
        <Link href="/policies/terms-of-service" className="underline">
          Terms of service
        </Link>
      </p>
    </div>
  );
}
