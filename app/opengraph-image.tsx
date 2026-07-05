import { macwall } from "@/lib/macwall-site"
import { ImageResponse } from "next/og"

export const alt = `${macwall.name} – ${macwall.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0a0b 0%, #1c1c24 45%, #0f1012 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          {macwall.name}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            fontWeight: 400,
            color: "rgba(255,255,255,0.82)",
            maxWidth: 900,
            lineHeight: 1.35,
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          {macwall.tagline}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 20,
            color: "rgba(255,255,255,0.45)",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          macwall.app
        </div>
      </div>
    ),
    { ...size },
  )
}
