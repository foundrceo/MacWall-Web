import { MarketingProseShell } from "@/components/content/marketing-prose-shell"
import { ProseBreadcrumbs } from "@/components/content/prose-breadcrumbs"
import { ContentBody } from "@/components/content/content-body"
import type { ContentFaq, ContentBlock } from "@/lib/content/types"
import {
  proseDivider,
  proseFaq,
  proseFaqAnswer,
  proseFaqItem,
  proseFaqList,
  proseFaqQuestion,
  proseFaqTitle,
  proseHero,
  proseHeroLead,
  proseHeroMeta,
  proseHeroTitle,
  proseArticle,
} from "@/lib/marketing-prose-classes"
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

      <header className={proseHero}>
        <h1 id={titleId} className={proseHeroTitle}>
          {headline}
        </h1>
        <p className={proseHeroLead}>{description}</p>
        {meta ? <p className={proseHeroMeta}>{meta}</p> : null}
      </header>

      <div className={proseDivider} role="presentation" />

      <article className={proseArticle}>
        {sections ? <ContentBody sections={sections} /> : null}
        {children}
      </article>

      {faq && faq.length > 0 ? (
        <>
          <div className={proseDivider} role="presentation" />
          <section className={proseFaq} aria-labelledby="seo-page-faq-title">
            <h2 id="seo-page-faq-title" className={proseFaqTitle}>
              Frequently asked questions
            </h2>
            <dl className={proseFaqList}>
              {faq.map((item) => (
                <div key={item.question} className={proseFaqItem}>
                  <dt className={proseFaqQuestion}>{item.question}</dt>
                  <dd className={proseFaqAnswer}>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : null}
    </MarketingProseShell>
  )
}
