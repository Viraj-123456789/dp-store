import Link from "next/link";

import { cn } from "@/lib/utils";

/** Pill filter link; the active chip is filled with the brand colour. */
export function Chip({
  active = false,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { active?: boolean }) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex-none whitespace-nowrap rounded-pill border-[1.5px] px-3.5 py-2 font-heading text-[12.5px] font-semibold leading-5 transition duration-150",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground",
        className,
      )}
      {...props}
    />
  );
}
