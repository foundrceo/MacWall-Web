import {
  macwall,
  macwallMinimumMacOSVersionLabel,
} from "@/lib/macwall-site"

export type ChatQuickReply = {
  id: string
  label: string
  /** Prefills the composer / triggers match */
  prompt: string
}

export type FaqMatch = {
  id: string
  reply: string
  followUps?: ChatQuickReply[]
}

const HUMAN: ChatQuickReply = {
  id: "human",
  label: "Talk to a human",
  prompt: "I want to talk to a human",
}

/** Greeting chips only — human first so handoff is always the priority path. */
const QUICK_START: ChatQuickReply[] = [
  HUMAN,
  { id: "pricing", label: "Pricing", prompt: "How much does Pro cost?" },
  {
    id: "license",
    label: "License help",
    prompt: "How do I activate my license?",
  },
  {
    id: "download",
    label: "Download",
    prompt: "Where can I download MacWall?",
  },
]

/**
 * Next steps after an Assist answer.
 * Human is always first. Topic chips from the FAQ only — never re-attach the
 * full greeting menu (that created a select-again loop).
 */
export function defaultFollowUps(
  extra: ChatQuickReply[] = [],
  options?: { excludeIds?: string[] }
): ChatQuickReply[] {
  const exclude = new Set(options?.excludeIds ?? [])
  const seen = new Set<string>(["human"])
  const out: ChatQuickReply[] = [HUMAN]

  for (const item of extra) {
    if (item.id === "human" || exclude.has(item.id) || seen.has(item.id)) {
      continue
    }
    seen.add(item.id)
    out.push(item)
    if (out.length >= 4) break
  }

  return out
}

const FAQS: Array<{
  id: string
  keywords: string[]
  reply: string
  followUps?: ChatQuickReply[]
}> = [
  {
    id: "pricing",
    keywords: [
      "price",
      "pricing",
      "cost",
      "how much",
      "pro+",
      "pro plus",
      "buy",
      "payment",
      "stripe",
      "cheap",
      "discount",
      "sale",
    ],
    reply: `MacWall Pro is a one-time purchase — no subscription.\n\n• Pro (up to 3 Macs): limited sale price on /pricing\n• Pro+ (up to 5 Macs): multi-Mac deal on the same page\n\nCheckout runs on Stripe. After payment, your license lands in your email.`,
    followUps: [
      { id: "checkout", label: "Open pricing", prompt: "Take me to pricing" },
      {
        id: "devices",
        label: "3 vs 5 Macs",
        prompt: "How many Macs does Pro cover?",
      },
      {
        id: "activate",
        label: "How to activate",
        prompt: "How do I activate my license?",
      },
    ],
  },
  {
    id: "devices",
    keywords: [
      "how many mac",
      "3 mac",
      "5 mac",
      "devices",
      "device limit",
      "multi mac",
    ],
    reply: `Pro covers up to 3 personal Macs. Pro+ covers up to 5.\n\nReplacing a Mac? Unlink the old one in Settings → Devices, then activate the new machine.`,
    followUps: [
      { id: "pricing", label: "See pricing", prompt: "How much does Pro cost?" },
      {
        id: "activate",
        label: "Activate license",
        prompt: "How do I activate my license?",
      },
    ],
  },
  {
    id: "activate",
    keywords: [
      "activate",
      "activation",
      "license key",
      "license",
      "redeem",
      "code",
      "unlock",
    ],
    reply: `After checkout you’ll get a license key by email.\n\n1. Open MacWall\n2. Go to Settings → License\n3. Paste your key and activate\n\nOr open the activation link from your receipt — it deep-links into the app.`,
    followUps: [
      {
        id: "missing",
        label: "Didn’t get email",
        prompt: "I didn’t receive my license email",
      },
      {
        id: "devices",
        label: "Device limits",
        prompt: "How many Macs does Pro cover?",
      },
    ],
  },
  {
    id: "missing_email",
    keywords: [
      "didn’t receive",
      "didnt receive",
      "no email",
      "missing email",
      "license email",
      "didn’t get",
      "didnt get",
    ],
    reply: `Check spam for a message from Stripe / MacWall. Still missing it?\n\nTalk to a human and share the email you used at checkout — our team can help resend your key.`,
    followUps: [HUMAN],
  },
  {
    id: "download",
    keywords: [
      "download",
      "install",
      "installer",
      "dmg",
      "get the app",
      "where to get",
    ],
    reply: `Grab the latest MacWall build from the Download button in the site header, or visit the homepage and hit Download.\n\nNeeds ${macwallMinimumMacOSVersionLabel}. Apple silicon and Intel are both supported.`,
    followUps: [
      { id: "pricing", label: "Upgrade to Pro", prompt: "How much does Pro cost?" },
      {
        id: "lockscreen",
        label: "Lock Screen help",
        prompt: "Does Lock Screen video work?",
      },
    ],
  },
  {
    id: "refund",
    keywords: ["refund", "money back", "reel", "cancel"],
    reply: `Sales are generally final. The Reel Refund program can get you up to 100% back if you post and hit the view targets.\n\nDetails: /pricing/reel-refund — or email ${macwall.reelRefundEmail} with your Reel link and purchase email.`,
    followUps: [
      {
        id: "reel",
        label: "How Reel refund works",
        prompt: "How does the Reel refund work?",
      },
      HUMAN,
    ],
  },
  {
    id: "reel",
    keywords: ["reel refund", "instagram", "tiktok", "views", "creator"],
    reply: `Buy Pro → post a Reel on Instagram ${macwall.reelRefundInstagram} or TikTok ${macwall.reelRefundTiktok} with ${macwall.reelRefundHashtag} → hit the view milestones → email ${macwall.reelRefundEmail} with your link and purchase email.\n\nOrganic views only.`,
    followUps: [
      { id: "pricing", label: "Buy Pro first", prompt: "How much does Pro cost?" },
      HUMAN,
    ],
  },
  {
    id: "lockscreen",
    keywords: [
      "lock screen",
      "screensaver",
      "screen saver",
      "wallpaper",
      "live wallpaper",
    ],
    reply: `Desktop live wallpapers work broadly. Live Lock Screen & Screen Saver need a newer macOS where Apple exposes those APIs — see the FAQ on /pricing for the exact version.`,
    followUps: [
      {
        id: "download",
        label: "Download app",
        prompt: "Where can I download MacWall?",
      },
      HUMAN,
    ],
  },
  {
    id: "human",
    keywords: [
      "human",
      "agent",
      "person",
      "support team",
      "talk to",
      "real person",
      "help me",
      "contact",
    ],
    reply: `I can connect you with our team right here.\n\nThey usually reply ASAP — typically within 24 hours. You’ll get a Chat ID to reference anytime.`,
  },
]

export function chatQuickStartReplies(): ChatQuickReply[] {
  return QUICK_START
}

export function matchFaqReply(raw: string): FaqMatch | null {
  const text = raw.trim().toLowerCase()
  if (!text) return null

  if (/pricing|\/pricing|take me to price/.test(text)) {
    return {
      id: "goto-pricing",
      reply: `Here’s pricing: /pricing — Pro and Pro+ are both one-time. Want help choosing between 3 Macs and 5?`,
      followUps: defaultFollowUps(
        [
          {
            id: "devices",
            label: "3 vs 5 Macs",
            prompt: "How many Macs does Pro cover?",
          },
        ],
        { excludeIds: ["pricing"] }
      ),
    }
  }

  let best: { score: number; faq: (typeof FAQS)[number] } | null = null
  for (const faq of FAQS) {
    let score = 0
    for (const keyword of faq.keywords) {
      if (text.includes(keyword)) score += keyword.length
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, faq }
    }
  }

  if (!best) return null

  return {
    id: best.faq.id,
    reply: best.faq.reply,
    followUps: defaultFollowUps(best.faq.followUps ?? [], {
      excludeIds: [best.faq.id],
    }),
  }
}

export function wantsHumanHandoff(raw: string): boolean {
  const text = raw.trim().toLowerCase()
  return (
    /\b(human|agent|person|support team|real person|talk to (someone|a human|support)|contact support)\b/.test(
      text
    ) || matchFaqReply(text)?.id === "human"
  )
}

export const CHAT_GREETING = `Hey — I’m MacWall Assist. Ask about pricing, licenses, downloads, or Reel refunds.\n\nNeed a person? Tap Talk to a human anytime — your chat stays right here.`
