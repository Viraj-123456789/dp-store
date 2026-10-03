import type { Metadata } from "next";
import { Bricolage_Grotesque, Urbanist } from "next/font/google";

import { CartProvider } from "@/components/cart/cart-provider";
import { getVariantCatalog } from "@/lib/cart/catalog";
import "@/styles/globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  display: "swap",
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin", "latin-ext"],
  // Static weights, as on the reference site (the variable build differs by sub-pixels)
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DPetals — Natural Skincare, Haircare & Essential Oils",
  description:
    "Chemical-free skincare, haircare and pure essential oils, made for Indian skin and climate. Free shipping on orders above ₹500.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${urbanist.variable}`}>
      <body className="min-h-screen">
        <CartProvider catalog={getVariantCatalog()}>{children}</CartProvider>
      </body>
    </html>
  );
}
