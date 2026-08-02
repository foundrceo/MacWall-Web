import {
  macwall,
  macwallInstallerLatestPath,
  mailtoReelRefund,
} from "@/lib/macwall-site"

const halfViews = macwall.reelRefundHalfViews.toLocaleString()
const fullViews = macwall.reelRefundFullViews.toLocaleString()

export const macwallCreatorCopy = {
  pageTitle: "Creator Offer",
  heroTitle: "Make a video. Get a full refund.",
  heroLead: `Post a MacWall video. If it takes off, your purchase is on us.`,

  steps: [
    {
      id: "1",
      title: `Buy ${macwall.name}`,
      body: `A licensed copy, running on your own Mac — the refund needs a purchase to refund. Grab it on pricing or download free first and buy when you're ready to film.`,
    },
    {
      id: "2",
      title: "Record a short video of it in real use",
      body: `Real screen, real setup — not a scripted ad. Show browsing the catalog, applying a live wallpaper, Lock Screen coming alive, menu bar controls. Those moments are the most photogenic.`,
    },
    {
      id: "3",
      title: "Post it publicly",
      body: `Instagram, TikTok, YouTube Shorts, Threads, or X — your pick. Add ${macwall.reelRefundHashtag} wherever you post. Tag ${macwall.reelRefundInstagram} or ${macwall.reelRefundTiktok} so we can find you.`,
    },
    {
      id: "4",
      title: "Cross a threshold, then email us",
      body: `At ${halfViews} views your video is worth 50% back; at ${fullViews} views it's worth the full price. Email ${macwall.reelRefundEmail} with your video link, view screenshot, and purchase email.`,
    },
    {
      id: "5",
      title: "We verify and refund",
      body: `We check the numbers and refund within 48 hours — half at ${halfViews}, everything at ${fullViews}. Same video keeps climbing? Email again and we top up the rest.`,
    },
    {
      id: "6",
      title: "The fine print",
      body: `Post as many times as you want until one video hits ${halfViews} organic views. No bots or paid promotion. We may verify views and decline suspicious claims. Refunds go to the original payment method. Offer can end anytime.`,
    },
  ] as const,

  midCtaTitle: "Try it free, film what you love, and let the video pay for it",
  midCtaLabel: "Download for macOS",
  midCtaHref: macwallInstallerLatestPath,

  influencerTitle: "Got a big following?",
  influencerBody: `If you already have a real audience and want to do something bigger than a single video — a free license, a proper collaboration — skip the view threshold and email ${macwall.reelRefundEmail} directly. Tell us where you post and what you have in mind.`,

  faqTitle: "Questions",
  faq: [
    {
      q: "Which platforms count?",
      a: `Instagram Reels, TikTok, YouTube — Shorts and full-length videos both count — Threads, and X. We go by the view count the platform itself shows on your post, the same number your step-four screenshot captures. On X that number is technically impressions rather than video plays; we know, and it still counts — the post just has to actually contain your video. The views must land on one video on one platform; we don't add counts up across posts or platforms.`,
    },
    {
      q: "Do I need a big following to start?",
      a: "No. Plenty of videos take off from small accounts because the moment is good, not because the poster is famous. If you do have a large following, email us and we'll set something up directly.",
    },
    {
      q: "What if I bought during a sale?",
      a: "We refund exactly what you paid, to the same payment method — sale price included. The refund matches your order, nothing more or less.",
    },
    {
      q: "How long does verification take?",
      a: `Once your video is past the view threshold and you've emailed us the link, screenshot, and purchase email, we verify and refund within 48 hours.`,
    },
  ] as const,

  closingTitle: "One more thing",
  closingBody: `${macwall.name} is built by a small team. There's no big marketing department behind this — a video from someone actually using the app does more than any ad we could run, and this is the honest way to say thanks for it. Download free, put it through a real workday, and if it earns a place in your setup, film it.`,

  claimCta: "Email us",
  claimHref: mailtoReelRefund,
  pricingLinkLabel: "View pricing",
} as const
