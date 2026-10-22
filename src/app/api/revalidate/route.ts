import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { CACHE_TAGS, type CacheTag } from "@/lib/medusa/dp";

const isCacheTag = (value: unknown): value is CacheTag =>
  typeof value === "string" && (CACHE_TAGS as readonly string[]).includes(value);

function secretMatches(received: string | null, expected: string) {
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Called by the Medusa backend (storefront-revalidate subscriber) after Admin changes
 * products, categories or stock, so cached catalogue pages refresh at once.
 * Body: { tags: ["products", "collections"] }. Header: x-revalidate-secret.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Revalidation is not configured" }, { status: 503 });
  }
  if (!secretMatches(request.headers.get("x-revalidate-secret"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const requested =
    typeof body === "object" && body !== null && "tags" in body && Array.isArray(body.tags)
      ? body.tags
      : [];
  const tags = requested.filter(isCacheTag);
  if (tags.length === 0) {
    return NextResponse.json({ error: "No valid tags" }, { status: 400 });
  }

  // The webhook cannot use updateTag, so expire immediately: the next request refetches.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: tags });
}
