import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/blog-index";
import { blogArticles } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blogs | DPetals",
};

export default function BlogsPage() {
  return <BlogIndex articles={blogArticles} />;
}
