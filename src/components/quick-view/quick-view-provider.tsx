"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { fetchQuickView } from "@/lib/quick-view/client";
import { cn, formatMoneyCompact } from "@/lib/utils";
import type { QuickViewItem } from "@/types/quick-view";

interface QuickViewContextValue {
  openQuickView: (handle: string) => void;
}

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

/** Share of the MRP saved, rounded to the nearest whole percent. */
function percentOff(price: number, mrp: number) {
  return mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
}

function QuickViewModal({ item, onClose }: { item: QuickViewItem; onClose: () => void }) {
  const { addLine } = useCart();
  const pct = item.compareAtPrice ? percentOff(item.price, item.compareAtPrice) : 0;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <div aria-hidden onClick={onClose} className="fixed inset-0 z-80 bg-foreground/45 backdrop-blur-[3px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="fixed left-1/2 top-1/2 z-90 max-h-[88vh] w-[min(920px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-4xl bg-background shadow-elevated"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-5 grid size-10 place-items-center rounded-full border border-border bg-card text-[17px] leading-[normal] text-foreground transition hover:bg-primary hover:text-primary-foreground"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square min-h-[260px] self-stretch bg-secondary">
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 460px, (min-width: 760px) 50vw, 94vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-[11px] px-[22px] py-6 md:p-9">
            <h2 className="font-heading text-[22px]">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{item.description}</p>

            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-heading text-[26px] font-extrabold text-foreground">
                {formatMoneyCompact(item.price, item.currency)}
              </span>
              {pct > 0 && item.compareAtPrice && (
                <>
                  <span className="font-medium text-subtle line-through">
                    {`MRP ${formatMoneyCompact(item.compareAtPrice, item.currency)}`}
                  </span>
                  <span className="font-bold text-accent">{pct}% off</span>
                </>
              )}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!item.available}
                onClick={() => {
                  // A refused or trimmed add leaves the modal open so its message stays in context.
                  if (addLine(item.line, 1) === "added") onClose();
                }}
                className={cn(buttonVariants(), "flex-1")}
              >
                {item.available ? "Add to Cart" : "Sold out"}
              </button>
              <Link
                href={`/products/${item.handle}`}
                onClick={onClose}
                className={buttonVariants({ variant: "outline" })}
              >
                Full Details
              </Link>
            </div>

            <div className="mt-2 text-[12.5px] text-muted-foreground">
              ✓ Free delivery · ✓ COD available · ✓ Easy returns
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [item, setItem] = useState<QuickViewItem | null>(null);
  const latestRequest = useRef(0);

  const close = useCallback(() => {
    latestRequest.current += 1;
    setItem(null);
  }, []);

  const openQuickView = useCallback(
    async (handle: string) => {
      latestRequest.current += 1;
      const request = latestRequest.current;
      try {
        const loaded = await fetchQuickView(handle);
        // Ignore a slow response that was superseded or closed meanwhile.
        if (request === latestRequest.current) setItem(loaded);
      } catch {
        // Without quick-view content the product page is the next best thing.
        router.push(`/products/${handle}`);
      }
    },
    [router],
  );

  const value = useMemo(() => ({ openQuickView }), [openQuickView]);

  return (
    <QuickViewContext value={value}>
      {children}
      {item && <QuickViewModal item={item} onClose={close} />}
    </QuickViewContext>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) throw new Error("useQuickView must be used inside QuickViewProvider");
  return context;
}
