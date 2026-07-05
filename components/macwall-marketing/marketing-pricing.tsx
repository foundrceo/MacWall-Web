"use client"

import Link from "next/link"
import { useCallback, useState } from "react"
import {
  macwallInstallerLatestPath,
  macwallProCheckoutURL,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import MacWallMarketingFooter from "@/components/macwall-marketing/marketing-footer"
import MacWallMarketingHeader from "@/components/macwall-marketing/marketing-header"

function SvgChevron14() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height="14"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.72 18.78a.75.75 0 0 1 0-1.06L14.44 12 8.72 6.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="Pro_iconOk__t5Olt"
      aria-hidden="true"
      height="18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconMonitor() {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="48"
      width="48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
    </svg>
  )
}

function IconBattery() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 256 256"
      height="48"
      width="48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M196,52H28A28,28,0,0,0,0,80v96a28,28,0,0,0,28,28H196a28,28,0,0,0,28-28V80A28,28,0,0,0,196,52Zm4,124a4,4,0,0,1-4,4H28a4,4,0,0,1-4-4V80a4,4,0,0,1,4-4H196a4,4,0,0,1,4,4Zm-56-72v48a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm-40,0v48a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm-40,0v48a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm192,0v48a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Z" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height="48"
      width="48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z" />
    </svg>
  )
}

const techIcons = [
  <IconMonitor key="m" />,
  <IconBattery key="b" />,
  <IconShield key="s" />,
]

function PricingFaqItem({
  question,
  answer,
  defaultOpen,
}: Readonly<{
  question: string
  answer: string
  defaultOpen?: boolean
}>) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const toggle = useCallback(() => setOpen((v) => !v), [])

  return (
    <div className="Pro_faqItem__f41pS">
      <button
        type="button"
        aria-expanded={open}
        style={{
          all: "unset",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          cursor: "pointer",
        }}
        onClick={toggle}
      >
        <h3 className="Pro_faqQ__9ZZeH" style={{ margin: 0 }}>
          {question}
        </h3>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            transition: "transform .2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5.22 8.22a.749.749 0 0 0 0 1.06l6.25 6.25a.749.749 0 0 0 1.06 0l6.25-6.25a.749.749 0 1 0-1.06-1.06L12 13.939 6.28 8.22a.749.749 0 0 0-1.06 0Z" />
          </svg>
        </span>
      </button>
      <div
        className="Pro_faqA__xf6yn"
        style={{ display: open ? "block" : "none" }}
      >
        {answer}
      </div>
    </div>
  )
}

export default function MacWallMarketingPricingPage() {
  const ribbon = macwallExactCopy.ribbon

  return (
    <div className="Wrapper_wrapper__5atST">
      <MacWallMarketingHeader />
      <main className="Pro_main__AXX86">
        <div className="Ribbon_ribbon__wKRG3">
          <span className="Ribbon_text__QAwUX">
            {ribbon.lineBeforeLink}
            <a className="Ribbon_link__XDQxu" href={macwallInstallerLatestPath}>
              {ribbon.linkText} <SvgChevron14 />
            </a>
          </span>
        </div>

        <div className="Pro_container__qFF_k">
          <h1 className="Pro_title__IgLf9">{p.heroTitle}</h1>
          <p className="Pro_lead__4Scrj">{p.heroLead}</p>

          <section className="Pro_plans___c7_l">
            <div className="Pro_card__D2Y1h">
              <div className="Pro_cardHeader__SpE4i">
                <div className="Pro_badge__R1MeK">{p.free.badge}</div>
                <div className="Pro_cardTitle__58EKF">{p.free.title}</div>
                <div className="Pro_cardPrice__ujJ2W">{p.free.price}</div>
                <div className="Pro_cardBullet__bFejC">{p.free.tagline}</div>
              </div>
              <ul className="Pro_featureList__UG5qq">
                {p.free.features.map((line) => (
                  <li className="Pro_featureItem__HhRtB" key={line}>
                    <IconCheck />
                    <span className="Pro_featureText___bfGk">{line}</span>
                  </li>
                ))}
              </ul>
              <div className="Pro_cardCta__T0F_S">
                <Link
                  className="SecondaryButton_secondaryButton__F7442"
                  href={macwallInstallerLatestPath}
                  aria-label={p.free.ctaAria}
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    width: "max-content",
                    padding: "7.25px 19px",
                  }}
                >
                  <span>{p.free.cta}</span>
                </Link>
              </div>
            </div>

            <div className="Pro_card__D2Y1h Pro_cardHighlight__iO9Ks">
              <div className="Pro_cardHeader__SpE4i">
                <div className="Pro_badge__R1MeK">{p.pro.badge}</div>
                <div className="Pro_cardTitle__58EKF">{p.pro.title}</div>
                <div className="Pro_cardPrice__ujJ2W">{p.pro.priceLine}</div>
                <div className="Pro_cardBullet__bFejC">{p.pro.tagline}</div>
              </div>
              <ul className="Pro_featureList__UG5qq">
                {p.pro.features.map((line) => (
                  <li className="Pro_featureItem__HhRtB" key={line}>
                    <IconCheck />
                    <span className="Pro_featureText___bfGk">{line}</span>
                  </li>
                ))}
              </ul>
              <div className="Pro_cardCta__T0F_S">
                <a
                  className="SecondaryButton_secondaryButton__F7442"
                  href={macwallProCheckoutURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={p.pro.ctaAria}
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    width: "max-content",
                    padding: "7.25px 19px",
                    backgroundColor: "#0071e3",
                  }}
                >
                  <span>{p.pro.cta}</span>
                </a>
              </div>
            </div>
          </section>

          <section className="Pro_tech__r11ZX">
            <div className="Pro_techGrid__vwAxm">
              {p.tech.map((t, i) => (
                <div className="Pro_techCard__931vm" key={t.title}>
                  <h3>
                    {techIcons[i]}
                    {t.title}
                  </h3>
                  <p>{t.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="Pro_faq__Yeb8f">
            <h2 className="Pro_faqTitle__SxczN">{p.faqTitle}</h2>
            <div className="Pro_faqGrid__uarGe">
              {p.faq.map((item, i) => (
                <PricingFaqItem
                  key={item.q}
                  question={item.q}
                  answer={item.a}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          </section>

          <section className="Pro_bottomCta__elQQV">
            <div className="Pro_bottomInner__3qifW">
              <div className="Pro_bottomText__ZD5MI">
                <h3 className="Pro_bottomTitle__dbwxz">{p.bottomTitle}</h3>
                <p className="Pro_bottomDesc__ux9lz">{p.bottomDesc}</p>
              </div>
              <div className="Pro_bottomActions__NZS0l">
                <Link className="Pro_btnSecondary___9Q0K" href={macwallInstallerLatestPath}>
                  {p.bottomCtaFree}
                </Link>
                <a
                  className="Pro_btnPrimary__O4ubA"
                  href={macwallProCheckoutURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.bottomCtaPro}
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <MacWallMarketingFooter shopPricingHref="/pricing" />
    </div>
  )
}
