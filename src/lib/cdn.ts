/**
 * Base URL for catalogue and editorial imagery.
 * Currently the legacy storefront CDN; point this at the Medusa file service when ready.
 */
export const CDN_BASE = "https://dpetals.com/cdn/shop/";

export const cdn = (path: string) => `${CDN_BASE}${path}`;
