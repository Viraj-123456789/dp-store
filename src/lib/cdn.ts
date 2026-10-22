/**
 * Base URL for catalogue and editorial imagery, with a trailing slash.
 * Set NEXT_PUBLIC_MEDIA_BASE_URL to point at the Medusa file service / CDN; it falls back
 * to the legacy storefront CDN.
 */
const configured = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
export const CDN_BASE = configured
  ? configured.replace(/\/?$/, "/")
  : "https://dpetals.com/cdn/shop/";

export const cdn = (path: string) => `${CDN_BASE}${path}`;
