import type { MetadataRoute } from "next";

import { getCollectionHandles } from "@/lib/collections";
import { fetchArticleList, fetchContentPageHandles } from "@/lib/medusa/content";
import { getProductHandles } from "@/lib/products";
import { siteUrl } from "@/lib/site-url";

/** Cached with the catalogue, so new products appear without a deploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, collections, pages, { articles }] = await Promise.all([
    getProductHandles(),
    getCollectionHandles(),
    fetchContentPageHandles(),
    fetchArticleList(),
  ]);

  const paths = [
    "",
    "/collections",
    "/blogs/blogs",
    ...collections.map((handle) => `/collections/${handle}`),
    ...products.map((handle) => `/products/${handle}`),
    ...pages.map((handle) => `/pages/${handle}`),
    ...articles.map((article) => `/blogs/blogs/${article.handle}`),
  ];
  return paths.map((path) => ({ url: `${base}${path}` }));
}
