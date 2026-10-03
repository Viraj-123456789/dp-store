import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { NOT_FOUND_METADATA } from "@/lib/seo";

export const metadata = NOT_FOUND_METADATA;

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-20 text-center">
      <div aria-hidden className="text-[56px] leading-[1.6]">
        🥀
      </div>
      <h1 className="font-heading text-[2em]">Page not found</h1>
      <p className="mb-6 mt-3 text-muted-foreground">
        The petal you&apos;re looking for has drifted away.
      </p>
      <Link href="/collections/all" className={buttonVariants()}>
        Continue shopping
      </Link>
    </div>
  );
}
