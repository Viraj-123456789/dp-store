"use client";

import { useSyncExternalStore } from "react";

import { addressStore, orderStore, sessionStore } from "@/lib/account/storage";

const subscribeNothing = () => () => {};

/** True once client-side storage can be read (false while rendering on the server). */
export function useHydrated() {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

export function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot, () => sessionStore.empty);
}

export function useAddresses() {
  return useSyncExternalStore(addressStore.subscribe, addressStore.getSnapshot, () => addressStore.empty);
}

export function useOrders() {
  return useSyncExternalStore(orderStore.subscribe, orderStore.getSnapshot, () => orderStore.empty);
}
