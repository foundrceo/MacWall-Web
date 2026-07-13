import { MarketingProseShell } from "@/components/content/marketing-prose-shell"
import { ProseBreadcrumbs } from "@/components/content/prose-breadcrumbs"
import { ContentBody } from "@/components/content/content-body"
import type { ContentFaq, ContentBlock } from "@/lib/content/types"
import type { ReactNode } from "react"

export function SeoPageShell({
  headline,
  description,
  sections,
  faq,
  breadcrumbs,
  meta,
  children,
  showBottomCta = true,
}: Readonly<{
  headline: string
  description: string
  sections?: ContentBlock[]
  faq?: ContentFaq[]
  breadcrumbs?: { label: string; href: string }[]
  meta?: ReactNode
  children?: ReactNode
  showBottomCta?: boolean
}>) {
  const titleId = "seo-page-title"

  return (
    <MarketingProseShell
      width="article"
      mainId="seo-page-main"
      labelledBy={titleId}
      showBottomCta={showBottomCta}
    >
      {breadcrumbs ? <ProseBreadcrumbs items={breadcrumbs} /> : null}

      <header className="MacWallProseHero">
        <h1 id={titleId} className="MacWallProseHeroTitle">
          {headline}
        </h1>
        <p className="MacWallProseHeroLead">{description}</p>
        {meta ? <p className="MacWallProseHeroMeta">{meta}</p> : null}
      </header>

      <div className="MacWallProseDivider" role="presentation" />

      <article className="MacWallProseArticle">
        {sections ? <ContentBody sections={sections} /> : null}
        {children}
      </article>

      {faq && faq.length > 0 ? (
        <>
          <div className="MacWallProseDivider" role="presentation" />
          <section
            className="MacWallProseFaq"
            aria-labelledby="seo-page-faq-title"
          >
            <h2 id="seo-page-faq-title" className="MacWallProseFaqTitle">
              Frequently asked questions
            </h2>
            <dl className="MacWallProseFaqList">
              {faq.map((item) => (
                <div key={item.question} className="MacWallProseFaqItem">
                  <dt className="MacWallProseFaqQuestion">{item.question}</dt>
                  <dd className="MacWallProseFaqAnswer">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : null}
    </MarketingProseShell>
  )
}
