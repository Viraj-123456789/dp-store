"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { FREE_SHIPPING_THRESHOLD, REWARD_TIERS } from "@/lib/cart/pricing";
import { cn, formatMoney, formatMoneyCompact } from "@/lib/utils";

import { useCart } from "./cart-provider";

interface CartTotalsProps {
  /** Drawer layout: itemises the reward discount and puts the total on the checkout button. */
  compact?: boolean;
}

const savedRowClass = "mb-[7px] flex justify-between text-[13px] font-bold text-primary";

export function CartTotals({ compact = false }: CartTotalsProps) {
  const { summary, closeDrawer } = useCart();
  const rewardTier = REWARD_TIERS.find((tier) => tier.discountPercent === summary.tierDiscountPercent);

  return (
    <>
      <div className={savedRowClass}>
        <span>🎉 Total saved vs MRP</span>
        <span>{formatMoney(summary.savedVsMrp, summary.currency)}</span>
      </div>
      {compact && rewardTier && summary.tierDiscount > 0 && (
        <div className={savedRowClass}>
          <span>{`🏷️ ${rewardTier.label} on orders above ₹${rewardTier.threshold}`}</span>
          <span>{`−${formatMoney(summary.tierDiscount, summary.currency)}`}</span>
        </div>
      )}
      <div className="mb-3 flex justify-between font-heading text-[18px] font-extrabold">
        <span>Subtotal</span>
        <span>{formatMoney(summary.subtotal, summary.currency)}</span>
      </div>
      <div className="mb-3 text-[12.5px] text-muted-foreground">
        {`Free shipping on orders above ${formatMoneyCompact(FREE_SHIPPING_THRESHOLD)}. COD available`}
      </div>
      <Link
        href="/checkout"
        onClick={closeDrawer}
        className={cn(buttonVariants(), "w-full font-heading leading-[normal]")}
      >
        {compact ? `Checkout · ${formatMoney(summary.subtotal, summary.currency)}` : "Checkout"}
      </Link>
    </>
  );
}
