"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        form.reset();
        setStatus({ kind: "done" });
        return;
      }
      const body: { error?: string } | null = await response.json().catch(() => null);
      setStatus({ kind: "error", message: body?.error ?? "Something went wrong. Please try again." });
    } catch {
      setStatus({ kind: "error", message: "Something went wrong. Please try again." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="min-w-[300px] max-w-[560px] flex-1 max-md:max-w-none">
      <div className="flex gap-2 max-md:flex-col">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          aria-label="Email"
          className="min-w-0 flex-1 rounded-pill bg-card px-5 py-3 font-sans text-[15px] leading-[normal] text-foreground placeholder:text-muted-foreground focus:outline-3 focus:outline-primary-foreground/40"
        />
        <Button
          type="submit"
          variant="light"
          disabled={status.kind === "sending"}
          className="whitespace-nowrap"
        >
          Claim 10% off
        </Button>
      </div>
      {(status.kind === "done" || status.kind === "error") && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className="mt-2 text-[12.5px] font-semibold text-inverse-soft"
        >
          {status.kind === "done"
            ? "Thanks for joining the DPetals circle!"
            : status.message}
        </p>
      )}
    </form>
  );
}
