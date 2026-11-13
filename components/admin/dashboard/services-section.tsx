"use client"

/** Live status of the services MacWall runs on. */

import type { ReactNode } from "react"

import {
  Badge,
  DataList,
  Panel,
  type DataListItem,
  type Tone,
} from "@/components/admin/ui"
import { formatUsd } from "@/lib/admin/format"

import { DashboardSection } from "./blocks"
import { formatCount, formatPercent, stripeProblem } from "./format"
import type { SectionProps } from "./types"

type Status = { tone: Tone; label: string }

const notConfigured = (error: string | undefined) =>
  !error || /not set/i.test(error)

export function ServicesSection({ snapshot }: SectionProps) {
  const { data } = snapshot
  const { stripeLive } = data
  const { resend, cloudflare } = data.opsLive
  const range =
    data.rangeDays === 0 ? "all time" : `last ${data.rangeDays} days`

  let stripeStatus: Status = { tone: "neutral", label: "No balance" }
  if (stripeLive.balance) {
    stripeStatus = { tone: "green", label: "Connected" }
  } else if (stripeLive.error) {
    stripeStatus = {
      tone: "red",
      label: /expired|invalid/i.test(stripeLive.error)
        ? "Key expired"
        : "Unavailable",
    }
  }

  let resendStatus: Status = { tone: "green", label: "Connected" }
  if (!resend.available) {
    resendStatus = notConfigured(resend.error)
      ? { tone: "neutral", label: "Not configured" }
      : { tone: "red", label: "Unavailable" }
  }

  const reachable = cloudflare.buckets.filter((bucket) => bucket.reachable)
  let storageStatus: Status = {
    tone: "green",
    label: `${reachable.length} of ${cloudflare.buckets.length} reachable`,
  }
  if (!cloudflare.available) {
    storageStatus = notConfigured(cloudflare.error)
      ? { tone: "neutral", label: "Not configured" }
      : { tone: "red", label: "Unavailable" }
  } else if (reachable.length < cloudflare.buckets.length) {
    storageStatus = { ...storageStatus, tone: "red" }
  }

  return (
    <DashboardSection
      id="services"
      title="Services"
      description="Checked live on every refresh. A service without credentials shows as not configured."
    >
      <Panel className="grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <Service
          name="Stripe"
          about="Payments and payout balance"
          status={stripeStatus}
          message={
            stripeLive.balance
              ? null
              : stripeLive.error
                ? `${stripeProblem(stripeLive.error)} Balance is unavailable.`
                : "Stripe returned no balance."
          }
          items={[
            {
              label: "Available",
              value: stripeLive.balance
                ? formatUsd(stripeLive.balance.availableUsd)
                : "—",
            },
            {
              label: "Pending",
              value: stripeLive.balance
                ? formatUsd(stripeLive.balance.pendingUsd)
                : "—",
            },
            {
              label: "Paid charges loaded",
              value: formatCount(stripeLive.chargeCount),
            },
          ]}
        />
        <Service
          name="Resend"
          about={`Email delivery, ${range}`}
          status={resendStatus}
          message={
            resend.available
              ? null
              : (resend.error ?? "RESEND_API_KEY is not set.")
          }
          items={
            resend.available
              ? [
                  { label: "Sent", value: formatCount(resend.sent) },
                  {
                    label: "Delivered",
                    value: `${formatCount(resend.delivered)} · ${formatPercent(resend.deliveryRate)}`,
                  },
                  { label: "Opened", value: formatCount(resend.opened) },
                  { label: "Clicked", value: formatCount(resend.clicked) },
                  { label: "Bounced", value: formatCount(resend.bounced) },
                  { label: "Failed", value: formatCount(resend.failed) },
                ]
              : []
          }
        />
        <Service
          name="Cloudflare R2"
          about="Wallpaper and installer storage"
          status={storageStatus}
          message={
            cloudflare.available
              ? null
              : (cloudflare.error ?? "R2 credentials are not set.")
          }
          items={cloudflare.buckets.map((bucket) => ({
            label: bucket.name,
            value: (
              <span className={bucket.reachable ? "text-soft" : "text-red"}>
                {bucket.reachable ? "Reachable" : "Down"}
              </span>
            ),
          }))}
        />
      </Panel>
    </DashboardSection>
  )
}

function Service({
  name,
  about,
  status,
  message,
  items,
}: Readonly<{
  name: string
  about: string
  status: Status
  /** Why the numbers are missing, when they are. */
  message: ReactNode
  items: readonly DataListItem[]
}>) {
  return (
    <div className="min-w-0 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="truncate text-[13px] font-medium text-foreground">
          {name}
        </h3>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{about}</p>
      {message ? (
        <p className="text-soft mt-3 text-[13px] text-pretty break-words">
          {message}
        </p>
      ) : null}
      {items.length > 0 ? <DataList className="mt-3" items={items} /> : null}
    </div>
  )
}
