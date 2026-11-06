import "./alias-hooks.mjs"

import assert from "node:assert/strict"
import test from "node:test"

const {
  indexNowConfig,
  indexNowUrlList,
  sitemapUrlsChangedSince,
  submitToIndexNow,
} = await import("../lib/seo/indexnow.ts")
const { workerBinding } = await import("../lib/env/worker-bindings.ts")

const KEY = "0123456789abcdef0123456789abcdef"

async function withEnv(env, fn) {
  const saved = {}
  for (const name of Object.keys(env)) {
    saved[name] = process.env[name]
    if (env[name] === undefined) delete process.env[name]
    else process.env[name] = env[name]
  }
  try {
    return await fn()
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  }
}

test("IndexNow stays off without a key or on a local origin", async () => {
  const site = "https://macwall.app"
  await withEnv({ INDEXNOW_KEY: undefined, NEXT_PUBLIC_SITE_URL: site }, () =>
    assert.equal(indexNowConfig(), null)
  )
  await withEnv({ INDEXNOW_KEY: "short", NEXT_PUBLIC_SITE_URL: site }, () =>
    assert.equal(indexNowConfig(), null)
  )
  for (const local of ["http://localhost:3000", "https://app.localhost"]) {
    await withEnv({ INDEXNOW_KEY: KEY, NEXT_PUBLIC_SITE_URL: local }, () =>
      assert.equal(indexNowConfig(), null, local)
    )
  }
  await withEnv({ INDEXNOW_KEY: KEY, NEXT_PUBLIC_SITE_URL: site }, () =>
    assert.deepEqual(indexNowConfig(), {
      key: KEY,
      host: "macwall.app",
      origin: "https://macwall.app",
      keyLocation: `https://macwall.app/${KEY}.txt`,
    })
  )

  // Not configured: no request goes out.
  const realFetch = globalThis.fetch
  globalThis.fetch = () => assert.fail("fetch while IndexNow is off")
  try {
    const result = await withEnv({ INDEXNOW_KEY: undefined }, () =>
      submitToIndexNow(["/pricing"])
    )
    assert.deepEqual(result, {
      status: "skipped",
      reason: "not_configured",
      urls: 0,
    })
  } finally {
    globalThis.fetch = realFetch
  }
})

test("submissions carry only absolute, unique URLs on the site's host", () => {
  const config = { host: "macwall.app", origin: "https://macwall.app" }
  assert.deepEqual(
    indexNowUrlList(
      [
        "/",
        "/pricing",
        "https://macwall.app/pricing",
        "https://macwall.app/pricing#plans",
        "/pricing.md",
        "https://www.macwall.app/download",
        "https://example.com/pricing",
        "http://macwall.app/download",
      ],
      config
    ),
    [
      "https://macwall.app/",
      "https://macwall.app/pricing",
      "https://macwall.app/pricing.md",
    ]
  )
})

test("a submission posts the key and reports the engine's answer", async () => {
  const realFetch = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push([url, JSON.parse(init.body)])
    return new Response(null, { status: 202 })
  }
  try {
    const result = await withEnv(
      { INDEXNOW_KEY: KEY, NEXT_PUBLIC_SITE_URL: "https://macwall.app" },
      () => submitToIndexNow(["/pricing", "/download"])
    )
    assert.deepEqual(result, { status: "submitted", urls: 2, httpStatus: 202 })
    assert.deepEqual(calls, [
      [
        "https://api.indexnow.org/indexnow",
        {
          host: "macwall.app",
          key: KEY,
          keyLocation: `https://macwall.app/${KEY}.txt`,
          urlList: [
            "https://macwall.app/pricing",
            "https://macwall.app/download",
          ],
        },
      ],
    ])

    globalThis.fetch = async () =>
      new Response("Key not valid", { status: 403 })
    const rejected = await withEnv(
      { INDEXNOW_KEY: KEY, NEXT_PUBLIC_SITE_URL: "https://macwall.app" },
      () => submitToIndexNow(["/pricing"])
    )
    assert.equal(rejected.status, "failed")
    assert.equal(rejected.httpStatus, 403)
  } finally {
    globalThis.fetch = realFetch
  }
})

test("the daily run picks sitemap URLs changed since its cursor", () => {
  const entries = [
    { url: "https://macwall.app/" },
    { url: "https://macwall.app/docs", lastModified: "2026-11-05" },
    { url: "https://macwall.app/blog", lastModified: "2026-11-03" },
    {
      url: "https://macwall.app/wallpaper/cars/a",
      lastModified: new Date("2026-11-05T14:00:00Z"),
    },
    {
      url: "https://macwall.app/wallpaper/cars/b",
      lastModified: new Date("2026-11-04T23:59:59Z"),
    },
    { url: "https://macwall.app/bad", lastModified: "not a date" },
  ]
  // A run on Nov 6 whose last run was Nov 5 03:15 starts at Nov 5 00:00.
  assert.deepEqual(
    sitemapUrlsChangedSince(entries, Date.parse("2026-11-05T00:00:00Z")),
    ["https://macwall.app/docs", "https://macwall.app/wallpaper/cars/a"]
  )
})

test("Worker bindings are null outside workerd", async () => {
  assert.equal(await workerBinding("VINEXT_KV_CACHE"), null)
})
