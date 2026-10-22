"use client";

/** Last resort when even the root layout fails; it replaces the whole document. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="px-4 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-3">Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-pill bg-primary px-6 py-3 font-bold text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
