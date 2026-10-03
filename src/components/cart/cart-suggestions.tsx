"use client";

import Image from "next/image";

import type { CartLineInput } from "@/lib/cart/lines";
import { formatMoney } from "@/lib/utils";

import { useCart } from "./cart-provider";

const VISIBLE = 3;

export function CartSuggestions({ suggestions }: { suggestions: CartLineInput[] }) {
  const { lines, addLine } = useCart();
  const inCart = new Set(lines.map((line) => line.variantId));
  const visible = suggestions.filter((item) => !inCart.has(item.variantId)).slice(0, VISIBLE);

  if (visible.length === 0) return null;

  return (
    <div className="mt-[18px] border-t border-border pt-3.5">
      <div className="mb-2.5 font-heading text-sm font-bold">Pairs well with your ritual</div>
      <div className="flex flex-col gap-2.5">
        {visible.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center gap-2.5 rounded-md border border-border bg-card px-2.5 py-2"
          >
            <Image
              src={item.image}
              alt={item.title}
              width={48}
              height={48}
              className="size-12 flex-none rounded-sm object-cover"
            />
            <div className="min-w-0 flex-1">
              <b className="line-clamp-2 font-heading text-[12.5px] leading-tight">{item.title}</b>
              <span className="text-xs font-bold text-primary">
                {formatMoney(item.unitPrice)}
                {item.compareAtPrice && (
                  <s className="ml-1 font-normal text-muted-foreground">
                    {formatMoney(item.compareAtPrice)}
                  </s>
                )}
              </span>
            </div>
            <button
              type="button"
              aria-label={`Add ${item.title}`}
              onClick={() => addLine(item, 1, { openDrawer: false })}
              className="size-[34px] flex-none rounded-full border-[1.5px] border-primary bg-card p-0 text-lg font-bold leading-none text-primary transition duration-150 hover:bg-primary hover:text-primary-foreground"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
