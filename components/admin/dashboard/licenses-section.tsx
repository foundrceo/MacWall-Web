"use client"

/** Licenses on record and the Macs activated with them. */

import { Panel, Stat, StatGroup } from "@/components/admin/ui"

import { DashboardSection, PartBar } from "./blocks"
import { formatCount, formatPercent, percentOf } from "./format"
import type { SectionProps } from "./types"

export function LicensesSection({ snapshot }: SectionProps) {
  const { data } = snapshot
  const licenses = data.licenseAnalytics
  const paid = licenses.activeLicenses

  return (
    <DashboardSection
      id="licenses"
      title="Licenses"
      description="Every license on record. Only Macs activated follows the date range."
    >
      <StatGroup columns={4}>
        <Stat
          label="Active licenses"
          value={licenses.activeLicenses}
          hint={`${formatCount(licenses.proLicenses)} Pro · ${formatCount(licenses.proPlusLicenses)} Pro+ · ${formatCount(licenses.annualLicenses)} annual`}
        />
        <Stat
          label="Pending checkouts"
          value={licenses.pendingLicenses}
          hint="Checkout started, not paid"
        />
        <Stat
          label="Lifetime licenses"
          value={licenses.permanentLicenses}
          hint={`${formatCount(licenses.annualLicenses)} on the legacy annual plan`}
        />
        <Stat
          label="Macs activated"
          value={data.activatedDevicesInRange}
          hint={
            data.rangeDays === 0
              ? "All time"
              : `In the last ${data.rangeDays} days`
          }
        />
      </StatGroup>

      <Panel className="grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <PartBar
          className="p-4"
          title="By plan"
          figure={`${formatPercent(percentOf(licenses.proPlusLicenses, paid))} Pro+`}
          parts={[
            {
              label: "Pro (3 Macs)",
              value: licenses.proLicenses,
              tone: "blue",
            },
            {
              label: "Pro+ (5 Macs)",
              value: licenses.proPlusLicenses,
              tone: "violet",
            },
            {
              label: "Legacy annual",
              value: licenses.annualLicenses,
              tone: "neutral",
            },
          ]}
          empty="No paid licenses yet."
        />
        <PartBar
          className="p-4"
          title="By status"
          figure={`${formatCount(licenses.totalLicenses)} in total`}
          parts={[
            { label: "Active", value: licenses.activeLicenses, tone: "green" },
            {
              label: "Pending checkout",
              value: licenses.pendingLicenses,
              tone: "amber",
            },
            {
              label: "Expired",
              value: licenses.expiredLicenses,
              tone: "neutral",
            },
            { label: "Revoked", value: licenses.revokedLicenses, tone: "red" },
          ]}
          empty="No licenses yet."
        />
        <PartBar
          className="p-4"
          title="By billing"
          figure={`${formatPercent(percentOf(licenses.permanentLicenses, paid))} one-time`}
          parts={[
            {
              label: "One-time",
              value: licenses.permanentLicenses,
              tone: "blue",
            },
            {
              label: "Subscription",
              value: licenses.subscriptionLicenses,
              tone: "violet",
            },
          ]}
          empty="No paid licenses yet."
        />
      </Panel>
    </DashboardSection>
  )
}
