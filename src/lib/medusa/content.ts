import "server-only";

import { cache } from "react";

import type { ArticleSummary, BlogArticle, BlogTag } from "@/types/blog";
import type { ContentPage, HomeContent, SiteContent } from "@/types/content";

import { sdk } from "./client";
import { dpFetch } from "./dp";
import { visitorHeaders } from "./visitor";

// Editorial content from the backend. React's cache() shares one request between the layout and
// the page when both ask for the same thing during a render.

/** GET /store/dp/content/home */
export const fetchHomeContent = cache(async (): Promise<HomeContent> => {
  const home = await dpFetch<HomeContent>("/content/home", { tags: ["content", "products"] });
  if (!home) throw new Error("The backend returned no home content.");
  return home;
});

/** GET /store/dp/content/site: info, navigation and public coupons for the layout. */
export const fetchSiteContent = cache(async (): Promise<SiteContent> => {
  const site = await dpFetch<SiteContent>("/content/site", { tags: ["content"] });
  if (!site) throw new Error("The backend returned no site content.");
  return site;
});

/** GET /store/dp/pages/:handle (null when unknown or unpublished). */
export function fetchContentPage(handle: string): Promise<ContentPage | null> {
  return dpFetch<ContentPage>(`/pages/${encodeURIComponent(handle)}`, { tags: ["content"] });
}

/** GET /store/dp/pages: handles of published pages. */
export async function fetchContentPageHandles(): Promise<string[]> {
  return (await dpFetch<string[]>("/pages", { tags: ["content"] })) ?? [];
}

interface ArticleList {
  articles: ArticleSummary[];
  tags: BlogTag[];
}

/** GET /store/dp/articles?tag=: published articles in display order, plus every tag. */
export const fetchArticleList = cache(async (tag?: string): Promise<ArticleList> => {
  const list = await dpFetch<ArticleList>("/articles", {
    ...(tag ? { query: { tag } } : {}),
    tags: ["content"],
  });
  return list ?? { articles: [], tags: [] };
});

/** GET /store/dp/articles/:handle */
export function fetchArticle(handle: string): Promise<BlogArticle | null> {
  return dpFetch<BlogArticle>(`/articles/${encodeURIComponent(handle)}`, { tags: ["content"] });
}

/** POST /store/dp/newsletter. Never cached; a 400 carries a message safe to show. */
export async function subscribeToNewsletter(email: string, source: string): Promise<void> {
  await sdk.client.fetch("/store/dp/newsletter", {
    method: "POST",
    cache: "no-store",
    headers: await visitorHeaders(),
    body: { email, source },
  });
}
