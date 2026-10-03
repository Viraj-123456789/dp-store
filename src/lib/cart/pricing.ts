import type { CartLine, CartSummary, RewardTier } from "@/types/cart";

export const CURRENCY = "INR";
export const FREE_SHIPPING_THRESHOLD = 500;

/** Rewards bar milestones, in ascending order of cart value. */
export const REWARD_TIERS: RewardTier[] = [
  { threshold: 500, discountPercent: 0, label: "FREE delivery" },
  { threshold: 1000, discountPercent: 10, label: "10% OFF" },
  { threshold: 1500, discountPercent: 15, label: "15% OFF" },
  { threshold: 2000, discountPercent: 20, label: "20% OFF" },
];

const MAX_THRESHOLD = REWARD_TIERS[REWARD_TIERS.length - 1].threshold;

export function summarizeCart(lines: CartLine[]): CartSummary {
  let itemCount = 0;
  let listSubtotal = 0;
  let mrpSubtotal = 0;

  for (const line of lines) {
    itemCount += line.quantity;
    listSubtotal += line.unitPrice * line.quantity;
    mrpSubtotal += (line.compareAtPrice ?? line.unitPrice) * line.quantity;
  }

  const unlocked = REWARD_TIERS.filter((tier) => listSubtotal >= tier.threshold);
  const tierDiscountPercent = unlocked.reduce(
    (best, tier) => Math.max(best, tier.discountPercent),
    0,
  );
  const tierDiscount = Math.round(listSubtotal * tierDiscountPercent) / 100;
  const subtotal = listSubtotal - tierDiscount;

  return {
    currency: CURRENCY,
    itemCount,
    listSubtotal,
    mrpSubtotal,
    tierDiscountPercent,
    tierDiscount,
    subtotal,
    savedVsMrp: mrpSubtotal - subtotal,
  };
}

export interface RewardProgress {
  /** 0–100, share of the bar that is filled. */
  percent: number;
  /** Highest tier index unlocked, or -1. */
  unlockedIndex: number;
  nextTier: RewardTier | null;
  amountToNext: number;
}

export function getRewardProgress(listSubtotal: number): RewardProgress {
  const unlockedIndex = REWARD_TIERS.reduce(
    (best, tier, index) => (listSubtotal >= tier.threshold ? index : best),
    -1,
  );
  const nextTier = REWARD_TIERS[unlockedIndex + 1] ?? null;

  return {
    percent: Math.min(100, Math.floor((listSubtotal / MAX_THRESHOLD) * 100)),
    unlockedIndex,
    nextTier,
    amountToNext: nextTier ? nextTier.threshold - listSubtotal : 0,
  };
}
