"use client";

import { CircleHelp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { cn, formatMoney } from "@/lib/utils";
import type { CartLine, CartSummary } from "@/types/cart";

function unitPriceLabel(line: CartLine) {
  if (!line.unitMeasure) return null;
  const perUnit = line.unitPrice / line.unitMeasure.amount;
  return `₹${perUnit.toFixed(2)}/${line.unitMeasure.unit}`;
}

interface SummaryItemProps {
  image: string;
  imageAlt: string;
  quantity: number;
  title: string;
  variantTitle: string | null;
  /** Per-unit price caption such as "₹2.08/ml". */
  unitPriceNote?: string | null;
  total: number;
}

/** One product row in an order summary: thumbnail with quantity badge, name and line total. */
export function SummaryItem({ image, imageAlt, quantity, title, variantTitle, unitPriceNote, total }: SummaryItemProps) {
  return (
    <li className="flex items-start gap-4">
      <div className="relative flex-none">
        <Image
          src={image}
          alt={imageAlt}
          width={64}
          height={64}
          className="size-16 rounded-lg border-2 border-card bg-card object-cover shadow-[0_0_0_1px_var(--ck-border)]"
        />
        <span className="absolute -right-2.5 -top-2.5 grid size-5 place-items-center rounded-full bg-ck-text text-[12px] font-semibold text-card">
          {quantity}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="pt-0.5 text-[14px]">{title}</p>
        {variantTitle && <p className="text-[12px] text-ck-muted-soft">{variantTitle}</p>}
        {unitPriceNote && <p className="text-[12px] text-ck-muted-soft">{unitPriceNote}</p>}
      </div>
      <span className="pt-0.5 text-[14px]">{formatMoney(total)}</span>
    </li>
  );
}

interface OrderSummaryProps {
  lines: CartLine[];
  summary: CartSummary;
  shippingText: string;
  className?: string;
  /** Hides the discount input (shown separately on small screens). */
  showDiscountField?: boolean;
}

/** Line items, discount code input and totals. */
export function OrderSummary({ lines, summary, shippingText, className, showDiscountField = true }: OrderSummaryProps) {
  const { couponCode, applyCoupon } = useCart();
  const [draft, setDraft] = useState("");

  return (
    <div className={className}>
      <ul className="grid gap-4">
        {lines.map((line) => (
          <SummaryItem
            key={line.variantId}
            image={line.image}
            imageAlt={line.imageAlt}
            quantity={line.quantity}
            title={line.title}
            variantTitle={line.variantTitle}
            unitPriceNote={unitPriceLabel(line)}
            total={line.unitPrice * line.quantity}
          />
        ))}
      </ul>

      {showDiscountField && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            applyCoupon(draft);
            setDraft("");
          }}
          className="mt-[22px] flex gap-2.5"
        >
          <div className="relative flex min-w-0 flex-1 items-center rounded-sm border border-ck-border bg-card has-[input:focus]:border-ck-accent has-[input:focus]:shadow-ck-focus has-[input:focus]:outline-3 has-[input:focus]:outline-ck-accent/30">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder=" "
              aria-label="Discount code or gift card"
              className="peer w-full bg-transparent px-2.5 py-3.5 font-system text-[14px] outline-none focus:pb-1.5 focus:pt-[21px] [&:not(:placeholder-shown)]:pb-1.5 [&:not(:placeholder-shown)]:pt-[21px]"
            />
            <span className="pointer-events-none absolute left-2.5 top-[15px] text-[14px] leading-[1.35] text-ck-muted transition-all peer-focus:top-1.5 peer-focus:text-[12px] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[12px]">
              Discount code or gift card
            </span>
          </div>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="h-[49px] flex-none rounded-sm bg-ck-button-surface px-3.5 font-system text-[14px] font-semibold leading-[normal] text-ck-text shadow-[inset_0_0_0_1px_var(--ck-border)] disabled:cursor-default disabled:text-ck-muted"
          >
            Apply
          </button>
        </form>
      )}
      {couponCode && (
        <p className="mt-2 text-[12px] text-ck-muted">
          {couponCode} will be applied at payment.
        </p>
      )}

      <dl className="mt-[34px] grid gap-[7px] text-[14px]">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatMoney(summary.listSubtotal)}</dd>
        </div>
        {summary.tierDiscount > 0 && (
          <div className="flex justify-between">
            <dt>Discount ({summary.tierDiscountPercent}% off)</dt>
            <dd>−{formatMoney(summary.tierDiscount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="flex items-center gap-1.5">
            Shipping
            <CircleHelp aria-hidden size={14} strokeWidth={1.6} className="text-ck-muted" />
          </dt>
          <dd className="text-ck-muted-soft">{shippingText}</dd>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <dt className="text-[18px] font-semibold">Total</dt>
          <dd className="flex items-baseline gap-2">
            <span className="text-[12px] text-ck-muted-soft">INR</span>
            <strong className="text-[18px] font-semibold">{formatMoney(summary.subtotal)}</strong>
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function SummaryToggleBar({
  total,
  open,
  onToggle,
  className,
}: {
  total: number;
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between border-y border-ck-border bg-ck-surface px-3.5 py-[18.5px] font-system text-[14px] leading-[normal] text-ck-accent",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        Order summary
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn("size-3 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M2 4.5l4 4 4-4" />
        </svg>
      </span>
      <strong className="text-[18px] font-semibold text-ck-text">{formatMoney(total)}</strong>
    </button>
  );
}
