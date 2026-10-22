"use client";

import { Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAddresses, useSession } from "@/components/account/hooks";
import { useCart } from "@/components/cart/cart-provider";
import { cartApi } from "@/lib/cart/client";
import { rememberNotice } from "@/lib/checkout/notice";
import {
  EMPTY_CHECKOUT_VALUES,
  hasErrors,
  validateCheckout,
  type AddressValues,
  type CheckoutErrors,
  type CheckoutValues,
} from "@/lib/checkout/validation";
import { FREE_SHIPPING_THRESHOLD, payableTotal } from "@/lib/cart/pricing";
import { cn, formatMoney } from "@/lib/utils";

import { AddressFields } from "./address-fields";
import { CheckoutHeader } from "./checkout-header";
import { CheckboxRow, RadioRow, TextField } from "./fields";
import { CheckoutFooterLinks } from "./footer-links";
import { OrderSummary, SummaryToggleBar } from "./order-summary";
import { useCheckoutCart } from "./use-checkout-cart";

const NO_ERRORS: CheckoutErrors = { shipping: {}, billing: {} };

const h2Class = "font-system text-[20px] font-semibold leading-6";
const h3Class = "font-system text-[16px] font-semibold leading-[1.2]";

function PaymentLogos({ count, extra }: { count: number; extra: number }) {
  return (
    <span className="-my-[0.5px] ml-auto flex flex-none items-center gap-1">
      {["upi", "visa", "master"].slice(0, count).map((name) => (
        <Image key={name} src={`/payments/${name}.svg`} alt={name} width={38} height={24} />
      ))}
      <span className="grid h-6 min-w-[22px] place-items-center rounded-xs border border-ck-border px-1 text-[10px] font-normal text-ck-accent">
        +{extra}
      </span>
    </span>
  );
}

const paymentOptions = [
  {
    id: "razorpay" as const,
    label: "Razorpay Secure (UPI, Card, Int'l Card, Apple Pay)",
    extra: 18,
    note: "You'll be redirected to Razorpay Secure (UPI, Card, Int'l Card, Apple Pay) to complete your purchase",
  },
  {
    id: "phonepe" as const,
    label: "PhonePe PG (UPI, Cards, EMI & NetBanking)",
    extra: 4,
    note: "You'll be redirected to PhonePe PG (UPI, Cards, EMI & NetBanking) to complete your purchase",
  },
];

export function CheckoutPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { ready, lines, summary, isBuyNow, mode, coupon } = useCheckoutCart();
  const [values, setValues] = useState<CheckoutValues>(EMPTY_CHECKOUT_VALUES);
  const [errors, setErrors] = useState<CheckoutErrors>(NO_ERRORS);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Set once an order is placed or the customer is on their way to the gateway: the cart is
  // emptied on purpose then, and the empty-cart redirect below must not override that move.
  const leaving = useRef(false);

  // A signed-in customer starts with their email and default address filled in (once, so
  // anything they type is never overwritten).
  const { session } = useSession();
  const { addresses, ready: addressesReady } = useAddresses();
  const [prefilled, setPrefilled] = useState(false);
  const saved = addresses.find((address) => address.isDefault) ?? addresses[0];
  if (!prefilled && session && addressesReady) {
    setPrefilled(true);
    setValues((current) => ({
      ...current,
      contact: current.contact || session.email,
      ...(saved
        ? {
            shipping: {
              firstName: saved.firstName,
              lastName: saved.lastName,
              address1: saved.address1,
              address2: saved.address2,
              city: saved.city,
              state: saved.state,
              pin: saved.pin,
              phone: saved.phone,
            },
          }
        : {}),
    }));
  }

  // An empty cart has nothing to check out; the live site sends visitors back to the homepage.
  useEffect(() => {
    if (ready && lines.length === 0 && !leaving.current) router.replace("/");
  }, [ready, lines.length, router]);

  if (!ready || lines.length === 0) return null;

  const patchShipping = (patch: Partial<AddressValues>) =>
    setValues((current) => ({ ...current, shipping: { ...current.shipping, ...patch } }));
  const patchBilling = (patch: Partial<AddressValues>) =>
    setValues((current) => ({ ...current, billing: { ...current.billing, ...patch } }));

  const addressReady =
    values.shipping.address1.trim() !== "" &&
    values.shipping.city.trim() !== "" &&
    /^\d{6}$/.test(values.shipping.pin);
  const payable = payableTotal(summary);
  // Delivery is priced on the list price (before tier and coupon), as the backend does.
  const freeShipping = summary.listSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingText = addressReady
    ? freeShipping
      ? "Free"
      : "Calculated at payment"
    : "Enter shipping address";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      // Wait for the error state to render so the first invalid field exists to focus.
      setTimeout(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 0);
      return;
    }

    setPaying(true);
    try {
      const result = await cartApi.checkout(values, mode);
      rememberNotice(result.status === "unavailable" ? undefined : result.notice);
      if (result.status === "redirect") {
        // Leaving for the gateway: keep the button disabled until the page changes.
        leaving.current = true;
        window.location.assign(result.url);
        return;
      }
      if (result.status === "placed") {
        leaving.current = true;
        router.push(`/order/${result.order.id}/confirmed?t=${encodeURIComponent(result.orderToken)}`);
        if (!isBuyNow) clearCart();
        return;
      }
      setNotice(result.message);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
    setPaying(false);
  };

  return (
    <div className="min-h-screen bg-card font-system text-[14px] leading-[1.35] text-ck-text">
      <CheckoutHeader />

      <SummaryToggleBar
        total={payable}
        open={summaryOpen}
        onToggle={() => setSummaryOpen((open) => !open)}
        className="md:hidden"
      />
      {summaryOpen && (
        <div className="border-b border-ck-border bg-ck-surface px-3.5 py-5 md:hidden">
          <OrderSummary lines={lines} summary={summary} shippingText={shippingText} coupon={coupon} />
        </div>
      )}

      <div className="mx-auto grid min-h-[calc(100vh-90px)] max-w-[1008px] px-3.5 md:grid-cols-[minmax(0,540px)_minmax(0,440px)]">
        <form
          ref={formRef}
          noValidate
          onSubmit={onSubmit}
          className="pb-[30px] pt-5 md:pr-10 md:pt-10"
        >
          <section>
            <div className="mb-3.5 flex items-baseline justify-between">
              <h2 className={h2Class}>Contact</h2>
              <Link href="/account/login" className="text-ck-accent underline">
                Sign in
              </Link>
            </div>
            <TextField
              label="Email"
              name="contact"
              autoComplete="email"
              icon="help"
              value={values.contact}
              error={errors.contact}
              onChange={(contact) => setValues((current) => ({ ...current, contact }))}
            />
            <div className="mt-[9px]">
              <CheckboxRow
                label="Email me with news and offers"
                checked={values.emailOffers}
                onChange={(emailOffers) => setValues((current) => ({ ...current, emailOffers }))}
              />
            </div>
          </section>

          <section className="mt-[33px]">
            <h2 className={cn(h2Class, "mb-3.5")}>Delivery</h2>
            <AddressFields
              idPrefix="shipping"
              values={values.shipping}
              errors={errors.shipping}
              onChange={patchShipping}
            />
            <div className="mt-2.5 grid gap-2.5">
              <CheckboxRow
                label="Save this information for next time"
                checked={values.saveInfo}
                onChange={(saveInfo) => setValues((current) => ({ ...current, saveInfo }))}
              />
              <CheckboxRow
                label="Text me with news and offers"
                checked={values.textOffers}
                onChange={(textOffers) => setValues((current) => ({ ...current, textOffers }))}
              />
            </div>
          </section>

          <section className="mt-6">
            <h3 className={cn(h3Class, "mb-3.5")}>Shipping method</h3>
            {addressReady ? (
              <div className="rounded-sm border border-ck-border">
                <RadioRow name="shipping-method" value="standard" checked onChange={() => {}} className="rounded-sm font-normal">
                  <span>Standard shipping</span>
                  <span className="ml-auto font-semibold">{freeShipping ? "Free" : "Calculated at payment"}</span>
                </RadioRow>
              </div>
            ) : (
              <div className="rounded-sm bg-ck-surface px-3.5 py-4 text-center text-ck-muted">
                Enter your shipping address to view available shipping methods.
              </div>
            )}
          </section>

          <section className="mt-[31px]">
            <h2 className={h2Class}>Payment</h2>
            <p className="mb-3.5 mt-1 text-ck-muted">All transactions are secure and encrypted.</p>
            <div className="divide-y divide-ck-border overflow-hidden rounded-sm border border-ck-border">
              {paymentOptions.map((option) => {
                const selected = values.payment === option.id;
                return (
                  <div key={option.id}>
                    <RadioRow
                      name="payment"
                      value={option.id}
                      checked={selected}
                      onChange={() => setValues((current) => ({ ...current, payment: option.id }))}
                    >
                      <span className="max-w-[280px] leading-[1.35]">{option.label}</span>
                      <PaymentLogos count={3} extra={option.extra} />
                    </RadioRow>
                    {selected && (
                      <p className="border-t border-ck-border bg-ck-surface px-3.5 py-3.5 text-center">
                        {option.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-[30px]">
            <h3 className={cn(h3Class, "mb-3.5")}>Billing address</h3>
            <div className="divide-y divide-ck-border overflow-hidden rounded-sm border border-ck-border">
              <RadioRow
                name="billing"
                value="same"
                checked={values.billingSame}
                onChange={() => setValues((current) => ({ ...current, billingSame: true }))}
              >
                Same as shipping address
              </RadioRow>
              <RadioRow
                name="billing"
                value="different"
                checked={!values.billingSame}
                onChange={() => setValues((current) => ({ ...current, billingSame: false }))}
              >
                Use a different billing address
              </RadioRow>
            </div>
            {!values.billingSame && (
              <div className="mt-2.5">
                <AddressFields
                  idPrefix="billing"
                  values={values.billing}
                  errors={errors.billing}
                  onChange={patchBilling}
                  withPhone={false}
                />
              </div>
            )}
          </section>

          <div className="mt-6 md:hidden">
            {discountOpen ? (
              <OrderSummary lines={lines} summary={summary} shippingText={shippingText} coupon={coupon} />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setDiscountOpen(true)}
                  className="inline-flex items-center gap-2 rounded-sm border border-ck-border bg-card px-3.5 py-[11px] font-system text-[14px] font-semibold leading-[normal]"
                >
                  <Tag size={14} strokeWidth={1.8} aria-hidden /> Add discount
                </button>
                <div className="mt-4 flex items-center gap-3">
                  <Image
                    src={lines[0].image}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-sm object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-system text-[20px] font-semibold leading-6">Total</p>
                    <p className="text-ck-muted-soft">
                      {summary.itemCount} {summary.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <span className="text-[12px] text-ck-muted-soft">INR</span>
                  <strong className="text-[20px] font-semibold">{formatMoney(payable)}</strong>
                </div>
              </>
            )}
          </div>

          {notice && (
            <div role="alert" className="mt-6 rounded-sm bg-ck-surface px-3.5 py-3.5 text-ck-muted">
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={paying}
            className="mt-[38px] block h-[49.6px] w-full rounded-sm bg-ck-accent px-3.5 font-system text-[14px] font-semibold leading-[normal] text-card disabled:opacity-70 max-md:mt-5"
          >
            {paying ? "Processing…" : "Pay now"}
          </button>

          <CheckoutFooterLinks className="mt-[72px] max-md:mt-6" />
        </form>

        <aside className="hidden border-l border-ck-border py-10 pl-10 md:block">
          <OrderSummary lines={lines} summary={summary} shippingText={shippingText} coupon={coupon} />
        </aside>
      </div>
    </div>
  );
}
