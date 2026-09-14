import type { Metadata } from "next"

import { unsubscribeTrialEmailByToken } from "@/lib/email/trial-unsubscribe"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
}

export default async function TrialUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const result = await unsubscribeTrialEmailByToken(t)

  const title = result.ok
    ? "Unsubscribed"
    : result.error === "update_failed"
      ? "Could not unsubscribe"
      : "Invalid unsubscribe link"

  const body = result.ok
    ? "You will not get more MacWall trial emails at this address."
    : result.error === "update_failed"
      ? "Try the link again, or email support@macwall.app."
      : "That link is missing or expired. If mail keeps arriving, write to support@macwall.app."

  return (
    <main
      id="main-content"
      className="mx-auto max-w-lg px-6 py-24 text-center"
    >
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        {body}
      </p>
    </main>
  )
}
