/**
 * The one layout every MacWall email uses: license delivery, Send to Mac,
 * the trial and checkout ladders, and sale campaigns.
 *
 * Pure TypeScript with no runtime imports, so the Supabase Edge Functions
 * that send mail and the admin preview in the Next app render the same HTML.
 *
 * Reading order, the same in every email:
 *   logo → headline → lead → 1-2 short paragraphs → image → price cards
 *   → offer hero → info card → icon list (rows or cards) (code, plan, license key) → one button → one text link
 *   → one reassurance line → fine print → footer
 *
 * Tables, inline styles and solid colours only, so it holds up in Gmail,
 * Apple Mail and Outlook. Light scheme only: a light grey page with white
 * cards.
 */

export type EmailBrand = {
  appName: string
  siteUrl: string
  logoUrl: string
  supportEmail: string
  /** Postal address for the footer of marketing mail (CAN-SPAM). */
  postalAddress?: string | null
}

export type EmailInfoRow = {
  label: string
  value: string
  hint?: string | null
  /** Codes and keys: monospace and letter-spaced, easy to read and copy. */
  mono?: boolean
  /** Tiles only: a 28px glyph above the label (public/email/icon-*.png). */
  icon?: string | null
}

export type EmailPriceCard = {
  plan: string
  now: string
  was: string
  note: string
}

/** One row of a short list (install steps, what Pro unlocks): an icon, a
 *  small label and the line itself. */
export type EmailStep = {
  /** 32px glyph on a transparent background, exported at 3x
   *  (public/email/icon-*.png). */
  icon: string
  /** Small line above the title, e.g. "Step 1". Leave out when the title
   *  says it all. */
  label?: string | null
  title: string
}

/** One big number as the hero of the email (a discount or a price), with a
 *  line under it: the promo code, or a plain footnote. */
export type EmailOffer = {
  /** Small pill above the number, e.g. a deadline. */
  badge?: string | null
  /** The previous, smaller offer, shown struck through. */
  was?: string | null
  /** The number itself, e.g. "20% off". */
  amount: string
  caption: string
  /** Promo code line: "Code X · hint". */
  code?: string | null
  hint?: string | null
  /** Used when there is no code. */
  footnote?: string | null
}

export type EmailContent = {
  subject: string
  /** Inbox preview line next to the subject. */
  preheader: string
  /** "First part|second part" colours the second part with the accent. */
  headline: string
  /** One larger sentence under the headline (sale emails). */
  lead?: string | null
  /** Keep to one or two, each one or two sentences. */
  paragraphs: string[]
  image?: { src: string; width: number; height: number; alt: string } | null
  prices?: EmailPriceCard[]
  offer?: EmailOffer | null
  /** A short list: one white row each, icon on the left. */
  steps?: EmailStep[]
  /** "cards" shows the list as square tiles side by side instead of rows;
   *  content stays left-aligned with the icon in the top-left corner. */
  stepsLayout?: "rows" | "cards"
  /** Rows of one white card: a promo code, the plan and price, a license key. */
  info?: EmailInfoRow[]
  /** The same label / value / hint blocks as separate cards side by side
   *  (two or three), for things to compare. */
  tiles?: EmailInfoRow[]
  /** The one action this email asks for. */
  button: { label: string; href: string }
  secondaryLink?: { label: string; href: string } | null
  /** One small reassurance line under the button. */
  note?: string | null
  /** Offer terms, above the footer. */
  fineprint?: string | null
  /** Footer: why they are getting this email. */
  reason: string
  /** Marketing mail only. */
  unsubscribeHref?: string | null
}

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif"
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace"

const PAGE = "#f5f5f7"
const CARD = "#ffffff"
const INK = "#1d1d1f"
const BODY = "#424245"
const MUTED = "#6e6e73"
const FAINT = "#86868b"
const RULE = "#d2d2d7"
const CARD_RULE = "#e8e8ed"
const ACCENT = "#0071e3"
const LINK = "#0066cc"

/** Content column, in px. Images are exported at this width or wider. */
export const EMAIL_WIDTH = 560

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * Escapes text and ties its last two words together, so a line never ends
 * with one short word alone ("…until Dec" / "1.").
 */
function prose(text: string): string {
  const escaped = escapeHtml(text.trim())
  const lastSpace = escaped.lastIndexOf(" ")
  if (lastSpace < 0 || escaped.split(" ").length < 4) return escaped
  return `${escaped.slice(0, lastSpace)}&nbsp;${escaped.slice(lastSpace + 1)}`
}

function row(inner: string, padding: string): string {
  return `<tr><td align="center" style="padding:${padding};">${inner}</td></tr>`
}

function infoCard(rows: EmailInfoRow[]): string {
  const cells = rows
    .map((info, index) => {
      const value = info.mono
        ? `<p class="mw-value" style="margin:0;font-family:${MONO};font-size:20px;line-height:1.35;font-weight:600;letter-spacing:0.06em;color:${INK};text-align:center;word-break:break-all;">${escapeHtml(info.value)}</p>`
        : `<p style="margin:0;font-family:${FONT};font-size:17px;line-height:1.35;font-weight:600;color:${INK};text-align:center;">${escapeHtml(info.value)}</p>`
      const hint = info.hint
        ? `<p style="margin:6px 0 0;font-family:${FONT};font-size:13px;line-height:1.45;color:${MUTED};text-align:center;">${escapeHtml(info.hint)}</p>`
        : ""
      return `<tr><td align="center" style="padding:18px 20px;${index > 0 ? `border-top:1px solid ${CARD_RULE};` : ""}">
            <p style="margin:0 0 6px;font-family:${FONT};font-size:12px;line-height:1.3;color:${MUTED};text-align:center;">${escapeHtml(info.label)}</p>
            ${value}
            ${hint}
          </td></tr>`
    })
    .join("\n          ")
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border-radius:16px;">
          ${cells}
        </table>`
}

function priceCards(cards: EmailPriceCard[]): string {
  const width = Math.floor(100 / cards.length)
  const last = cards.length - 1
  const cells = cards
    .map(
      (card, index) => `<td align="center" valign="top" width="${width}%" style="padding:0 ${index < last ? 5 : 0}px 0 ${index > 0 ? 5 : 0}px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border-radius:16px;">
              <tr><td align="center" style="padding:20px 10px 18px;">
                <p style="margin:0 0 8px;font-family:${FONT};font-size:14px;line-height:1.3;color:${MUTED};text-align:center;">${escapeHtml(card.plan)}</p>
                <p style="margin:0;font-family:${FONT};font-size:28px;line-height:1.1;font-weight:700;letter-spacing:-0.01em;color:${INK};text-align:center;">${escapeHtml(card.now)}</p>
                <p style="margin:6px 0 0;font-family:${FONT};font-size:13px;line-height:1.4;color:${MUTED};text-align:center;"><span style="text-decoration:line-through;">${escapeHtml(card.was)}</span> &middot; ${escapeHtml(card.note)}</p>
              </td></tr>
            </table>
          </td>`
    )
    .join("\n          ")
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
          ${cells}
        </tr></table>`
}

function infoTiles(tiles: EmailInfoRow[]): string {
  // Background on the cells, so the cards in a row are the same height.
  const gap = 10
  const cells: string[] = []
  tiles.forEach((tile, index) => {
    if (index > 0) {
      cells.push(`<td width="${gap}" style="width:${gap}px;font-size:0;line-height:0;">&nbsp;</td>`)
    }
    cells.push(`<td align="center" valign="top" bgcolor="${CARD}" style="background-color:${CARD};border-radius:16px;padding:22px 14px 20px;">
            ${tile.icon ? `<img src="${escapeHtml(tile.icon)}" width="28" height="28" alt="" style="display:block;margin:0 auto 12px;width:28px;height:28px;border:0;">` : ""}
            <p style="margin:0 0 6px;font-family:${FONT};font-size:13px;line-height:1.3;color:${MUTED};text-align:center;">${escapeHtml(tile.label)}</p>
            <p class="mw-tile-value" style="margin:0;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:700;letter-spacing:-0.02em;color:${INK};text-align:center;">${escapeHtml(tile.value)}</p>
            ${tile.hint ? `<p style="margin:8px 0 0;font-family:${FONT};font-size:13px;line-height:1.45;color:${MUTED};text-align:center;">${escapeHtml(tile.hint)}</p>` : ""}
          </td>`)
  })
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;width:100%;"><tr>
          ${cells.join("\n          ")}
        </tr></table>`
}

function offerTile(offer: EmailOffer): string {
  const badge = offer.badge
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 14px;"><tr><td bgcolor="${PAGE}" style="background-color:${PAGE};border-radius:980px;padding:5px 12px;font-family:${FONT};font-size:12px;line-height:1.3;font-weight:600;color:${INK};">${escapeHtml(offer.badge)}</td></tr></table>`
    : ""
  const was = offer.was
    ? `<p style="margin:0 0 4px;font-family:${FONT};font-size:15px;line-height:1.3;color:${MUTED};text-align:center;text-decoration:line-through;">${escapeHtml(offer.was)}</p>`
    : ""
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border-radius:16px;">
          <tr><td align="center" style="padding:26px 20px 22px;">
            ${badge}
            ${was}
            <p class="mw-offer" style="margin:0;font-family:${FONT};font-size:52px;line-height:1.05;font-weight:700;letter-spacing:-0.035em;color:${ACCENT};text-align:center;">${escapeHtml(offer.amount)}</p>
            <p style="margin:8px 0 0;font-family:${FONT};font-size:15px;line-height:1.4;color:${INK};text-align:center;">${escapeHtml(offer.caption)}</p>
          </td></tr>
          <tr><td align="center" style="padding:16px 20px 18px;border-top:1px solid ${CARD_RULE};">
            <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.5;color:${MUTED};text-align:center;">${
              offer.code
                ? `Code <span style="font-family:${MONO};font-size:14px;font-weight:600;letter-spacing:0.06em;color:${INK};">${escapeHtml(offer.code)}</span>${offer.hint ? ` &middot; ${escapeHtml(offer.hint)}` : ""}`
                : escapeHtml(offer.footnote ?? "")
            }</p>
          </td></tr>
        </table>`
}

function stepRows(steps: EmailStep[]): string {
  // One full-width white row per step: icon on the left, text beside it.
  return steps
    .map(
      (step, index) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border-radius:16px;${index > 0 ? "margin-top:8px;" : ""}">
          <tr>
            <td width="32" valign="middle" style="padding:16px 0 16px 20px;">
              <img src="${escapeHtml(step.icon)}" width="32" height="32" alt="" style="display:block;width:32px;height:32px;border:0;">
            </td>
            <td align="left" valign="middle" style="padding:16px 20px 16px 16px;">
              ${step.label ? `<p style="margin:0 0 2px;font-family:${FONT};font-size:12px;line-height:1.3;color:${MUTED};text-align:left;">${escapeHtml(step.label)}</p>` : ""}
              <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.35;font-weight:600;color:${INK};text-align:left;">${escapeHtml(step.title)}</p>
            </td>
          </tr>
        </table>`
    )
    .join("\n        ")
}

function stepCardRow(steps: EmailStep[], perRow: number): string {
  // The white background sits on the cells themselves, so every card in a
  // row is as tall as the tallest one. Narrow spacer cells make the gaps.
  // Card cells carry no width: with a fixed table layout they share what the
  // fixed-width spacers leave, in equal parts, at any screen size.
  const gap = 10
  const cells: string[] = []
  for (let index = 0; index < perRow; index += 1) {
    const step = steps[index]
    if (index > 0) {
      cells.push(`<td width="${gap}" style="width:${gap}px;font-size:0;line-height:0;">&nbsp;</td>`)
    }
    cells.push(
      step
        ? `<td class="mw-card" align="left" valign="top" bgcolor="${CARD}" style="background-color:${CARD};border-radius:16px;padding:18px 18px 16px;">
            <img src="${escapeHtml(step.icon)}" width="24" height="24" alt="" style="display:block;margin:0 0 14px;width:24px;height:24px;border:0;">
            ${step.label ? `<p style="margin:0 0 3px;font-family:${FONT};font-size:12px;line-height:1.3;color:${MUTED};text-align:left;">${escapeHtml(step.label)}</p>` : ""}
            <p class="mw-card-title" style="margin:0;font-family:${FONT};font-size:14px;line-height:1.36;font-weight:600;letter-spacing:-0.005em;color:${INK};text-align:left;">${escapeHtml(step.title)}</p>
          </td>`
        : `<td>&nbsp;</td>`
    )
  }
  // Fixed layout keeps the three columns the same width whatever the text.
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;width:100%;"><tr>
          ${cells.join("\n          ")}
        </tr></table>`
}

/** Square-ish tiles, three to a row. */
function stepCards(steps: EmailStep[]): string {
  const perRow = 3
  const rows: string[] = []
  for (let index = 0; index < steps.length; index += perRow) {
    const html = stepCardRow(steps.slice(index, index + perRow), perRow)
    rows.push(index === 0 ? html : `<div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>${html}`)
  }
  return rows.join("\n        ")
}

/** Official accounts, shown as two small icons at the top of every footer
 *  (public/email/icon-instagram.png, icon-tiktok.png). */
export const EMAIL_SOCIALS = [
  {
    label: "Instagram",
    icon: "instagram",
    href: "https://www.instagram.com/macwallapp_",
  },
  {
    label: "TikTok",
    icon: "tiktok",
    href: "https://www.tiktok.com/@macwall.app",
  },
] as const

function copyrightLine(appName: string): string {
  return `&copy; ${new Date().getFullYear()} ${escapeHtml(appName)}. All rights reserved.`
}

export function renderEmailHtml(content: EmailContent, brand: EmailBrand): string {
  const [first, second] = content.headline.includes("|")
    ? content.headline.split("|")
    : [content.headline, ""]
  const headline = `<h1 class="mw-h1" style="margin:0;font-family:${FONT};font-size:34px;line-height:1.12;font-weight:700;letter-spacing:-0.022em;color:${INK};text-align:center;">${second ? escapeHtml(first) : prose(first)}${second ? ` <span style="color:${ACCENT};">${prose(second)}</span>` : ""}</h1>`

  const rows: string[] = [
    row(
      `<img src="${escapeHtml(brand.logoUrl)}" width="40" height="40" alt="${escapeHtml(brand.appName)}" style="display:block;width:40px;height:40px;border:0;border-radius:10px;">`,
      "0 0 22px"
    ),
    row(headline, "0 8px 14px"),
  ]

  if (content.lead) {
    rows.push(
      row(
        `<p class="mw-lead" style="margin:0 auto;max-width:470px;font-family:${FONT};font-size:19px;line-height:1.42;color:${INK};text-align:center;">${prose(content.lead)}</p>`,
        "0 8px 12px"
      )
    )
  }

  if (content.paragraphs.length) {
    const last = content.paragraphs.length - 1
    rows.push(
      row(
        content.paragraphs
          .map(
            (text, index) =>
              `<p style="margin:0 auto${index < last ? " 12px" : ""};max-width:480px;font-family:${FONT};font-size:16px;line-height:1.55;color:${BODY};text-align:center;">${prose(text)}</p>`
          )
          .join("\n        "),
        "0 12px 12px"
      )
    )
  }

  if (content.image) {
    const { src, width, height, alt } = content.image
    rows.push(
      row(
        `<img src="${escapeHtml(src)}" width="${width}" height="${height}" alt="${escapeHtml(alt)}" style="display:block;width:100%;max-width:${width}px;height:auto;border:0;border-radius:16px;">`,
        "12px 0 6px"
      )
    )
  }

  if (content.prices?.length) rows.push(row(priceCards(content.prices), "12px 0 0"))
  if (content.offer) rows.push(row(offerTile(content.offer), "12px 0 0"))
  if (content.info?.length) rows.push(row(infoCard(content.info), "12px 0 0"))
  if (content.tiles?.length) rows.push(row(infoTiles(content.tiles), "12px 0 0"))
  if (content.steps?.length) rows.push(
      row(
        content.stepsLayout === "cards"
          ? stepCards(content.steps)
          : stepRows(content.steps),
        "12px 0 0"
      )
    )

  rows.push(
    row(
      `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
          <tr><td align="center" bgcolor="${ACCENT}" style="background-color:${ACCENT};border-radius:980px;">
            <a href="${escapeHtml(content.button.href)}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:17px;line-height:1.2;font-weight:600;color:#ffffff;text-decoration:none;border-radius:980px;">${escapeHtml(content.button.label)}</a>
          </td></tr>
        </table>`,
      "24px 0 0"
    )
  )

  if (content.secondaryLink) {
    rows.push(
      row(
        `<p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.5;text-align:center;"><a href="${escapeHtml(content.secondaryLink.href)}" style="color:${LINK};text-decoration:none;">${escapeHtml(content.secondaryLink.label)}&nbsp;&rsaquo;</a></p>`,
        "16px 0 0"
      )
    )
  }

  if (content.note) {
    rows.push(
      row(
        `<p style="margin:0 auto;max-width:440px;font-family:${FONT};font-size:13px;line-height:1.5;color:${MUTED};text-align:center;">${prose(content.note)}</p>`,
        "18px 16px 0"
      )
    )
  }

  const footerLine = (html: string, first = false) =>
    `<p style="margin:${first ? "0" : "8px 0 0"};font-family:${FONT};font-size:12px;line-height:1.55;color:${FAINT};text-align:center;">${html}</p>`
  const footerLink = (href: string, label: string) =>
    `<a href="${escapeHtml(href)}" style="color:${FAINT};text-decoration:underline;">${escapeHtml(label)}</a>`
  const footer: string[] = []
  if (content.fineprint) footer.push(escapeHtml(content.fineprint))
  footer.push(
    `${escapeHtml(content.reason)}${content.unsubscribeHref ? ` ${footerLink(content.unsubscribeHref, "Unsubscribe")}.` : ""}`
  )
  footer.push(
    `Questions? Reply to this email or write to ${footerLink(`mailto:${brand.supportEmail}`, brand.supportEmail)}.`
  )
  const address = brand.postalAddress?.trim()
  footer.push(
    `${address ? `${escapeHtml(address)}<br>` : ""}${copyrightLine(brand.appName)}`
  )
  const site = brand.siteUrl.replace(/\/+$/, "")
  const social = EMAIL_SOCIALS.map(
    (item) =>
      `<td style="padding:0 9px;"><a href="${item.href}" style="text-decoration:none;"><img src="${escapeHtml(`${site}/email/icon-${item.icon}.png`)}" width="20" height="20" alt="${item.label}" style="display:block;width:20px;height:20px;border:0;"></a></td>`
  ).join("")
  rows.push(
    `<tr><td align="center" style="padding:32px 8px 0;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:20px 0 0;border-top:1px solid ${RULE};">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 16px;"><tr>${social}</tr></table>
        ${footer.map((line, index) => footerLine(line, index === 0)).join("\n        ")}
      </td></tr></table></td></tr>`
  )

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(content.subject)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style type="text/css">
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: ${PAGE}; }
  @media only screen and (max-width: 480px) {
    .mw-outer { padding: 28px 14px 36px !important; }
    .mw-h1 { font-size: 28px !important; }
    .mw-lead { font-size: 17px !important; }
    .mw-value { font-size: 17px !important; }
    .mw-offer { font-size: 44px !important; }
    .mw-tile-value { font-size: 24px !important; }
    .mw-card { padding: 16px 12px 14px !important; }
    .mw-card-title { font-size: 13px !important; }
  }
</style>
</head>
<body bgcolor="${PAGE}" style="margin:0;padding:0;background-color:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${PAGE};">${escapeHtml(content.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${PAGE}" style="background-color:${PAGE};">
  <tr><td class="mw-outer" align="center" style="padding:40px 16px 48px;">
    <!--[if mso]><table role="presentation" width="${EMAIL_WIDTH}" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:${EMAIL_WIDTH}px;margin:0 auto;">
      ${rows.join("\n      ")}
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr>
</table>
</body>
</html>`
}

/** Plain-text part: same content and order, links spelled out. */
export function renderEmailText(content: EmailContent, brand: EmailBrand): string {
  const lines: string[] = [content.headline.replace("|", " "), ""]
  if (content.lead) lines.push(content.lead, "")
  lines.push(...content.paragraphs.flatMap((text) => [text, ""]))
  for (const card of content.prices ?? []) {
    lines.push(`${card.plan}: ${card.now} (was ${card.was}, ${card.note})`)
  }
  if (content.prices?.length) lines.push("")
  for (const step of content.steps ?? []) lines.push(step.label ? `${step.label}: ${step.title}` : `- ${step.title}`)
  if (content.steps?.length) lines.push("")
  if (content.offer) {
    lines.push(
      `${content.offer.amount} ${content.offer.caption}${content.offer.badge ? ` (${content.offer.badge})` : ""}`,
      content.offer.code
        ? `Code ${content.offer.code}: ${content.offer.hint ?? ""}`
        : (content.offer.footnote ?? ""),
      ""
    )
  }
  for (const info of [...(content.info ?? []), ...(content.tiles ?? [])]) {
    lines.push(`${info.label}: ${info.value}`)
    if (info.hint) lines.push(info.hint)
    lines.push("")
  }
  lines.push(`${content.button.label}: ${content.button.href}`, "")
  if (content.secondaryLink) {
    lines.push(`${content.secondaryLink.label}: ${content.secondaryLink.href}`, "")
  }
  if (content.note) lines.push(content.note, "")
  if (content.fineprint) lines.push(content.fineprint, "")
  lines.push("--", content.reason)
  if (content.unsubscribeHref) lines.push(`Unsubscribe: ${content.unsubscribeHref}`)
  lines.push(`Questions? Reply to this email or write to ${brand.supportEmail}.`)
  for (const item of EMAIL_SOCIALS) lines.push(`${item.label}: ${item.href}`)
  if (brand.postalAddress?.trim()) lines.push(brand.postalAddress.trim())
  lines.push(`© ${new Date().getFullYear()} ${brand.appName}. All rights reserved.`)
  return lines.join("\n")
}
