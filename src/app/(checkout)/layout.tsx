import { Toast } from "@/components/cart/toast";

/** Checkout runs without the storefront header/footer, like the hosted checkout it mirrors. */
export default function CheckoutLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main id="MainContent">{children}</main>
      <Toast />
    </>
  );
}
