export type BenefitIconName =
  | "bubbles"
  | "waves"
  | "leaf"
  | "drop"
  | "wind"
  | "check-circle"
  | "sparkles"
  | "heart"
  | "moon"
  | "shield-check"
  | "scalp"
  | "target";

export type ProductBadgeTone = "new" | "off" | "tag" | "save";

export interface ProductBadge {
  tone: ProductBadgeTone;
  label: string;
}

export interface ProductImageMedia {
  type: "image";
  src: string;
}

export interface ProductVideoMedia {
  type: "video";
  /** Poster / thumbnail image. */
  src: string;
  video: string;
}

export type ProductMedia = ProductImageMedia | ProductVideoMedia;

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  /** Option values in the same order as `ProductDetail.options`. */
  options: string[];
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  /** File name of the variant's featured image, matched against gallery media. */
  imageFile: string | null;
}

export interface ProductTrustItem {
  icon: string;
  label: string;
}

export type ProductAccordion =
  | { kind: "html"; title: string; open: boolean; html: string }
  | {
      kind: "rows";
      title: string;
      open: boolean;
      rows: { label: string; value: string; href: string | null }[];
    };

export interface IngredientsSection {
  type: "ingredients";
  title: string;
  subtitle: string | null;
  items: { image: string; alt: string; title: string; text: string }[];
  summaryHtml: string | null;
}

export interface BenefitsSection {
  type: "benefits";
  title: string;
  subtitle: string | null;
  items: { icon: BenefitIconName; text: string }[];
}

export interface StepsSection {
  type: "steps";
  title: string;
  subtitle: string | null;
  items: { image: string | null; number: string | null; text: string }[];
  footnoteHtml: string | null;
}

export interface PuritySection {
  type: "purity";
  title: string;
  subtitle: string | null;
  items: string[];
}

export interface ComparisonSection {
  type: "comparison";
  title: string;
  subtitle: string | null;
  columns: { feature: string; ours: string; theirs: string };
  rows: { feature: string; ours: string; theirs: string }[];
}

export interface FaqSection {
  type: "faq";
  title: string;
  subtitle: string | null;
  items: { question: string; answerHtml: string; open: boolean }[];
}

export type ProductSection =
  | IngredientsSection
  | BenefitsSection
  | StepsSection
  | PuritySection
  | ComparisonSection
  | FaqSection;

export interface ProductDetail {
  handle: string;
  seoTitle: string;
  seoDescription: string | null;
  badges: ProductBadge[];
  title: string;
  subtitle: string | null;
  rating: { average: number; count: number } | null;
  netQty: string | null;
  taxNote: string | null;
  offer: string | null;
  options: ProductOption[];
  variants: ProductVariant[];
  currency: string;
  media: ProductMedia[];
  trust: ProductTrustItem[];
  accordions: ProductAccordion[];
  sections: ProductSection[];
  /** "Save more — get it in the <combo>" link shown under the trust badges. */
  crossSell: { handle: string; title: string } | null;
  related: { title: string; subtitle: string | null; handles: string[] } | null;
  /** Whether the journal (blog) rail closes the page. */
  showBlog: boolean;
}
