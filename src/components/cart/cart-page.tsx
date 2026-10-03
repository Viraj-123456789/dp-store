"use client";

import { CartLineItem } from "./cart-line-item";
import { useCart } from "./cart-provider";
import { CartTotals } from "./cart-totals";
import { CouponBox } from "./coupon-box";
import { EmptyCart } from "./empty-cart";

export function CartPage() {
  const { ready, lines } = useCart();

  return (
    <div className="mx-auto w-full max-w-[820px] px-4 pb-16 pt-[34px] md:px-6">
      <h1 className="font-heading text-[2em]">Your Cart</h1>

      {/* Stored carts are read in the browser, so stay blank until then rather than flash "empty". */}
      {!ready ? null : lines.length === 0 ? (
        <EmptyCart ctaLabel="Continue shopping" href="/collections/all" />
      ) : (
        <div>
          {lines.map((line) => (
            <CartLineItem key={line.variantId} line={line} />
          ))}
          <div className="mt-5 rounded-2xl border border-border bg-card p-5">
            <CouponBox defaultOpen />
            <CartTotals />
          </div>
        </div>
      )}
    </div>
  );
}
