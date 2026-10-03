import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "teal" | "white";
  className?: string;
}

const sources = {
  teal: "/brand/dpetals-logo-teal.svg",
  white: "/brand/dpetals-logo-white.svg",
} as const;

export function Logo({ variant = "teal", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="DPetals"
      className={cn("flex flex-none items-center", className)}
    >
      <Image
        src={sources[variant]}
        alt="DPetals"
        width={150}
        height={73}
        className={cn("w-auto", variant === "teal" ? "h-14" : "h-9")}
        preload={variant === "teal"}
      />
    </Link>
  );
}
