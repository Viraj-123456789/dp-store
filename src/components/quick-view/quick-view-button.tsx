"use client";

import { useQuickView } from "./quick-view-provider";

interface QuickViewButtonProps {
  handle: string;
  title: string;
  className?: string;
}

/** Hover action on product cards that opens the quick-view modal. */
export function QuickViewButton({ handle, title, className }: QuickViewButtonProps) {
  const { openQuickView } = useQuickView();

  return (
    <button
      type="button"
      aria-label={`Quick View: ${title}`}
      onClick={() => openQuickView(handle)}
      className={className}
    >
      <span aria-hidden>👁</span> Quick View
    </button>
  );
}
