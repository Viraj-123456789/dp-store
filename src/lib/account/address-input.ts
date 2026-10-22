import "server-only";

import type { AddressInput } from "@/lib/medusa/account";

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** Picks the address fields out of an untrusted request body. */
export function toAddressInput(value: Record<string, unknown> | null): AddressInput {
  return {
    firstName: text(value?.firstName),
    lastName: text(value?.lastName),
    address1: text(value?.address1),
    address2: text(value?.address2),
    city: text(value?.city),
    state: text(value?.state),
    pin: text(value?.pin),
    phone: text(value?.phone),
    isDefault: value?.isDefault === true,
  };
}
