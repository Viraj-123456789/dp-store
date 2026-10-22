import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentPageView } from "@/components/content/content-page-view";
import { fetchContentPage } from "@/lib/medusa/content";
import { NOT_FOUND_METADATA } from "@/lib/seo";

// Legal pages (/policies/privacy-policy, ...) are content pages managed in Admin, same as /pages.

export async function generateMetadata(props: PageProps<"/policies/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const page = await fetchContentPage(handle);
  return page ? { title: page.seoTitle, description: page.description } : NOT_FOUND_METADATA;
}

export default async function PolicyPageRoute(props: PageProps<"/policies/[handle]">) {
  const { handle } = await props.params;
  const page = await fetchContentPage(handle);
  if (!page) notFound();

  return <ContentPageView page={page} />;
}
