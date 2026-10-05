import { ArticleCard } from "@/components/ui/article-card";
import { cn } from "@/lib/utils";
import type { BlogArticle } from "@/types/blog";

const GRID_SIZES = "(min-width: 1080px) 388px, (min-width: 760px) 50vw, 100vw";

/** Stacked on mobile, two columns from 760px, three from 1080px. */
export function ArticleGrid({
  articles,
  className,
}: {
  articles: BlogArticle[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3.5 md:grid-cols-2 xl:grid-cols-3", className)}>
      {articles.map((article) => (
        <ArticleCard key={article.handle} post={article} sizes={GRID_SIZES} />
      ))}
    </div>
  );
}
