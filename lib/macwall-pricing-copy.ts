import { macwall, mailtoReelRefund } from "@/lib/macwall-site"

export type ReelRefundStepIcon = "video" | "tag" | "views" | "email"

export const macwallPricingCopy = {
  heroTitle: "Try Pro for 24 hours. Keep it for life.",
  heroLead: `${macwall.name} Pro starts with a 24-hour free trial. When the timer ends, live wallpapers pause until you activate a one-time ${macwall.pro.price} license with lifetime updates — then make a Reel and get up to 100% refunded when your video hits the view targets.`,

  reelRefund: {
    badge: "Reel refund",
    title: "Get 50% back",
    description:
      "Make a Reel. Get views. We pay you back. Instagram or TikTok. Organic views only.",
    steps: [
      {
        icon: "video" as const,
        title: "Create your Reel",
        body: `Film ${macwall.name} on your Mac — your setup, your wallpaper, your vibe.`,
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
      "You can post as many Reels as you want until one hits 2,000 views — no cap on attempts. Views must be organic (no bots, no paid promotion). We reserve the right to verify view counts and decline suspicious activity. Refund is 50% of the purchase price, sent via the original payment method. Offer can be withdrawn at any time.",
    cta: "Email for your refund",
    ctaHref: mailtoReelRefund,
  },

  pro: {
    badge: "Pro",
    title: "Trial, then lifetime license",
    description: `${macwall.trial.description} Then pay one-time ${macwall.pro.price} for the full catalog, Lock Screen video, unlimited playlists, and lifetime updates on up to ${macwall.maxLicensedMacs} Macs — no subscription, ever.`,
    cta: `Buy Pro for ${macwall.pro.price}`,
    ctaAria: `Buy ${macwall.name} Pro for ${macwall.pro.price}`,
    features: [
      ...macwall.pro.features,
      ...macwall.proIncludedFeatures.slice(0, 5),
      `Use on up to ${macwall.maxLicensedMacs} personal Macs`,
      "Lifetime updates with your license",
    ],
  },

  faqTitle: "Common questions",

  faq: [
    {
      q: "How does the 24-hour trial work?",
      a: `Start the trial in ${macwall.name} and the timer begins immediately. You get the full Pro experience for 24 hours. When the fixed timer ends, MacWall stops live wallpapers and locks Pro features until you activate a paid license.`,
    },
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
      a: "Checkout runs on Whop. After payment, your license details are delivered to the email you used. Keep that message for reinstalls or device changes.",
    },
    {
      q: "How many Macs can I use with one Pro license?",
      a: `Each Pro license may be activated on up to ${macwall.maxLicensedMacs} personal Macs you own. Replace a machine by moving the seat from the old Mac to the new one in line with the terms you agree to at purchase.`,
    },
    {
      q: "Does Lock Screen video work on every macOS version?",
      a: "Lock Screen live wallpapers follow Apple's platform gates. Where the OS does not expose APIs, Pro still unlocks catalog depth and other premium features documented on this site and in the app.",
    },
    {
      q: "Can I get a refund without making a Reel?",
      a: `Standard refund eligibility is described in our Terms of Service. The Reel program is separate: email ${macwall.reelRefundEmail} with your post link and purchase email after you hit the view targets.`,
    },
    {
      q: "Where do I get help?",
      a: `Email ${macwall.supportEmail} with your macOS version, Mac model, and a short screen recording if something looks wrong. We read every message.`,
    },
    {
      q: "Which macOS releases are supported?",
      a: "We target current and recent macOS versions on Apple silicon, and Intel where Apple still ships security updates for the OS. Download the latest build from the site for the freshest compatibility notes.",
    },
  ] as const,

  bottomTitle: `Get ${macwall.name}`,
  bottomDesc: `Start with 24 hours free. Pro is ${macwall.pro.price} one-time after that. Make a Reel and earn up to 100% back. Up to ${macwall.maxLicensedMacs} Macs with a personal license.`,
  bottomCtaPro: `Buy Pro for ${macwall.pro.price}`,
  bottomCtaReel: "Save 50% with a Reel",
} as const
