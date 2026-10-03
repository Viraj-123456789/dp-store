"use client";

import { useState } from "react";

import { coupons } from "@/lib/data/coupons";
import { cn } from "@/lib/utils";

import { useCart } from "./cart-provider";

const applyButtonClass =
  "flex-none rounded-sm bg-primary font-heading font-bold text-primary-foreground";

export function CouponBox({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { couponCode, applyCoupon, clearCoupon } = useCart();
  const [draft, setDraft] = useState("");

  return (
    <div className="my-3">
      <details open={defaultOpen}>
        <summary className="cursor-pointer py-0.5 font-heading text-sm font-bold text-primary">
          🏷️ Coupons &amp; offers
        </summary>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            // The typed text stays in the field, as on the live store.
            applyCoupon(draft);
          }}
          className="mb-1.5 mt-2.5 flex gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Enter coupon code"
            autoComplete="off"
            autoCapitalize="characters"
            aria-label="Coupon code"
            className="min-w-0 flex-1 rounded-sm border-[1.5px] border-border bg-card px-3.5 py-[11px] font-sans text-[13.5px] uppercase leading-[normal]"
          />
          <button type="submit" className={cn(applyButtonClass, "px-[18px] py-[11px] text-[13px] leading-[normal]")}>
            Apply
          </button>
        </form>

        <div className="mb-2 min-h-0 text-[12.5px] font-semibold text-primary">
          {couponCode && (
            <>
              {`✓ `}
              <b>{couponCode}</b>
              {` will be applied at checkout`}
              <button
                type="button"
                onClick={clearCoupon}
                aria-label="Remove coupon"
                className="ml-1.5 bg-transparent font-sans text-xs text-muted-foreground"
              >
                ✕ remove
              </button>
            </>
          )}
        </div>

        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="mb-2 flex items-center gap-2.5 rounded-sm border-[1.2px] border-dashed border-primary-hover bg-primary-faint px-3 py-2.5"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="w-max rounded-xs bg-primary-soft px-2 py-0.5 font-heading text-[11px] font-extrabold tracking-[0.06em] text-primary">
                {coupon.code}
              </span>
              <b className="font-heading text-[13px]">{coupon.title}</b>
              <span className="text-[11.5px] text-muted-foreground">{coupon.description}</span>
            </div>
            <button
              type="button"
              onClick={() => applyCoupon(coupon.code)}
              className={cn(applyButtonClass, "px-3.5 py-2 text-xs leading-[normal]")}
            >
              {couponCode === coupon.code ? "Applied ✓" : "Apply"}
            </button>
          </div>
        ))}

        <div className="mt-0.5 text-[11px] text-muted-foreground">
          Offers combine where eligible · you can review or remove codes at checkout.
        </div>
      </details>
    </div>
  );
}
