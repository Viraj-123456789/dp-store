import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleView } from "@/components/blog/article-view";
import {
  blogArticleMetaDescription,
  blogArticleMetaTitle,
  blogArticles,
  getBlogArticle,
} from "@/lib/data/blog";
import { NOT_FOUND_METADATA } from "@/lib/seo";

export function generateStaticParams() {
  return blogArticles.map((article) => ({ handle: article.handle }));
}

export async function generateMetadata(
  props: PageProps<"/blogs/blogs/[handle]">,
): Promise<Metadata> {
  const { handle } = await props.params;
  const article = getBlogArticle(handle);
  if (!article) return NOT_FOUND_METADATA;

  return {
    title: blogArticleMetaTitle(article),
    description: blogArticleMetaDescription(article),
  };
}

export default async function BlogArticlePage(props: PageProps<"/blogs/blogs/[handle]">) {
  const { handle } = await props.params;
  const article = getBlogArticle(handle);
  if (!article) notFound();

  return <ArticleView article={article} />;
}
