import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { cdn } from "@/lib/cdn";
import type { BannerTone, LinkItem, SizedImage } from "@/types/home";

interface PromoBannerProps {
  tone: BannerTone;
  kicker: string;
  titleMain: string;
  titleAccent: string;
  text: string;
  cta: LinkItem;
  image: SizedImage;
}

export function PromoBanner({
  tone,
  kicker,
  titleMain,
  titleAccent,
  text,
  cta,
  image,
}: PromoBannerProps) {
  return (
    <section className="py-[26px]">
      <Container>
        <div
          data-banner={tone}
          className="grid overflow-hidden rounded-xl bg-banner md:min-h-[440px] md:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="flex flex-col items-start justify-center px-[22px] pb-2 pt-7 md:py-11 md:pl-12 md:pr-5">
            <p className="mb-2 text-[clamp(15px,1.6vw,21px)] font-semibold text-banner-kicker">
              {kicker}
            </p>
            <h2 className="mb-3.5 font-heading text-[clamp(26px,3.6vw,48px)] font-bold leading-[1.06]">
              <span className="text-banner-heading">{titleMain}</span>
              <br />
              <span className="text-banner-accent">{titleAccent}</span>
            </h2>
            <p className="mb-[22px] max-w-[440px] text-[clamp(14px,1.3vw,17px)] leading-[1.55] text-banner-text">
              {text}
            </p>
            <Link
              href={cta.href}
              className="inline-block rounded-pill bg-primary px-7 py-[13px] text-[15px] font-semibold text-primary-foreground shadow-button transition duration-200 hover:-translate-y-px hover:bg-foreground"
            >
              {cta.label}
            </Link>
          </div>
          <div className="relative md:min-h-[240px]">
            <Image
              src={cdn(image.src)}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1080px) 566px, (min-width: 760px) 45vw, 100vw"
              className="block h-auto w-full object-contain md:absolute md:inset-0 md:size-full md:object-cover md:object-center"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
