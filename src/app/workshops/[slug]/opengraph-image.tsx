import { ImageResponse } from "next/og"
import { ogJpeg } from "@/lib/og-jpeg"
import { ogPhotoForPath } from "@/lib/og-photo"
import { OG_SANS, loadOgFonts } from "@/lib/og-fonts"
import {
  OG_ACCENT,
  OG_CONTENT_LEFT,
  OG_CONTENT_WIDTH,
  OG_INK,
  OG_MARGIN,
  addressLine,
  ogEyebrow,
  ogMaroonBar,
  ogScrim,
  ogTitle,
  ogWordmarkSpine,
} from "@/lib/og-card"
import { WORKSHOPS, getWorkshop } from "@/lib/workshops"

export const runtime = "nodejs"
export const alt = "Public workshop with Coach Adrian Ding"
export const size = { width: 1200, height: 630 }
export const contentType = "image/jpeg"

export function generateStaticParams() {
  return WORKSHOPS.map((w) => ({ slug: w.slug }))
}

/**
 * Per-course social card, layout L1 + wordmark E6 — approved out of
 * `og-mockups/round5/` (see that folder's `NOTES.md` for the full A-through-5
 * round history). Eyebrow + title pinned top-left, date + venue pinned
 * bottom-left, the "Adrian Ding" wordmark carried on every card as a soft-glow
 * vertical spine chopped at the right edge, full-bleed duotoned photo behind
 * everything.
 *
 * Same Satori constraints as before: fonts must be TTF, every absolutely
 * positioned element needs explicit numeric width/height, assets are inlined
 * as data URIs. `params` is a Promise (Next 15+ metadata-route contract) —
 * typing it as a plain object compiles fine and silently yields `undefined`
 * for every slug.
 *
 * Verify against `next build`, not `next dev` (Turbopack dev rejects the
 * inlined bitmaps that the production render handles fine).
 */
export default async function WorkshopOgImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const workshop = getWorkshop(slug)

  const [photoSrc, fonts] = await Promise.all([
    ogPhotoForPath(workshop?.image, slug),
    loadOgFonts(),
  ])

  // Drop the weekday and the time range — a social card has room for the date
  // and nothing else, and "Friday" is not what makes someone click.
  const dateLine = workshop?.schedule
    .split("·")[0]
    ?.replace(/^\w+day,\s*/, "")
    .trim()
  const address = workshop
    ? addressLine(workshop.venue, workshop.city)
    : "SEDA Ayala Center Cebu, E-bloc"
  const title = workshop?.title ?? "Workshop"
  const isLong = title.length > 28

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
        {ogEyebrow("PUBLIC WORKSHOP")}
        <div style={{ marginTop: 18, display: "flex" }}>
          {ogTitle(title, isLong)}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: OG_CONTENT_LEFT,
          bottom: OG_MARGIN,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {dateLine && (
          <div
            style={{
              display: "flex",
              fontFamily: OG_SANS,
              fontSize: 34,
              fontWeight: 600,
              color: OG_ACCENT,
            }}
          >
            {dateLine}
          </div>
        )}
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontFamily: OG_SANS,
            fontSize: 30,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {address}
        </div>
      </div>
    </div>,
    { ...size, fonts }
  )

  // WhatsApp drops any card over ~300 KB — see `ogJpeg`.
  return ogJpeg(card)
}
