"use client"

/** Checkout recovery emails and promotions: what they brought back. */

import {
  Badge,
  DataList,
  Panel,
  PanelBody,
  PanelHeader,
  Stat,
  StatGroup,
} from "@/components/admin/ui"
import { formatUsd } from "@/lib/admin/format"

import {
  DashboardSection,
  Funnel,
  PanelFigure,
  RankedList,
  type RankedRow,
} from "./blocks"
import {
  formatCount,
  formatPercent,
  plural,
  pricingLocationLabel,
} from "./format"
import type { SectionProps } from "./types"

export function GrowthSection({ snapshot }: SectionProps) {
  return (
    <>
      <RecoverySection snapshot={snapshot} />
      <PromotionsSection snapshot={snapshot} />
    </>
  )
}

function RecoverySection({ snapshot }: SectionProps) {
  const recovery = snapshot.data.recoveryStats
  const opensTracked = recovery.opensTracked && recovery.emailsOpened != null

  let opensHint = "Opens and clicks are not stored"
  if (opensTracked && recovery.emailsClicked != null) {
    opensHint = `${plural(recovery.emailsClicked, "click")} from those emails`
  } else if (recovery.emailsLogged > 0) {
    opensHint = `${plural(recovery.emailsLogged, "email")} in the recovery log`
  }

  return (
    <DashboardSection
      id="recovery"
      title="Checkout recovery"
      description="Abandoned checkouts, the reminder emails sent for them and the sales that came back."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <StatGroup columns={2} className="[&>dl]:h-full">
          <Stat
            label="Recovery emails sent"
            value={recovery.emailsSent}
            hint={`For ${plural(recovery.totalQueued, "queued checkout")}`}
          />
          <Stat
            label="Rescued sales"
            value={recovery.recoveredConversions}
            hint={`${formatPercent(recovery.recoveryRatePercent)} of queued checkouts`}
          />
          <Stat
            label="Rescued revenue"
            value={formatUsd(recovery.recoveredRevenueUsd)}
            hint="Stripe charges on recovered licenses"
          />
          <Stat
            label="Email opens"
            value={opensTracked ? (recovery.emailsOpened ?? 0) : "Not tracked"}
            hint={opensHint}
          />
        </StatGroup>

        <Panel>
          <PanelHeader
            title="Recovery funnel"
            description="Share of checkouts queued in this range"
            actions={
              recovery.totalQueued > 0 ? (
                <PanelFigure
                  value={formatPercent(recovery.recoveryRatePercent)}
                  label="recovered"
                />
              ) : null
            }
          />
          <PanelBody>
            <Funnel
              label="Checkout recovery funnel"
              steps={recovery.funnel.map((step, index) => ({
                label: step.stage,
                value: step.count,
                note: index > 0 ? formatPercent(step.rate) : undefined,
              }))}
              empty="No abandoned checkouts in this range."
            />
          </PanelBody>
          {recovery.totalQueued > 0 ? (
            <PanelBody className="border-t border-border">
              <DataList
                layout="grid"
                columns={4}
                items={[
                  { label: "Sent", value: formatCount(recovery.emailsSent) },
                  { label: "Pending", value: formatCount(recovery.pending) },
                  { label: "Skipped", value: formatCount(recovery.skipped) },
                  {
                    label: "Cancelled",
                    value: formatCount(recovery.cancelled),
                  },
                ]}
              />
            </PanelBody>
          ) : null}
        </Panel>
      </div>
    </DashboardSection>
  )
}

function PromotionsSection({ snapshot }: SectionProps) {
  const { data } = snapshot
  const promos = data.promoDiscount
  const stripeCodes = data.stripeLive.promotions
  const fromStripe = stripeCodes.length > 0

  const codeRows: RankedRow[] = fromStripe
    ? stripeCodes.map((promo) => ({
        key: promo.id,
        label: promo.code,
        value: promo.timesRedeemed,
        detail: (
          <span className="flex items-center gap-2">
            {promo.maxRedemptions != null ? (
              <span className="text-xs text-muted-foreground tabular-nums">
                of {formatCount(promo.maxRedemptions)}
              </span>
            ) : null}
            {promo.active ? null : <Badge>Off</Badge>}
          </span>
        ),
      }))
    : promos.promoCodesBreakdown.map((row) => ({
        key: row.code,
        label: row.label,
        value: row.count,
      }))

  return (
    <DashboardSection
      id="promotions"
      title="Promotions"
      description="Clicks on discount offers and the promo codes redeemed at checkout."
    >
      <StatGroup columns={4}>
        <Stat
          label="Discount clicks"
          value={promos.totalDiscountClicks}
          hint="Offer and banner clicks combined"
        />
        <Stat
          label="Promo redemptions"
          value={promos.checkoutPromoAttempts}
          hint={
            fromStripe
              ? "Stripe promotion codes, lifetime"
              : "Checkouts that used a code"
          }
        />
        <Stat
          label="India offer clicks"
          value={promos.indiaOfferClicks}
          hint={`${plural(data.indiaAudience.uniqueSessions, "session")} from India`}
        />
        <Stat
          label="Announcement bar clicks"
          value={promos.announcementPromoClicks}
          hint="Clicks on the top banner"
        />
      </StatGroup>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Promo codes"
            description={
              fromStripe
                ? "Lifetime redemptions from Stripe"
                : "Checkouts that used a code, this range"
            }
            actions={
              codeRows.length > 0 ? (
                <PanelFigure
                  value={formatCount(promos.checkoutPromoAttempts)}
                  label="redeemed"
                />
              ) : null
            }
          />
          <PanelBody>
            <RankedList
              label="Promo codes by redemptions"
              rows={codeRows}
              empty="No promo codes have been redeemed."
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title="Offer clicks by placement"
            description="Pricing and call-to-action buttons"
          />
          <PanelBody>
            <RankedList
              label="Pricing and call-to-action clicks by placement"
              rows={promos.discountLocations.map((row) => ({
                key: row.location,
                label: pricingLocationLabel(row.location),
                value: row.count,
              }))}
              empty="No pricing or call-to-action clicks in this range."
            />
          </PanelBody>
        </Panel>
      </div>
    </DashboardSection>
  )
}
