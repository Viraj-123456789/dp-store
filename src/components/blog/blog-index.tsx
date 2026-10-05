import { ArticleGrid } from "@/components/blog/article-grid";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { BLOG_PATH, blogTagPath, blogTags } from "@/lib/data/blog";
import type { BlogArticle } from "@/types/blog";

/** Blog listing, shared by the full index and the per-tag filter pages. */
export function BlogIndex({
  articles,
  activeTag,
}: {
  articles: BlogArticle[];
  /** Handle of the selected tag; omit for "All". */
  activeTag?: string;
}) {
  return (
    <Container>
      <header className="pb-2 pt-7">
        <Breadcrumb items={[{ label: "Blogs" }]} className="pb-2.5" />
        <h1 className="font-heading text-[clamp(26px,3.4vw,40px)]">Blogs 🌿</h1>
        <p className="mt-[7px] max-w-[640px] text-sm text-muted-foreground">
          Honest skincare, haircare and aromatherapy education — every guide links back to the
          ritual that serves it.
        </p>
      </header>

      <nav aria-label="Filter articles" className="flex gap-2 overflow-x-auto pb-5 pt-3.5">
        <Chip href={BLOG_PATH} active={!activeTag}>
          All
        </Chip>
        {blogTags.map((tag) => (
          <Chip key={tag.handle} href={blogTagPath(tag.handle)} active={tag.handle === activeTag}>
            {tag.label}
          </Chip>
        ))}
      </nav>

      <ArticleGrid articles={articles} className="pb-[34px]" />
    </Container>
  );
}
