import type { Order } from "@/types/account";

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
  /** Items after the reward-tier discount, before any coupon. */
  subtotal: number;
  /** Discount from a manual coupon code, after the tier discount (0 when none). */
  couponDiscount: number;
  /** Total saved versus MRP, coupon included. */
  savedVsMrp: number;
}

/** What the cart renders: the backend is the source of truth. */
export interface CartView {
  id: string;
  lines: CartLine[];
  summary: CartSummary;
  /** The manual coupon applied, or "" when none. */
  couponCode: string;
  email: string | null;
}

/** Result of a cart change; "partial", "max" and "unavailable" explain a trimmed or refused add. */
export type LineOutcome = "added" | "partial" | "max" | "updated" | "removed" | "unavailable";

export interface CartMutation {
  cart: CartView;
  outcome: LineOutcome;
  /** Units actually added (add only). */
  added?: number;
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
}

export type PaymentChoice = "razorpay" | "phonepe";

export interface CheckoutInput {
  email: string;
  shipping: CheckoutAddress;
  /** null means the same as shipping. */
  billing: CheckoutAddress | null;
  payment: PaymentChoice;
  /** Absolute URL the payment gateway returns the customer to. */
  returnUrl: string;
}

export type PlaceOrderResult =
  | { status: "redirect"; url: string; notice?: string }
  | { status: "placed"; order: Order; orderToken: string; notice?: string }
  | { status: "unavailable"; message: string };

export type CompleteCartResult =
  | { status: "placed"; order: Order; orderToken: string }
  | { status: "pending"; message: string }
  | { status: "failed"; message: string };

/** Which cart a request acts on: the shopping cart, or the throwaway cart behind "Buy it now". */
export type CartMode = "cart" | "buy";
