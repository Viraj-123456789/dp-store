import Image from "next/image";
import Link from "next/link";

import { textLinkClass } from "@/components/ui/text-link";
import { cdn } from "@/lib/cdn";
import { cn } from "@/lib/utils";
import type { SizedImage } from "@/types/home";

export interface ArticleCardData {
  handle: string;
  title: string;
  excerpt: string;
  category: string | null;
  image: SizedImage;
}

export function ArticleCard({ post, className }: { post: ArticleCardData; className?: string }) {
  return (
    <Link
      href={`/blogs/blogs/${post.handle}`}
      className={cn(
        "group flex snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-[220ms] hover:-translate-y-[3px] hover:shadow-elevated",
        className,
      )}
    >
      <div className="aspect-video overflow-hidden bg-secondary">
        <Image
          src={cdn(post.image.src)}
          alt={post.image.alt}
          width={post.image.width}
          height={post.image.height}
          sizes="(min-width: 1080px) 388px, (min-width: 760px) 50vw, 78vw"
          className="size-full object-cover"
        />
      </div>
      <div className="px-[18px] pb-[18px] pt-4">
        {post.category && (
          <span className="font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
            {post.category}
          </span>
        )}
        <h3 className="mb-1.5 mt-[7px] text-[16px]">{post.title}</h3>
        <p className="text-[13px] leading-[1.5] text-muted-foreground">{post.excerpt}</p>
        <span className={cn(textLinkClass, "mt-1.5 group-hover:text-primary-hover")}>
          Read blog
        </span>
      </div>
    </Link>
  );
}
