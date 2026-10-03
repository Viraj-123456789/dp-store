"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { updateProfile } from "@/lib/account/storage";
import { formatMoney } from "@/lib/utils";

import { AddressSummary } from "./address-card";
import { AccountCard } from "./account-shell";
import { FormField } from "./form-field";
import { useAddresses, useOrders, useSession } from "./hooks";

const helpLinks = [
  { label: "Shipping policy", href: "/policies/shipping-policy" },
  { label: "Refund policy", href: "/policies/refund-policy" },
  { label: "Contact us", href: "/pages/contact" },
];

const cardLinkClass = "font-heading text-[13px] font-bold text-primary hover:text-primary-hover";

function ProfileCard() {
  const session = useSession();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ firstName: "", lastName: "", phone: "" });

  if (!session) return null;
  const name = `${session.firstName} ${session.lastName}`.trim();

  return (
    <AccountCard
      title="Profile"
      action={
        !editing && (
          <button
            type="button"
            onClick={() => {
              setDraft({ firstName: session.firstName, lastName: session.lastName, phone: session.phone });
              setEditing(true);
            }}
            className={cardLinkClass}
          >
            Edit
          </button>
        )
      }
    >
      {editing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateProfile(draft);
            setEditing(false);
          }}
          className="grid gap-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              label="First name"
              value={draft.firstName}
              autoComplete="given-name"
              onValueChange={(firstName) => setDraft((d) => ({ ...d, firstName }))}
            />
            <FormField
              label="Last name"
              value={draft.lastName}
              autoComplete="family-name"
              onValueChange={(lastName) => setDraft((d) => ({ ...d, lastName }))}
            />
          </div>
          <FormField
            label="Phone"
            type="tel"
            value={draft.phone}
            autoComplete="tel"
            onValueChange={(phone) => setDraft((d) => ({ ...d, phone }))}
          />
          <div className="flex gap-2.5">
            <Button type="submit" size="sm">
              Save changes
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[12.5px] text-muted-foreground">Name</dt>
            <dd>{name || "Not added yet"}</dd>
          </div>
          <div>
            <dt className="text-[12.5px] text-muted-foreground">Email</dt>
            <dd>{session.email}</dd>
          </div>
          <div>
            <dt className="text-[12.5px] text-muted-foreground">Phone</dt>
            <dd>{session.phone || "Not added yet"}</dd>
          </div>
        </dl>
      )}
    </AccountCard>
  );
}

export function DashboardView() {
  const orders = useOrders();
  const addresses = useAddresses();
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const latest = orders[0];

  return (
    <div className="grid gap-3.5 md:grid-cols-2">
      <ProfileCard />

      <AccountCard
        title="Recent orders"
        action={
          <Link href="/account/orders" className={cardLinkClass}>
            View all →
          </Link>
        }
      >
        {latest ? (
          <div className="text-sm">
            <b className="font-heading">Order {latest.number}</b>
            <p className="text-muted-foreground">
              {new Date(latest.placedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })} ·{" "}
              {formatMoney(latest.total, latest.currency)}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3.5 text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <Link href="/collections/all" className={buttonVariants({ size: "sm" })}>
              Start shopping
            </Link>
          </>
        )}
      </AccountCard>

      <AccountCard
        title="Default address"
        action={
          <Link href="/account/addresses" className={cardLinkClass}>
            {defaultAddress ? "Manage →" : "Add one →"}
          </Link>
        }
      >
        {defaultAddress ? (
          <AddressSummary address={defaultAddress} />
        ) : (
          <p className="text-sm text-muted-foreground">No address saved yet.</p>
        )}
      </AccountCard>

      <AccountCard title="Need help?">
        <ul className="grid gap-1.5 text-sm">
          {helpLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="font-semibold text-primary hover:text-primary-hover">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </AccountCard>
    </div>
  );
}
