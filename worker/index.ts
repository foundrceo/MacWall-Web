/**
 * Cloudflare Workers entry. vinext serves every request; Cron Triggers call the
 * `/api/cron/*` routes in-process with an `Authorization: Bearer $CRON_SECRET`
 * header.
 */
import type {
  ExecutionContext,
  ExportedHandler,
  Request as WorkerRequest,
  ScheduledController,
} from "@cloudflare/workers-types"
import vinext from "vinext/server/fetch-handler"

import { MW_RESOLVED_COUNTRY_HEADER } from "../lib/geo/country"
import {
  negotiatedMarkdownPath,
  prefersMarkdown,
} from "../lib/http/markdown-negotiation"

import { CRON_ROUTES } from "./crons"

export * from "vinext/server/fetch-handler"

type CronEnv = { CRON_SECRET?: string }

/** Files written by scripts/generate-og-images.mjs. */
const HASHED_SHARE_IMAGE = /^\/og\/[a-z0-9-]+\.[a-f0-9]{10}\.jpg$/

export default {
  ...vinext,
  /**
   * Hand the visitor's country and IP to the app in headers it already reads
   * first (`x-mw-resolved-country`, `x-forwarded-for`). vinext forwards the
   * request to an internal entrypoint, and `cf-*` headers don't survive that
   * hop; read there, `cf-ipcountry` / `cf-connecting-ip` give the Worker's own
   * location. Both are always overwritten, so a client can't spoof them.
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

    // An agent asking for Markdown on a page URL gets the page's `.md` twin.
    const url = new URL(request.url)
    const markdownPath =
      request.method === "GET" || request.method === "HEAD"
        ? negotiatedMarkdownPath(url.pathname)
        : null
    const negotiate =
      markdownPath !== null && prefersMarkdown(headers.get("accept"))
    if (negotiate) url.pathname = markdownPath

    const forwarded = new Request(
      negotiate ? url.toString() : (request as unknown as RequestInfo),
      negotiate ? { method: request.method, headers } : { headers }
    ) as unknown as WorkerRequest
    const response = await vinext.fetch(forwarded, env, ctx)

    // vinext serves `public/` files with `max-age=0` and skips next.config
    // headers for them. Share images carry a content hash in the name
    // (`/og/{slug}.{hash}.jpg`), so a published file never changes.
    if (response.ok && HASHED_SHARE_IMAGE.test(url.pathname)) {
      const cached = new Response(
        response.body,
        response as unknown as Response
      )
      cached.headers.set("cache-control", "public, max-age=31536000, immutable")
      return cached as unknown as Awaited<ReturnType<typeof vinext.fetch>>
    }

    if (markdownPath === null) return response

    // Page URLs answer in two formats, so shared caches must key on Accept.
    const varied = new Response(response.body, response as unknown as Response)
    const vary = varied.headers.get("vary")
    if (!vary || !/\baccept\b/i.test(vary)) {
      varied.headers.set("vary", vary ? `${vary}, Accept` : "Accept")
    }
    return varied as unknown as Awaited<ReturnType<typeof vinext.fetch>>
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
