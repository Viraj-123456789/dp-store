import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private, per-visitor or transactional screens.
      disallow: ["/api/", "/account", "/checkout", "/cart", "/order/", "/search"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
