import Link from "next/link";

import { Container } from "@/components/ui/container";
import {
  footerPolicyLinks,
  footerShopLinks,
  popularSearches,
  siteInfo,
} from "@/lib/data/navigation";

import { Logo } from "./logo";

const headingClass =
  "mb-[13px] font-heading text-[13px] uppercase tracking-[0.12em] text-primary-foreground";

const linkClass =
  "block py-1 text-[13px] text-inverse-muted transition-colors hover:text-mint";

const socialClass =
  "grid size-[38px] place-items-center rounded-full border border-primary-foreground/25 text-primary-foreground transition-colors hover:border-primary-hover hover:bg-primary-hover";

const marketplaceClass =
  "inline-flex items-center gap-2 rounded-pill border border-primary-foreground/25 px-4 py-[9px] font-heading text-[13px] font-bold text-primary-foreground transition-colors hover:border-primary-hover hover:bg-primary-hover";

export function Footer() {
  return (
    <footer className="bg-foreground text-inverse-muted">
      <Container>
        <div className="border-b border-primary-foreground/10 pb-1.5 pt-[34px]">
          <h4 className={headingClass.replace("mb-[13px]", "mb-3")}>
            About DPetals
          </h4>
          <p className="mb-[26px] max-w-[920px] text-[13px] leading-[1.75]">
            {siteInfo.about}
          </p>
        </div>

        <div className="grid gap-[26px] pb-[26px] pt-[30px] md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo variant="white" />
            <p className="mt-3.5 max-w-[300px] text-[13px]">{siteInfo.tagline}</p>
            <div className="mt-4 flex gap-2.5">
              <a
                href={siteInfo.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener"
                className={socialClass}
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-[18px]">
                  <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.9" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.9" />
                  <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
                </svg>
              </a>
              <a
                href={siteInfo.facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noopener"
                className={socialClass}
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-[18px]">
                  <path
                    fill="currentColor"
                    d="M14 8.5h2.2V5.6c-.4-.05-1.4-.15-2.6-.15-2.6 0-4.3 1.55-4.3 4.4v2.4H6.8V15h2.5v7h3.05v-7h2.45l.4-2.75h-2.85v-2.1c0-.8.22-1.35 1.65-1.35z"
                  />
                </svg>
              </a>
            </div>
            <div className="mt-[22px]">
              <span className="mb-2.5 block font-heading text-[11px] uppercase tracking-[0.12em] text-inverse-muted">
                Also available on
              </span>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={siteInfo.amazon}
                  target="_blank"
                  rel="noopener"
                  aria-label="Shop DPetals on Amazon"
                  className={marketplaceClass}
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="size-[17px]">
                    <circle cx="9" cy="20" r="1.4" fill="currentColor" />
                    <circle cx="17" cy="20" r="1.4" fill="currentColor" />
                    <path d="M3 4h2.2l2 11h9.3l2-7.5H6.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Amazon</span>
                </a>
                <a
                  href={siteInfo.flipkart}
                  target="_blank"
                  rel="noopener"
                  aria-label="Shop DPetals on Flipkart"
                  className={marketplaceClass}
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="size-[17px]">
                    <path d="M6 8h12l-1 12H7z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    <path d="M9 9V6.5a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  <span>Flipkart</span>
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className={headingClass}>Shop</h4>
            {footerShopLinks.map((link) => (
              <Link key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className={headingClass}>Help &amp; Policies</h4>
            {footerPolicyLinks.map((link) => (
              <Link key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className={headingClass}>Contact us</h4>
            <p className="text-[13px] leading-[1.8]">
              Email:{" "}
              <a href={`mailto:${siteInfo.email}`} className="text-mint">
                {siteInfo.email}
              </a>
              <br />
              <br />
              <b className="font-heading text-primary-foreground">Office address</b>
              {siteInfo.address.map((line) => (
                <span key={line}>
                  <br />
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 py-[22px]">
          <h4 className={headingClass.replace("mb-[13px]", "mb-2.5")}>
            Popular searches
          </h4>
          <div>
            {popularSearches.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="mb-2 mr-1.5 inline-block rounded-pill border border-primary-foreground/15 px-3 py-[5px] text-xs text-inverse-dim transition duration-[180ms] hover:border-mint hover:text-mint"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2.5 border-t border-primary-foreground/10 py-5 text-[11.5px]">
          <span>
            © {new Date().getFullYear()} DPetals · {siteInfo.legalName}
          </span>
        </div>
      </Container>
    </footer>
  );
}
