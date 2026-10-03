"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cdn } from "@/lib/cdn";
import { cn } from "@/lib/utils";
import type { LinkItem, SizedImage } from "@/types/home";

export interface HeroSlide {
  kicker: string;
  title: string;
  subtitle: string;
  cta: LinkItem;
  imageMain: SizedImage;
  imageAccent: SizedImage;
  chip: { label: string; value: string };
}

const AUTOPLAY_MS = 6000;

const arrowClass =
  "absolute top-1/2 z-5 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-scrim/28 text-sm text-primary-foreground transition-colors hover:bg-primary-foreground/35 lg:size-[38px] lg:text-base";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % count),
      AUTOPLAY_MS,
    );
    return () => clearInterval(timer);
  }, [paused, count, index]);

  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative overflow-hidden bg-brand-gradient text-primary-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[50px] -top-10 z-1 rotate-[-15deg] select-none text-[260px] opacity-5"
      >
        🌿
      </span>

      <div className="grid">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className={cn(
              "col-start-1 row-start-1",
              i === index ? "visible" : "invisible",
            )}
          >
            <Container className="relative z-2 grid items-center gap-[26px] pb-[46px] pt-[38px] md:pb-[60px] md:pt-[52px] xl:grid-cols-[1.05fr_0.95fr] xl:gap-12 xl:pb-[70px] xl:pt-16">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-pill border border-primary-foreground/25 bg-primary-foreground/12 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.06em]">
                  {slide.kicker}
                </span>
                {i === 0 ? (
                  <h1 className="font-heading text-[clamp(30px,4.6vw,58px)] font-[750] tracking-[-0.02em]">
                    {slide.title}
                  </h1>
                ) : (
                  <p
                    role="heading"
                    aria-level={2}
                    className="font-heading text-[clamp(30px,4.6vw,58px)] font-[750] leading-[1.15] tracking-[-0.02em]"
                  >
                    {slide.title}
                  </p>
                )}
                <p className="mb-[22px] mt-3.5 max-w-[520px] text-[15px] text-inverse-soft">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href={slide.cta.href}
                    tabIndex={i === index ? undefined : -1}
                    className={buttonVariants({ variant: "light" })}
                  >
                    {slide.cta.label}
                  </Link>
                </div>
              </div>

              <div className="relative h-[280px] md:h-[360px] md:max-w-[560px] xl:h-[460px]">
                <div className="absolute right-[4%] top-0 h-[86%] w-[62%] rotate-2 overflow-hidden rounded-3xl bg-secondary shadow-elevated">
                  <Image
                    src={cdn(slide.imageMain.src)}
                    alt={slide.imageMain.alt}
                    width={slide.imageMain.width}
                    height={slide.imageMain.height}
                    sizes="(min-width: 1080px) 350px, 60vw"
                    preload={i === 0}
                    className="size-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-[2%] h-[58%] w-[42%] -rotate-4 overflow-hidden rounded-3xl border-4 border-primary-foreground/85 bg-secondary shadow-elevated">
                  <Image
                    src={cdn(slide.imageAccent.src)}
                    alt={slide.imageAccent.alt}
                    width={slide.imageAccent.width}
                    height={slide.imageAccent.height}
                    sizes="(min-width: 1080px) 250px, 40vw"
                    className="size-full object-cover"
                  />
                </div>
                <div className="absolute bottom-5 right-0 rounded-lg bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-elevated">
                  {slide.chip.label}
                  <b className="block font-heading text-sm text-primary">
                    {slide.chip.value}
                  </b>
                </div>
              </div>
            </Container>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(index - 1)}
        className={cn(arrowClass, "left-3")}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(index + 1)}
        className={cn(arrowClass, "right-3")}
      >
        ›
      </button>

      <div className="absolute bottom-3.5 left-1/2 z-5 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "h-[9px] rounded-full p-0 transition-all duration-200",
              i === index
                ? "w-[26px] rounded-[5px] bg-primary-foreground"
                : "w-[9px] bg-primary-foreground/40",
            )}
          />
        ))}
      </div>
    </section>
  );
}
