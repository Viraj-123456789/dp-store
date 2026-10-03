"use client";

import { Menu, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { useSearch } from "@/components/search/search-provider";
import { Container } from "@/components/ui/container";
import {
  primaryLinks,
  shopByCategory,
  shopByConcern,
} from "@/lib/data/navigation";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

const iconButtonClass =
  "relative grid size-[42px] place-items-center rounded-full text-foreground transition duration-[180ms] hover:bg-secondary hover:text-primary";

const navLinkClass =
  "flex items-center gap-1.5 rounded-pill px-3.5 py-2.5 font-heading text-[15px] font-semibold text-foreground transition duration-[180ms] hover:bg-secondary hover:text-primary";

const mobileLinkClass =
  "block border-b border-border px-1 py-2.5 font-heading text-base font-semibold";

const mobileHeadingClass =
  "mb-2 mt-5 font-heading text-[11px] uppercase tracking-[0.14em] text-muted-foreground";

function MegaColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h5 className="mb-3 font-heading text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h5>
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="block py-[7px] text-[15px] font-semibold text-foreground hover:text-primary-hover"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function Header() {
  const { summary, openDrawer } = useCart();
  const { openSearch } = useSearch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      setShopOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="sticky top-0 z-60 border-b border-border bg-background/94 backdrop-blur-[14px]">
        <Container className="flex h-[60px] items-center gap-2.5 md:h-[68px] md:gap-[18px] xl:h-[72px]">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
            className={cn(iconButtonClass, "xl:hidden")}
          >
            <Menu size={22} strokeWidth={2} />
          </button>

          <Logo />

          <nav aria-label="Main navigation" className="hidden flex-1 gap-1 xl:flex">
            <div
              className="relative"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button
                type="button"
                aria-expanded={shopOpen}
                aria-controls="mega-shop"
                onClick={() => setShopOpen((open) => !open)}
                className={cn(
                  navLinkClass,
                  shopOpen && "bg-secondary text-primary",
                )}
              >
                Shop
                <span
                  aria-hidden
                  className="size-[9px] border-b-2 border-r-2 [transform:rotate(45deg)_translateY(-2px)]"
                />
              </button>
              <div
                id="mega-shop"
                className={cn(
                  "absolute left-0 top-[calc(100%+10px)] z-70 min-w-[560px] gap-12 rounded-2xl border border-border bg-card px-[30px] py-[26px] shadow-elevated before:absolute before:inset-x-0 before:-top-3.5 before:h-3.5 before:content-['']",
                  shopOpen ? "flex" : "hidden",
                )}
              >
                {/* The reference renders an empty leading column, which offsets the links by one gap */}
                <div aria-hidden />
                <MegaColumn title="By Category" links={shopByCategory} />
                <MegaColumn title="By Concern" links={shopByConcern} />
              </div>
            </div>
            {primaryLinks.map((link) => (
              <Link key={link.label} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={openSearch}
            className="hidden min-w-[210px] items-center gap-2.5 rounded-pill border border-border bg-secondary px-[18px] py-2.5 font-heading text-sm leading-[normal] text-muted-foreground transition duration-[180ms] hover:border-primary-hover hover:text-primary xl:flex"
          >
            <Search size={16} strokeWidth={2} />
            Search products…
            <kbd className="ml-auto rounded-xs border border-border bg-card px-[7px] py-0.5 font-sans text-[11px] text-muted-foreground">
              /
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Search"
              onClick={openSearch}
              className={cn(iconButtonClass, "xl:hidden")}
            >
              <Search size={21} strokeWidth={2} />
            </button>
            <Link href="/account" aria-label="Account" className={iconButtonClass}>
              <User size={21} strokeWidth={2} />
            </Link>
            <button
              type="button"
              aria-label="Cart"
              onClick={openDrawer}
              className={iconButtonClass}
            >
              <ShoppingBag size={21} strokeWidth={2} />
              {summary.itemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-[9px] bg-primary px-1 font-sans text-[11px] font-bold leading-[normal] text-primary-foreground">
                  {summary.itemCount}
                </span>
              )}
            </button>
          </div>
        </Container>
      </header>

      <div
        aria-hidden
        onClick={closeMobile}
        className={cn(
          "fixed inset-0 z-80 bg-foreground/45 backdrop-blur-[3px] transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-label="Mobile menu"
        inert={!mobileOpen}
        className={cn(
          "fixed left-0 top-0 z-110 h-screen w-[min(300px,86vw)] overflow-auto bg-background p-[22px] shadow-drawer transition-transform duration-[280ms]",
          mobileOpen ? "translate-x-0" : "-translate-x-[110%]",
        )}
      >
        <div className="flex items-center justify-between">
          <Logo className="[&_img]:h-11" />
          <button
            type="button"
            aria-label="Close"
            onClick={closeMobile}
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-[17px] text-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            ✕
          </button>
        </div>

        <h5 className={mobileHeadingClass}>Shop</h5>
        {[...shopByCategory, ...shopByConcern, ...primaryLinks].map((link, index) => (
          <Link
            key={`${link.label}-${index}`}
            href={link.href}
            onClick={closeMobile}
            className={mobileLinkClass}
          >
            {link.label}
          </Link>
        ))}

        <h5 className={mobileHeadingClass}>More</h5>
        <button
          type="button"
          onClick={() => {
            closeMobile();
            openSearch();
          }}
          className={cn(mobileLinkClass, "w-full text-left")}
        >
          Search 🔍
        </button>
        <Link href="/account" onClick={closeMobile} className={mobileLinkClass}>
          Account
        </Link>
      </aside>
    </>
  );
}
