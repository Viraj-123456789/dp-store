import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleView } from "@/components/blog/article-view";
import { blogArticleMetaDescription, blogArticleMetaTitle, moreArticles } from "@/lib/blog";
import { fetchArticle, fetchArticleList } from "@/lib/medusa/content";
import { NOT_FOUND_METADATA } from "@/lib/seo";

/** If the backend is unreachable at build time the pages are rendered on first request instead. */
export async function generateStaticParams() {
  try {
    const { articles } = await fetchArticleList();
    return articles.map((article) => ({ handle: article.handle }));
  } catch (error) {
    console.warn("Could not list articles for static generation:", error);
    return [];
  }
}

export async function generateMetadata(
  props: PageProps<"/blogs/blogs/[handle]">,
): Promise<Metadata> {
  const { handle } = await props.params;
  const article = await fetchArticle(handle);
  if (!article) return NOT_FOUND_METADATA;

  return {
    title: blogArticleMetaTitle(article),
    description: blogArticleMetaDescription(article),
  };
}

export default async function BlogArticlePage(props: PageProps<"/blogs/blogs/[handle]">) {
  const { handle } = await props.params;
  const [article, { articles }] = await Promise.all([fetchArticle(handle), fetchArticleList()]);
  if (!article) notFound();

  return <ArticleView article={article} more={moreArticles(articles, handle)} />;
}
