import { canonicalSiteOrigin } from "@/lib/site-url"
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const origin = canonicalSiteOrigin()
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/admin/",
        "/auth/",
        "/sign-up",
        "/forgot-password",
        "/thank-you",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: new URL(origin).host,
  }
}
