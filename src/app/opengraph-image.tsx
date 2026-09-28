import { ImageResponse } from "next/og"
import { ogJpeg } from "@/lib/og-jpeg"
import { ogPhotoForPath } from "@/lib/og-photo"
import { OG_SANS, loadOgFonts } from "@/lib/og-fonts"
import {
  OG_CONTENT_LEFT,
  OG_CONTENT_WIDTH,
  OG_INK,
  OG_MARGIN,
  ogEyebrow,
  ogMaroonBar,
  ogScrim,
  ogTitle,
  ogWordmarkSpine,
} from "@/lib/og-card"

export const runtime = "nodejs"
export const alt =
  "Coach Adrian Ding — Leadership Development & Corporate Training"
export const size = { width: 1200, height: 630 }
export const contentType = "image/jpeg"

/**
 * Site-wide social card, layout L1 + wordmark E6 — same family as the
 * per-workshop cards (`workshops/[slug]/opengraph-image.tsx`), approved out
 * of `og-mockups/round5/`. Eyebrow + headline pinned top-left, "ADRIANDING.COM"
 * pinned bottom-left in place of the date/venue block workshop cards use, the
 * "Adrian Ding" wordmark as the soft-glow spine on the right edge, full-bleed
 * duotoned mono room plate (`ad-bg-2.png`) behind everything.
 *
 * Verify against `next build`, not `next dev` (Turbopack dev rejects the
 * inlined bitmaps that the production render handles fine).
 */
export default async function OgImage() {
  const [photoSrc, fonts] = await Promise.all([
    ogPhotoForPath("images/mascot/ad-bg-2.png", "landing"),
    loadOgFonts(),
  ])

  const card = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: OG_INK,
      }}
    >
      <img
        src={photoSrc}
        alt=""
        width={1200}
        height={630}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          objectFit: "cover",
        }}
      />
      {ogScrim()}
      {ogWordmarkSpine()}
      {ogMaroonBar()}
      <div
        style={{
          position: "absolute",
          left: OG_CONTENT_LEFT,
          top: OG_MARGIN,
          display: "flex",
          flexDirection: "column",
          width: OG_CONTENT_WIDTH,
        }}
      >
        {ogEyebrow("LEADERSHIP COACH · CORPORATE TRAINER")}
        <div style={{ marginTop: 18, display: "flex" }}>
          {ogTitle("20+ years. 20,000+ leaders trained.", true)}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: OG_CONTENT_LEFT,
          bottom: OG_MARGIN,
          display: "flex",
          fontFamily: OG_SANS,
          fontSize: 20,
          letterSpacing: 2.4,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        ADRIANDING.COM
      </div>
    </div>,
    { ...size, fonts }
  )

  // WhatsApp drops any card over ~300 KB — see `ogJpeg`.
  return ogJpeg(card)
}
