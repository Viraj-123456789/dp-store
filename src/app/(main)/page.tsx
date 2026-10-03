import { BlogSection } from "@/components/home/blog-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { ConcernCards } from "@/components/home/concern-cards";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { Newsletter } from "@/components/home/newsletter";
import { ProductRailSection } from "@/components/home/product-rail-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { ReelsSection } from "@/components/home/reels-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { Spotlight } from "@/components/home/spotlight";
import { SquareRailSection } from "@/components/home/square-rail-section";
import { ValueCards } from "@/components/home/value-cards";
import { WhySection } from "@/components/home/why-section";
import {
  bestsellers,
  blogPosts,
  categories,
  comboKits,
  comboProducts,
  concerns,
  haircarePicks,
  heroSlides,
  ingredients,
  promoBanners,
  reels,
  reviews,
  skincarePicks,
  spotlight,
  valueCards,
  whyDpetals,
} from "@/lib/data/home";

function Banner({ id }: { id: string }) {
  const banner = promoBanners.find((item) => item.id === id);
  return banner ? <PromoBanner {...banner} /> : null;
}

export default function HomePage() {
  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <ValueCards cards={valueCards} />
      <ConcernCards concerns={concerns} />
      <ProductRailSection
        title="Bestsellers"
        description="The products our customers reorder."
        action={{ label: "View all", href: "/collections/bestsellers" }}
        products={bestsellers}
      />
      <Banner id="hair" />
      <ProductRailSection
        title="Haircare picks"
        description="Masks, oils and nourishing gels."
        action={{ label: "View all", href: "/collections/haircare" }}
        products={haircarePicks}
      />
      <SquareRailSection
        title="Made with pure, nourishing butters and oils"
        description="Slow infusions, small batches, real ingredients."
        cardSize={200}
        items={ingredients.map((image) => ({ image, caption: image.alt }))}
      />
      <Banner id="glow" />
      <ProductRailSection
        title="Skincare picks"
        description="Gels, face washes and mists for daily glow."
        action={{ label: "View all", href: "/collections/skincare" }}
        products={skincarePicks}
      />
      <CategoryGrid categories={categories} />
      <Banner id="aroma" />
      <Spotlight {...spotlight} />
      <ProductRailSection
        title="Build your routine and save"
        description="Curated combos with real savings, up to 80% off MRP."
        action={{ label: "View all", href: "/collections/combo" }}
        products={comboProducts}
        showSavings
      />
      <SquareRailSection
        title="Combos and kits at a glance"
        cardSize={190}
        items={comboKits.map((kit) => ({
          image: kit.image,
          caption: kit.title,
          href: kit.href,
        }))}
      />
      <Banner id="shower" />
      <WhySection {...whyDpetals} />
      <ReelsSection reels={reels} />
      <Banner id="hair-gel" />
      <ReviewsSection reviews={reviews} />
      <BlogSection posts={blogPosts} />
      <Newsletter />
    </>
  );
}
