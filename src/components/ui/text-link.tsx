import Link from "next/link";

import { cn } from "@/lib/utils";

export const textLinkClass =
  "inline-flex items-center justify-center gap-2 rounded-pill px-1.5 py-2 text-sm font-bold text-primary transition duration-[180ms] after:transition after:duration-[180ms] after:content-['→'] hover:text-primary-hover hover:after:translate-x-[3px]";

/** Inline "View all →" style link with a nudging arrow. */
export function TextLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(textLinkClass, className)}
      {...props}
    />
  );
}
