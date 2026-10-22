import type { AccountSession, Order, SavedAddress } from "@/types/account";

// Browser-side calls to the storefront's own /api/auth* and /api/account* routes.

export type AddressDraft = Omit<SavedAddress, "id">;

export class AccountApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, method = "GET", body?: object): Promise<T> {
  const response = await fetch(path, {
    method,
    ...(body
      ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      : {}),
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : "Something went wrong. Please try again.";
    throw new AccountApiError(message, response.status);
  }
  return data as T;
}

export const accountApi = {
  /** The signed-in customer, or null when signed out. */
  async session(): Promise<AccountSession | null> {
    try {
      return await request<AccountSession | null>("/api/account");
    } catch (error) {
      if (error instanceof AccountApiError && error.status === 401) return null;
      throw error;
    }
  },
  requestOtp: (phone: string) =>
    request<{ resendInSeconds: number; devCode?: string }>("/api/auth/otp", "POST", { phone }),
  verifyOtp: (phone: string, code: string) =>
    request<AccountSession>("/api/auth/verify", "POST", { phone, code }),
  signOut: () => request<{ signedOut: boolean }>("/api/auth/logout", "POST", {}),
  updateProfile: (patch: Partial<Pick<AccountSession, "firstName" | "lastName" | "email">>) =>
    request<AccountSession>("/api/account", "PATCH", patch),
  addresses: () => request<SavedAddress[]>("/api/account/addresses"),
  createAddress: (address: AddressDraft) =>
    request<SavedAddress>("/api/account/addresses", "POST", address),
  updateAddress: (id: string, address: AddressDraft) =>
    request<SavedAddress>(`/api/account/addresses/${encodeURIComponent(id)}`, "PATCH", address),
  deleteAddress: (id: string) =>
    request<SavedAddress[]>(`/api/account/addresses/${encodeURIComponent(id)}`, "DELETE"),
  orders: () => request<Order[]>("/api/account/orders"),
};
