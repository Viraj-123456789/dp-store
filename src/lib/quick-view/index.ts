import { fetchQuickViewItem } from "@/lib/medusa/quick-view";
import type { QuickViewItem } from "@/types/quick-view";

/** A product's quick-view content (first variant, first image), or null when it does not exist. */
export async function getQuickViewItem(handle: string): Promise<QuickViewItem | null> {
  return fetchQuickViewItem(handle);
}
