/** The public origin of the storefront (no trailing slash), for sitemap and canonical links. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
