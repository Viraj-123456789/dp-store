import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-[5px] rounded-pill font-heading text-[11px] font-bold tracking-[0.04em]",
  {
    variants: {
      tone: {
        new: "bg-warning-soft text-warning",
        discount: "bg-primary text-primary-foreground",
        tag: "border border-border bg-secondary text-primary",
        save: "bg-primary-soft text-primary",
      },
      size: {
        default: "px-2.5 py-1",
        compact: "px-[7px] py-[3px] text-[9px] md:px-2.5 md:py-1 md:text-[11px]",
      },
    },
    defaultVariants: { tone: "new", size: "default" },
  },
);

export function Badge({
  className,
  tone,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props} />
  );
}
