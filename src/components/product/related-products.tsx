import { ProductCard } from "@/components/ui/product-card";
import type { ProductSummary } from "@/types/home";

interface RelatedProductsProps {
  title: string;
  subtitle: string | null;
  products: ProductSummary[];
}

export function RelatedProducts({ title, subtitle, products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border py-[26px] xl:py-[34px]">
      <div className="rounded-3xl bg-secondary px-4 py-5 xl:p-[34px]">
        <h2 className="mb-1.5 font-heading text-[21px] xl:text-[24px]">{title}</h2>
        {subtitle && (
          <p className="mb-[18px] text-[13.5px] text-muted-foreground">{subtitle}</p>
        )}
        <div className="grid gap-3 md:grid-cols-2 md:gap-[18px] xl:grid-cols-3 xl:gap-[22px]">
          {products.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
