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
import {
  parseWallpaperDetailPath,
  resolveWallpaperDetailRequest,
} from "../lib/public-catalog/redirects"

import { CRON_ROUTES } from "./crons"
import {
  applyResponseRules,
  canonicalRequestOrigin,
  createCatalogPathsLoader,
  isPageRequest,
  permanentRedirect,
  stripTrackingParams,
  wallpaperGoneResponse,
  withTrackingParams,
  withoutAmpParam,
  type EdgeCache,
} from "./edge"

export * from "vinext/server/fetch-handler"

type CronEnv = { CRON_SECRET?: string }
type VinextResponse = Awaited<ReturnType<typeof vinext.fetch>>

/**
 * vinext hands cacheable renders to its `VinextCachedResponse` entrypoint
 * through `ctx.exports`, with a request that follows redirects. A page that
 * calls `redirect()` answers that hop with a 30x, workerd follows it back into
 * the same render (the entrypoint renders the original URL from its props),
 * and after 20 rounds throws "Too many redirects": an uncaught 1101/500
 * instead of the redirect. Asking for `redirect: "manual"` on those hops hands
 * the 30x back to vinext, which returns it as is.
 */
function withManualStageRedirects(ctx: ExecutionContext): ExecutionContext {
  const exportsTarget = Reflect.get(ctx, "exports") as object | undefined
  const stageExports =
    exportsTarget &&
    new Proxy(exportsTarget, {
      get(target, property) {
        const factory = Reflect.get(target, property)
        if (typeof factory !== "function") return factory
        return (options: unknown) => {
          const stage = factory(options) as { fetch: typeof fetch } | null
          if (!stage || typeof stage.fetch !== "function") return stage
          return new Proxy(stage, {
            get(fetcher, name) {
              if (name === "fetch") {
                return (input: RequestInfo, init?: RequestInit) =>
                  fetcher.fetch(
                    new Request(input, { ...init, redirect: "manual" })
                  )
              }
              // RPC methods on a stage stub (purge, invalidate) are bound already.
              return Reflect.get(fetcher, name)
            },
          })
        }
      },
    })
  return new Proxy(ctx, {
    get(target, property) {
      if (property === "exports") return stageExports
      const value = Reflect.get(target, property)
      return typeof value === "function" ? value.bind(target) : value
    },
  })
}

/** Per-isolate loader for the detail-URL map (`/api/catalog/paths`). */
const getCatalogPaths = createCatalogPathsLoader()

function workersCache(): EdgeCache | null {
  const storage = (globalThis as { caches?: { default?: EdgeCache } }).caches
  return storage?.default ?? null
}

export default {
  ...vinext,
  /**
   * Before vinext: one-hop redirects for non-canonical wallpaper URLs and
   * `?amp=`, and tracking params dropped from the URL vinext sees. Then hand
   * the visitor's country and IP to the app in headers it already reads first
   * (`x-mw-resolved-country`, `x-forwarded-for`). vinext forwards the request
   * to an internal entrypoint, and `cf-*` headers don't survive that hop; read
   * there, `cf-ipcountry` / `cf-connecting-ip` give the Worker's own location.
   * Both are always overwritten, so a client can't spoof them.
   */
  async fetch(request: WorkerRequest, env: CronEnv, ctx: ExecutionContext) {
    const stageCtx = withManualStageRedirects(ctx)
    const url = new URL(request.url)
    const origin = canonicalRequestOrigin(url)
    const isPage = isPageRequest(request.method, url.pathname)

    if (isPage) {
      const search = (withoutAmpParam(url) ?? url).search
      let pathname = url.pathname

      if (parseWallpaperDetailPath(pathname)) {
        const paths = await getCatalogPaths({
          origin,
          cache: workersCache(),
          fetchFresh: (target) =>
            vinext.fetch(
              new Request(target, {
                headers: { accept: "application/json" },
              }) as unknown as WorkerRequest,
              env,
              stageCtx
            ) as unknown as Promise<Response>,
          waitUntil: (promise) => ctx.waitUntil(promise),
        })
        const decision = paths
          ? resolveWallpaperDetailRequest(pathname, paths)
          : null
        if (decision?.kind === "gone") {
          return wallpaperGoneResponse(
            decision.hubPath,
            decision.categoryName
          ) as unknown as VinextResponse
        }
        if (decision?.kind === "redirect") pathname = decision.location
      }

      if (pathname !== url.pathname || search !== url.search) {
        return permanentRedirect(
          origin,
          pathname,
          search
        ) as unknown as VinextResponse
      }
    }

    const headers = new Headers(request.headers as unknown as HeadersInit)
    const country = request.cf?.country
    if (typeof country === "string" && /^[A-Z]{2}$/.test(country)) {
      headers.set(MW_RESOLVED_COUNTRY_HEADER, country)
    } else {
      headers.delete(MW_RESOLVED_COUNTRY_HEADER)
    }
    const ip = request.headers.get("cf-connecting-ip")
    if (ip) headers.set("x-forwarded-for", ip)

    // Pages are the same for every ad click; the browser keeps the full URL
    // for client analytics, vinext caches one copy.
    const removedParams = isPage ? stripTrackingParams(url) : []
    const stripped = removedParams.length > 0

    // An agent asking for Markdown on a page URL gets the page's `.md` twin.
    const markdownPath =
      request.method === "GET" || request.method === "HEAD"
        ? negotiatedMarkdownPath(url.pathname)
        : null
    const negotiated =
      markdownPath !== null && prefersMarkdown(headers.get("accept"))
    const pathname = url.pathname
    if (negotiated) url.pathname = markdownPath

    const forwarded = (negotiated || stripped
      ? new Request(url.toString(), {
          method: request.method,
          headers,
          cf: request.cf,
        } as RequestInit)
      : new Request(request as unknown as RequestInfo, {
          headers,
        })) as unknown as WorkerRequest
    const fetched = await vinext.fetch(forwarded, env, stageCtx)
    const response = stripped
      ? ((withTrackingParams(
          fetched as unknown as Response,
          removedParams,
          url
        ) as unknown as typeof fetched | null) ?? fetched)
      : fetched

    const rules = { pathname, markdownPath, negotiated }
    if (
      response.status < 200 ||
      !applyResponseRules(new Headers(response.headers), response.status, rules)
    ) {
      return response
    }
    const result = new Response(
      response.body as unknown as BodyInit | null,
      response as unknown as Response
    )
    applyResponseRules(result.headers, result.status, rules)
    return result as unknown as VinextResponse
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
      withManualStageRedirects(ctx)
    )
    if (!response.ok) {
      throw new Error(`cron ${path} failed: HTTP ${response.status}`)
    }
  },
} satisfies ExportedHandler<CronEnv>
