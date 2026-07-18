import { NextResponse } from "next/server"

import { getCachedIndiaQuote } from "@/lib/pricing/get-cached-india-quote"
import { buildIndiaFallbackQuote } from "@/lib/pricing/whop-india-pricing"

export const runtime = "nodejs"

const CACHE_SECONDS = 300

export async function GET() {
  const quote = (await getCachedIndiaQuote()) ?? buildIndiaFallbackQuote()

  return NextResponse.json(quote, {
    headers: {
      "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=60`,
    },
  })
}
