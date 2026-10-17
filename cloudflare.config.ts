import { bindings, defineConfig, defineWorker, triggers } from "cf/config"
import { createWorkersCacheConfig } from "@vinext/cloudflare/cache/config"

// Explicit `.ts`: this file is loaded by Node, not the bundler.
import { CRON_ROUTES } from "./worker/crons.ts"

const cache = await createWorkersCacheConfig()

export default defineConfig({
  worker: defineWorker({
    ...cache,
    name: "macwall",
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-10-17",
    compatibilityFlags: ["nodejs_compat"],
    // Run next to Supabase (the Vercel project was pinned to sin1 for this).
    placement: { mode: "smart" },
    observability: { enabled: true },
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    triggers: Object.keys(CRON_ROUTES).map((schedule) =>
      triggers.scheduled({ schedule })
    ),
    env: {
      ...cache.env,
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      VINEXT_KV_CACHE: bindings.kv(),
    },
  }),
})
