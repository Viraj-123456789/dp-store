import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/blog-index";
import { fetchArticleList } from "@/lib/medusa/content";

export const metadata: Metadata = {
  title: "Blogs | DPetals",
};

export default async function BlogsPage() {
  const { articles, tags } = await fetchArticleList();
  return <BlogIndex articles={articles} tags={tags} />;
}
