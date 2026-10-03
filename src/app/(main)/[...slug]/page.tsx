import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/lib/seo";

export const metadata = NOT_FOUND_METADATA;

/**
 * Catches every URL no other route handles so the 404 renders inside the storefront
 * header/footer (not-found.tsx in this route group) instead of the bare root fallback.
 */
export default function UnmatchedRoute() {
  notFound();
}
