import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pages } from "@/lib/data/pages";
import { NOT_FOUND_METADATA } from "@/lib/seo";

export function generateStaticParams() {
  return Object.keys(pages).map((handle) => ({ handle }));
}

export async function generateMetadata(props: PageProps<"/pages/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const page = pages[handle];
  return page ? { title: page.seoTitle, description: page.description } : NOT_FOUND_METADATA;
}

export default async function ContentPageRoute(props: PageProps<"/pages/[handle]">) {
  const { handle } = await props.params;
  const page = pages[handle];
  if (!page) notFound();

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-[34px] md:px-6">
      <h1 className="font-heading text-[2em]">{page.title}</h1>
      <div className="page-prose mt-[18px]" dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  );
}
