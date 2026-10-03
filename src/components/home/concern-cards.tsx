import Image from "next/image";
import Link from "next/link";

import { ScrollRail } from "@/components/ui/scroll-rail";
import { Section, SectionHeading } from "@/components/ui/section";
import { cdn } from "@/lib/cdn";
import type { CdnImage } from "@/types/home";

interface Concern {
  title: string;
  description: string;
  href: string;
  image: CdnImage;
}

export function ConcernCards({ concerns }: { concerns: Concern[] }) {
  return (
    <Section id="concern">
      <SectionHeading
        title="Shop by Concern"
        description="Find products by what your skin or hair needs."
      />
      <ScrollRail className="scrollbar-none flex gap-[18px] overflow-x-auto pb-1.5 [scroll-snap-type:x_mandatory] sm:grid sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))] sm:overflow-visible sm:pb-0">
        {concerns.map((concern) => (
          <Link
            key={concern.title}
            href={concern.href}
            className="group block w-[46%] flex-none snap-start text-center sm:w-auto"
          >
            <span className="relative block aspect-square overflow-hidden rounded-md">
              <Image
                src={cdn(concern.image.src)}
                alt={concern.image.alt}
                fill
                sizes="(min-width: 1024px) 224px, (min-width: 640px) 25vw, 46vw"
                className="object-cover transition-transform duration-[350ms] group-hover:scale-[1.045]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-b from-transparent via-scrim/25 via-55% to-scrim/45"
              />
              <span className="absolute inset-x-3 bottom-2.5 text-left font-heading text-[clamp(15px,1.6vw,21px)] font-bold uppercase leading-[1.05] tracking-[0.02em] text-primary-foreground text-shadow-caption">
                {concern.title}
              </span>
            </span>
            <h3 className="mb-0.5 mt-2.5 font-sans text-[15.5px] font-semibold text-foreground">
              {concern.title}
            </h3>
            <p className="text-[12.5px] leading-[1.4] text-muted-foreground">
              {concern.description}
            </p>
          </Link>
        ))}
      </ScrollRail>
    </Section>
  );
}
