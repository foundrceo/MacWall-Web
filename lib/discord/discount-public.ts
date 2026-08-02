/** Extra percent off for Discord members (safe for client + server). */
export const DISCORD_MEMBER_PERCENT_OFF = 10 as const

/** Apply Discord discount to a USD major amount for marketing display. */
export function applyDiscordMemberDiscountMajor(major: number): number {
  const discounted = major * (1 - DISCORD_MEMBER_PERCENT_OFF / 100)
  return Math.round(discounted * 100) / 100
}
