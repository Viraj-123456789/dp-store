import type { QuickViewItem } from "@/types/quick-view";

/** Fetches a product's quick-view content (kept here so components never call fetch directly). */
export async function fetchQuickView(handle: string): Promise<QuickViewItem> {
  const response = await fetch(`/api/quick-view/${encodeURIComponent(handle)}`);
  if (!response.ok) throw new Error("Quick view request failed");
  return (await response.json()) as QuickViewItem;
}
