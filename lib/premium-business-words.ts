/**
 * Premium business-word map from @zorvainx
 * ("100+ business words that sound more premium").
 *
 * Checklist for marketing/sell copy rewrites. Prefer natural integration over
 * blind find-replace. Do not apply to legal, admin, or API error strings.
 *
 * `intentionalSkip`: pairs that do not fit a wallpaper product UI; omit from
 * forced coverage but keep documented.
 */

export type PremiumWordPair = {
  insteadOf: string
  sayThis: string
  /** When set, we deliberately skip forcing this into MacWall sell copy. */
  intentionalSkip?: string
}

export const PREMIUM_BUSINESS_WORDS: readonly PremiumWordPair[] = [
  { insteadOf: "Buy", sayThis: "Invest" },
  { insteadOf: "Cheap", sayThis: "Affordable" },
  { insteadOf: "Customer", sayThis: "Client" },
  { insteadOf: "Problem", sayThis: "Concern" },
  { insteadOf: "Contract", sayThis: "Agreement" },
  { insteadOf: "Sell", sayThis: "Help" },
  { insteadOf: "Cost", sayThis: "Investment" },
  { insteadOf: "Price", sayThis: "Value" },
  { insteadOf: "Expensive", sayThis: "Premium" },
  { insteadOf: "Discount", sayThis: "Exclusive Offer" },
  { insteadOf: "Free", sayThis: "Complimentary" },
  { insteadOf: "Guarantee", sayThis: "Assurance" },
  { insteadOf: "Deal", sayThis: "Opportunity" },
  { insteadOf: "Offer", sayThis: "Solution" },
  { insteadOf: "Product", sayThis: "Solution" },
  { insteadOf: "Service", sayThis: "Experience" },
  { insteadOf: "Package", sayThis: "Program" },
  { insteadOf: "Basic", sayThis: "Essential" },
  { insteadOf: "Standard", sayThis: "Professional" },
  { insteadOf: "Premium", sayThis: "Elite" },
  { insteadOf: "Luxury", sayThis: "Exclusive" },
  { insteadOf: "Fast", sayThis: "Efficient" },
  { insteadOf: "Quick", sayThis: "Seamless" },
  { insteadOf: "Easy", sayThis: "Effortless" },
  { insteadOf: "Simple", sayThis: "Streamlined" },
  { insteadOf: "Improve", sayThis: "Transform" },
  { insteadOf: "Change", sayThis: "Upgrade" },
  { insteadOf: "Fix", sayThis: "Resolve" },
  { insteadOf: "Start", sayThis: "Launch" },
  { insteadOf: "Finish", sayThis: "Complete" },
  { insteadOf: "Create", sayThis: "Build" },
  { insteadOf: "Grow", sayThis: "Scale" },
  { insteadOf: "Learn", sayThis: "Master" },
  { insteadOf: "Teach", sayThis: "Guide" },
  { insteadOf: "Tell", sayThis: "Explain" },
  { insteadOf: "Show", sayThis: "Demonstrate" },
  { insteadOf: "Ask", sayThis: "Request" },
  { insteadOf: "Need", sayThis: "Require" },
  { insteadOf: "Use", sayThis: "Leverage" },
  { insteadOf: "Try", sayThis: "Experience" },
  { insteadOf: "Job", sayThis: "Opportunity" },
  { insteadOf: "Worker", sayThis: "Professional" },
  {
    insteadOf: "Team",
    sayThis: "Experts",
    intentionalSkip: "No staffing org copy on MacWall marketing",
  },
  {
    insteadOf: "Employee",
    sayThis: "Specialist",
    intentionalSkip: "No HR/org copy on MacWall marketing",
  },
  {
    insteadOf: "Boss",
    sayThis: "Leader",
    intentionalSkip: "No management hierarchy copy",
  },
  { insteadOf: "Meeting", sayThis: "Strategy Session" },
  { insteadOf: "Call", sayThis: "Consultation" },
  { insteadOf: "Chat", sayThis: "Discussion" },
  { insteadOf: "Plan", sayThis: "Roadmap" },
  { insteadOf: "Idea", sayThis: "Strategy" },
  { insteadOf: "Target", sayThis: "Goal" },
  { insteadOf: "Result", sayThis: "Outcome" },
  { insteadOf: "Success", sayThis: "Growth" },
  { insteadOf: "Win", sayThis: "Achieve" },
  { insteadOf: "Failure", sayThis: "Learning" },
  { insteadOf: "Mistake", sayThis: "Improvement" },
  { insteadOf: "Risk", sayThis: "Opportunity" },
  { insteadOf: "Difficult", sayThis: "Challenging" },
  { insteadOf: "Impossible", sayThis: "Unlikely" },
  { insteadOf: "Perfect", sayThis: "Optimized" },
  { insteadOf: "Best", sayThis: "Most Effective" },
  { insteadOf: "New", sayThis: "Innovative" },
  { insteadOf: "Old", sayThis: "Established" },
  { insteadOf: "Normal", sayThis: "Professional" },
  { insteadOf: "Small", sayThis: "Compact" },
  { insteadOf: "Big", sayThis: "Large-Scale" },
  { insteadOf: "Huge", sayThis: "Massive" },
  { insteadOf: "Strong", sayThis: "Powerful" },
  { insteadOf: "Weak", sayThis: "Needs Improvement" },
  { insteadOf: "Important", sayThis: "Essential" },
  { insteadOf: "Urgent", sayThis: "Priority" },
  { insteadOf: "Soon", sayThis: "Shortly" },
  { insteadOf: "Now", sayThis: "Today" },
  { insteadOf: "Later", sayThis: "In the Next Step" },
  { insteadOf: "Money", sayThis: "Revenue" },
  { insteadOf: "Income", sayThis: "Earnings" },
  { insteadOf: "Profit", sayThis: "Net Profit" },
  { insteadOf: "Loss", sayThis: "Shortfall" },
  { insteadOf: "Spend", sayThis: "Allocate" },
  { insteadOf: "Save", sayThis: "Optimize" },
  { insteadOf: "Earn", sayThis: "Generate" },
  { insteadOf: "Business", sayThis: "Brand" },
  { insteadOf: "Company", sayThis: "Organization" },
  { insteadOf: "Shop", sayThis: "Store" },
  { insteadOf: "Website", sayThis: "Digital Presence" },
  { insteadOf: "Social Media", sayThis: "Online Presence" },
  { insteadOf: "Ads", sayThis: "Campaigns" },
  { insteadOf: "Marketing", sayThis: "Brand Growth" },
  { insteadOf: "Followers", sayThis: "Community" },
  { insteadOf: "Likes", sayThis: "Engagement" },
  { insteadOf: "Views", sayThis: "Reach" },
  { insteadOf: "Viral", sayThis: "High-Reach" },
  { insteadOf: "Audience", sayThis: "Ideal Clients" },
  { insteadOf: "Competition", sayThis: "Market" },
  { insteadOf: "Copy", sayThis: "Adapt" },
  { insteadOf: "Upgrade", sayThis: "Elevate" },
  { insteadOf: "Improve", sayThis: "Enhance" },
  { insteadOf: "Quality", sayThis: "Craftsmanship" },
  { insteadOf: "Support", sayThis: "Assistance" },
  { insteadOf: "Help", sayThis: "Guidance" },
  { insteadOf: "Answer", sayThis: "Solution" },
  { insteadOf: "Features", sayThis: "Benefits" },
  { insteadOf: "Benefit", sayThis: "Advantage" },
  { insteadOf: "Feedback", sayThis: "Insights" },
  { insteadOf: "Complaint", sayThis: "Concern" },
  { insteadOf: "Refund", sayThis: "Resolution" },
  { insteadOf: "Signature", sayThis: "Authorization" },
  { insteadOf: "Invoice", sayThis: "Billing Statement" },
  { insteadOf: "Payment", sayThis: "Secure Payment" },
  { insteadOf: "Reminder", sayThis: "Friendly Reminder" },
  { insteadOf: "Deadline", sayThis: "Milestone" },
  { insteadOf: "Guarantee", sayThis: "Peace of Mind" },
  { insteadOf: "Trust", sayThis: "Credibility" },
  { insteadOf: "Happy", sayThis: "Satisfied" },
  { insteadOf: "Good", sayThis: "Exceptional" },
  { insteadOf: "Amazing", sayThis: "Outstanding" },
  { insteadOf: "Excellent", sayThis: "World-Class" },
  { insteadOf: "Different", sayThis: "Unique" },
  { insteadOf: "Custom", sayThis: "Personalized" },
  { insteadOf: "Made For You", sayThis: "Tailored Solution" },
] as const

/** Say-This terms that must appear in sell copy (excludes intentional skips). */
export function requiredPremiumSayTerms(): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const pair of PREMIUM_BUSINESS_WORDS) {
    if (pair.intentionalSkip) continue
    const key = pair.sayThis.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(pair.sayThis)
  }
  return out
}
