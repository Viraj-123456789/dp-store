import { cva, type VariantProps } from "class-variance-authority";

import { cn, discountPercent, formatMoney } from "@/lib/utils";

const priceVariants = cva("flex flex-wrap items-baseline", {
  variants: {
    size: {
      card: "gap-2 [&_.now]:text-[17px] [&_.mrp]:text-[12.5px] [&_.pct]:text-[12.5px]",
      /** Smaller on phones; used inside horizontal rails. */
      "card-compact":
        "gap-[5px] md:gap-2 [&_.now]:text-sm md:[&_.now]:text-[17px] [&_.mrp]:text-[10px] md:[&_.mrp]:text-[12.5px] [&_.pct]:text-[10px] md:[&_.pct]:text-[12.5px]",
      large:
        "gap-2 [&_.now]:text-[30px] [&_.mrp]:text-base [&_.pct]:text-[15px]",
    },
  },
  defaultVariants: { size: "card" },
});

interface PriceProps extends VariantProps<typeof priceVariants> {
  price: number;
  mrp: number;
  currency?: string;
  className?: string;
}

export function Price({
  price,
  mrp,
  currency = "INR",
  size,
  className,
}: PriceProps) {
  const pct = discountPercent(price, mrp);

  return (
    <div className={cn(priceVariants({ size }), className)}>
      <span className="now font-heading font-extrabold text-foreground">
        {formatMoney(price, currency)}
      </span>
      {pct > 0 && (
        <>
          <span className="mrp font-medium text-subtle line-through">
            {`MRP ${formatMoney(mrp, currency)}`}
          </span>
          <span className="pct font-bold text-accent">{pct}% off</span>
        </>
      )}
    </div>
  );
}
