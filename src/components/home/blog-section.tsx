import { ScrollRail } from "@/components/ui/scroll-rail";
import { Section, SectionHeading } from "@/components/ui/section";
import { ArticleCard, type ArticleCardData } from "@/components/ui/article-card";

export function BlogSection({
  posts,
  title = "Read and know more",
  description = "Skincare education from the DPetals journal.",
}: {
  posts: ArticleCardData[];
  title?: string;
  description?: string | null;
}) {
  return (
    <Section>
      <SectionHeading
        title={title}
        description={description ?? undefined}
        action={{ label: "See all posts", href: "/blogs/blogs" }}
      />
      <ScrollRail className="scrollbar-none grid auto-cols-[78%] grid-flow-col gap-3.5 overflow-x-auto pb-3.5 [scroll-snap-type:x_mandatory] md:auto-cols-auto md:grid-flow-row md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-3">
        {posts.map((post) => (
          <ArticleCard key={post.handle} post={post} />
        ))}
      </ScrollRail>
    </Section>
  );
}
