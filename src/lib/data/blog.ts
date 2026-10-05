import { blogArticles, blogTags } from "@/lib/data/blog-articles";
import type { BlogArticle, BlogTag } from "@/types/blog";

export { blogArticles, blogTags };

export type Article = Pick<BlogArticle, "handle" | "title" | "excerpt" | "category" | "image">;

/** Journal articles known to the storefront (used by search). */
export const articles: Article[] = blogArticles;

export const BLOG_PATH = "/blogs/blogs";

export const blogArticlePath = (handle: string) => `${BLOG_PATH}/${handle}`;

export const blogTagPath = (handle: string) => `${BLOG_PATH}/tagged/${handle}`;

export function getBlogArticle(handle: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.handle === handle);
}

export function getBlogTag(handle: string): BlogTag | undefined {
  return blogTags.find((tag) => tag.handle === handle);
}

export function getArticlesByTag(handle: string): BlogArticle[] {
  return blogArticles.filter((article) => article.tags.includes(handle));
}

/** "Keep reading" picks: the first articles in listing order, excluding the one being read. */
export function getMoreArticles(excludeHandle: string, limit = 3): BlogArticle[] {
  return blogArticles.filter((article) => article.handle !== excludeHandle).slice(0, limit);
}

const META_TITLE_MAX = 70;
const META_DESCRIPTION_MAX = 320;

/** Page titles are cut to 70 characters, as on the reference storefront. */
export function blogArticleMetaTitle(article: BlogArticle) {
  return `${article.title.slice(0, META_TITLE_MAX)} | DPetals`;
}

export function blogArticleMetaDescription(article: BlogArticle) {
  return article.body
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, META_DESCRIPTION_MAX);
}
