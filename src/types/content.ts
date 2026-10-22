import type { CartLineInput } from "@/lib/cart/lines";
import type { BlogTag } from "@/types/blog";
import type { BannerTone, CdnImage, LinkItem, ProductSummary, SizedImage } from "@/types/home";

// Editorial content served by the backend (/store/dp/content, /pages, /articles, /search).
// The shapes are exactly what the static data files held before.

export interface HeroSlide {
  kicker: string;
  title: string;
  subtitle: string;
  cta: LinkItem;
  imageMain: SizedImage;
  imageAccent: SizedImage;
  chip: { label: string; value: string };
}

export interface Concern {
  title: string;
  description: string;
  href: string;
  image: CdnImage;
}

export interface TitledLinkImage {
  title: string;
  href: string;
  image: CdnImage;
}

export interface PromoBannerData {
  id: string;
  tone: BannerTone;
  kicker: string;
  titleMain: string;
  titleAccent: string;
  text: string;
  cta: LinkItem;
  image: SizedImage;
}

export interface WhyDpetalsData {
  title: string;
  text: string;
  cta: LinkItem;
  points: { icon: string; title: string; text: string }[];
}

export interface HomeSpotlight {
  badge: string;
  title: string;
  image: SizedImage;
  points: string[];
  price: number;
  mrp: number;
  currency: string;
  handle: string;
  /** The product's default cart line, so the spotlight can add it to the cart. */
  line?: CartLineInput;
}

export interface HomeReel {
  video: string;
  poster: string;
  productHandle: string;
  productTitle: string;
  price: number;
  mrp: number;
  currency: string;
}

export interface HomeReview {
  rating: number;
  text: string;
  author: string;
  /** "Product label, City". */
  product: string;
}

/** What a journal card needs. */
export interface ArticleCardData {
  handle: string;
  title: string;
  excerpt: string;
  category: string | null;
  image: SizedImage;
}

export interface HomeContent {
  heroSlides: HeroSlide[];
  valueCards: SizedImage[];
  concerns: Concern[];
  bestsellers: ProductSummary[];
  haircarePicks: ProductSummary[];
  skincarePicks: ProductSummary[];
  comboProducts: ProductSummary[];
  ingredients: CdnImage[];
  categories: TitledLinkImage[];
  comboKits: TitledLinkImage[];
  spotlight: HomeSpotlight | null;
  promoBanners: PromoBannerData[];
  whyDpetals: WhyDpetalsData;
  reels: HomeReel[];
  reviews: HomeReview[];
  blogPosts: ArticleCardData[];
}

export interface SiteInfo {
  name: string;
  legalName: string;
  tagline: string;
  about: string;
  email: string;
  address: string[];
  instagram: string;
  facebook: string;
  amazon: string;
  flipkart: string;
  announcement: { before: string; code: string; after: string };
}

export interface Navigation {
  primaryLinks: LinkItem[];
  shopByCategory: LinkItem[];
  shopByConcern: LinkItem[];
  footerShopLinks: LinkItem[];
  footerPolicyLinks: LinkItem[];
  popularSearches: LinkItem[];
}

/** A public promotion shown in the cart's "Coupons & offers" panel. */
export interface Coupon {
  code: string;
  title: string;
  description: string;
}

export interface SiteContent {
  siteInfo: SiteInfo;
  navigation: Navigation;
  coupons: Coupon[];
}

export interface ContentPage {
  handle: string;
  title: string;
  seoTitle: string;
  description?: string;
  html: string;
}

export type { BlogTag };

export interface SearchResults {
  products: ProductSummary[];
  articles: ArticleCardData[];
}
