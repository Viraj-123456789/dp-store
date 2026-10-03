import type { LinkItem } from "@/types/home";

export const shopByCategory: LinkItem[] = [
  { label: "Skincare", href: "/collections/skincare" },
  { label: "Haircare", href: "/collections/haircare" },
  { label: "Body Care", href: "/collections/body-wash" },
  { label: "Essential Oils", href: "/collections/essential-oils-for-aromatherapy" },
  { label: "Combos & Kits", href: "/collections/combo" },
];

export const shopByConcern: LinkItem[] = [
  { label: "Acne & Oil Control", href: "/collections/features-at-dpetals" },
  { label: "Glow & Pigmentation", href: "/collections/skin-care" },
  { label: "Hydration & Dryness", href: "/collections/skin-care" },
  { label: "Hair Fall & Dandruff", href: "/collections/haircare" },
  { label: "Relax & Aromatherapy", href: "/collections/essential-oils-for-aromatherapy" },
];

export const primaryLinks: LinkItem[] = [
  { label: "Bestsellers", href: "/collections/bestsellers" },
  { label: "Combos & Gifts", href: "/collections/combo" },
  { label: "Essential Oils", href: "/collections/essential-oils-for-aromatherapy" },
  { label: "Our Story", href: "/pages/about-us" },
  { label: "Blog", href: "/blogs/blogs" },
];

export const footerShopLinks: LinkItem[] = [
  ...shopByCategory.slice(0, 4),
  { label: "Combos & Gifts", href: "/collections/combo" },
  { label: "Bestsellers", href: "/collections/bestsellers" },
];

export const footerPolicyLinks: LinkItem[] = [
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Refund Policy", href: "/policies/refund-policy" },
  { label: "Shipping Policy", href: "/policies/shipping-policy" },
  { label: "Terms of Service", href: "/policies/terms-of-service" },
  { label: "Contact", href: "/pages/contact" },
];

export const popularSearches: LinkItem[] = [
  { label: "neem face wash for acne", href: "/products/neem-tea-tree-face-wash" },
  { label: "rosemary oil for hair growth", href: "/products/rosemary-essential-oil" },
  { label: "multani mitti for face", href: "/products/multani-mitti-face-pack" },
  { label: "aloe vera gel for face", href: "/products/cucumber-aloe-vera-gel" },
  { label: "rose water for face", href: "/products/rose-water-face-mist-toner" },
  { label: "kumkumadi gel for glow", href: "/products/saffron-kumkumadi-aloe-vera-gel" },
  { label: "cold pressed jojoba oil", href: "/products/cold-pressed-jojoba-oil" },
  { label: "tea tree oil for skin", href: "/products/tea-tree-essential-oil" },
  { label: "lavender oil for sleep", href: "/products/lavender-essential-oil" },
  { label: "ayurvedic hair mask for dandruff", href: "/products/ayurvedic-hair-mask" },
  { label: "hair mask for frizzy hair", href: "/products/hair-nourishing-gel-mask-conditioner" },
  { label: "body butter for dry skin", href: "/products/citrus-sunrise-body-butter" },
  { label: "sulphate free body wash", href: "/collections/body-wash" },
  { label: "peppermint oil for headache", href: "/products/peppermint-essential-oil" },
  { label: "eucalyptus oil for steam", href: "/products/eucalyptus-essential-oil" },
  {
    label: "essential oils combo set",
    href: "/products/essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser",
  },
  { label: "natural skincare india", href: "/collections/skincare" },
  { label: "chemical free haircare", href: "/collections/haircare" },
];

export const siteInfo = {
  name: "DPetals",
  legalName: "Rich Elements Pvt. Ltd., Ahmedabad, India",
  tagline: "Natural, thoughtfully formulated care. Made in Ahmedabad, India.",
  about:
    "DPetals is a natural skincare, haircare and essential oils brand from Rich Elements Pvt. Ltd., Ahmedabad. We make chemical free, SLS free and paraben free products for Indian skin and climate. Every formula is thoughtfully made and priced honestly, with free shipping on orders above ₹500.",
  email: "customercare@richelements.in",
  address: [
    "Rich Elements Private Limited",
    "A-204, Dev Parisar, B/H Gorbandh Hotel Khodiyar,",
    "Khodiyar, Daskroi, Ahmedabad-382421, Gujarat",
  ],
  instagram: "https://www.instagram.com/dpetals_essentials/",
  facebook: "https://www.facebook.com/profile.php?id=61573787796961",
  amazon:
    "https://www.amazon.in/stores/DPetals/page/35B2DCAA-4A49-4614-941E-C876447D75C8",
  flipkart: "https://www.flipkart.com/search?q=dpetals",
  announcement: {
    before: "Extra 10% off your first order with code",
    code: "FIRSTTIMEOFFER",
    after: ". Free shipping on orders above ₹500.",
  },
};
