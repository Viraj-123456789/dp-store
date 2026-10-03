"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface ScrollRailProps {
  children: React.ReactNode;
  /** Classes for the scrolling element itself. */
  className?: string;
}

const arrowClass =
  "absolute top-1/2 z-[6] grid size-[30px] -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border bg-card p-0 text-base leading-none text-primary shadow-float transition duration-200 hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-0";

/** A horizontally scrolling container with chevron buttons that appear when there is overflow. */
export function ScrollRail({ children, className }: ScrollRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const scrollable = rail.scrollWidth > rail.clientWidth + 4;
    const max = rail.scrollWidth - rail.clientWidth - 2;
    setCanPrev(scrollable && rail.scrollLeft > 2);
    setCanNext(scrollable && rail.scrollLeft < max);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    // ResizeObserver fires once on observe, which seeds the initial state.
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    rail.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      rail.removeEventListener("scroll", update);
    };
  }, [update]);

  const scrollBy = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.8, 220),
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div ref={railRef} className={className}>
        {children}
      </div>
      <button
        type="button"
        aria-label="Scroll left"
        disabled={!canPrev}
        onClick={() => scrollBy(-1)}
        className={cn(arrowClass, "-left-1.5")}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        disabled={!canNext}
        onClick={() => scrollBy(1)}
        className={cn(arrowClass, "-right-1.5")}
      >
        ›
      </button>
    </div>
  );
}
