/**
 * Shape of `GET /api/admin/analytics?days=N` (app/api/admin/analytics/route.ts).
 * The pieces come from the data layer, so a change there fails the build here.
 */

import type { OpsLivePayload } from "@/lib/admin/ops-live"
import type {
  CheckoutRecoverySummary,
  ConversionFunnel,
  DayOfWeekSalesRow,
  LicenseAnalyticsSummary,
  SalesSummary,
} from "@/lib/admin/sales"
import type {
  StripeBalanceLive,
  StripePromotionRow,
} from "@/lib/admin/stripe-live"
import type {
  CountryCountRow,
  DailyRow,
  HourlyHeatmapCell,
  IndiaAudienceMetrics,
  LiveActivityMetrics,
  LocationCountRow,
  PromoDiscountAnalytics,
  UserSessionEngagement,
} from "@/lib/analytics/admin-metrics"

export type AnalyticsResponse = {
  /** 0 means all time. */
  rangeDays: number
  since: string
  lastEventAt: string | null
  eventCounts: Array<{ event_name: string; count: number }>
  dailyCounts: DailyRow[]
  downloadFunnel: {
    clicks: number
    redirects: number
    uniqueRedirectSessions: number
    completionRate: number
  }
  downloadClicksByLocation: LocationCountRow[]
  pricingClicksByLocation: LocationCountRow[]
  downloadDaily: DailyRow[]
  topPages: Array<{ path: string; count: number }>
  visitorsByCountry: CountryCountRow[]
  indiaAudience: IndiaAudienceMetrics
  communityUploads: { pending: number; approved: number; rejected: number }
  catalogWallpaperCount: number
  totalLikes: number
  activatedDevicesAllTime: number
  activatedDevicesInRange: number
  wallpaperCategoryCounts: Array<{ category: string; count: number }>
  topLikedWallpapers: Array<{
    id: string
    name: string
    category: string
    likeCount: number
  }>
  sales: SalesSummary
  conversionFunnel: ConversionFunnel
  licenseAnalytics: LicenseAnalyticsSummary
  liveActivity: LiveActivityMetrics
  dayOfWeekSales: DayOfWeekSalesRow[]
  hourlyHeatmap: HourlyHeatmapCell[]
  promoDiscount: PromoDiscountAnalytics
  sessionEngagement: UserSessionEngagement
  recoveryStats: CheckoutRecoverySummary
  feedbackTotals: {
    total: number
    open: number
    resolved: number
    needsReply: number
    sentiments: Array<{
      label: string
      sentiment: string
      count: number
      color: string
    }>
  }
  stripeLive: {
    balance: StripeBalanceLive | null
    promotions: StripePromotionRow[]
    chargeCount: number
    error?: string
  }
  opsLive: OpsLivePayload
}

/** A loaded payload plus when it arrived, so charts never read the clock. */
export type Snapshot = {
  data: AnalyticsResponse
  fetchedAt: number
}

/** Props every dashboard section takes. */
export type SectionProps = Readonly<{ snapshot: Snapshot }>
