import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a major-unit amount, e.g. 1499 -> "₹1,499.00". */
export function formatMoney(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Like formatMoney but drops the decimals for whole amounts, e.g. 250 -> "₹250". */
export function formatMoneyCompact(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Whole-number discount percentage, rounded down (matches storefront copy). */
export function discountPercent(price: number, mrp: number) {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.floor((1 - price / mrp) * 100);
}
