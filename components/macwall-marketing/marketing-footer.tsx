import Link from "next/link"
import {
  macwall,
  macwallProCheckoutURL,
  mailtoSupport,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"

/** `light` = Apple-style pale rail (#f5f5f7); `dark` = charcoal (#1d1d1f). Matches vendored Footer_* classes. */
export type MacWallMarketingFooterVariant = "dark" | "light"

const footerSurface: Record<MacWallMarketingFooterVariant, string> = {
  dark: "Footer_footer__eIwFJ",
  light: "Footer_footerBlack__z3UJN",
}

const footerContainer: Record<MacWallMarketingFooterVariant, string> = {
  dark: "Footer_container__Iw2Bs",
  light: "Footer_containerBlack__IwbPP",
}

const footerDisclaimer: Record<MacWallMarketingFooterVariant, string> = {
  dark: "Footer_footerText__KOgFA",
  light: "Footer_footerTextBlack__xGE0Q",
}

const footerGrid: Record<MacWallMarketingFooterVariant, string> = {
  dark: "Footer_gridFooter__01zz2",
  light: "Footer_gridFooterBlack__DX_5v",
}

const footerTitle: Record<MacWallMarketingFooterVariant, string> = {
  dark: "Footer_footerTitle__66ouh",
  light: "Footer_footerTitleBlack__HrpcE",
}

const footerLink: Record<MacWallMarketingFooterVariant, string> = {
  dark: "Footer_footerLinks__NM_cC",
  light: "Footer_footerLinksBlack__aHMsJ",
}

const footerList: Record<MacWallMarketingFooterVariant, string> = {
  dark: "Footer_footerList__VrYnQ",
  light: "Footer_footerListBlack__kVuuZ",
}

const footerSummary: Record<MacWallMarketingFooterVariant, string> = {
  dark: "Footer_footerSummary__NM8Ab",
  light: "Footer_footerSummaryBlack__oD1_G",
}

function FooterChevron() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      className="Footer_chevron__tFu7q"
      aria-hidden="true"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.72 18.78a.75.75 0 0 1 0-1.06L14.44 12 8.72 6.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z" />
    </svg>
  )
}

export default function MacWallMarketingFooter({
  shopPricingHref = "#pricing",
  variant = "dark",
}: Readonly<{
  shopPricingHref?: string
  variant?: MacWallMarketingFooterVariant
}>) {
  const foot = macwallExactCopy.footer
  const year = new Date().getFullYear()

  const c = {
    footer: footerSurface[variant],
    container: footerContainer[variant],
    disclaimer: footerDisclaimer[variant],
    grid: footerGrid[variant],
    title: footerTitle[variant],
    link: footerLink[variant],
    list: footerList[variant],
    summary: footerSummary[variant],
  }

  return (
    <footer className={c.footer} data-macwall-footer={variant}>
      <div className={c.container}>
        <ul className={c.disclaimer}>
          {foot.disclaimerBullets.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <div className={c.grid} role="navigation" aria-label="Footer">
          <div className="Footer_sandimax__mgVdL">
            <h4>{foot.org.name}</h4>
            <p>
              {foot.org.line1}
              <br /> {foot.org.line2}
            </p>
          </div>
          <div>
            <h3 className={c.title}>{foot.shopTitle}</h3>
            <ul>
              <li className="Footer_item__8hrsH">
                <a
                  className={c.link}
                  href={macwallProCheckoutURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {foot.shop.buy}
                </a>
              </li>
              <li className="Footer_item__8hrsH">
                <Link className={c.link} href={shopPricingHref}>
                  {foot.shop.pricing}
                </Link>
              </li>
              <li className="Footer_item__8hrsH">
                <a
                  className={c.link}
                  href={macwall.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {foot.shop.download}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={c.title}>{foot.legalTitle}</h3>
            <ul>
              <li className="Footer_item__8hrsH">
                <Link className={c.link} href="/privacy">
                  {foot.legal.privacy}
                </Link>
              </li>
              <li className="Footer_item__8hrsH">
                <Link className={c.link} href="/terms">
                  {foot.legal.terms}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={c.title}>{foot.supportTitle}</h3>
            <ul>
              <li className="Footer_item__8hrsH">
                <a className={c.link} href={mailtoSupport}>
                  {foot.support.email}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={c.title}>{foot.communityTitle}</h3>
            <ul>
              <li className="Footer_item__8hrsH">
                <a
                  className={c.link}
                  href={macwall.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {foot.community.discord}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="Footer_accordions__lxdA5"
          role="navigation"
          aria-label="Footer (mobile)"
        >
          <div className="Footer_sandimax__mgVdL">
            <h4>{foot.org.name}</h4>
            <p>
              {foot.org.line1}
              <br /> {foot.org.line2}
            </p>
          </div>
          <details className="Footer_details__yAgbt">
            <summary className={c.summary}>
              {foot.shopTitle}
              <FooterChevron />
            </summary>
            <div data-panel="true" style={{ overflow: "hidden", height: 0 }}>
              <ul className={c.list}>
                <li className="Footer_item__8hrsH">
                  <a
                    className={c.link}
                    href={macwallProCheckoutURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {foot.shop.buy}
                  </a>
                </li>
                <li className="Footer_item__8hrsH">
                  <Link className={c.link} href={shopPricingHref}>
                    {foot.shop.pricing}
                  </Link>
                </li>
                <li className="Footer_item__8hrsH">
                  <a
                    className={c.link}
                    href={macwall.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {foot.shop.download}
                  </a>
                </li>
              </ul>
            </div>
          </details>
          <details className="Footer_details__yAgbt">
            <summary className={c.summary}>
              {foot.legalTitle}
              <FooterChevron />
            </summary>
            <div data-panel="true" style={{ overflow: "hidden", height: 0 }}>
              <ul className={c.list}>
                <li className="Footer_item__8hrsH">
                  <Link className={c.link} href="/privacy">
                    {foot.legal.privacy}
                  </Link>
                </li>
                <li className="Footer_item__8hrsH">
                  <Link className={c.link} href="/terms">
                    {foot.legal.terms}
                  </Link>
                </li>
              </ul>
            </div>
          </details>
          <details className="Footer_details__yAgbt">
            <summary className={c.summary}>
              {foot.supportTitle}
              <FooterChevron />
            </summary>
            <div data-panel="true" style={{ overflow: "hidden", height: 0 }}>
              <ul className={c.list}>
                <li className="Footer_item__8hrsH">
                  <a className={c.link} href={mailtoSupport}>
                    {foot.support.email}
                  </a>
                </li>
              </ul>
            </div>
          </details>
          <details className="Footer_details__yAgbt">
            <summary className={c.summary}>
              {foot.communityTitle}
              <FooterChevron />
            </summary>
            <div data-panel="true" style={{ overflow: "hidden", height: 0 }}>
              <ul className={c.list}>
                <li className="Footer_item__8hrsH">
                  <a
                    className={c.link}
                    href={macwall.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {foot.community.discord}
                  </a>
                </li>
              </ul>
            </div>
          </details>
        </div>
        <div className="Footer_bottom__KrYKf">
          <div className="Footer_left__xKuw0">
            <span className="Footer_copy__R7dUE">
              © {year} {foot.copyrightName}. All rights reserved.
            </span>
            <span className="Footer_divider__X8rPc" aria-hidden="true">
              |
            </span>
            <Link className={c.link} href="/terms">
              {foot.legal.terms}
            </Link>
            <span className="Footer_divider__X8rPc" aria-hidden="true">
              |
            </span>
            <Link className={c.link} href="/privacy">
              {foot.legal.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
