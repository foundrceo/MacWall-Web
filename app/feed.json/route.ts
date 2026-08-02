import { buildJsonFeed } from "@/lib/feeds/blog-feed"

export const dynamic = "force-static"
export const revalidate = 3600

export function GET(): Response {
  return new Response(JSON.stringify(buildJsonFeed(), null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
