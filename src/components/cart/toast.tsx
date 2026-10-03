"use client";

import { cn } from "@/lib/utils";

import { useCart } from "./cart-provider";

export function Toast() {
  const { toast } = useCart();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-6 left-1/2 z-120 max-w-[92vw] -translate-x-1/2 rounded-pill bg-foreground px-6 py-3 text-center font-heading text-[13.5px] font-semibold leading-[normal] text-primary-foreground transition duration-300",
        toast ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
      )}
    >
      {toast ? `✓ ${toast.message}` : ""}
    </div>
  );
}
