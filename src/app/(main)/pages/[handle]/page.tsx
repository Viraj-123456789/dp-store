import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentPageView } from "@/components/content/content-page-view";
import { fetchContentPage, fetchContentPageHandles } from "@/lib/medusa/content";
import { NOT_FOUND_METADATA } from "@/lib/seo";

/** If the backend is unreachable at build time the pages are rendered on first request instead. */
export async function generateStaticParams() {
  try {
    return (await fetchContentPageHandles()).map((handle) => ({ handle }));
  } catch (error) {
    console.warn("Could not list content pages for static generation:", error);
    return [];
  }
}

export async function generateMetadata(props: PageProps<"/pages/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const page = await fetchContentPage(handle);
  return page ? { title: page.seoTitle, description: page.description } : NOT_FOUND_METADATA;
}

export default async function ContentPageRoute(props: PageProps<"/pages/[handle]">) {
  const { handle } = await props.params;
  const page = await fetchContentPage(handle);
  if (!page) notFound();

  return <ContentPageView page={page} />;
}
