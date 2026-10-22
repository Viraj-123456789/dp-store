import type { ArticleSummary, BlogArticle } from "@/types/blog";

// Journal URLs and page text. The articles themselves come from the backend (lib/medusa/content).

export const BLOG_PATH = "/blogs/blogs";

export const blogArticlePath = (handle: string) => `${BLOG_PATH}/${handle}`;

export const blogTagPath = (handle: string) => `${BLOG_PATH}/tagged/${handle}`;

/** "Keep reading" picks: the first articles in listing order, excluding the one being read. */
export function moreArticles(articles: ArticleSummary[], excludeHandle: string, limit = 3) {
  return articles.filter((article) => article.handle !== excludeHandle).slice(0, limit);
}

const META_TITLE_MAX = 70;
const META_DESCRIPTION_MAX = 320;

/** Page titles are cut to 70 characters, as on the reference storefront. */
export function blogArticleMetaTitle(article: Pick<BlogArticle, "title">) {
  return `${article.title.slice(0, META_TITLE_MAX)} | DPetals`;
}

export function blogArticleMetaDescription(article: Pick<BlogArticle, "body">) {
  return article.body
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, META_DESCRIPTION_MAX);
}
