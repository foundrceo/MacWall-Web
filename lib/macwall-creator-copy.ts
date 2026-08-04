import {
  macwall,
  macwallInstallerLatestPath,
  mailtoReelRefund,
} from "@/lib/macwall-site"

const halfViews = macwall.reelRefundHalfViews.toLocaleString()
const fullViews = macwall.reelRefundFullViews.toLocaleString()

export const macwallCreatorCopy = {
  pageTitle: "Creator Solution",
  heroTitle: "Build a video. Achieve a complete resolution.",
  heroLead: `Post a MacWall video. If it takes off with high-reach growth, your investment is on us.`,

  steps: [
    {
      id: "1",
      title: `Invest in ${macwall.name}`,
      body: `A licensed copy, running on your own Mac — the resolution needs a purchase to resolve. Claim it on pricing or download complimentary first and invest when you're ready to film.`,
    },
    {
      id: "2",
      title: "Record a short video of it in real use",
      body: `Real screen, real setup — not a scripted campaign. Demonstrate browsing the catalog, applying a live wallpaper, Lock Screen coming alive, menu bar controls. Those moments are the most photogenic.`,
    },
    {
      id: "3",
      title: "Post it publicly",
      body: `Instagram, TikTok, YouTube Shorts, Threads, or X — your pick. Add ${macwall.reelRefundHashtag} wherever you post. Tag ${macwall.reelRefundInstagram} or ${macwall.reelRefundTiktok} so we can find you. Grow your online presence.`,
    },
    {
      id: "4",
      title: "Cross a milestone, then email us",
      body: `At ${halfViews} reach your video is worth 50% back; at ${fullViews} reach it's worth the complete investment. Email ${macwall.reelRefundEmail} with your video link, reach screenshot, and purchase email.`,
    },
    {
      id: "5",
      title: "We verify and resolve",
      body: `We check the numbers and resolve within 48 hours — half at ${halfViews}, everything at ${fullViews}. Same video keeps climbing? Email again and we top up the rest. In the next step, your earnings land on the original secure payment method.`,
    },
    {
      id: "6",
      title: "The fine print",
      body: `Post as many times as you want until one video hits ${halfViews} organic reach. No bots or paid campaigns. We may verify reach and decline suspicious claims. Resolutions go to the original secure payment method. Solution can end anytime.`,
    },
  ] as const,

  midCtaTitle:
    "Experience it complimentary, film what you love, and let the video pay for it",
  midCtaLabel: "Download for macOS",
  midCtaHref: macwallInstallerLatestPath,

  influencerTitle: "Got large-scale community reach?",
  influencerBody: `If you already have ideal clients watching and want to do something bigger than a single video — a complimentary license, a proper collaboration — skip the reach milestone and email ${macwall.reelRefundEmail} directly. Tell us where you post and what you have in mind. We'll schedule a strategy session.`,

  faqTitle: "Questions",
  faq: [
    {
      q: "Which platforms count?",
      a: `Instagram Reels, TikTok, YouTube — Shorts and full-length videos both count — Threads, and X. We go by the reach the platform itself shows on your post, the same number your step-four screenshot captures. On X that number is technically impressions rather than video plays; we know, and it still counts — the post just has to actually contain your video. The reach must land on one video on one platform; we don't add counts up across posts or platforms.`,
    },
    {
      q: "Do I need a large-scale following to launch?",
      a: "No. Plenty of videos take off from compact accounts because the moment is exceptional, not because the poster is famous. If you do have massive reach, email us and we'll set something up directly — a consultation to explain the roadmap.",
    },
    {
      q: "What if I invested during an exclusive offer?",
      a: "We resolve exactly what you paid, to the same secure payment method — exclusive-offer value included. The resolution matches your order, nothing more or less. No shortfall, no surprise net profit games.",
    },
    {
      q: "How long does verification take?",
      a: `Once your video is past the reach milestone and you've emailed us the link, screenshot, and purchase email, we verify and resolve within 48 hours. Challenging claims get a friendly reminder if we need more insights.`,
    },
  ] as const,

  closingTitle: "One more thing",
  closingBody: `${macwall.name} is built by a small organization. There's no big brand-growth department behind this — a video from someone actually leveraging the app does more than any campaign we could run, and this is the honest way to say thanks for it. Download complimentary, put it through a real workday, and if it earns a place in your setup, film it. Master the moment; adapt what works.`,

  claimCta: "Email us",
  claimHref: mailtoReelRefund,
  pricingLinkLabel: "View pricing",
} as const
