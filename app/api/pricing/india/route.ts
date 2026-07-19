import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"

import { COUNTRY_COOKIE } from "@/lib/geo/country"
import {
  isIndiaCountry,
  resolveVisitorCountry,
} from "@/lib/geo/resolve-visitor-country"
import { getCachedIndiaQuote } from "@/lib/pricing/get-cached-india-quote"

export const runtime = "edge"
export const dynamic = "force-dynamic"

const CACHE_SECONDS = 300

export async function GET() {
  const hdrs = await headers()
  const cookieStore = await cookies()
  const country = await resolveVisitorCountry({
    headers: hdrs,
    cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
  })

  if (!isIndiaCountry(country)) {
    return NextResponse.json(
      { error: "Not available in your region" },
      { status: 404 }
    )
  }

  const quote = await getCachedIndiaQuote()

  if (!quote) {
    return NextResponse.json(
      { error: "Unable to load live India pricing" },
      { status: 503 }
    )
  }

  return NextResponse.json(quote, {
    headers: {
      "Cache-Control": `private, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=60`,
    },
  })
}
