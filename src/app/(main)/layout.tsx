import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toast } from "@/components/cart/toast";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { QuickViewProvider } from "@/components/quick-view/quick-view-provider";
import { SearchOverlay } from "@/components/search/search-overlay";
import { SearchProvider } from "@/components/search/search-provider";
import { getCartSuggestions } from "@/lib/cart/suggestions";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <SearchProvider>
      <QuickViewProvider>
        <AnnouncementBar />
        <Header />
        <main id="MainContent">{children}</main>
        <Footer />
        <CartDrawer suggestions={getCartSuggestions()} />
        <SearchOverlay />
        <Toast />
      </QuickViewProvider>
    </SearchProvider>
  );
}
