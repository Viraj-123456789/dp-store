import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill border-2 text-sm font-bold transition duration-[180ms] disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover",
        outline:
          "border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        "outline-inverse":
          "border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary",
        light:
          "border-transparent bg-primary-foreground text-primary hover:bg-secondary",
      },
      size: {
        default: "min-h-[46px] px-6 py-[13px]",
        sm: "min-h-10 px-4 py-2.5 text-[13px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & ButtonVariantProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), "leading-[normal]", className)}
      {...props}
    />
  );
}
