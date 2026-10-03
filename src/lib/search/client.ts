import type { CdnImage } from "@/types/home";

export interface Suggestion {
  handle: string;
  title: string;
  image: CdnImage;
  price: number;
  mrp: number;
  currency: string;
}

export interface SuggestionResponse {
  total: number;
  products: Suggestion[];
}

/** Fetches live search suggestions (kept here so components never call fetch directly). */
export async function fetchSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<SuggestionResponse> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) throw new Error("Search request failed");
  return (await response.json()) as SuggestionResponse;
}
