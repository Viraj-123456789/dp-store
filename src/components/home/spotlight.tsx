import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Section } from "@/components/ui/section";
import { getDefaultCartLine } from "@/lib/cart/catalog";
import { cdn } from "@/lib/cdn";
import { formatMoney } from "@/lib/utils";
import type { SizedImage } from "@/types/home";
import Link from "next/link";

interface SpotlightProps {
  badge: string;
  title: string;
  image: SizedImage;
  points: string[];
  price: number;
  mrp: number;
  currency: string;
  handle: string;
}

export function Spotlight({
  badge,
  title,
  image,
  points,
  price,
  mrp,
  currency,
  handle,
}: SpotlightProps) {
  return (
    <Section>
      <div className="grid overflow-hidden rounded-4xl border border-border bg-card shadow-card md:grid-cols-2">
        <div className="min-h-[280px] bg-secondary">
          <Image
            src={cdn(image.src)}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 1240px) 595px, (min-width: 760px) 50vw, 100vw"
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-[13px] px-[22px] py-7 md:p-10">
          <Badge tone="new" className="self-start">
            {badge}
          </Badge>
          <h2 className="font-heading text-[clamp(22px,2.8vw,34px)]">{title}</h2>
          <ul className="grid list-none gap-2">
            {points.map((point) => (
              <li
                key={point}
                className="flex gap-2.5 text-sm before:font-extrabold before:text-accent before:content-['✓']"
              >
                {point}
              </li>
            ))}
          </ul>
          <Price size="large" price={price} mrp={mrp} currency={currency} />
          <div className="text-[11.5px] text-muted-foreground">
            MRP inclusive of all taxes
          </div>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <AddToCartButton
              line={getDefaultCartLine(handle)}
              className={buttonVariants()}
            >
              {`Add to Cart · ${formatMoney(price, currency)}`}
            </AddToCartButton>
            <Link
              href={`/products/${handle}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
