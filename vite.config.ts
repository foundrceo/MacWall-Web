import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import vinext from "vinext"
import { cloudflare } from "@cloudflare/vite-plugin"
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter"
import { workersCacheCdnAdapter } from "@vinext/cloudflare/cache/workers-cache-cdn-adapter"
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer"

/**
 * Cloudflare Workers build (vinext). `next build` still works for Vercel while
 * both deployments exist.
 * - Data cache (`unstable_cache`) → Workers KV; page ISR → Workers Cache with
 *   tag purges, so `revalidateTag` still refreshes catalog pages.
 * - `next/image` → Cloudflare Images (the Vercel optimizer is gone).
 * - Tailwind runs as its Vite plugin; postcss.config.mjs stays for `next build`
 *   (Vite's CSS @import step can't resolve `@import "tailwindcss"` itself).
 */
export default defineConfig({
  css: { postcss: { plugins: [] } },
  plugins: [
    tailwindcss(),
    vinext({
      cache: { data: kvDataAdapter(), cdn: workersCacheCdnAdapter() },
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      // Read cloudflare.config.ts (bindings, crons, Workers Cache) — the same
      // file `vinext-cloudflare deploy` (the `cf` CLI) deploys from.
      experimental: { newConfig: true },
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
})
