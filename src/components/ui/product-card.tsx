import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { QuickViewButton } from "@/components/quick-view/quick-view-button";
import { getDefaultCartLine } from "@/lib/cart/catalog";
import { cdn } from "@/lib/cdn";
import { cn, discountPercent, formatMoney } from "@/lib/utils";
import type { ProductSummary } from "@/types/home";

import { Badge } from "./badge";
import { Price } from "./price";

const formatRating = (average: number) =>
  Number.isInteger(average) ? average.toFixed(1) : String(average);

interface ProductCardProps {
  product: ProductSummary;
  /** Shows the "You save ₹x" strip used on combo cards. */
  showSavings?: boolean;
  /** Phone-sized typography and spacing, used in horizontal rails. Grids use full size. */
  compact?: boolean;
}

export function ProductCard({
  product,
  showSavings = false,
  compact = false,
}: ProductCardProps) {
  const { handle, title, image, subtitle, price, mrp, currency, isNew, rating } =
    product;
  const href = `/products/${handle}`;
  const pct = discountPercent(price, mrp);
  const cartLine = getDefaultCartLine(handle);

  return (
    <article className="group relative flex snap-start flex-col overflow-hidden rounded-xl border border-border bg-card transition duration-[250ms] hover:-translate-y-1 hover:border-transparent hover:shadow-elevated">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Link href={href} aria-label={title} className="absolute inset-0 block">
          <Image
            src={cdn(image.src)}
            alt={image.alt}
            fill
            sizes={
              compact
                ? "(min-width: 1024px) 280px, (min-width: 760px) 37vw, 40vw"
                : "(min-width: 1080px) 282px, (min-width: 760px) 33vw, 50vw"
            }
            className="object-cover transition duration-[400ms] group-hover:scale-105"
          />
        </Link>
        {isNew && (
          <div className="pointer-events-none absolute left-2.5 top-2.5 z-[2] flex gap-1.5">
            <Badge tone="new" size={compact ? "compact" : "default"}>
              NEW
            </Badge>
          </div>
        )}
        <QuickViewButton
          handle={handle}
          title={title}
          className={cn(
            "absolute inset-x-2.5 bottom-2.5 flex translate-y-2 items-center justify-center gap-[7px] rounded-pill bg-card/95 p-[9px] font-heading text-[12.5px] font-bold leading-[normal] text-foreground opacity-0 backdrop-blur-[6px] transition duration-[220ms] hover:bg-primary hover:text-primary-foreground focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100",
            compact && "max-md:hidden",
          )}
        />
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col",
          compact
            ? "gap-1 px-2.5 pb-[11px] pt-[9px] md:gap-1.5 md:px-3.5 md:pb-3.5 md:pt-3"
            : "gap-1.5 px-3.5 pb-3.5 pt-3",
        )}
      >
        {rating && (
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs text-muted-foreground",
              compact && "max-md:text-[10px]",
            )}
          >
            <span
              className={cn(
                "text-[12.5px] tracking-[1px] text-star",
                compact && "max-md:text-[10.5px]",
              )}
            >
              ★★★★★
            </span>
            <span>
              {formatRating(rating.average)} ({rating.count})
            </span>
          </div>
        )}
        <h3
          className={cn(
            "font-heading text-[14.5px] font-[650] leading-[1.3] transition-colors hover:text-primary",
            compact && "max-md:text-xs",
          )}
        >
          <Link href={href}>{title}</Link>
        </h3>
        <p
          className={cn(
            "text-xs leading-[1.45] text-muted-foreground",
            compact && "max-md:hidden",
          )}
        >
          {subtitle}
        </p>
        <Price
          size={compact ? "card-compact" : "card"}
          price={price}
          mrp={mrp}
          currency={currency}
          className="mt-auto"
        />
        {showSavings && pct > 0 && (
          <div className="flex flex-wrap justify-between gap-2 rounded-md bg-primary-soft px-[13px] py-[9px] text-[12.5px] font-bold text-primary">
            <span>{`✓ You save ${formatMoney(mrp - price, currency)}`}</span>
            <span className="font-semibold text-warning">{pct}% off MRP</span>
          </div>
        )}
        <AddToCartButton
          line={cartLine}
          className={cn(
            "min-h-[42px] w-full rounded-pill border-[1.5px] border-primary bg-secondary p-2.5 text-[13px] font-bold leading-[normal] text-primary transition duration-[180ms] hover:bg-primary hover:text-primary-foreground",
            compact && "max-md:min-h-8 max-md:p-[7px] max-md:text-[11px]",
          )}
        >
          Add to Cart
        </AddToCartButton>
      </div>
    </article>
  );
}
