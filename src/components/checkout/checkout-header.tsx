import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** Logo bar shared by the checkout and order confirmation screens. */
export function CheckoutHeader() {
  return (
    <header className="h-[90px] border-b border-ck-border">
      <div className="mx-auto flex h-full max-w-[1008px] items-center justify-between px-3.5">
        <Link href="/" aria-label="DPetals">
          <Image
            src="/brand/dpetals-logo-teal.svg"
            alt="DPetals"
            width={100}
            height={49}
            preload
            className="h-[49px] w-[100px]"
          />
        </Link>
        <Link href="/cart" aria-label="Cart" className="text-ck-accent">
          <ShoppingBag size={24} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}
