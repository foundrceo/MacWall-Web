import { proxyAffonsoApi } from "@/lib/affonso-first-party-proxy"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function handle(request: Request) {
  return proxyAffonsoApi(request, "signups")
}

export const GET = handle
export const POST = handle
export const OPTIONS = handle
