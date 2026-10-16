import {
  MARKETING_CATALOG_CACHE_TAGS,
  revalidateMarketingCatalog,
} from "@/lib/admin/uploads"
import { secretsEqual } from "@/lib/http/secrets"

/** On-demand ISR for homepage + public gallery after external catalog updates. */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim()
  if (!secret) {
    return Response.json(
      { error: "Revalidation is not configured." },
      { status: 503 }
    )
  }

  const provided = request.headers.get("x-revalidate-secret")?.trim() ?? ""
  if (!provided || !secretsEqual(provided, secret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  await revalidateMarketingCatalog()

  return Response.json({
    revalidated: true,
    tags: MARKETING_CATALOG_CACHE_TAGS,
    at: new Date().toISOString(),
  })
}
