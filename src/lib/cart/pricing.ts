import type { CartLine, CartSummary, CartView, RewardTier } from "@/types/cart";

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

/**
 * The cart summary computed locally. The backend computes the real one; this gives the
 * cart an instant, optimistic number while a change is on its way. A coupon discount is
 * carried over from the last server summary (it cannot be known here).
 */
export function summarizeCart(lines: CartLine[], couponDiscount = 0): CartSummary {
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
  const coupon = lines.length > 0 ? Math.min(couponDiscount, subtotal) : 0;

  return {
    currency: CURRENCY,
    itemCount,
    listSubtotal,
    mrpSubtotal,
    tierDiscountPercent,
    tierDiscount,
    subtotal,
    couponDiscount: coupon,
    savedVsMrp: mrpSubtotal - (subtotal - coupon),
  };
}

/** What the customer pays for the items: after the reward tier and any coupon. */
export const payableTotal = (summary: CartSummary) => summary.subtotal - summary.couponDiscount;

/** Shown before anything is in the cart, and while the server cart is loading. */
export const EMPTY_CART: CartView = {
  id: "",
  lines: [],
  summary: summarizeCart([]),
  couponCode: "",
  email: null,
};

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
