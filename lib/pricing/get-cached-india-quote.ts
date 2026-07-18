import { unstable_cache } from "next/cache"

import { fetchWhopIndiaQuote } from "@/lib/pricing/whop-india-pricing"

/** Shared Whop INR quote — reused by layout prefetch and /api/pricing/india. */
export const getCachedIndiaQuote = unstable_cache(
  async () => fetchWhopIndiaQuote(),
  ["whop-india-pricing-quote-v1"],
  { revalidate: 300 }
)
