import { blogPosts } from "@/lib/data/home";

export interface Article {
  handle: string;
  title: string;
  excerpt: string;
  category: string | null;
  image: { src: string; alt: string; width: number; height: number };
}

/** Journal articles known to the storefront (home page rail plus search-only entries). */
export const articles: Article[] = [
  ...blogPosts,
  {
    handle: "benefits-of-essential-oils",
    title: "Revealing the Magic of Rosemary Essential Oil: Benefits Beyond the Aromatic",
    excerpt:
      "When it comes to essential oils, rosemary is one very different and more invigorating scent....",
    category: "Aroma Oil",
    image: {
      src: "articles/rosemary.jpg",
      alt: "Revealing the Magic of Rosemary Essential Oil: Benefits Beyond the Aromatic",
      width: 720,
      height: 411,
    },
  },
];
