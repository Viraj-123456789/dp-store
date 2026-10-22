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
import { fetchHomeContent, fetchSiteContent } from "@/lib/medusa/content";

export default async function HomePage() {
  const [home, site] = await Promise.all([fetchHomeContent(), fetchSiteContent()]);

  const banner = (id: string) => {
    const data = home.promoBanners.find((item) => item.id === id);
    return data ? <PromoBanner {...data} /> : null;
  };

  return (
    <>
      <HeroCarousel slides={home.heroSlides} />
      <ValueCards cards={home.valueCards} />
      <ConcernCards concerns={home.concerns} />
      <ProductRailSection
        title="Bestsellers"
        description="The products our customers reorder."
        action={{ label: "View all", href: "/collections/bestsellers" }}
        products={home.bestsellers}
      />
      {banner("hair")}
      <ProductRailSection
        title="Haircare picks"
        description="Masks, oils and nourishing gels."
        action={{ label: "View all", href: "/collections/haircare" }}
        products={home.haircarePicks}
      />
      <SquareRailSection
        title="Made with pure, nourishing butters and oils"
        description="Slow infusions, small batches, real ingredients."
        cardSize={200}
        items={home.ingredients.map((image) => ({ image, caption: image.alt }))}
      />
      {banner("glow")}
      <ProductRailSection
        title="Skincare picks"
        description="Gels, face washes and mists for daily glow."
        action={{ label: "View all", href: "/collections/skincare" }}
        products={home.skincarePicks}
      />
      <CategoryGrid categories={home.categories} />
      {banner("aroma")}
      {home.spotlight && <Spotlight {...home.spotlight} />}
      <ProductRailSection
        title="Build your routine and save"
        description="Curated combos with real savings, up to 80% off MRP."
        action={{ label: "View all", href: "/collections/combo" }}
        products={home.comboProducts}
        showSavings
      />
      <SquareRailSection
        title="Combos and kits at a glance"
        cardSize={190}
        items={home.comboKits.map((kit) => ({
          image: kit.image,
          caption: kit.title,
          href: kit.href,
        }))}
      />
      {banner("shower")}
      <WhySection {...home.whyDpetals} />
      <ReelsSection reels={home.reels} instagram={site.siteInfo.instagram} />
      {banner("hair-gel")}
      <ReviewsSection reviews={home.reviews} />
      <BlogSection posts={home.blogPosts} />
      <Newsletter />
    </>
  );
}
