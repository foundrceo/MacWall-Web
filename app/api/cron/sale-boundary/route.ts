import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { faqPricePaths } from "@/lib/faq/answers"
import { secretsEqual } from "@/lib/http/secrets"
import {
  SALE_BOUNDARY_LOOKBACK_MS,
  saleBoundariesBetween,
} from "@/lib/pricing/sale-aware-price"
import { submitToIndexNow } from "@/lib/seo/indexnow"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Indexable URLs whose text or JSON-LD states a MacWall price: revalidated by
 * name on top of the whole-site purge, then sent to IndexNow.
 */
const PRICE_PATHS: readonly string[] = [
  "/",
  "/pricing",
  "/download",
  "/ai-info",
  "/about",
  "/press",
  "/llms.txt",
  "/llms-full.txt",
  // FAQ answers that quote the Pro price.
  ...faqPricePaths(),
]
/**
 * Their Markdown twins: revalidated only, since they are `noindex`. They are
 * served by app/md/[...path] behind a rewrite, so both forms are listed.
 */
const MARKDOWN_PATHS: readonly string[] = [
  ...["/pricing", "/ai-info", "/index", "/creator", "/about", "/press"].flatMap(
    (path) => [`${path}.md`, `/md${path}`]
  ),
  ...faqPricePaths().flatMap((path) => [`${path}.md`, `/md${path}`]),
]

/**
 * Cron (every 5 minutes) → re-render cached pages when a `SITE_SALES` entry
 * starts or ends. Pages are cached at the edge (ISR), so without this the
 * HTML, JSON-LD and llms.txt keep the old price until their next revalidate
 * or deploy. Most runs find no boundary and return at once.
 *
 * `?force=1` revalidates without a boundary, e.g. after editing a sale on a
 * preview. Auth is CRON_SECRET only.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: "missing_cron_secret" },
      { status: 500 }
    )
  }
  const auth = request.headers.get("authorization")?.trim()
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : ""
  if (!token || !secretsEqual(token, cronSecret)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    )
  }

  const now = Date.now()
  const boundaries = saleBoundariesBetween(now - SALE_BOUNDARY_LOOKBACK_MS, now)
  const force = new URL(request.url).searchParams.get("force") === "1"
  if (boundaries.length === 0 && !force) {
    return NextResponse.json({ ok: true, boundaries: [] })
  }

  try {
    // The root layout carries the site-wide JSON-LD and the sale banner, and
    // every cached page and route handler is tagged with it.
    revalidatePath("/", "layout")
    for (const path of [...PRICE_PATHS, ...MARKDOWN_PATHS]) {
      revalidatePath(path)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "revalidate_failed"
    console.error("[cron/sale-boundary]", message)
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }

  for (const boundary of boundaries) {
    console.log(
      `[cron/sale-boundary] ${boundary.saleId} ${boundary.kind} at ${boundary.at} (${boundary.regions.join(", ")}): revalidated`
    )
  }

  // Bing and the other IndexNow engines recrawl the new prices. A failure
  // here doesn't fail the run: the pages are already fresh.
  const indexNow = await submitToIndexNow(PRICE_PATHS)

  return NextResponse.json({
    ok: true,
    forced: force && boundaries.length === 0,
    boundaries,
    revalidated: ["/ (layout)", ...PRICE_PATHS, ...MARKDOWN_PATHS],
    indexNow,
  })
}
