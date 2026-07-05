import { canonicalSiteOrigin } from "@/lib/site-url"
import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = canonicalSiteOrigin()
  const stamp = new Date()

  const entries: MetadataRoute.Sitemap = [
    { url: origin, lastModified: stamp, changeFrequency: "weekly", priority: 1 },
    {
      url: `${origin}/pricing`,
      lastModified: stamp,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${origin}/terms`,
      lastModified: stamp,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${origin}/privacy`,
      lastModified: stamp,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]

  return entries
}
