"use client";

import { INDIAN_STATES } from "@/lib/data/india";
import type { AddressErrors, AddressValues } from "@/lib/checkout/validation";

import { SelectField, TextField } from "./fields";

interface AddressFieldsProps {
  idPrefix: string;
  values: AddressValues;
  errors: AddressErrors;
  onChange: (patch: Partial<AddressValues>) => void;
  withPhone?: boolean;
}

/** Country, name, address, city/state/PIN and phone fields shared by shipping and billing. */
export function AddressFields({ idPrefix, values, errors, onChange, withPhone = true }: AddressFieldsProps) {
  return (
    <div className="grid gap-2.5">
      <SelectField label="Country/Region" name={`${idPrefix}-country`} value="India" options={["India"]} onChange={() => {}} />
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        <TextField
          label="First name"
          name={`${idPrefix}-firstName`}
          autoComplete="given-name"
          value={values.firstName}
          onChange={(firstName) => onChange({ firstName })}
        />
        <TextField
          label="Last name"
          name={`${idPrefix}-lastName`}
          autoComplete="family-name"
          value={values.lastName}
          error={errors.lastName}
          onChange={(lastName) => onChange({ lastName })}
        />
      </div>
      <TextField
        label="Address"
        name={`${idPrefix}-address1`}
        autoComplete="address-line1"
        icon="search"
        value={values.address1}
        error={errors.address1}
        onChange={(address1) => onChange({ address1 })}
      />
      <TextField
        label="Apartment, suite, etc. (optional)"
        name={`${idPrefix}-address2`}
        autoComplete="address-line2"
        value={values.address2}
        onChange={(address2) => onChange({ address2 })}
      />
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        <TextField
          label="City"
          name={`${idPrefix}-city`}
          autoComplete="address-level2"
          value={values.city}
          error={errors.city}
          onChange={(city) => onChange({ city })}
        />
        <SelectField
          label="State"
          name={`${idPrefix}-state`}
          value={values.state}
          options={INDIAN_STATES}
          onChange={(state) => onChange({ state })}
        />
        <TextField
          label="PIN code"
          name={`${idPrefix}-pin`}
          autoComplete="postal-code"
          inputMode="numeric"
          value={values.pin}
          error={errors.pin}
          onChange={(pin) => onChange({ pin: pin.replace(/\D/g, "").slice(0, 6) })}
        />
      </div>
      {withPhone && (
        <TextField
          label="Phone"
          name={`${idPrefix}-phone`}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          icon="help"
          value={values.phone}
          error={errors.phone}
          onChange={(phone) => onChange({ phone })}
        />
      )}
    </div>
  );
}
