"use client";

import { buttonVariants } from "@/components/ui/button";

/** Shown inside the storefront header/footer when a page fails to load (for example, the backend is down). */
export default function MainError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-24 text-center">
      <h1 className="font-heading text-[2em]">Something went wrong</h1>
      <p className="mt-3 text-muted-foreground">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <button type="button" onClick={reset} className={`${buttonVariants()} mt-6`}>
        Try again
      </button>
    </div>
  );
}
