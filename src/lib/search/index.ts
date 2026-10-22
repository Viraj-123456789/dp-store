import "server-only";

import { fetchSearch } from "@/lib/medusa/search";

export type { SearchResults } from "@/types/content";

/** Full results for the search page: matching products and journal articles, searched by the backend. */
export const searchCatalog = fetchSearch;
