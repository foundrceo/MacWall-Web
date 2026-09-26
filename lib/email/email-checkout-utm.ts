/**
 * UTM params on recovery / trial checkout links so Mixpanel + marketing
 * attribution can attribute email → checkout → paid.
 */

export type EmailCheckoutUtmMedium = "recovery" | "trial_ended"

export type EmailCheckoutUtmCampaign =
  | "wall10"
  | "ladder_20"
  | "ladder_30"

export function appendEmailCheckoutUtm(
  params: URLSearchParams,
  args: {
    medium: EmailCheckoutUtmMedium
    campaign: EmailCheckoutUtmCampaign
  }
): void {
  params.set("utm_source", "email")
  params.set("utm_medium", args.medium)
  params.set("utm_campaign", args.campaign)
}

export function trialEndedUtmCampaign(
  step: "ended" | "ladder_20" | "ladder_30"
): EmailCheckoutUtmCampaign {
  switch (step) {
    case "ended":
      return "wall10"
    case "ladder_20":
      return "ladder_20"
    case "ladder_30":
      return "ladder_30"
    default: {
      const _never: never = step
      return _never
    }
  }
}
