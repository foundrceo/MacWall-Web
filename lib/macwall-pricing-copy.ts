import {
  macwall,
  mailtoReelRefund,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"
import { LICENSE_PLANS } from "@/lib/license/plans.shared"

export type ReelRefundStepIcon = "video" | "tag" | "views" | "email"

export const macwallPricingCopy = {
  heroTitle: "One purchase. Earn your money back.",
  heroLead: `${macwall.name} Pro is a one-time ${macwall.pro.price} license with lifetime updates on up to ${macwall.maxLicensedMacs} Macs. Buy once, use the full app, then make a Reel and get up to 100% refunded when your video hits the view targets.`,

  reelRefund: {
    badge: "Reel refund",
    title: "Get 100% back",
    description:
      "Make a Reel. Get views. We pay you back. Instagram or TikTok. Organic views only.",
    steps: [
      {
        icon: "video" as const,
        title: "Create your Reel",
        body: `Film ${macwall.name} on your Mac, your setup, your wallpaper, your vibe.`,
      },
      {
        icon: "tag" as const,
        title: "Post and tag us",
      },
      {
        icon: "views" as const,
        title: "Hit the milestones",
        body: `${macwall.reelRefundHalfViews.toLocaleString()} views → 50% refund. ${macwall.reelRefundFullViews.toLocaleString()} views → full refund.`,
      },
      {
        icon: "email" as const,
        title: "Send your claim",
        body: `Email ${macwall.reelRefundEmail} with your Reel link, view screenshot, and purchase email.`,
      },
    ],
    influencerTitle: "Got a bigger audience?",
    finePrintLabel: "The fine print:",
    finePrint:
      "You can post as many Reels as you want until one hits 2,000 views, no cap on attempts. Views must be organic (no bots, no paid promotion). We reserve the right to verify view counts and decline suspicious activity. Refund is 50% of the purchase price, sent via the original payment method. Offer can be withdrawn at any time.",
    cta: "Email for your refund",
    ctaHref: mailtoReelRefund,
  },

  pro: {
    badge: LICENSE_PLANS.pro.badge,
    title: LICENSE_PLANS.pro.name,
    description: LICENSE_PLANS.pro.description,
    cta: LICENSE_PLANS.pro.buyCta,
    ctaAria: `Buy ${macwall.name} Pro for ${LICENSE_PLANS.pro.price}`,
    features: [
      ...macwall.pro.features,
      ...macwall.proIncludedFeatures.slice(0, 4),
      `Use on up to ${LICENSE_PLANS.pro.maxDevices} personal Macs`,
      "Lifetime updates with your license",
    ],
  },

  proPlus: {
    badge: LICENSE_PLANS.pro_plus.badge,
    title: LICENSE_PLANS.pro_plus.name,
    description: LICENSE_PLANS.pro_plus.description,
    cta: LICENSE_PLANS.pro_plus.buyCta,
    ctaAria: `Buy ${macwall.name} Pro Plus for ${LICENSE_PLANS.pro_plus.price}`,
    features: [
      "Everything in Pro",
      `Use on up to ${LICENSE_PLANS.pro_plus.maxDevices} personal Macs`,
      "Full catalog + Lock Screen video",
      "Lifetime updates with your license",
      LICENSE_PLANS.pro_plus.featureHighlight,
    ],
  },

  faqTitle: "Common questions",

  faq: [
    {
      q: "How does the Reel refund work?",
      a: `Buy ${macwall.name} Pro, post on Instagram ${macwall.reelRefundInstagram} or TikTok ${macwall.reelRefundTiktok} with ${macwall.reelRefundHashtag}, then email ${macwall.reelRefundEmail} once you hit ${macwall.reelRefundHalfViews.toLocaleString()} views for 50% back or ${macwall.reelRefundFullViews.toLocaleString()} views for a full refund.`,
    },
    {
      q: "Is Pro a subscription?",
      a: "No. Pro is a one-time purchase for the current Pro feature set bundled with your license, including updates we ship for that generation of the product.",
    },
    {
      q: "How does checkout work?",
      a: "Checkout runs on Stripe. After payment, your license details are delivered to the email you used. Keep that message for reinstalls or device changes.",
    },
    {
      q: "How many Macs can I use with one license?",
      a: `Pro (${macwall.pro.price}) covers up to ${LICENSE_PLANS.pro.maxDevices} personal Macs. Pro Plus (${LICENSE_PLANS.pro_plus.price}) covers up to ${LICENSE_PLANS.pro_plus.maxDevices}. Replacing a Mac? Unlink the license on the old machine in Settings → Devices, then activate on the new one.`,
    },
    {
      q: "Does Lock Screen video work on every macOS version?",
      a: `Live Lock Screen and Screen Saver wallpapers require ${macwallMinimumMacOSVersion} or later, where Apple exposes the native wallpaper APIs.`,
    },
    {
      q: "Can I get a refund without making a Reel?",
      a: `There is no general refund policy: all sales are final. In limited cases (for example, a billing error or the app not running on a supported macOS version) we may issue a refund at our discretion. Email ${macwall.supportEmail} and we'll review it. The Reel program is separate: email ${macwall.reelRefundEmail} with your post link and purchase email after you hit the view targets.`,
    },
    {
      q: "Where do I get help?",
      a: `Email ${macwall.supportEmail} with your macOS version, Mac model, and a short screen recording if something looks wrong. We read every message.`,
    },
    {
      q: "Which macOS releases are supported?",
      a: `MacWall runs on ${macwallMinimumMacOSVersion} or later on Apple silicon and Intel Macs. Download the latest build from the site for the freshest compatibility notes.`,
    },
  ] as const,

  bottomTitle: `Get ${macwall.name}`,
  bottomDesc: `Pro is ${macwall.pro.price} for ${LICENSE_PLANS.pro.maxDevices} Macs. Pro Plus is ${LICENSE_PLANS.pro_plus.price} for ${LICENSE_PLANS.pro_plus.maxDevices} Macs. Make a Reel and earn up to 100% back.`,
  bottomCtaPro: `Buy Pro for ${macwall.pro.price}`,
  bottomCtaReel: "Get 100% free",
} as const