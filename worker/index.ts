/**
 * Cloudflare Workers entry: vinext serves every request; Cron Triggers replace
 * the `crons` in vercel.json by calling the same `/api/cron/*` routes
 * in-process, with the `Authorization: Bearer $CRON_SECRET` header Vercel sent.
 */
import type {
  ExecutionContext,
  ExportedHandler,
  ScheduledController,
} from "@cloudflare/workers-types"
import vinext from "vinext/server/fetch-handler"

import { CRON_ROUTES } from "./crons"

export * from "vinext/server/fetch-handler"

type CronEnv = { CRON_SECRET?: string }

export default {
  ...vinext,
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
