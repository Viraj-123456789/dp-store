export interface CdnImage {
  src: string;
  alt: string;
}

export interface SizedImage extends CdnImage {
  width: number;
  height: number;
}

export interface ProductSummary {
  handle: string;
  title: string;
  image: CdnImage;
  /** Category and size line, e.g. "Face Wash · 120 ml". */
  subtitle: string;
  /** Selling price in major currency units. */
  price: number;
  /** Maximum retail price in major currency units. */
  mrp: number;
  currency: string;
  isNew: boolean;
  rating: { average: number; count: number } | null;
}

export interface LinkItem {
  label: string;
  href: string;
}

export type BannerTone = "sage" | "meadow" | "sand" | "mist" | "peach";
