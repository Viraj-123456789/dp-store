import type { SizedImage } from "@/types/home";

export interface BlogTag {
  handle: string;
  label: string;
}

export interface BlogArticle {
  handle: string;
  title: string;
  excerpt: string;
  /** Primary tag, shown as the small uppercase label on cards and the badge on the article. */
  category: string | null;
  image: SizedImage;
  /** Handles of the {@link BlogTag}s this article is filed under. */
  tags: string[];
  author: string;
  /** Display date, e.g. "May 2025". */
  published: string;
  /** Article body as trusted HTML. */
  body: string;
}
