import { ProductCard } from "@/components/ui/product-card";
import { ScrollRail } from "@/components/ui/scroll-rail";
import { Section, SectionHeading } from "@/components/ui/section";
import type { ProductSummary } from "@/types/home";

interface ProductRailSectionProps {
  title: string;
  description: string;
  action: { label: string; href: string };
  products: ProductSummary[];
  showSavings?: boolean;
}

export function ProductRailSection({
  title,
  description,
  action,
  products,
  showSavings,
}: ProductRailSectionProps) {
  return (
    <Section>
      <SectionHeading title={title} description={description} action={action} />
      <ScrollRail className="rail-scrollbar grid auto-cols-[calc(40%-7px)] grid-flow-col gap-2.5 overflow-x-auto px-0.5 pb-4 pt-1 [scroll-snap-type:x_mandatory] md:auto-cols-[calc(37%-12px)] md:gap-[18px] xl:auto-cols-[calc(25%-17px)] xl:gap-[22px]">
        {products.map((product) => (
          <ProductCard
            key={product.handle}
            product={product}
            showSavings={showSavings}
            compact
          />
        ))}
      </ScrollRail>
    </Section>
  );
}
