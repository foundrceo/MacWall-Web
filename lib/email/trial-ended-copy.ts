export const EMAIL_TRIAL_PROMO_CODE = "WALL10"
export const EMAIL_TRIAL_PROMO_PERCENT = "10%"
export const EMAIL_TRIAL_LADDER_20 = "R7N2WP8J"
export const EMAIL_TRIAL_LADDER_30 = "B3H9KF5Q"

export type TrialEndedEmailStep = "ended" | "ladder_20" | "ladder_30"

export function trialEndedPromo(step: TrialEndedEmailStep): {
  code: string
  percent: string
  expiresHours: number | null
} {
  switch (step) {
    case "ended":
      return {
        code: EMAIL_TRIAL_PROMO_CODE,
        percent: EMAIL_TRIAL_PROMO_PERCENT,
        expiresHours: null,
      }
    case "ladder_20":
      return { code: EMAIL_TRIAL_LADDER_20, percent: "20%", expiresHours: 24 }
    case "ladder_30":
      return { code: EMAIL_TRIAL_LADDER_30, percent: "30%", expiresHours: 12 }
    default: {
      const _never: never = step
      return _never
    }
  }
}

export type TrialEndedCopy = {
  subject: string
  preheader: string
  headline: string
  body: string
  cta: string
  codeLabel: string
  codeHint: string
}

export function trialEndedCopy(
  step: TrialEndedEmailStep,
  appName = "MacWall"
): TrialEndedCopy {
  const promo = trialEndedPromo(step)
  switch (step) {
    case "ended":
      return {
        subject: `Your ${appName} Pro trial ended`,
        preheader: `The 24-hour Pro trial is over. ${promo.percent} off with ${promo.code}`,
        headline: "Your trial ended",
        body: `The 24-hour ${appName} Pro trial is over. Keep live wallpapers and Lock Screen with a one-time Pro license.`,
        cta: "Get Pro",
        codeLabel: "Discount code",
        codeHint: `${promo.percent} off. Auto-applied at checkout.`,
      }
    case "ladder_20":
      return {
        subject: `20% off ${appName} Pro for 24 hours`,
        preheader: `Code ${promo.code} expires in 24 hours`,
        headline: "20% off Pro",
        body: `Your ${appName} Pro trial ended. This 20% code lasts 24 hours.`,
        cta: "Get Pro",
        codeLabel: "Discount code",
        codeHint: `${promo.percent} off. Expires in 24 hours.`,
      }
    case "ladder_30":
      return {
        subject: `30% off ${appName} Pro for 12 hours`,
        preheader: `Code ${promo.code} expires in 12 hours`,
        headline: "30% off Pro",
        body: `Last mail about the trial. This 30% code lasts 12 hours.`,
        cta: "Get Pro",
        codeLabel: "Discount code",
        codeHint: `${promo.percent} off. Expires in 12 hours.`,
      }
    default: {
      const _never: never = step
      return _never
    }
  }
}

export function trialEndedPlainText(args: {
  step: TrialEndedEmailStep
  appName?: string
  checkoutHref: string
  unsubscribeHref?: string | null
  supportEmail?: string
}): string {
  const appName = args.appName ?? "MacWall"
  const copy = trialEndedCopy(args.step, appName)
  const promo = trialEndedPromo(args.step)
  const unsub = args.unsubscribeHref?.trim()
  const support = args.supportEmail?.trim() || "support@macwall.app"
  return (
    `${copy.headline}\n\n` +
    `${copy.body}\n\n` +
    `${copy.codeLabel}: ${promo.code}\n` +
    `${copy.codeHint}\n` +
    `${copy.cta}: ${args.checkoutHref}\n\n` +
    `Already paid? Ignore this email.\n` +
    (unsub ? `Unsubscribe: ${unsub}\n` : "") +
    `\nHelp: ${support}`
  )
}
