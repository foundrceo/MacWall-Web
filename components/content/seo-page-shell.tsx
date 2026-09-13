import { ProseBreadcrumbs } from "@/components/content/prose-breadcrumbs"
import { ContentBody } from "@/components/content/content-body"
import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { landingPageH1, landingPageLead } from "@/components/macwall-marketing/landing-type"
import type { ContentFaq, ContentBlock } from "@/lib/content/types"
import {
  proseFaq,
  proseFaqAnswer,
  proseFaqItem,
  proseFaqList,
  proseFaqQuestion,
  proseFaqTitle,
  proseHeroMeta,
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
    <>
      <MarketingTitleSection aria-labelledby={titleId}>
        {breadcrumbs ? <ProseBreadcrumbs items={breadcrumbs} /> : null}
        <h1 id={titleId} className={landingPageH1}>
          {headline}
        </h1>
        <p className={landingPageLead}>{description}</p>
        {meta ? <p className={proseHeroMeta}>{meta}</p> : null}
      </MarketingTitleSection>

      <MarketingBodySection>
        <article className="prose min-w-0 max-w-none px-4 py-8 md:px-6">
          {sections ? <ContentBody sections={sections} /> : null}
          {children}
        </article>

        {faq && faq.length > 0 ? (
          <section
            className={proseFaq}
            aria-labelledby="seo-page-faq-title"
          >
            <h2
              id="seo-page-faq-title"
              className={`${proseFaqTitle} px-4 pt-8 md:px-6`}
            >
              Frequently asked questions
            </h2>
            <dl className={proseFaqList}>
              {faq.map((item) => (
                <div key={item.question} className={`${proseFaqItem} px-4 md:px-6`}>
                  <dt className={proseFaqQuestion}>{item.question}</dt>
                  <dd className={proseFaqAnswer}>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </MarketingBodySection>
    </>
  )
}
