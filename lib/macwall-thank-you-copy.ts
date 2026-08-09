import {
  macwall,
  macwallInstallerLatestPath,
  macwallLicenseActivationDeepLink,
} from "@/lib/macwall-site"

export const macwallThankYouCopy = {
  title: "You're all set.",
  lead: `Thanks for buying ${macwall.name} Pro. Your license key is on its way to the email you used at checkout.`,
  stepsTitle: "What happens next",
  steps: [
    {
      title: "Check your inbox",
      body: "Your license key, receipt, and activation steps arrive within a few minutes. Check spam if you don't see them.",
    },
    {
      title: "Activate Pro in one tap",
      body: "After checkout you land on macwall.app/activate. MacWall opens on its own and Pro activates with your key. Nothing to copy or paste.",
    },
    {
      title: "Download MacWall",
      body: "Haven't installed it yet? Download the app first, then use the activation link from your email.",
    },
  ],
  downloadCta: "Download for Mac",
  downloadHref: macwallInstallerLatestPath,
  openAppCta: "Open MacWall",
  openAppHref: macwallLicenseActivationDeepLink(),
  openAppWithKeyHref: (licenseKey: string) =>
    macwallLicenseActivationDeepLink(licenseKey),
  supportLabel: "Stuck activating?",
  supportHint:
    "Email us the address you bought with and we'll get Pro running on your Mac.",
} as const
