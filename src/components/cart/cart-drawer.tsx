"use client";

import Link from "next/link";
import { useEffect } from "react";

import { textLinkClass } from "@/components/ui/text-link";
import type { CartLineInput } from "@/lib/cart/lines";
import { cn } from "@/lib/utils";

import { CartLineItem } from "./cart-line-item";
import { useCart } from "./cart-provider";
import { CartSuggestions } from "./cart-suggestions";
import { CartTotals } from "./cart-totals";
import { CouponBox } from "./coupon-box";
import { EmptyCart } from "./empty-cart";
import { RewardsBar } from "./rewards-bar";

export function CartDrawer({ suggestions }: { suggestions: CartLineInput[] }) {
  const { lines, summary, drawerOpen, closeDrawer } = useCart();
  const isEmpty = lines.length === 0;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeDrawer]);

  return (
    <>
      <div
        aria-hidden
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-80 bg-foreground/45 backdrop-blur-[3px] transition-opacity duration-300",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-label="Your Cart"
        inert={!drawerOpen}
        className={cn(
          "fixed right-0 top-0 z-95 flex h-screen w-[min(440px,100vw)] flex-col bg-background shadow-drawer-end transition-transform duration-300",
          drawerOpen ? "translate-x-0" : "translate-x-[110%]",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-[18px]">
          <h3 className="font-heading text-[19px]">
            Your Cart{" "}
            {!isEmpty && <span className="text-primary-hover">({summary.itemCount})</span>}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={closeDrawer}
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-[17px] leading-[normal] text-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            ✕
          </button>
        </div>

        {isEmpty ? (
          <div className="flex-1 overflow-auto">
            <EmptyCart ctaLabel="Shop Bestsellers" href="/collections/all" onNavigate={closeDrawer} />
          </div>
        ) : (
          <>
            <RewardsBar listSubtotal={summary.listSubtotal} />
            <div className="flex-1 overflow-auto px-5 py-3.5">
              {lines.map((line) => (
                <CartLineItem key={line.variantId} line={line} />
              ))}
              <CartSuggestions suggestions={suggestions} />
            </div>
            <div className="border-t border-border bg-card px-5 py-4">
              <CouponBox />
              <CartTotals compact />
              <Link
                href="/cart"
                onClick={closeDrawer}
                className={cn(textLinkClass, "mt-2")}
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
