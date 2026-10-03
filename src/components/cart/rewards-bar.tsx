"use client";

import { useLayoutEffect, useRef } from "react";

import { getRewardProgress, REWARD_TIERS } from "@/lib/cart/pricing";
import { cn, formatMoneyCompact } from "@/lib/utils";

const PERCENT_KEY = "dpMsPct";
const TIER_KEY = "dpMsTier";
/** Delay before the fill starts moving, so it can first be placed at its previous position. */
const FILL_DELAY_MS = 40;

function readSession(key: string) {
  try {
    return Number.parseInt(window.sessionStorage.getItem(key) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function writeSession(key: string, value: number) {
  try {
    window.sessionStorage.setItem(key, String(value));
  } catch {
    // Session storage can be unavailable (private mode); the bar then simply always animates.
  }
}

function Message({ listSubtotal }: { listSubtotal: number }) {
  const { unlockedIndex, nextTier, amountToNext } = getRewardProgress(listSubtotal);
  const emphasis = "font-bold text-primary";

  if (unlockedIndex < 0) {
    return (
      <>
        Add <b className="text-primary">{formatMoneyCompact(amountToNext)}</b> more to unlock{" "}
        <b className="text-primary">FREE delivery</b> 🚚
      </>
    );
  }

  // Keyed on the subtotal so the unlocked line fades in again after every cart change.
  if (!nextTier) {
    return (
      <span key={listSubtotal} className={cn("meter-unlocked", emphasis)}>
        🏆 You&apos;ve unlocked {REWARD_TIERS[unlockedIndex].label} + FREE delivery!
      </span>
    );
  }

  return (
    <>
      <span key={listSubtotal} className={cn("meter-unlocked", emphasis)}>
        🎉 {REWARD_TIERS[unlockedIndex].label} unlocked!
      </span>{" "}
      Add <b className="text-primary">{formatMoneyCompact(amountToNext)}</b> for{" "}
      <b className="text-primary">{nextTier.label}</b>
    </>
  );
}

/** Progress meter towards free delivery and tiered discounts. */
export function RewardsBar({ listSubtotal }: { listSubtotal: number }) {
  const { percent, unlockedIndex } = getRewardProgress(listSubtotal);
  const tier = unlockedIndex + 1;
  const boxRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // Slide the fill from where it was last shown this session, and only celebrate a milestone
  // that is higher than any reached before. Done on the DOM nodes so React never resets the width.
  useLayoutEffect(() => {
    const box = boxRef.current;
    const fill = fillRef.current;
    if (!box || !fill) return;

    const previousPercent = readSession(PERCENT_KEY);
    const previousTier = readSession(TIER_KEY);

    fill.style.width = `${previousPercent}%`;
    void fill.offsetWidth;
    box.toggleAttribute("data-still", tier <= previousTier);

    const timer = setTimeout(() => {
      fill.style.width = `${percent}%`;
    }, FILL_DELAY_MS);
    writeSession(PERCENT_KEY, percent);
    writeSession(TIER_KEY, tier);

    return () => clearTimeout(timer);
  }, [percent, tier]);

  return (
    <div
      ref={boxRef}
      className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-faint to-card px-[18px] pb-2.5 pt-3.5"
    >
      <div className="mb-3 text-center text-[13px] text-meter-copy">
        <Message listSubtotal={listSubtotal} />
      </div>
      <div className="relative mx-4 mb-9 h-2 rounded-full bg-meter">
        <div
          ref={fillRef}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-hover to-primary transition-[width] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        />
        {REWARD_TIERS.map((candidate, index) => {
          const reached = index <= unlockedIndex;
          return (
            <span
              key={candidate.threshold}
              data-label={`₹${candidate.threshold}`}
              style={{ left: `${(index + 1) * 25}%` }}
              className={cn(
                "absolute top-1/2 z-[1] grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 font-heading text-[9.5px] font-extrabold after:absolute after:left-1/2 after:top-[29px] after:-translate-x-1/2 after:whitespace-nowrap after:text-[9.5px] after:font-semibold after:text-muted-foreground after:content-[attr(data-label)]",
                index === 0 && "text-xs",
                reached
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-meter-edge bg-card text-meter-dot",
                index === unlockedIndex && "meter-dot-just",
              )}
            >
              {index === 0 ? "🚚" : `${candidate.discountPercent}%`}
            </span>
          );
        })}
      </div>
    </div>
  );
}
