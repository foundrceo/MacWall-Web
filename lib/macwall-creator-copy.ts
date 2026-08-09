import {
  macwall,
  macwallInstallerLatestPath,
  mailtoReelRefund,
} from "@/lib/macwall-site"

const halfViews = macwall.reelRefundHalfViews.toLocaleString()
const fullViews = macwall.reelRefundFullViews.toLocaleString()

export const macwallCreatorCopy = {
  pageTitle: "Free with a video",
  heroTitle: "Post a video. Get your money back.",
  heroLead: `Buy MacWall, post a short video of it running on your Mac, and we pay you back. You get 50% at ${halfViews} views and all of it at ${fullViews}.`,

  steps: [
    {
      id: "1",
      title: `Buy ${macwall.name} Pro`,
      body: `We can only refund a real purchase, so you need a license running on your own Mac. Download it free first, try it for a few days, and buy when you're ready to film.`,
    },
    {
      id: "2",
      title: "Record a short video of it in real use",
      body: `Your real screen, your real setup, not a scripted ad. Show yourself browsing the catalog, setting a live wallpaper, the Lock Screen coming alive, the menu bar controls. Those are the moments people stop scrolling for.`,
    },
    {
      id: "3",
      title: "Post it publicly",
      body: `Instagram, TikTok, YouTube Shorts, Threads, or X. Your pick. Add ${macwall.reelRefundHashtag} and tag ${macwall.reelRefundInstagram} or ${macwall.reelRefundTiktok} so we can find it.`,
    },
    {
      id: "4",
      title: "Hit a milestone, then email us",
      body: `At ${halfViews} views you get 50% back. At ${fullViews} you get all of it back. Email ${macwall.reelRefundEmail} with your video link, a screenshot of the view count, and the email you bought with.`,
    },
    {
      id: "5",
      title: "We check it and pay you back",
      body: `We verify the numbers and refund within 48 hours: half at ${halfViews}, everything at ${fullViews}. If the same video keeps climbing, email again and we top up the difference. The money goes back to the card you paid with.`,
    },
    {
      id: "6",
      title: "The fine print",
      body: `Post as many times as you like until one video hits ${halfViews} organic views. No bots, no paid promotion. We may check the numbers and turn down claims that look inflated. Refunds go back to the original payment method. We can end this offer at any time.`,
    },
  ] as const,

  midCtaTitle: "Try it free, film what you like, and let the video pay for it",
  midCtaLabel: "Download free for Mac",
  midCtaHref: macwallInstallerLatestPath,

  influencerTitle: "Already have a big audience?",
  influencerBody: `If a lot of people already watch you and you want to do something bigger than one video, like a free license or a proper collaboration, skip the view milestone and email ${macwall.reelRefundEmail} directly. Tell us where you post and what you have in mind.`,

  faqTitle: "Questions",
  faq: [
    {
      q: "Which platforms count?",
      a: `Instagram Reels, TikTok, YouTube (Shorts and full-length both count), Threads, and X. We go by the view count the platform shows on your post, the same number your screenshot captures. On X that number is impressions rather than plays. It still counts, as long as the post actually contains your video. One video on one platform has to hit the milestone on its own, so we don't add up views across posts or platforms.`,
    },
    {
      q: "Do I need a big following?",
      a: "No. Plenty of videos take off from small accounts because the clip is good, not because the poster is famous. If you do have a big audience, email us and we'll set something up directly.",
    },
    {
      q: "What if I bought it on sale?",
      a: "We refund exactly what you paid, back to the same card, sale price included. Nothing more, nothing less.",
    },
    {
      q: "How long does verification take?",
      a: `Once your video is past the milestone and you've emailed us the link, screenshot, and purchase email, we check it and refund within 48 hours. If something doesn't add up, we'll email you and ask.`,
    },
  ] as const,

  closingTitle: "One more thing",
  closingBody: `${macwall.name} is built by a tiny team. There's no marketing department here. A video from someone who actually uses the app does more than any ad we could buy, and this is the honest way to say thanks for it. Download it free, put it through a real workday, and if it earns a place in your setup, film it.`,

  claimCta: "Email us",
  claimHref: mailtoReelRefund,
  pricingLinkLabel: "View pricing",
} as const
