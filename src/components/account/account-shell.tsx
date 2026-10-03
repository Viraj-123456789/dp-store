"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/account/storage";
import { cn } from "@/lib/utils";

import { useHydrated, useSession } from "./hooks";

const tabs = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
];

/** Page frame for signed-in account screens; sends visitors without a session to sign in. */
export function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const session = useSession();
  const signingOut = useRef(false);

  useEffect(() => {
    if (hydrated && !session && !signingOut.current) router.replace("/account/login");
  }, [hydrated, session, router]);

  if (!hydrated || !session) return null;

  const greeting = session.firstName ? `Hi, ${session.firstName}` : "My account";

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pb-16 pt-[34px] md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-[2em]">{greeting}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{session.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            signingOut.current = true;
            router.push("/");
            signOut();
          }}
        >
          Sign out
        </Button>
      </div>

      <nav aria-label="Account" className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex-none whitespace-nowrap rounded-pill border-[1.5px] px-3.5 py-2 font-heading text-[12.5px] font-semibold transition duration-150",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary-hover",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}

export function AccountCard({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-[19px]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
