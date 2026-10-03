"use client";

import Image from "next/image";
import Link from "next/link";

import { cn, formatMoney } from "@/lib/utils";
import type { CartLine } from "@/types/cart";

import { useCart } from "./cart-provider";

const qtyButtonClass =
  "size-7 rounded-full p-0 text-base leading-none text-primary hover:bg-secondary";

export function CartLineItem({ line, className }: { line: CartLine; className?: string }) {
  const { setQuantity, removeLine, closeDrawer } = useCart();
  const href = `/products/${line.handle}?variant=${line.variantId}`;
  const total = line.unitPrice * line.quantity;
  const mrp = (line.compareAtPrice ?? line.unitPrice) * line.quantity;

  return (
    <div className={cn("flex gap-3 border-b border-border py-[13px]", className)}>
      <Link href={href} onClick={closeDrawer} className="flex-none">
        <Image
          src={line.image}
          alt={line.imageAlt}
          width={68}
          height={68}
          className="size-[68px] rounded-md bg-card object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <b className="block font-heading text-[13.5px] leading-[1.3]">
          <Link href={href} onClick={closeDrawer}>
            {line.title}
          </Link>
        </b>
        {line.variantTitle && (
          <span className="text-xs text-muted-foreground">{line.variantTitle}</span>
        )}
        <div className="mt-1.5 inline-flex max-w-[110px] items-center rounded-pill border-[1.5px] border-border bg-card p-0.5">
          <button
            type="button"
            aria-label="Decrease"
            onClick={() => setQuantity(line.variantId, line.quantity - 1)}
            className={qtyButtonClass}
          >
            −
          </button>
          <span className="min-w-[26px] text-center font-heading text-sm font-semibold">
            {line.quantity}
          </span>
          <button
            type="button"
            aria-label="Increase"
            onClick={() => setQuantity(line.variantId, line.quantity + 1)}
            className={qtyButtonClass}
          >
            +
          </button>
        </div>
      </div>

      <div className="text-right">
        <span className="font-heading font-extrabold">
          {formatMoney(total)}
        </span>
        {mrp > total && (
          <span className="block text-[11.5px] text-subtle line-through">
            {formatMoney(mrp)}
          </span>
        )}
        <button
          type="button"
          onClick={() => removeLine(line.variantId)}
          className="mt-1.5 font-sans text-[11.5px] leading-[normal] text-destructive"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
