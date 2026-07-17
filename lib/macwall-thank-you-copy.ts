import {
  macwall,
  macwallInstallerLatestPath,
  macwallLicenseActivationDeepLink,
} from "@/lib/macwall-site"

export const macwallThankYouCopy = {
  title: "You're all set.",
  lead: `Thanks for buying ${macwall.name} Pro. Your license details are on the way to the email you used at checkout.`,
  stepsTitle: "What happens next",
  steps: [
    {
      title: "Check your inbox",
      body: "Whop sends your license key and activation steps within a few minutes. Check spam if you do not see it.",
    },
    {
      title: "Activate Pro in one tap",
      body: "Open MacWall from your purchase email or tap Open MacWall below — your license key activates automatically when the app is installed.",
    },
    {
      title: "Download MacWall",
      body: "If you have not installed yet, download the app first, then use the activation link from your email.",
    },
  ],
  downloadCta: "Download for Mac",
  downloadHref: macwallInstallerLatestPath,
  openAppCta: "Open MacWall",
  openAppHref: macwallLicenseActivationDeepLink(),
  openAppWithKeyHref: (licenseKey: string) =>
    macwallLicenseActivationDeepLink(licenseKey),
  supportLabel: "Need help activating?",
  supportHint: "Send your purchase email and we will help you get Pro running.",
} as const
