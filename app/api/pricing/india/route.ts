import { NextResponse } from "next/server"

import { getCachedIndiaQuote } from "@/lib/pricing/get-cached-india-quote"

export const runtime = "edge"

const CACHE_SECONDS = 300

export async function GET() {
  const quote = await getCachedIndiaQuote()

  if (!quote) {
    return NextResponse.json(
      { error: "Unable to load live India pricing" },
      { status: 503 }
    )
  }

  return NextResponse.json(quote, {
    headers: {
      "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=60`,
    },
  })
}
