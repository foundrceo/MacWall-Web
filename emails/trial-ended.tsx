import {
  Body,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "react-email"

import {
  trialEndedCopy,
  trialEndedPromo,
  type TrialEndedEmailStep,
} from "@/lib/email/trial-ended-copy"

const FONT =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

export type TrialEndedEmailProps = {
  step: TrialEndedEmailStep
  appName?: string
  logoUrl: string
  checkoutHref: string
  unsubscribeHref?: string | null
}

export function TrialEndedEmail({
  step,
  appName = "MacWall",
  logoUrl,
  checkoutHref,
  unsubscribeHref,
}: TrialEndedEmailProps) {
  const copy = trialEndedCopy(step, appName)
  const promo = trialEndedPromo(step)
  const year = new Date().getFullYear()
  const unsub = unsubscribeHref?.trim() || null

  return (
    <Html lang="en">
      <Head>
        <title>{copy.subject}</title>
      </Head>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#ffffff",
          width: "100%",
        }}
      >
        <Preview>{copy.preheader}</Preview>
        <Section
          style={{
            backgroundColor: "#ffffff",
            paddingTop: 24,
            paddingBottom: 40,
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <Section
            style={{
              maxWidth: 740,
              margin: "0 auto",
              backgroundColor: "#f5f5f7",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Section style={{ paddingTop: 36, paddingBottom: 12, textAlign: "center" }}>
              <Img
                src={logoUrl}
                width={36}
                height={36}
                alt={appName}
                style={{
                  display: "inline-block",
                  width: 36,
                  height: 36,
                  border: 0,
                  borderRadius: 9,
                }}
              />
            </Section>

            <Section
              style={{
                paddingLeft: 26,
                paddingRight: 26,
                paddingTop: 12,
                paddingBottom: 20,
              }}
            >
              <Heading
                as="h1"
                style={{
                  margin: 0,
                  fontFamily: FONT,
                  color: "#111111",
                  fontWeight: 600,
                  fontSize: 40,
                  lineHeight: "44px",
                  letterSpacing: "0.004em",
                  textAlign: "center",
                }}
              >
                {copy.headline}
              </Heading>
            </Section>

            <Section
              style={{
                paddingLeft: 26,
                paddingRight: 26,
                paddingBottom: 28,
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT,
                  fontWeight: 400,
                  fontSize: 17,
                  color: "#333333",
                  lineHeight: "1.47059",
                  letterSpacing: "-0.022em",
                  textAlign: "center",
                }}
              >
                {copy.body}
              </Text>
            </Section>

            <Section
              style={{
                paddingLeft: 26,
                paddingRight: 26,
                paddingBottom: 28,
              }}
            >
              <Section
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  paddingTop: 22,
                  paddingBottom: 22,
                  paddingLeft: 20,
                  paddingRight: 20,
                  textAlign: "center",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    marginBottom: 8,
                    fontFamily: FONT,
                    fontSize: 12,
                    fontWeight: 400,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "#86868b",
                    textAlign: "center",
                  }}
                >
                  {copy.codeLabel}
                </Text>
                <Text
                  style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    lineHeight: 1.4,
                    color: "#111111",
                    textAlign: "center",
                    wordBreak: "break-all",
                  }}
                >
                  {promo.code}
                </Text>
                <Text
                  style={{
                    margin: 0,
                    marginTop: 10,
                    fontFamily: FONT,
                    fontSize: 13,
                    lineHeight: "18px",
                    color: "#86868b",
                    textAlign: "center",
                  }}
                >
                  {copy.codeHint}
                </Text>
              </Section>
            </Section>

            <Section style={{ paddingBottom: 8, textAlign: "center" }}>
              <Link
                href={checkoutHref}
                style={{
                  color: "#0070c9",
                  textDecoration: "none",
                  fontFamily: FONT,
                  fontSize: 17,
                  lineHeight: "26px",
                  letterSpacing: "-0.021em",
                  fontWeight: 400,
                }}
              >
                {copy.cta}&nbsp;›
              </Link>
            </Section>

            <Section
              style={{
                paddingTop: 20,
                paddingBottom: 28,
                paddingLeft: 28,
                paddingRight: 28,
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT,
                  color: "#888888",
                  fontSize: 11,
                  lineHeight: "14px",
                  textAlign: "center",
                }}
              >
                Already paid? Ignore this email.
                {unsub ? (
                  <>
                    {" "}
                    <Link
                      href={unsub}
                      style={{
                        color: "#888888",
                        textDecoration: "underline",
                      }}
                    >
                      Unsubscribe
                    </Link>
                  </>
                ) : null}
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT,
                  color: "#888888",
                  fontSize: 11,
                  lineHeight: "14px",
                  textAlign: "center",
                }}
              >
                © {year} {appName}. All rights reserved.
              </Text>
            </Section>
          </Section>
        </Section>
      </Body>
    </Html>
  )
}

TrialEndedEmail.PreviewProps = {
  step: "ended",
  appName: "MacWall",
  logoUrl: "https://macwall.app/email/macwall-icon.png",
  checkoutHref:
    "https://macwall.app/api/checkout/create-session?offer=permanent&promo=WALL10",
  unsubscribeHref: "https://macwall.app/unsubscribe/trial",
} satisfies TrialEndedEmailProps

export default TrialEndedEmail
