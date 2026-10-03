"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

import { useProduct } from "./product-context";

export function ProductGallery() {
  const { product, mediaIndex, selectMedia } = useProduct();
  const active = product.media[mediaIndex];

  return (
    <div className="min-w-0 max-w-full">
      <div className="relative aspect-square overflow-hidden rounded-gallery border border-border bg-card">
        {active.type === "video" ? (
          <video
            key={active.video}
            controls
            playsInline
            poster={active.src}
            className="block h-auto w-full rounded-[inherit] bg-scrim"
          >
            <source src={active.video} type="video/mp4" />
          </video>
        ) : (
          <Image
            key={active.src}
            src={active.src}
            alt={product.title}
            fill
            loading="eager"
            fetchPriority={mediaIndex === 0 ? "high" : undefined}
            sizes="(min-width: 1080px) 600px, (min-width: 760px) 720px, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
        {product.media.map((media, index) => (
          <button
            key={`${media.src}-${index}`}
            type="button"
            aria-label={`Media ${index + 1}`}
            aria-current={index === mediaIndex}
            onClick={() => selectMedia(index)}
            className={cn(
              "relative size-[68px] flex-none overflow-hidden rounded-md border-2 bg-card p-0 xl:size-[84px]",
              index === mediaIndex ? "border-primary" : "border-border",
            )}
          >
            <Image
              src={media.src}
              alt=""
              fill
              sizes="84px"
              className="object-cover"
            />
            {media.type === "video" && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 m-auto grid size-9 place-items-center rounded-full bg-scrim/55 text-xs text-primary-foreground"
              >
                ▶
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
