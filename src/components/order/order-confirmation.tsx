"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useHydrated, useOrders } from "@/components/account/hooks";
import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { CheckoutFooterLinks } from "@/components/checkout/footer-links";
import { SummaryItem, SummaryToggleBar } from "@/components/checkout/order-summary";
import { formatMoney } from "@/lib/utils";
import type { Order, OrderAddress } from "@/types/account";

const h2Class = "font-system text-[20px] font-semibold leading-6";
const primaryButtonClass =
  "grid h-[49.6px] place-items-center rounded-sm bg-ck-accent px-6 font-system text-[14px] font-semibold leading-[normal] text-card";
const secondaryButtonClass =
  "grid h-[49.6px] place-items-center rounded-sm bg-ck-button-surface px-6 font-system text-[14px] font-semibold leading-[normal] text-ck-text shadow-[inset_0_0_0_1px_var(--ck-border)]";

function AddressLines({ address }: { address: OrderAddress }) {
  const lines = [
    `${address.firstName} ${address.lastName}`.trim(),
    address.address1,
    address.address2,
    `${address.city}, ${address.state} ${address.pin}`,
    "India",
    address.phone,
  ].filter(Boolean);

  return (
    <>
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-system text-[14px] font-semibold leading-[1.35]">{title}</h3>
      <div className="mt-1 leading-[1.5]">{children}</div>
    </div>
  );
}

function OrderTotals({ order }: { order: Order }) {
  return (
    <div>
      <ul className="grid gap-4">
        {order.lines.map((line) => (
          <SummaryItem
            key={`${line.title}-${line.variantTitle}`}
            image={line.image}
            imageAlt={line.title}
            quantity={line.quantity}
            title={line.title}
            variantTitle={line.variantTitle}
            total={line.unitPrice * line.quantity}
          />
        ))}
      </ul>

      <dl className="mt-[34px] grid gap-[7px] text-[14px]">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatMoney(order.subtotal, order.currency)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd>−{formatMoney(order.discount, order.currency)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{order.shippingTotal === 0 ? "Free" : formatMoney(order.shippingTotal, order.currency)}</dd>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <dt className="text-[18px] font-semibold">Total</dt>
          <dd className="flex items-baseline gap-2">
            <span className="text-[12px] text-ck-muted-soft">{order.currency}</span>
            <strong className="text-[18px] font-semibold">{formatMoney(order.total, order.currency)}</strong>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ConfirmedOrder({ order }: { order: Order }) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const firstName = order.shippingAddress.firstName.trim();
  const sameBilling =
    JSON.stringify({ ...order.billingAddress, phone: "" }) ===
    JSON.stringify({ ...order.shippingAddress, phone: "" });

  return (
    <>
      <SummaryToggleBar
        total={order.total}
        open={summaryOpen}
        onToggle={() => setSummaryOpen((open) => !open)}
        className="md:hidden"
      />
      {summaryOpen && (
        <div className="border-b border-ck-border bg-ck-surface px-3.5 py-5 md:hidden">
          <OrderTotals order={order} />
        </div>
      )}

      <div className="mx-auto grid min-h-[calc(100vh-90px)] max-w-[1008px] px-3.5 md:grid-cols-[minmax(0,540px)_minmax(0,440px)]">
        <div className="pb-[30px] pt-5 md:pr-10 md:pt-10">
          <div className="flex items-center gap-3.5">
            <span className="grid size-[50px] flex-none place-items-center rounded-full border-2 border-ck-accent text-ck-accent">
              <Check aria-hidden size={26} strokeWidth={2} />
            </span>
            <div>
              <p className="text-[13px] text-ck-muted-soft">Confirmation #{order.number}</p>
              <h1 className="font-system text-[26px] font-semibold leading-[1.2]">
                {firstName ? `Thank you, ${firstName}!` : "Thank you!"}
              </h1>
            </div>
          </div>

          <section className="mt-6 rounded-sm border border-ck-border p-[18px]">
            <h2 className="font-system text-[16px] font-semibold leading-[1.2]">Your order is confirmed</h2>
            <p className="mt-1.5 leading-[1.5] text-ck-muted">
              We&apos;ve sent a confirmation to <strong className="font-semibold text-ck-text">{order.email}</strong>.
              You&apos;ll get another email as soon as your order ships.
            </p>
          </section>

          <section className="mt-[22px] rounded-sm border border-ck-border p-[18px]">
            <h2 className={h2Class}>Order details</h2>
            <div className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Detail title="Contact information">{order.email}</Detail>
              <Detail title="Payment method">
                {order.paymentMethod}
                <span className="block text-ck-muted">{formatMoney(order.total, order.currency)}</span>
              </Detail>
              <Detail title="Shipping address">
                <AddressLines address={order.shippingAddress} />
              </Detail>
              <Detail title="Billing address">
                {sameBilling ? "Same as shipping address" : <AddressLines address={order.billingAddress} />}
              </Detail>
              <Detail title="Shipping method">{order.shippingMethod}</Detail>
            </div>
          </section>

          <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Need help?{" "}
              <Link href="/pages/contact" className="text-ck-accent underline">
                Contact us
              </Link>
            </p>
            <Link href="/collections/all" className={primaryButtonClass}>
              Continue shopping
            </Link>
          </div>

          <CheckoutFooterLinks className="mt-[40px] max-md:mt-8" />
        </div>

        <aside className="hidden border-l border-ck-border py-10 pl-10 md:block">
          <OrderTotals order={order} />
        </aside>
      </div>
    </>
  );
}

function OrderNotFound() {
  return (
    <div className="mx-auto max-w-[540px] px-3.5 py-16 text-center">
      <h1 className="font-system text-[26px] font-semibold leading-[1.2]">We couldn&apos;t find that order</h1>
      <p className="mt-2 leading-[1.5] text-ck-muted">
        This order isn&apos;t available on this device. The confirmation email we sent has all of its details.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/account/orders" className={secondaryButtonClass}>
          View your orders
        </Link>
        <Link href="/collections/all" className={primaryButtonClass}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

interface OrderConfirmationProps {
  orderId: string;
  /** Sample order supplied by the page in development; bypasses local storage. */
  previewOrder?: Order;
}

export function OrderConfirmation({ orderId, previewOrder }: OrderConfirmationProps) {
  const hydrated = useHydrated();
  const orders = useOrders();
  const order = previewOrder ?? orders.find((item) => item.id === orderId);

  return (
    <div className="min-h-screen bg-card font-system text-[14px] leading-[1.35] text-ck-text">
      <CheckoutHeader />
      {order ? <ConfirmedOrder order={order} /> : hydrated && <OrderNotFound />}
    </div>
  );
}
