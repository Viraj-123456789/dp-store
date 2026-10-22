import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toast } from "@/components/cart/toast";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { QuickViewProvider } from "@/components/quick-view/quick-view-provider";
import { SearchOverlay } from "@/components/search/search-overlay";
import { SearchProvider } from "@/components/search/search-provider";
import { getCartSuggestions } from "@/lib/cart/suggestions";
import { fetchSiteContent } from "@/lib/medusa/content";

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const [suggestions, site] = await Promise.all([getCartSuggestions(), fetchSiteContent()]);

  return (
    <SearchProvider>
      <QuickViewProvider>
        <AnnouncementBar announcement={site.siteInfo.announcement} />
        <Header navigation={site.navigation} />
        <main id="MainContent">{children}</main>
        <Footer siteInfo={site.siteInfo} navigation={site.navigation} />
        <CartDrawer suggestions={suggestions} coupons={site.coupons} />
        <SearchOverlay />
        <Toast />
      </QuickViewProvider>
    </SearchProvider>
  );
}
