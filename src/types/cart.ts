export interface CartLine {
  variantId: string;
  handle: string;
  title: string;
  /** e.g. "500gms"; null for single-variant products. */
  variantTitle: string | null;
  image: string;
  imageAlt: string;
  unitPrice: number;
  compareAtPrice: number | null;
  /** Pack size used to show a per-unit price, e.g. 120 ml. */
  unitMeasure?: { amount: number; unit: string } | null;
  quantity: number;
}

export interface RewardTier {
  /** Cart subtotal (before the tier discount) needed to unlock the tier. */
  threshold: number;
  /** Discount percentage unlocked; 0 for the free-delivery milestone. */
  discountPercent: number;
  label: string;
}

export interface CartSummary {
  currency: string;
  itemCount: number;
  /** Sum of selling prices, before any tier discount. */
  listSubtotal: number;
  /** Sum of MRPs. */
  mrpSubtotal: number;
  tierDiscountPercent: number;
  tierDiscount: number;
  /** Amount payable for items (list subtotal minus tier discount). */
  subtotal: number;
  /** Total saved versus MRP. */
  savedVsMrp: number;
}
