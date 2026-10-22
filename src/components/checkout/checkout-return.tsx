"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { cartApi } from "@/lib/cart/client";
import { parseCartMode } from "@/lib/cart/mode";

import { CheckoutHeader } from "./checkout-header";

const POLL_MS = 3000;
const MAX_ATTEMPTS = 10;

type State =
  | { phase: "confirming" }
  | { phase: "slow"; message: string }
  | { phase: "failed"; message: string };

const linkClass =
  "grid h-[49.6px] place-items-center rounded-sm bg-ck-accent px-6 font-system text-[14px] font-semibold leading-[normal] text-card";

/**
 * Where the payment gateway sends the customer back to. It asks the backend to finish the
 * order (which checks the payment with the gateway itself, never trusting the URL) and then
 * moves on to the confirmation page. If the payment is still undecided it keeps checking for
 * about half a minute; the payment webhook may also place the order in the meantime.
 */
export function CheckoutReturn() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = parseCartMode(params.get("mode"));
  const { clearCart } = useCart();
  const [state, setState] = useState<State>({ phase: "confirming" });
  const started = useRef(false);

  useEffect(() => {
    // React runs effects twice in development; completing is idempotent but one loop is enough.
    if (started.current) return;
    started.current = true;
    let cancelled = false;

    (async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        let result;
        try {
          result = await cartApi.complete(mode);
        } catch {
          result = null;
        }
        if (cancelled) return;

        if (result?.status === "placed") {
          if (mode === "cart") clearCart();
          router.replace(`/order/${result.order.id}/confirmed?t=${encodeURIComponent(result.orderToken)}`);
          return;
        }
        if (result?.status === "failed") {
          setState({ phase: "failed", message: result.message });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      }
      if (!cancelled) {
        setState({
          phase: "slow",
          message:
            "Your bank is taking longer than usual to confirm the payment. If it goes through, we'll email your order confirmation.",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, router, clearCart]);

  return (
    <div className="min-h-screen bg-card font-system text-[14px] leading-[1.35] text-ck-text">
      <CheckoutHeader />
      <div className="mx-auto max-w-[540px] px-3.5 py-16 text-center">
        {state.phase === "confirming" ? (
          <>
            <h1 className="font-system text-[26px] font-semibold leading-[1.2]">Confirming your payment…</h1>
            <p role="status" className="mt-2 leading-[1.5] text-ck-muted">
              Please don&apos;t close this page. This only takes a moment.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-system text-[26px] font-semibold leading-[1.2]">
              {state.phase === "failed" ? "Payment not completed" : "Still confirming…"}
            </h1>
            <p role="alert" className="mt-2 leading-[1.5] text-ck-muted">
              {state.message}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={mode === "cart" ? "/cart" : "/"} className={linkClass}>
                {mode === "cart" ? "Back to your cart" : "Continue shopping"}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
