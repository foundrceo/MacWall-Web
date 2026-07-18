import { resolveIndiaQuote } from "@/lib/pricing/resolve-india-quote"

/** Entry used by layout prefetch and /api/pricing/india. */
export async function getCachedIndiaQuote() {
  return resolveIndiaQuote()
}
