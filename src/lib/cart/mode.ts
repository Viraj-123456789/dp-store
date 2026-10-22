import type { CartMode } from "@/types/cart";

/** Anything other than "buy" means the shopping cart. Safe for server and browser code. */
export function parseCartMode(value: unknown): CartMode {
  return value === "buy" ? "buy" : "cart";
}
