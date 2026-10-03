import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

interface EmptyCartProps {
  ctaLabel: string;
  href: string;
  onNavigate?: () => void;
}

export function EmptyCart({ ctaLabel, href, onNavigate }: EmptyCartProps) {
  return (
    <div className="px-5 py-[60px] text-center text-muted-foreground">
      <div className="text-[44px]">🛍️</div>
      <p className="my-3">Your cart is empty</p>
      <Link href={href} onClick={onNavigate} className={buttonVariants()}>
        {ctaLabel}
      </Link>
    </div>
  );
}
