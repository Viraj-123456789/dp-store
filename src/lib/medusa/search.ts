import "server-only";

import type { SearchResults } from "@/types/content";

import { dpFetch } from "./dp";

/** The backend caps a response at this many products; the catalogue is far smaller. */
const MAX_RESULTS = 50;

const EMPTY: SearchResults = { products: [], articles: [] };

/** GET /store/dp/search?q=: matching products and journal articles. */
export async function fetchSearch(query: string): Promise<SearchResults> {
  if (!query.trim()) return EMPTY;
  const result = await dpFetch<SearchResults>("/search", {
    query: { q: query, limit: MAX_RESULTS },
    tags: ["products", "content"],
    revalidate: 60,
  });
  return result ?? EMPTY;
}
