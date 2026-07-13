import { macwall, macwallInstallerLatestPath } from "@/lib/macwall-site"

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
      title: "Download MacWall",
      body: "Install the app on your Mac, then enter your license when prompted.",
    },
    {
      title: "Activate Pro",
      body: `Use your license on up to ${macwall.maxLicensedMacs} personal Macs. Keep the email for reinstalls.`,
    },
  ],
  downloadCta: "Download for Mac",
  downloadHref: macwallInstallerLatestPath,
  supportLabel: "Need help activating?",
  supportHint: "Send your purchase email and we will help you get Pro running.",
} as const
