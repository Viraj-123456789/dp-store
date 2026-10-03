import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogSection } from "@/components/home/blog-section";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductProvider } from "@/components/product/product-context";
import { ProductSections } from "@/components/product/product-sections";
import { RelatedProducts } from "@/components/product/related-products";
import { StickyAddBar } from "@/components/product/sticky-add-bar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { blogPosts } from "@/lib/data/home";
import {
  getProductDetail,
  getProductHandles,
  getRelatedProducts,
} from "@/lib/products";
import { NOT_FOUND_METADATA } from "@/lib/seo";

export function generateStaticParams() {
  return getProductHandles().map((handle) => ({ handle }));
}

export async function generateMetadata(
  props: PageProps<"/products/[handle]">,
): Promise<Metadata> {
  const { handle } = await props.params;
  const product = await getProductDetail(handle);
  if (!product) return NOT_FOUND_METADATA;

  return {
    title: product.seoTitle,
    description: product.seoDescription ?? undefined,
  };
}

export default async function ProductPage(props: PageProps<"/products/[handle]">) {
  const { handle } = await props.params;
  const product = await getProductDetail(handle);
  if (!product) notFound();

  const related = product.related
    ? await getRelatedProducts(product.related.handles)
    : [];

  return (
    <ProductProvider product={product}>
      <Container>
        <Breadcrumb items={[{ label: product.title }]} className="pb-1 pt-4" />

        <div className="grid min-w-0 gap-[26px] pb-9 pt-3.5 xl:grid-cols-[1.02fr_0.98fr] xl:gap-14 xl:pb-14 xl:pt-6">
          <ProductGallery />
          <ProductInfo />
        </div>

        <ProductSections sections={product.sections} />

        {product.related && (
          <RelatedProducts
            title={product.related.title}
            subtitle={product.related.subtitle}
            products={related}
          />
        )}
      </Container>

      {product.showBlog && (
        <BlogSection posts={blogPosts} title="From our journal" description={null} />
      )}
      <StickyAddBar />
    </ProductProvider>
  );
}
