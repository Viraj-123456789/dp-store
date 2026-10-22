import "server-only";

import { headers } from "next/headers";

/**
 * Headers that tell the backend which visitor a server-side call is for, so its per-visitor
 * rate limits count the visitor rather than this server. The shared secret proves the header is
 * ours; without STOREFRONT_API_SECRET nothing is sent and the backend sees this server's address.
 */
export async function visitorHeaders(): Promise<Record<string, string>> {
  const secret = process.env.STOREFRONT_API_SECRET;
  if (!secret) return {};

  const incoming = await headers();
  const address =
    incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || incoming.get("x-real-ip") || "";
  return address ? { "x-dp-client-ip": address, "x-dp-client-secret": secret } : {};
}
