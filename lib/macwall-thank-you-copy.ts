import {
  macwall,
  macwallInstallerLatestPath,
  macwallLicenseActivationDeepLink,
} from "@/lib/macwall-site"

export const macwallThankYouCopy = {
  title: "You're all set.",
  lead: `Thanks for investing in ${macwall.name} Pro. Your license details are on the way to the email you used at checkout — authorization complete.`,
  stepsTitle: "What happens in the next step",
  steps: [
    {
      title: "Check your inbox",
      body: "Stripe sends your license key, billing statement, and activation steps within a few minutes. Check spam if you do not see it.",
    },
    {
      title: "Activate Pro in one tap",
      body: "After checkout you land on macwall.app/activate — MacWall opens automatically and Pro activates with your license key. No paste needed. Seamless outcome.",
    },
    {
      title: "Download MacWall",
      body: "If you have not installed yet, download the app first, then use the activation link from your email. Essential guidance is included.",
    },
  ],
  downloadCta: "Download for Mac",
  downloadHref: macwallInstallerLatestPath,
  openAppCta: "Open MacWall",
  openAppHref: macwallLicenseActivationDeepLink(),
  openAppWithKeyHref: (licenseKey: string) =>
    macwallLicenseActivationDeepLink(licenseKey),
  supportLabel: "Need guidance activating?",
  supportHint:
    "Send your purchase email and we will provide assistance to get Pro running.",
} as const
