"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface SearchContextValue {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo<SearchContextValue>(
    () => ({
      open,
      openSearch: () => setOpen(true),
      closeSearch: () => setOpen(false),
    }),
    [open],
  );

  return <SearchContext value={value}>{children}</SearchContext>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used inside SearchProvider");
  return context;
}
