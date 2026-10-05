import Image from "next/image";

import { ArticleGrid } from "@/components/blog/article-grid";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { cdn } from "@/lib/cdn";
import { BLOG_PATH, getMoreArticles } from "@/lib/data/blog";
import type { BlogArticle } from "@/types/blog";

export function ArticleView({ article }: { article: BlogArticle }) {
  const more = getMoreArticles(article.handle);

  return (
    <Container>
      <Breadcrumb
        items={[{ label: "Blogs", href: BLOG_PATH }, { label: article.title }]}
        className="pb-1 pt-4"
      />

      <article className="pt-2.5">
        {article.category && (
          <div>
            <Badge tone="tag">{article.category}</Badge>
          </div>
        )}
        <h1 className="mt-3 max-w-[840px] font-heading text-[clamp(26px,3.4vw,40px)]">
          {article.title}
        </h1>
        <p className="mb-[18px] mt-2.5 text-[13px] text-muted-foreground">
          By {article.author} · {article.published}
        </p>

        <div className="relative mb-[26px] mt-1.5 aspect-[16/8] overflow-hidden rounded-3xl bg-secondary md:aspect-[16/7]">
          <Image
            src={cdn(article.image.src)}
            alt={article.image.alt}
            fill
            priority
            sizes="(min-width: 1240px) 1192px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="page-prose" dangerouslySetInnerHTML={{ __html: article.body }} />
      </article>

      {more.length > 0 && (
        <section className="border-t border-border pb-16 pt-[26px] xl:pt-[34px]">
          <h2 className="mb-1.5 font-heading text-[21px] xl:text-2xl">Keep reading</h2>
          <ArticleGrid articles={more} />
        </section>
      )}
    </Container>
  );
}
