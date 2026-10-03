import Link from "next/link";

import { cn } from "@/lib/utils";

const footerLinks = [
  { label: "Refund policy", href: "/policies/refund-policy" },
  { label: "Shipping", href: "/policies/shipping-policy" },
  { label: "Privacy policy", href: "/policies/privacy-policy" },
  { label: "Terms of service", href: "/policies/terms-of-service" },
  { label: "Contact", href: "/pages/contact" },
];

export function CheckoutFooterLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-3.5 gap-y-2", className)}>
      {footerLinks.map((link) => (
        <li key={link.label}>
          <Link href={link.href} className="text-ck-accent underline">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
