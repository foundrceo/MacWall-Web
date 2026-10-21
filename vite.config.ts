import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import vinext from "vinext"
import { cloudflare } from "@cloudflare/vite-plugin"
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter"
import { workersCacheCdnAdapter } from "@vinext/cloudflare/cache/workers-cache-cdn-adapter"
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer"

/**
 * Workers build via vinext. The Worker itself is configured in wrangler.jsonc.
 * - `unstable_cache` goes to Workers KV, page ISR to the Workers Cache with tag
 *   purges, so `revalidateTag` still refreshes catalog pages.
 * - `next/image` goes through Cloudflare Images.
 * - Tailwind runs as a Vite plugin because Vite's CSS @import step can't
 *   resolve `@import "tailwindcss"`. postcss.config.mjs is only for `next build`.
 */
export default defineConfig({
  css: { postcss: { plugins: [] } },
  plugins: [
    tailwindcss(),
    vinext({
      cache: {
        // Same KV adapter, wrapped so a failed KV write never fails a request.
        data: {
          ...kvDataAdapter(),
          adapter: fileURLToPath(new URL("./worker/kv-data-cache.ts", import.meta.url)),
        },
        cdn: workersCacheCdnAdapter(),
      },
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
})
