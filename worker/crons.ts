/**
 * Cron Triggers: expression → the `/api/cron/*` route it runs. worker/index.ts
 * dispatches on this map, and wrangler.jsonc `triggers.crons` lists the same
 * expressions (one route per expression, so a second job on the same cadence
 * gets offset minutes).
 */
export const CRON_ROUTES: Record<string, string> = {
  "*/5 * * * *": "/api/cron/checkout-recovery",
  "*/10 * * * *": "/api/cron/trial-ended",
  "7,22,37,52 * * * *": "/api/cron/prune-checkouts",
  // Every 5 minutes, a minute after sales start and end (they do on :00/:30).
  "1,6,11,16,21,26,31,36,41,46,51,56 * * * *": "/api/cron/sale-boundary",
  "15 3 * * *": "/api/cron/indexnow",
}
