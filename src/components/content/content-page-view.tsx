import type { ContentPage } from "@/types/content";

export function ContentPageView({ page }: { page: ContentPage }) {
  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-[34px] md:px-6">
      <h1 className="font-heading text-[2em]">{page.title}</h1>
      <div className="page-prose mt-[18px]" dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  );
}
