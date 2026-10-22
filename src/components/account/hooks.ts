"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type AddressDraft, accountApi } from "@/lib/account/client";
import type { AccountSession, Order, SavedAddress } from "@/types/account";

const SESSION_KEY = ["account", "session"] as const;
const ADDRESSES_KEY = ["account", "addresses"] as const;
const ORDERS_KEY = ["account", "orders"] as const;

const NO_ADDRESSES: SavedAddress[] = [];
const NO_ORDERS: Order[] = [];

/** The signed-in customer (null when signed out); `ready` is false until the first answer. */
export function useSession() {
  const query = useQuery({
    queryKey: SESSION_KEY,
    queryFn: accountApi.session,
    staleTime: 5 * 60 * 1000,
  });
  return { session: query.data ?? null, ready: query.isSuccess || query.isError };
}

export function useAddresses() {
  const { session } = useSession();
  const query = useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: accountApi.addresses,
    enabled: session !== null,
  });
  return { addresses: query.data ?? NO_ADDRESSES, ready: query.isSuccess };
}

export function useOrders() {
  const { session } = useSession();
  const query = useQuery({
    queryKey: ORDERS_KEY,
    queryFn: accountApi.orders,
    enabled: session !== null,
  });
  return { orders: query.data ?? NO_ORDERS, ready: query.isSuccess };
}

/** Mutations for the account screens; each refreshes whatever it changed. */
export function useAccountActions() {
  const client = useQueryClient();

  const verifyOtp = useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      accountApi.verifyOtp(phone, code),
    onSuccess: (session) => {
      client.setQueryData<AccountSession | null>(SESSION_KEY, session);
      void client.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const signOut = useMutation({
    mutationFn: accountApi.signOut,
    onSuccess: () => {
      client.setQueryData<AccountSession | null>(SESSION_KEY, null);
      client.removeQueries({ queryKey: ADDRESSES_KEY });
      client.removeQueries({ queryKey: ORDERS_KEY });
    },
  });

  const updateProfile = useMutation({
    mutationFn: accountApi.updateProfile,
    onSuccess: (session) => client.setQueryData<AccountSession | null>(SESSION_KEY, session),
  });

  const refreshAddresses = () => client.invalidateQueries({ queryKey: ADDRESSES_KEY });

  const saveAddress = useMutation({
    mutationFn: ({ id, address }: { id?: string; address: AddressDraft }) =>
      id ? accountApi.updateAddress(id, address) : accountApi.createAddress(address),
    onSuccess: refreshAddresses,
  });

  const removeAddress = useMutation({
    mutationFn: accountApi.deleteAddress,
    onSuccess: (remaining) => client.setQueryData<SavedAddress[]>(ADDRESSES_KEY, remaining),
  });

  const setDefaultAddress = useMutation({
    mutationFn: (address: SavedAddress) => {
      const { id, ...rest } = address;
      return accountApi.updateAddress(id, { ...rest, isDefault: true });
    },
    onSuccess: refreshAddresses,
  });

  return { verifyOtp, signOut, updateProfile, saveAddress, removeAddress, setDefaultAddress };
}
