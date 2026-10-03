import type { Metadata } from "next";

import { SearchForm } from "@/components/search/search-form";
import { ArticleCard } from "@/components/ui/article-card";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/ui/product-card";
import { searchCatalog } from "@/lib/search";

function readQuery(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export async function generateMetadata(props: PageProps<"/search">): Promise<Metadata> {
  const query = readQuery((await props.searchParams).q);
  if (!query) return { title: "Search | DPetals" };

  const { products, articles } = searchCatalog(query);
  const total = products.length + articles.length;
  return {
    title: `Search: ${total} ${total === 1 ? "result" : "results"} found for "${query}" | DPetals`,
    robots: { index: false },
  };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const query = readQuery((await props.searchParams).q);
  const { products, articles } = searchCatalog(query);
  const total = products.length + articles.length;

  return (
    <Container>
      <header className="pb-2 pt-7">
        <h1 className="font-heading text-[clamp(26px,3.4vw,40px)]">Search</h1>
        <SearchForm defaultValue={query} />
      </header>

      {query && (
        <>
          <p className="my-3.5 text-[13px] text-muted-foreground">
            {`${total} ${total === 1 ? "result" : "results"} — “${query}”`}
          </p>
          <div className="grid grid-cols-2 gap-3 pb-[34px] md:grid-cols-3 md:gap-[18px] xl:grid-cols-4 xl:gap-[22px]">
            {products.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))}
            {articles.map((article) => (
              <ArticleCard key={article.handle} post={article} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
