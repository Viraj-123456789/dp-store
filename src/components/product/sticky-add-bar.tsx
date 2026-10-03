"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { buildCartLine } from "@/lib/cart/lines";
import { cn, formatMoneyCompact } from "@/lib/utils";

import { useProduct } from "./product-context";

const SHOW_AFTER_SCROLL = 560;

/** Fixed add-to-cart bar that appears once the main buy box has scrolled away. */
export function StickyAddBar() {
  const { product, variant, quantity } = useProduct();
  const { addLine } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_SCROLL);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const thumbnail = product.media[0];
  const hasDiscount =
    variant.compareAtPrice !== null && variant.compareAtPrice > variant.price;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-55 max-w-screen items-center gap-3 overflow-hidden border-t border-border bg-card px-3.5 py-2.5 shadow-sticky",
        visible ? "flex" : "hidden",
      )}
    >
      <Image
        src={thumbnail.src}
        alt=""
        width={44}
        height={44}
        className="size-11 flex-none rounded-sm object-cover"
      />
      <div className="min-w-0 flex-1 overflow-hidden text-ellipsis font-heading text-[13px] font-bold leading-tight">
        {product.title}
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="font-extrabold text-base text-foreground">
            {formatMoneyCompact(variant.price, product.currency)}
          </span>
          {hasDiscount && (
            <span className="text-xs font-medium text-subtle line-through">
              {formatMoneyCompact(variant.compareAtPrice ?? 0, product.currency)}
            </span>
          )}
        </div>
      </div>
      <Button
        tabIndex={visible ? 0 : -1}
        className="min-w-0 whitespace-nowrap px-[22px] py-3 text-[13px]"
        disabled={!variant.available}
        onClick={() => addLine(buildCartLine(product, variant), quantity)}
      >
        Add to Cart
      </Button>
    </div>
  );
}
