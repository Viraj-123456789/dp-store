import { createStore } from "@/lib/cart/storage";
import type { AccountSession, Order, SavedAddress } from "@/types/account";

const EMPTY_ADDRESSES: SavedAddress[] = [];
const EMPTY_ORDERS: Order[] = [];

/**
 * Local stand-ins for the customer API. Replace these stores with Medusa customer
 * calls (src/lib/medusa) once authentication is available on the backend.
 */
export const sessionStore = createStore<AccountSession | null>("dp-account", null, (raw) => {
  const parsed: unknown = JSON.parse(raw);
  return parsed && typeof parsed === "object" ? (parsed as AccountSession) : null;
});

export const addressStore = createStore<SavedAddress[]>("dp-addresses", EMPTY_ADDRESSES, (raw) => {
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as SavedAddress[]) : EMPTY_ADDRESSES;
});

export const orderStore = createStore<Order[]>("dp-orders", EMPTY_ORDERS, (raw) => {
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as Order[]) : EMPTY_ORDERS;
});

export function signIn(email: string) {
  const existing = sessionStore.getSnapshot();
  sessionStore.write(
    existing?.email === email
      ? existing
      : { email, firstName: "", lastName: "", phone: "" },
  );
}

export function updateProfile(patch: Partial<Pick<AccountSession, "firstName" | "lastName" | "phone">>) {
  const current = sessionStore.getSnapshot();
  if (current) sessionStore.write({ ...current, ...patch });
}

/** Newest order first. */
export function addOrder(order: Order) {
  orderStore.write([order, ...orderStore.getSnapshot().filter((item) => item.id !== order.id)]);
}

export function signOut() {
  sessionStore.write(null);
}

export function saveAddress(address: Omit<SavedAddress, "id"> & { id?: string }) {
  const current = addressStore.getSnapshot();
  const id = address.id ?? `addr_${Date.now().toString(36)}`;
  const index = current.findIndex((item) => item.id === id);
  const isOnlyAddress = current.length === 0 || (current.length === 1 && index === 0);
  const makeDefault = address.isDefault || isOnlyAddress;
  const next: SavedAddress = { ...address, id, isDefault: makeDefault };
  const others = current
    .filter((item) => item.id !== id)
    .map((item) => (makeDefault ? { ...item, isDefault: false } : item));

  addressStore.write(
    index >= 0
      ? [...others.slice(0, index), next, ...others.slice(index)]
      : [...others, next],
  );
}

export function removeAddress(id: string) {
  const remaining = addressStore.getSnapshot().filter((item) => item.id !== id);
  if (remaining.length > 0 && !remaining.some((item) => item.isDefault)) {
    remaining[0] = { ...remaining[0], isDefault: true };
  }
  addressStore.write(remaining.length > 0 ? remaining : null);
}

export function setDefaultAddress(id: string) {
  addressStore.write(
    addressStore.getSnapshot().map((item) => ({ ...item, isDefault: item.id === id })),
  );
}
