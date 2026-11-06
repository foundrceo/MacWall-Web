import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import test from "node:test"

// worker/ imports lib/ by relative path without an extension, as the bundler
// allows; resolve those to the TypeScript source too.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith(".") &&
      !/\.[cm]?[jt]sx?$/.test(specifier) &&
      context.parentURL?.endsWith(".ts")
    ) {
      return nextResolve(`${specifier}.ts`, context)
    }
    return nextResolve(specifier, context)
  },
})

const {
  buildCatalogPathsPayload,
  isCatalogPathsPayload,
  resolveWallpaperDetailRequest,
  wallpaperRedirectFromRow,
} = await import("../lib/public-catalog/redirects.ts")
const {
  applyResponseRules,
  canonicalRequestOrigin,
  createCatalogPathsLoader,
  isPageRequest,
  staticAssetCacheControl,
  stripTrackingParams,
  wallpaperGoneResponse,
  withTrackingParams,
  withoutAmpParam,
} = await import("../worker/edge.ts")

const UUID = "918d4150-36a6-4bab-aead-172e566fd0c9"
const WALLPAPERS = [
  {
    id: "porsche-911-front-glow",
    name: "Porsche 911 Front Glow",
    category: "Cars",
  },
  { id: UUID, name: "Cyberpunk Edgerunners", category: "Anime" },
  { id: "iron-man-9d16c780", name: "Iron Man", category: "Heroes" },
  {
    id: "gargantua-accretion-disk",
    name: "Gargantua Accretion Disk",
    category: "Space",
  },
]

const paths = buildCatalogPathsPayload(WALLPAPERS, [
  {
    old_path: "/wallpaper/space/accretion-disk-black-hole",
    target_path: "/wallpaper/space/gargantua-accretion-disk",
    status: 308,
  },
  // Points at a stale URL of a live wallpaper: resolved to its canonical path.
  {
    old_path:
      "/wallpaper/heroes/i-am-ironman-8c6c8a32-9432-42f2-aebb-fd562b7220b6",
    target_path: "/wallpaper/space/iron-man-9d16c780",
    status: 308,
  },
  // Its id is live, so the live page wins over the rule.
  {
    old_path: "/wallpaper/anime/porsche-911-front-glow",
    target_path: "/",
    status: 308,
  },
  {
    old_path: "/wallpaper/others/taken-down-clip",
    target_path: null,
    status: 410,
  },
  // Malformed rows are ignored.
  { old_path: "/wallpapers/cars", target_path: "/", status: 308 },
  { old_path: "/wallpaper/cars/x", target_path: "//evil.example", status: 308 },
  { old_path: "/wallpaper/cars/y", target_path: "/ok", status: 301 },
])

const redirectOf = (pathname) => {
  const decision = resolveWallpaperDetailRequest(pathname, paths)
  return decision?.kind === "redirect" ? decision.location : decision
}

test("detail URLs canonicalise in one hop to the sitemap URL", () => {
  assert.equal(
    paths.byId[UUID],
    `/wallpaper/anime/cyberpunk-edgerunners-${UUID}`
  )
  const canonical = "/wallpaper/cars/porsche-911-front-glow"
  assert.equal(redirectOf("/wallpaper/anime/porsche-911-front-glow"), canonical)
  assert.equal(redirectOf("/wallpaper/CARS/porsche-911-front-glow"), canonical)
  assert.equal(redirectOf("/wallpaper/cars/Porsche-911-Front-Glow"), canonical)
  assert.equal(redirectOf("/wallpaper/cars/porsche-911-front-glow/"), canonical)
  assert.equal(
    redirectOf("/wallpaper/video-games/porsche-911-front-glow"),
    canonical
  )
  const anime = paths.byId[UUID]
  assert.equal(
    redirectOf(`/wallpaper/space/cyberpunk-edgerunners-${UUID}`),
    anime
  )
  assert.equal(redirectOf(`/wallpaper/anime/old-name-${UUID}`), anime)
  assert.equal(redirectOf(`/wallpaper/anime/${UUID}`), anime)
  assert.equal(redirectOf(`/wallpaper/anime/${UUID.toUpperCase()}`), anime)
})

test("canonical, unknown and non-detail URLs fall through to vinext", () => {
  assert.equal(redirectOf("/wallpaper/cars/porsche-911-front-glow"), null)
  assert.equal(redirectOf(paths.byId[UUID]), null)
  assert.equal(redirectOf("/wallpaper/space/does-not-exist-xyz"), null)
  assert.equal(redirectOf("/wallpaper/cars/porsche-911-front-glow.md"), null)
  assert.equal(redirectOf("/wallpapers/cars"), null)
  assert.equal(redirectOf("/wallpaper"), null)
  // Object.prototype keys are not wallpaper ids.
  for (const slug of [
    "constructor",
    "__proto__",
    "toString",
    "hasOwnProperty",
  ]) {
    assert.equal(redirectOf(`/wallpaper/anime/${slug}`), null)
  }
  const parsed = JSON.parse(JSON.stringify(paths))
  assert.equal(
    resolveWallpaperDetailRequest("/wallpaper/anime/constructor", parsed),
    null
  )
  assert.equal(
    resolveWallpaperDetailRequest("/wallpaper/anime/__proto__", parsed),
    null
  )
})

test("redirect rules: renamed, removed and taken down", () => {
  assert.equal(
    redirectOf("/wallpaper/space/accretion-disk-black-hole"),
    "/wallpaper/space/gargantua-accretion-disk"
  )
  assert.equal(
    redirectOf(
      "/wallpaper/heroes/i-am-ironman-8c6c8a32-9432-42f2-aebb-fd562b7220b6"
    ),
    "/wallpaper/heroes/iron-man-9d16c780"
  )
  assert.equal(
    paths.redirects["/wallpaper/anime/porsche-911-front-glow"],
    undefined
  )
  assert.equal(Object.keys(paths.redirects).length, 3)
  assert.deepEqual(
    resolveWallpaperDetailRequest("/wallpaper/others/taken-down-clip", paths),
    {
      kind: "gone",
      hubPath: "/wallpapers/others",
      categoryName: "Others",
    }
  )
  // Removed for copyright: 410 under any category, retired slugs map to the live hub.
  assert.deepEqual(
    resolveWallpaperDetailRequest("/wallpaper/city/rainy-parking-lot", paths),
    {
      kind: "gone",
      hubPath: "/wallpapers/dark",
      categoryName: "Dark",
    }
  )
  assert.deepEqual(
    resolveWallpaperDetailRequest("/wallpaper/nope/rainy-parking-lot", paths),
    {
      kind: "gone",
      hubPath: "/wallpapers",
      categoryName: null,
    }
  )
  // A live wallpaper with a removed id comes back as a page, not a 410.
  const revived = buildCatalogPathsPayload(
    [{ id: "rainy-parking-lot", name: "Rainy Parking Lot", category: "Dark" }],
    []
  )
  assert.equal(
    resolveWallpaperDetailRequest("/wallpaper/dark/rainy-parking-lot", revived),
    null
  )
  assert.equal(
    wallpaperRedirectFromRow({
      old_path: "/wallpaper/a/b",
      target_path: "/wallpaper/a/b",
      status: 308,
    }),
    null
  )
  assert.equal(isCatalogPathsPayload(JSON.parse(JSON.stringify(paths))), true)
  assert.equal(isCatalogPathsPayload({ byId: {} }), false)
})

test("tracking params leave the cache key; app params stay", () => {
  const url = new URL(
    "https://macwall.app/?utm_source=google&UTM_Campaign=bf&gclid=1&fbclid=2&ttclid=3&ref=x&via=y&atp=z&_gl=g&send=1&q=anime&tag=car&sort=newest"
  )
  assert.deepEqual(stripTrackingParams(url), [
    ["utm_source", "google"],
    ["UTM_Campaign", "bf"],
    ["gclid", "1"],
    ["fbclid", "2"],
    ["ttclid", "3"],
    ["ref", "x"],
    ["via", "y"],
    ["atp", "z"],
    ["_gl", "g"],
  ])
  assert.equal(url.search, "?send=1&q=anime&tag=car&sort=newest")
  const clean = new URL("https://macwall.app/pricing?promo=BLACKFRIDAY")
  assert.deepEqual(stripTrackingParams(clean), [])
  assert.equal(clean.search, "?promo=BLACKFRIDAY")
  assert.deepEqual(
    stripTrackingParams(new URL("https://macwall.app/?gclid=1")),
    [["gclid", "1"]]
  )
})

test("redirects vinext sends keep the stripped tracking params", () => {
  const redirect = (location, status = 308) =>
    new Response(null, { status, headers: { location } })

  // www to apex (next.config) on an ad click.
  const www = new URL("https://www.macwall.app/?gclid=X&utm_source=google")
  const wwwRemoved = stripTrackingParams(www)
  assert.equal(
    withTrackingParams(
      redirect("https://macwall.app/"),
      wwwRemoved,
      www
    )?.headers.get("location"),
    "https://macwall.app/?gclid=X&utm_source=google"
  )

  // Trailing slash, with a relative Location and an app param kept by vinext.
  const slash = new URL("https://macwall.app/pricing/?utm_medium=cpc&promo=BF")
  const slashRemoved = stripTrackingParams(slash)
  const restored = withTrackingParams(
    redirect("/pricing?promo=BF"),
    slashRemoved,
    slash
  )
  assert.equal(restored?.status, 308)
  assert.equal(
    restored?.headers.get("location"),
    "https://macwall.app/pricing?promo=BF&utm_medium=cpc"
  )

  // A key the redirect sets itself wins; repeated keys all come back.
  const repeat = new URL("https://macwall.app/support?ref=a&ref=b&via=v")
  const repeatRemoved = stripTrackingParams(repeat)
  assert.equal(
    withTrackingParams(
      redirect("/contact?via=rule"),
      repeatRemoved,
      repeat
    )?.headers.get("location"),
    "https://macwall.app/contact?via=rule&ref=a&ref=b"
  )

  // Off-site redirects, non-redirects and clean requests are left alone.
  assert.equal(
    withTrackingParams(redirect("https://example.com/"), wwwRemoved, www),
    null
  )
  assert.equal(withTrackingParams(new Response("ok"), wwwRemoved, www), null)
  assert.equal(
    withTrackingParams(redirect("https://macwall.app/"), [], www),
    null
  )
})

test("amp params, page scope and origins", () => {
  assert.equal(
    withoutAmpParam(new URL("https://macwall.app/?amp="))?.search,
    ""
  )
  assert.equal(
    withoutAmpParam(new URL("https://macwall.app/blog/x?amp=1&utm_source=a"))
      ?.search,
    "?utm_source=a"
  )
  assert.equal(withoutAmpParam(new URL("https://macwall.app/blog/x?q=1")), null)
  assert.equal(isPageRequest("GET", "/"), true)
  assert.equal(isPageRequest("HEAD", "/wallpaper/cars/x"), true)
  assert.equal(isPageRequest("POST", "/"), false)
  for (const path of [
    "/checkout",
    "/wallpaper",
    "/api/wallpapers",
    "/_next/static/a.js",
    "/pricing.md",
    "/hero/a.avif",
  ]) {
    assert.equal(isPageRequest("GET", path), false, path)
  }
  assert.equal(
    canonicalRequestOrigin(new URL("https://www.macwall.app/a")),
    "https://macwall.app"
  )
  assert.equal(
    canonicalRequestOrigin(new URL("http://localhost:3001/a")),
    "http://localhost:3001"
  )
})

test("static asset caching", () => {
  const day = "public, max-age=86400, stale-while-revalidate=604800"
  for (const path of [
    "/hero/hero-video-poster.avif",
    "/blog/thumbs/4k-video-wallpaper-mac.avif",
    "/blog/vs/backdrop.png",
    "/favicon_io/favicon-32x32.png",
    "/MacWall.png",
    "/favicon.ico",
    "/icon.png",
    "/apple-icon.png",
  ]) {
    assert.equal(staticAssetCacheControl(path), day, path)
  }
  assert.equal(
    staticAssetCacheControl("/og/home.0123456789.jpg"),
    "public, max-age=31536000, immutable"
  )
  for (const path of [
    "/blog/how-to",
    "/hero",
    "/og/home.jpg",
    "/wallpapers",
    "/MacWall.png/x",
  ]) {
    assert.equal(staticAssetCacheControl(path), null, path)
  }
})

test("response rules: Markdown twin, HTML and assets", () => {
  const markdown = new Headers({
    "content-type": "text/markdown; charset=utf-8",
    "x-robots-tag": "noindex",
    vary: "Accept",
  })
  assert.equal(
    applyResponseRules(markdown, 200, {
      pathname: "/pricing",
      markdownPath: "/pricing.md",
      negotiated: true,
    }),
    true
  )
  assert.equal(markdown.get("x-robots-tag"), null)
  assert.equal(markdown.get("content-location"), "/pricing.md")
  assert.equal(markdown.get("vary"), "Accept")

  const html = new Headers({
    "content-type": "text/html; charset=utf-8",
    link: "</a.css>; rel=preload; as=style",
    "last-modified": "Thu, 05 Nov 2026 15:36:10 GMT",
    vary: "rsc",
  })
  applyResponseRules(html, 200, {
    pathname: "/",
    markdownPath: "/index.md",
    negotiated: false,
  })
  assert.equal(
    html.get("link"),
    "</a.css>; rel=preload; as=style, <https://cdn.macwall.app>; rel=preconnect"
  )
  assert.equal(html.get("last-modified"), null)
  assert.equal(html.get("vary"), "rsc, Accept")
  assert.equal(html.get("x-robots-tag"), null)

  const twinUrl = new Headers({
    "content-type": "text/markdown",
    "x-robots-tag": "noindex",
  })
  assert.equal(
    applyResponseRules(twinUrl, 200, {
      pathname: "/pricing.md",
      markdownPath: null,
      negotiated: false,
    }),
    false
  )
  assert.equal(twinUrl.get("x-robots-tag"), "noindex")

  const poster = new Headers({
    "cache-control": "public, max-age=0, must-revalidate",
  })
  applyResponseRules(poster, 200, {
    pathname: "/hero/hero-video-poster.avif",
    markdownPath: null,
    negotiated: false,
  })
  assert.equal(
    poster.get("cache-control"),
    "public, max-age=86400, stale-while-revalidate=604800"
  )
  const missing = new Headers({ "cache-control": "no-store" })
  assert.equal(
    applyResponseRules(missing, 404, {
      pathname: "/hero/nope.avif",
      markdownPath: null,
      negotiated: false,
    }),
    false
  )

  const json = new Headers({ "content-type": "application/json" })
  assert.equal(
    applyResponseRules(json, 200, {
      pathname: "/api/wallpapers",
      markdownPath: null,
      negotiated: false,
    }),
    false
  )
})

test("410 page is small, noindex and links to the hub", async () => {
  const response = wallpaperGoneResponse("/wallpapers/dark", "Dark")
  assert.equal(response.status, 410)
  assert.equal(response.headers.get("x-robots-tag"), "noindex")
  const body = await response.text()
  assert.match(body, /<meta name="robots" content="noindex">/)
  assert.match(body, /href="\/wallpapers\/dark">Browse Dark live wallpapers</)
})

function fakeCache() {
  const store = new Map()
  return {
    store,
    async match(key) {
      const body = store.get(key)
      return body === undefined ? undefined : new Response(body)
    },
    async put(key, response) {
      store.set(key, await response.text())
    },
  }
}

test("catalog paths loader: cache, fetch, memo and failure", async () => {
  const body = JSON.stringify(paths)
  const cache = fakeCache()
  const pending = []
  let fetches = 0
  const options = {
    origin: "https://macwall.app",
    cache,
    fetchFresh: async (url) => {
      fetches += 1
      assert.equal(url, "https://macwall.app/api/catalog/paths")
      return new Response(body, {
        headers: { "content-type": "application/json" },
      })
    },
    waitUntil: (promise) => pending.push(promise),
  }

  const load = createCatalogPathsLoader()
  const [first, second] = await Promise.all([
    load({ ...options, now: 0 }),
    load({ ...options, now: 0 }),
  ])
  assert.equal(fetches, 1, "concurrent misses share one fetch")
  assert.deepEqual(first, paths)
  assert.equal(second, first)
  await Promise.all(pending)
  assert.equal(
    cache.store.get("https://macwall.app/__edge/api/catalog/paths"),
    body
  )

  await load({ ...options, now: 30_000 })
  assert.equal(fetches, 1, "isolate memo")

  // Memo expired: a fresh isolate copy comes from the Workers Cache.
  const fromCache = await load({ ...options, now: 120_000 })
  assert.deepEqual(fromCache, paths)
  assert.equal(fetches, 1)

  const failing = createCatalogPathsLoader()
  let failures = 0
  const broken = {
    ...options,
    cache: fakeCache(),
    fetchFresh: async () => {
      failures += 1
      return new Response("error code: 1101", { status: 500 })
    },
  }
  assert.equal(await failing({ ...broken, now: 0 }), null)
  assert.equal(await failing({ ...broken, now: 10_000 }), null)
  assert.equal(failures, 1, "failures are remembered briefly")
  await failing({ ...broken, now: 40_000 })
  assert.equal(failures, 2)

  const throwing = createCatalogPathsLoader()
  assert.equal(
    await throwing({
      ...broken,
      fetchFresh: async () => {
        throw new Error("boom")
      },
    }),
    null
  )
})
