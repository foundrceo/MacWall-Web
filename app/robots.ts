import { canonicalSiteOrigin } from "@/lib/site-url"
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const origin = canonicalSiteOrigin()
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth/", "/sign-up", "/forgot-password"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: new URL(origin).host,
  }
}
