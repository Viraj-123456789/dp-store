import Image from "next/image";

import { Container } from "@/components/ui/container";
import { cdn } from "@/lib/cdn";
import type { SizedImage } from "@/types/home";

export function ValueCards({ cards }: { cards: SizedImage[] }) {
  return (
    <section className="bg-card py-[34px]">
      <Container>
        <div className="flex gap-4 overflow-x-auto pb-1.5 [scroll-snap-type:x_mandatory] min-[701px]:flex-wrap min-[701px]:justify-center min-[701px]:overflow-visible min-[701px]:pb-0">
          {cards.map((card) => (
            <div
              key={card.alt}
              className="group relative aspect-square w-[44%] flex-none snap-start overflow-hidden rounded-md min-[701px]:w-[210px]"
            >
              <Image
                src={cdn(card.src)}
                alt={card.alt}
                width={card.width}
                height={card.height}
                sizes="(min-width: 701px) 210px, 44vw"
                className="size-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-scrim/20"
              />
              <span className="absolute inset-0 flex items-center justify-center p-2.5 text-center font-heading text-[clamp(18px,2.2vw,30px)] font-bold leading-[1.08] text-primary-foreground text-shadow-label">
                {card.alt}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
