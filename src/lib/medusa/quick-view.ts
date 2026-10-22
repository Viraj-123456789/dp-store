import "server-only";

import type { QuickViewItem } from "@/types/quick-view";

import { dpFetch } from "./dp";

/** GET /store/dp/quick-view/:handle */
export function fetchQuickViewItem(handle: string): Promise<QuickViewItem | null> {
  return dpFetch<QuickViewItem>(`/quick-view/${encodeURIComponent(handle)}`, {
    tags: ["products"],
    revalidate: 60,
  });
}
