import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/collection/pagination";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/ui/product-card";
import { getCollectionHandles, getCollectionPage } from "@/lib/collections";
import { NOT_FOUND_METADATA } from "@/lib/seo";

function parsePage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(Array.isArray(value) ? value[0] : (value ?? "1"), 10);
  return Number.isNaN(parsed) ? 1 : parsed;
}

export function generateStaticParams() {
  return getCollectionHandles().map((handle) => ({ handle }));
}

export async function generateMetadata(
  props: PageProps<"/collections/[handle]">,
): Promise<Metadata> {
  const { handle } = await props.params;
  const result = await getCollectionPage(handle);
  if (!result) return NOT_FOUND_METADATA;

  const { collection } = result;
  return {
    title: collection.seoTitle,
    description: collection.intro ?? undefined,
  };
}

export default async function CollectionPage(
  props: PageProps<"/collections/[handle]">,
) {
  const { handle } = await props.params;
  const page = parsePage((await props.searchParams).page);
  const result = await getCollectionPage(handle, page);
  if (!result) notFound();

  const { collection, products, pageCount } = result;

  return (
    <Container>
      <header className="pb-2 pt-7">
        <Breadcrumb items={[{ label: collection.title }]} className="pb-2.5" />
        <h1 className="font-heading text-[clamp(26px,3.4vw,40px)]">
          {collection.title}
        </h1>
        {collection.intro && (
          <p className="mt-[7px] max-w-[640px] text-sm text-muted-foreground">
            {collection.intro}
          </p>
        )}
      </header>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 pb-[34px] md:grid-cols-3 md:gap-[18px] xl:grid-cols-4 xl:gap-[22px]">
          {products.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      ) : (
        <p className="pb-[54px] pt-6 text-muted-foreground">
          No products found in this collection yet.
        </p>
      )}

      <Pagination
        basePath={`/collections/${collection.handle}`}
        page={page}
        pageCount={pageCount}
      />
    </Container>
  );
}
