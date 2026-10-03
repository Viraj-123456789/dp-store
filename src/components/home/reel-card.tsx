"use client";

import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { cdn } from "@/lib/cdn";
import { cn, formatMoney } from "@/lib/utils";

interface ReelCardProps {
  video: string;
  poster: string;
  productHandle: string;
  productTitle: string;
  price: number;
  mrp: number;
  currency: string;
}

export function ReelCard({
  video,
  poster,
  productHandle,
  productTitle,
  price,
  mrp,
  currency,
}: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const href = `/products/${productHandle}`;

  const toggle = () => {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      // Only one reel plays at a time.
      document
        .querySelectorAll<HTMLVideoElement>("video[data-reel]")
        .forEach((other) => other !== element && other.pause());
      void element.play();
    } else {
      element.pause();
    }
  };

  return (
    <div className="snap-start">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-foreground shadow-elevated">
        <video
          ref={videoRef}
          data-reel
          src={`${video}#t=0.1`}
          poster={cdn(poster)}
          muted
          loop
          playsInline
          preload="metadata"
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="block size-full cursor-pointer object-cover"
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3 top-3 grid size-[34px] place-items-center rounded-full bg-scrim/45 text-xs text-primary-foreground transition-opacity duration-[250ms]",
            playing && "opacity-0",
          )}
        >
          ▶
        </span>
        <Link
          href={href}
          className="absolute left-3 top-3 z-2 inline-flex items-center gap-1.5 rounded-pill bg-card/92 px-3 py-2 font-heading text-[11.5px] font-bold leading-[normal] text-foreground backdrop-blur-[6px] transition-colors hover:bg-card"
        >
          <Eye size={14} strokeWidth={2} aria-hidden />
          Quick view
        </Link>
        <Link
          href={href}
          className="absolute inset-x-2.5 bottom-2.5 z-2 flex items-center gap-[9px] rounded-lg bg-card/94 p-[8px_9px] text-foreground backdrop-blur-[8px] transition-transform duration-[180ms] hover:-translate-y-0.5 [&:hover_.cta]:bg-primary-hover"
        >
          <Image
            src={cdn(poster)}
            alt=""
            width={42}
            height={42}
            className="size-[42px] flex-none rounded-sm bg-card object-cover"
          />
          <span className="flex min-w-0 flex-1 flex-col gap-px">
            <b className="line-clamp-2 text-[12.5px] font-bold leading-[1.25]">
              {productTitle}
            </b>
            <span className="text-xs font-bold text-primary">
              {formatMoney(price, currency)}{" "}
              <s className="ml-[3px] font-medium text-subtle">
                {formatMoney(mrp, currency)}
              </s>
            </span>
          </span>
          <span className="cta flex-none whitespace-nowrap rounded-pill bg-primary px-3.5 py-[9px] text-xs font-bold text-primary-foreground">
            Shop now
          </span>
        </Link>
      </div>
    </div>
  );
}
