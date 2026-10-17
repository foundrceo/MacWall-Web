/**
 * Cron Triggers (replacing the `crons` in vercel.json): expression → the
 * `/api/cron/*` route it runs. Shared by cloudflare.config.ts (schedules) and
 * worker/index.ts (dispatch), so the two cannot drift.
 */
export const CRON_ROUTES: Record<string, string> = {
  "*/5 * * * *": "/api/cron/checkout-recovery",
  "*/10 * * * *": "/api/cron/trial-ended",
  "7,22,37,52 * * * *": "/api/cron/prune-checkouts",
}
