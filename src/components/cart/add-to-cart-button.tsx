"use client";

import type { CartLineInput } from "@/lib/cart/lines";

import { useCart } from "./cart-provider";

interface AddToCartButtonProps
  extends Omit<React.ComponentProps<"button">, "onClick" | "type"> {
  line: CartLineInput | null;
  quantity?: number;
}

/** Adds a product line to the cart and opens the cart drawer. */
export function AddToCartButton({
  line,
  quantity = 1,
  disabled,
  children = "Add to Cart",
  ...props
}: AddToCartButtonProps) {
  const { addLine } = useCart();

  return (
    <button
      type="button"
      disabled={disabled || !line}
      onClick={() => line && addLine(line, quantity)}
      {...props}
    >
      {children}
    </button>
  );
}
