import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogIndex } from "@/components/blog/blog-index";
import { blogTags, getArticlesByTag, getBlogTag } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blogs | DPetals",
};

export function generateStaticParams() {
  return blogTags.map((tag) => ({ tag: tag.handle }));
}

export default async function BlogTagPage(props: PageProps<"/blogs/blogs/tagged/[tag]">) {
  const { tag } = await props.params;
  if (!getBlogTag(tag)) notFound();

  return <BlogIndex articles={getArticlesByTag(tag)} activeTag={tag} />;
}
