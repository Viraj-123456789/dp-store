"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { TextField } from "@/components/checkout/fields";
import { accountApi } from "@/lib/account/client";

import { useAccountActions, useSession } from "./hooks";

/** The 10-digit national number from what the customer typed (+91 and a leading 0 are allowed). */
function nationalNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

const submitButtonClass =
  "absolute right-[7px] grid h-[35px] w-[34px] place-items-center rounded-sm bg-card";

type Step = { kind: "phone" } | { kind: "code"; phone: string; devCode?: string };

export function SignInForm() {
  const router = useRouter();
  const { session, ready } = useSession();
  const { verifyOtp } = useAccountActions();
  const [step, setStep] = useState<Step>({ kind: "phone" });
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  // Already signed in: go straight to the account.
  useEffect(() => {
    if (ready && session) router.replace("/account");
  }, [ready, session, router]);

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    const national = nationalNumber(phone);
    if (!/^[6-9]\d{9}$/.test(national)) {
      setError(national ? "Enter a valid 10-digit mobile number" : "Enter your mobile number");
      return;
    }
    setBusy(true);
    try {
      const sent = await accountApi.requestOtp(national);
      setCode("");
      setStep({ kind: "code", phone: national, devCode: sent.devCode });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Something went wrong. Please try again.");
    }
    setBusy(false);
  };

  const checkCode = (event: React.FormEvent) => {
    event.preventDefault();
    if (step.kind !== "code") return;
    if (!/^\d{4,8}$/.test(code.trim())) {
      setError("Enter the code we sent you");
      return;
    }
    verifyOtp.mutate(
      { phone: step.phone, code: code.trim() },
      {
        onSuccess: () => router.push("/account"),
        onError: (failure) => setError(failure.message),
      },
    );
  };

  return (
    <div className="w-full max-w-[427px] px-6 py-10">
      <h1 className="font-system text-[20px] font-semibold leading-6">Sign in</h1>
      <p className="mt-1.5 text-ck-muted-soft">
        {step.kind === "phone"
          ? "Sign in or create an account with your mobile number"
          : `Enter the code we sent to +91 ${step.phone}`}
      </p>

      {step.kind === "phone" ? (
        <form onSubmit={sendCode} noValidate className="mt-[41px]">
          <TextField
            label="Mobile number"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            value={phone}
            error={error}
            onChange={(value) => {
              setPhone(value);
              setError(undefined);
            }}
            trailing={
              <button type="submit" aria-label="Send code" disabled={busy} className={submitButtonClass}>
                <ArrowRight size={18} strokeWidth={2} />
              </button>
            }
          />
        </form>
      ) : (
        <form onSubmit={checkCode} noValidate className="mt-[41px]">
          <TextField
            label="Code"
            name="code"
            autoComplete="one-time-code"
            inputMode="numeric"
            value={code}
            error={error}
            onChange={(value) => {
              setCode(value.replace(/\D/g, "").slice(0, 8));
              setError(undefined);
            }}
            trailing={
              <button
                type="submit"
                aria-label="Verify code"
                disabled={verifyOtp.isPending}
                className={submitButtonClass}
              >
                <ArrowRight size={18} strokeWidth={2} />
              </button>
            }
          />
          {step.devCode && (
            <p className="mt-2 text-[12px] text-ck-muted-soft">Development code: {step.devCode}</p>
          )}
          <button
            type="button"
            onClick={() => {
              setStep({ kind: "phone" });
              setError(undefined);
            }}
            className="mt-3 text-[13px] text-ck-accent"
          >
            Use a different number
          </button>
        </form>
      )}

      <p className="mt-[25px] text-center text-[12px] text-ck-muted-soft">
        By continuing, you agree to our{" "}
        <Link href="/policies/terms-of-service" className="underline">
          Terms of service
        </Link>
      </p>
    </div>
  );
}
