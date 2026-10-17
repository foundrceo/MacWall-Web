/**
 * Cloudflare Workers entry: vinext serves every request; Cron Triggers replace
 * the `crons` in vercel.json by calling the same `/api/cron/*` routes
 * in-process, with the `Authorization: Bearer $CRON_SECRET` header Vercel sent.
 */
import type {
  ExecutionContext,
  ExportedHandler,
  Request as WorkerRequest,
  ScheduledController,
} from "@cloudflare/workers-types"
import vinext from "vinext/server/fetch-handler"

import { MW_RESOLVED_COUNTRY_HEADER } from "../lib/geo/country"

import { CRON_ROUTES } from "./crons"

export * from "vinext/server/fetch-handler"

type CronEnv = { CRON_SECRET?: string }

export default {
  ...vinext,
  /**
   * Hand the visitor's country and IP to the app in headers it already reads
   * first (`x-mw-resolved-country`, `x-forwarded-for`). vinext forwards the
   * request to an internal entrypoint, and `cf-*` headers don't survive that
   * hop, so `cf-ipcountry` / `cf-connecting-ip` alone resolved every visitor
   * to the Worker's own location. Both are always overwritten, so a client
   * can't spoof them.
   */
  async fetch(request: WorkerRequest, env: CronEnv, ctx: ExecutionContext) {
    const headers = new Headers(request.headers as unknown as HeadersInit)
    const country = request.cf?.country
    if (typeof country === "string" && /^[A-Z]{2}$/.test(country)) {
      headers.set(MW_RESOLVED_COUNTRY_HEADER, country)
    } else {
      headers.delete(MW_RESOLVED_COUNTRY_HEADER)
    }
    const ip = request.headers.get("cf-connecting-ip")
    if (ip) headers.set("x-forwarded-for", ip)
    const forwarded = new Request(request as unknown as RequestInfo, {
      headers,
    }) as unknown as WorkerRequest
    return vinext.fetch(forwarded, env, ctx)
  },
  async scheduled(
    controller: ScheduledController,
    env: CronEnv,
    ctx: ExecutionContext
  ) {
    const path = CRON_ROUTES[controller.cron]
    const secret = env.CRON_SECRET?.trim()
    if (!path || !secret) {
      console.error(`cron ${controller.cron}: no route or CRON_SECRET`)
      return
    }
    const response = await vinext.fetch(
      new Request(`https://macwall.app${path}`, {
        headers: { authorization: `Bearer ${secret}` },
      }),
      env,
      ctx
    )
    if (!response.ok) {
      throw new Error(`cron ${path} failed: HTTP ${response.status}`)
    }
  },
} satisfies ExportedHandler<CronEnv>
