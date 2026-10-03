"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cdn } from "@/lib/cdn";
import { fetchSuggestions, type SuggestionResponse } from "@/lib/search/client";
import { cn, formatMoney } from "@/lib/utils";

import { useSearch } from "./search-provider";

const DEBOUNCE_MS = 200;

interface Resolved {
  query: string;
  response: SuggestionResponse;
}

export function SearchOverlay() {
  const { open, closeSearch, openSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = query.trim();

  // "/" opens search from anywhere that isn't a text field; Escape closes it.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeSearch, openSearch]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchSuggestions(trimmed, controller.signal)
        .then((response) => setResolved({ query: trimmed, response }))
        .catch(() => undefined);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  const current = trimmed && resolved?.query === trimmed ? resolved.response : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      inert={!open}
      className={cn(
        "fixed inset-0 z-100 overflow-auto bg-background/98",
        open ? "block" : "hidden",
      )}
    >
      <div className="sticky top-0 z-5 border-b border-border bg-background pb-3 pt-[18px]">
        <Container>
          <div className="flex items-center gap-2.5 rounded-pill border-2 border-primary bg-card py-1 pl-[18px] pr-1.5">
            <Search aria-hidden size={20} strokeWidth={2} />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, concerns…"
              autoComplete="off"
              aria-label="Search"
              className="min-w-0 flex-1 bg-transparent py-[11px] font-sans text-[16px] leading-[normal] outline-none"
            />
            <Button variant="outline" onClick={closeSearch}>
              Close
            </Button>
          </div>
          {/* Reserved row for quick-filter chips, kept to match the reference height */}
          <div aria-hidden className="mt-3 pb-1" />
        </Container>
      </div>

      <Container className="pb-[60px]">
        {current && (
          <>
            <div className="mb-3.5 text-[13px] text-muted-foreground">
              {`${current.total} ${current.total === 1 ? "product" : "products"} for “${trimmed}”`}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-[18px] xl:grid-cols-4 xl:gap-[22px]">
              {current.products.length === 0 && (
                <p className="col-span-full text-muted-foreground">
                  No products found — try “aloe”, “hair fall”, “oil”…
                </p>
              )}
              {current.products.map((product) => (
                <div
                  key={product.handle}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition duration-[250ms] hover:-translate-y-1 hover:border-transparent hover:shadow-elevated"
                >
                  <Link
                    href={`/products/${product.handle}`}
                    onClick={closeSearch}
                    className="relative block aspect-square overflow-hidden bg-secondary"
                  >
                    <Image
                      src={cdn(product.image.src)}
                      alt=""
                      fill
                      sizes="(min-width: 1080px) 282px, (min-width: 760px) 33vw, 50vw"
                      className="object-cover transition duration-[400ms] group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col gap-1.5 px-3.5 pb-3.5 pt-3">
                    <h3 className="font-heading text-[14.5px] font-[650] leading-[1.3] hover:text-primary">
                      <Link href={`/products/${product.handle}`} onClick={closeSearch}>
                        {product.title}
                      </Link>
                    </h3>
                    <div className="mt-auto flex flex-wrap items-baseline gap-2">
                      <span className="font-heading text-[17px] font-extrabold">
                        {formatMoney(product.price, product.currency)}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-[12.5px] font-medium text-subtle line-through">
                          {formatMoney(product.mrp, product.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-span-full p-2.5 text-center">
                <Link
                  href={`/search?q=${encodeURIComponent(trimmed)}`}
                  onClick={closeSearch}
                  className={buttonVariants({ variant: "outline" })}
                >
                  See all results
                </Link>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
