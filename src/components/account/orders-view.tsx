"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import type { Order } from "@/types/account";

import { AccountCard } from "./account-shell";
import { useOrders } from "./hooks";

const statusLabel: Record<Order["status"], string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrdersView() {
  const orders = useOrders();

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-[60px] text-center text-muted-foreground">
        <div className="text-[44px]">📦</div>
        <p className="my-3">You haven&apos;t placed any orders yet</p>
        <Link href="/collections/all" className={buttonVariants()}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3.5">
      {orders.map((order) => (
        <AccountCard
          key={order.id}
          title={`Order ${order.number}`}
          action={<Badge tone="save">{statusLabel[order.status]}</Badge>}
        >
          <p className="mb-3 text-sm text-muted-foreground">
            Placed {new Date(order.placedAt).toLocaleDateString("en-IN", { dateStyle: "long" })} ·{" "}
            <b className="font-heading text-foreground">{formatMoney(order.total, order.currency)}</b>
          </p>
          <ul className="grid gap-2.5">
            {order.lines.map((line) => (
              <li key={`${order.id}-${line.title}-${line.variantTitle}`} className="flex items-center gap-3">
                <Image
                  src={line.image}
                  alt=""
                  width={52}
                  height={52}
                  className="size-[52px] rounded-sm border border-border bg-card object-cover"
                />
                <span className="flex-1 text-sm">
                  {line.title}
                  {line.variantTitle && <small className="block text-muted-foreground">{line.variantTitle}</small>}
                </span>
                <span className="text-sm text-muted-foreground">× {line.quantity}</span>
              </li>
            ))}
          </ul>
        </AccountCard>
      ))}
    </div>
  );
}
