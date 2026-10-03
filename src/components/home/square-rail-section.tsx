import Image from "next/image";
import Link from "next/link";

import { ScrollRail } from "@/components/ui/scroll-rail";
import { Section, SectionHeading } from "@/components/ui/section";
import { cdn } from "@/lib/cdn";
import { cn } from "@/lib/utils";
import type { CdnImage } from "@/types/home";

interface SquareRailItem {
  image: CdnImage;
  caption: string;
  href?: string;
}

interface SquareRailSectionProps {
  title: string;
  description?: string;
  items: SquareRailItem[];
  /** Card width in px at every breakpoint. */
  cardSize: 190 | 200;
}

const cardSizeClass = {
  190: "w-[190px]",
  200: "w-[200px]",
} as const;

export function SquareRailSection({
  title,
  description,
  items,
  cardSize,
}: SquareRailSectionProps) {
  return (
    <Section>
      <SectionHeading title={title} description={description} centered />
      <ScrollRail className="rail-scrollbar flex gap-4 overflow-x-auto px-0.5 pb-2.5 pt-1 [scroll-snap-type:x_mandatory]">
        {items.map((item) => {
          const content = (
            <>
              <span className="relative block aspect-square overflow-hidden rounded-sm bg-secondary">
                <Image
                  src={cdn(item.image.src)}
                  alt={item.image.alt}
                  fill
                  sizes={`${cardSize}px`}
                  className="object-cover transition-transform duration-[350ms] group-hover:scale-105"
                />
              </span>
              <span className="mt-2 block text-[13.5px] font-semibold leading-[1.3] text-foreground">
                {item.caption}
              </span>
            </>
          );
          const className = cn(
            "group block flex-none snap-start text-center",
            cardSizeClass[cardSize],
          );

          return item.href ? (
            <Link key={item.caption} href={item.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={item.caption} className={className}>
              {content}
            </div>
          );
        })}
      </ScrollRail>
    </Section>
  );
}
