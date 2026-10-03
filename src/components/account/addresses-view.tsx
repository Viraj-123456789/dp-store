"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { removeAddress, saveAddress, setDefaultAddress } from "@/lib/account/storage";
import { validateAddress, type AddressErrors } from "@/lib/checkout/validation";
import { INDIAN_STATES } from "@/lib/data/india";
import type { SavedAddress } from "@/types/account";

import { AddressSummary } from "./address-card";
import { AccountCard } from "./account-shell";
import { FormField, FormSelect } from "./form-field";
import { useAddresses } from "./hooks";

type Draft = Omit<SavedAddress, "id">;

const EMPTY_DRAFT: Draft = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "Gujarat",
  pin: "",
  phone: "",
  isDefault: false,
};

const linkButtonClass = "font-heading text-[13px] font-bold text-primary hover:text-primary-hover";

function AddressForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Draft;
  onCancel: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<AddressErrors>({});
  const patch = (value: Partial<Draft>) => setDraft((current) => ({ ...current, ...value }));

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const nextErrors = validateAddress(draft);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length === 0) onSave(draft);
      }}
      className="grid gap-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="First name" value={draft.firstName} autoComplete="given-name" onValueChange={(firstName) => patch({ firstName })} />
        <FormField label="Last name" value={draft.lastName} error={errors.lastName} autoComplete="family-name" onValueChange={(lastName) => patch({ lastName })} />
      </div>
      <FormField label="Address" value={draft.address1} error={errors.address1} autoComplete="address-line1" onValueChange={(address1) => patch({ address1 })} />
      <FormField label="Apartment, suite, etc. (optional)" value={draft.address2} autoComplete="address-line2" onValueChange={(address2) => patch({ address2 })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <FormField label="City" value={draft.city} error={errors.city} autoComplete="address-level2" onValueChange={(city) => patch({ city })} />
        <FormSelect label="State" value={draft.state} options={INDIAN_STATES} onValueChange={(state) => patch({ state })} />
        <FormField
          label="PIN code"
          value={draft.pin}
          error={errors.pin}
          inputMode="numeric"
          autoComplete="postal-code"
          onValueChange={(pin) => patch({ pin: pin.replace(/\D/g, "").slice(0, 6) })}
        />
      </div>
      <FormField label="Phone" type="tel" value={draft.phone} error={errors.phone} autoComplete="tel" onValueChange={(phone) => patch({ phone })} />
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={draft.isDefault}
          onChange={(event) => patch({ isDefault: event.target.checked })}
          className="size-4 accent-primary"
        />
        Set as default address
      </label>
      <div className="flex gap-2.5">
        <Button type="submit" size="sm">
          Save address
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddressesView() {
  const addresses = useAddresses();
  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null);

  const startAdd = () => setEditing({ draft: EMPTY_DRAFT });
  const startEdit = (address: SavedAddress) => {
    const { id, ...draft } = address;
    setEditing({ id, draft });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {addresses.length === 0
            ? "Save an address to speed up checkout."
            : `${addresses.length} saved ${addresses.length === 1 ? "address" : "addresses"}`}
        </p>
        {!editing && (
          <Button size="sm" onClick={startAdd}>
            Add a new address
          </Button>
        )}
      </div>

      {editing && (
        <AccountCard title={editing.id ? "Edit address" : "New address"} className="mb-3.5">
          <AddressForm
            key={editing.id ?? "new"}
            initial={editing.draft}
            onCancel={() => setEditing(null)}
            onSave={(draft) => {
              saveAddress({ ...draft, id: editing.id });
              setEditing(null);
            }}
          />
        </AccountCard>
      )}

      {addresses.length === 0 && !editing ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-[60px] text-center text-muted-foreground">
          <div className="text-[44px]">📍</div>
          <p className="my-3">No addresses saved yet</p>
          <Button onClick={startAdd}>Add your first address</Button>
        </div>
      ) : (
        <div className="grid gap-3.5 md:grid-cols-2">
          {addresses.map((address) => (
            <AccountCard
              key={address.id}
              title={address.isDefault ? "Default address" : "Address"}
              action={address.isDefault ? <Badge tone="save">Default</Badge> : undefined}
            >
              <AddressSummary address={address} />
              <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5">
                <button type="button" className={linkButtonClass} onClick={() => startEdit(address)}>
                  Edit
                </button>
                {!address.isDefault && (
                  <button type="button" className={linkButtonClass} onClick={() => setDefaultAddress(address.id)}>
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  className="font-heading text-[13px] font-bold text-destructive"
                  onClick={() => removeAddress(address.id)}
                >
                  Delete
                </button>
              </div>
            </AccountCard>
          ))}
        </div>
      )}
    </div>
  );
}
