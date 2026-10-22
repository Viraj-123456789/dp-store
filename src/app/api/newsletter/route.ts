import { FetchError } from "@medusajs/js-sdk";

import { guarded, json, readJson } from "@/lib/cart/server";
import { subscribeToNewsletter } from "@/lib/medusa/content";

/** POST /api/newsletter { email }: { subscribed: true }. */
export function POST(request: Request) {
  return guarded(async () => {
    const body = await readJson(request);
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email) return json({ error: "Enter your email address." }, 400);

    try {
      await subscribeToNewsletter(email, "home-footer");
    } catch (error) {
      if (error instanceof FetchError && error.status === 429) {
        return json({ error: "Too many attempts. Please try again in a little while." }, 429);
      }
      throw error;
    }
    return json({ subscribed: true });
  });
}
