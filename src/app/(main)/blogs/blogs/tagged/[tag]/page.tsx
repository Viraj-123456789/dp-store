import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogIndex } from "@/components/blog/blog-index";
import { fetchArticleList } from "@/lib/medusa/content";

export const metadata: Metadata = {
  title: "Blogs | DPetals",
};

/** If the backend is unreachable at build time the pages are rendered on first request instead. */
export async function generateStaticParams() {
  try {
    const { tags } = await fetchArticleList();
    return tags.map((tag) => ({ tag: tag.handle }));
  } catch (error) {
    console.warn("Could not list journal tags for static generation:", error);
    return [];
  }
}

export default async function BlogTagPage(props: PageProps<"/blogs/blogs/tagged/[tag]">) {
  const { tag } = await props.params;
  const { articles, tags } = await fetchArticleList(tag);
  if (!tags.some((item) => item.handle === tag)) notFound();

  return <BlogIndex articles={articles} tags={tags} activeTag={tag} />;
}
