"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { useCart } from "@/components/cart/cart-provider";
import { buildCartLine } from "@/lib/cart/lines";
import { cn, formatMoney } from "@/lib/utils";

import { useProduct } from "./product-context";

const badgeTone = { new: "new", off: "discount", tag: "tag", save: "save" } as const;

export function ProductInfo() {
  const {
    product,
    variant,
    selectedOptions,
    quantity,
    selectOption,
    changeQuantity,
  } = useProduct();
  const { rating, netQty } = product;
  const { addLine } = useCart();
  const router = useRouter();
  const cartLine = buildCartLine(product, variant);

  return (
    <div className="min-w-0 max-w-full">
      <div className="mb-2.5 flex flex-wrap gap-2">
        {product.badges.map((badge) => (
          <Badge key={`${badge.tone}-${badge.label}`} tone={badgeTone[badge.tone]}>
            {badge.label}
          </Badge>
        ))}
      </div>

      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-[720] max-md:break-words">
        {product.title}
      </h1>
      {product.subtitle && (
        <p className="mt-[7px] text-[15px] text-muted-foreground">
          {product.subtitle}
        </p>
      )}

      <div className="mb-1 mt-3 flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
        {rating && (
          <>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="text-[12.5px] tracking-[1px] text-star">★★★★★</span>
              {` ${rating.average} · ${rating.count} ${rating.count === 1 ? "review" : "reviews"}`}
            </span>
            <span aria-hidden>·</span>
          </>
        )}
        {netQty && (
          <span>
            Net Qty: <b>{netQty}</b>
          </span>
        )}
      </div>

      <Price
        size="large"
        price={variant.price}
        mrp={variant.compareAtPrice ?? variant.price}
        currency={product.currency}
        className="mb-1 mt-3.5 min-w-0"
      />
      {product.taxNote && (
        <div className="text-[11.5px] text-muted-foreground">{product.taxNote}</div>
      )}

      {product.offer && (
        <div className="my-3.5 flex flex-wrap items-center gap-2.5 rounded-md border border-dashed border-star bg-warning-surface px-3.5 py-[11px] text-[12.5px] font-semibold text-warning">
          {product.offer}
        </div>
      )}

      <form onSubmit={(event) => event.preventDefault()} className="max-w-full">
        <div className="my-2.5">
          {product.options.map((option, optionIndex) => (
            <div key={option.name} className="mb-3">
              <span className="mb-2 block font-heading text-[13px] font-bold">
                {option.name}
              </span>
              <div
                role="radiogroup"
                aria-label={option.name}
                className="flex flex-wrap gap-2.5"
              >
                {option.values.map((value) => {
                  const selected = selectedOptions[optionIndex] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => selectOption(optionIndex, value)}
                      className={cn(
                        "rounded-pill border-[1.5px] px-[26px] py-[11px] font-heading text-sm font-bold leading-[normal] transition duration-150",
                        selected
                          ? "border-primary bg-primary text-primary-foreground shadow-pill"
                          : "border-border bg-card text-copy hover:border-primary-hover hover:text-primary",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-3 mt-2 flex flex-wrap gap-2.5">
          <div className="flex flex-none items-center rounded-pill border-[1.5px] border-border bg-card">
            <button
              type="button"
              aria-label="Decrease"
              onClick={() => changeQuantity(-1)}
              className="h-[46px] w-[42px] text-xl leading-[normal] text-primary"
            >
              −
            </button>
            <span className="min-w-[30px] text-center font-heading font-bold">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase"
              onClick={() => changeQuantity(1)}
              className="h-[46px] w-[42px] text-xl leading-[normal] text-primary"
            >
              +
            </button>
          </div>
          <Button
            className="min-w-0 flex-1"
            disabled={!variant.available}
            onClick={() => addLine(cartLine, quantity)}
          >
            Add to Cart ·
            <span>{formatMoney(variant.price, product.currency)}</span>
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full"
          disabled={!variant.available}
          onClick={() => router.push(`/checkout?buy=${variant.id}&qty=${quantity}`)}
        >
          Buy it now
        </Button>
      </form>

      <div className="mb-1.5 mt-[18px] grid max-w-full grid-cols-2 gap-2 md:grid-cols-6">
        {product.trust.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-card px-1.5 py-3 text-center font-heading text-[10.5px] font-bold leading-[1.3] text-foreground"
          >
            <Image
              src={item.icon}
              alt={item.label}
              width={38}
              height={38}
              unoptimized
              className="mx-auto mb-1.5 size-[38px] object-contain"
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {product.crossSell && (
        <Link
          href={`/products/${product.crossSell.handle}`}
          className="mt-2.5 flex flex-wrap justify-between gap-2 rounded-md bg-primary-soft px-[13px] py-[9px] text-[12.5px] font-bold text-primary"
        >
          <span>
            💡 Save more — get it in the <b>{product.crossSell.title}</b>
          </span>
          <span>View →</span>
        </Link>
      )}

      {product.accordions.map((accordion, index) => (
        <Accordion
          key={accordion.title}
          title={accordion.title}
          defaultOpen={accordion.open}
          className={index === 0 ? "mt-4" : undefined}
        >
          {accordion.kind === "html" ? (
            <div
              className="rich-text"
              dangerouslySetInnerHTML={{ __html: accordion.html }}
            />
          ) : (
            <div className="grid gap-2 text-[13.5px]">
              {accordion.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between gap-2.5 border-b border-dashed border-border pb-2"
                >
                  <span>{row.label}</span>
                  <b className="text-right font-heading font-normal">
                    {row.href ? (
                      <a href={row.href} className="text-primary">
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </b>
                </div>
              ))}
            </div>
          )}
        </Accordion>
      ))}
    </div>
  );
}
