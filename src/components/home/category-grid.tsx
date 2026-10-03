import { CollectionCard } from "@/components/ui/collection-card";
import { Section, SectionHeading } from "@/components/ui/section";
import type { CdnImage } from "@/types/home";

interface Category {
  title: string;
  href: string;
  image: CdnImage;
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <Section>
      <SectionHeading title="Shop by Category" />
      <div className="scrollbar-none grid auto-cols-[40%] grid-flow-col gap-3 overflow-x-auto pb-2.5 [scroll-snap-type:x_mandatory] md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:overflow-visible md:pb-0 xl:grid-cols-5">
        {categories.map((category) => (
          <CollectionCard
            key={category.title}
            {...category}
            caption="Shop now →"
            sizes="(min-width: 1080px) 229px, (min-width: 760px) 33vw, 40vw"
          />
        ))}
      </div>
    </Section>
  );
}
