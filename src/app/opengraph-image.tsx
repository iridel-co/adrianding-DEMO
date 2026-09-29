import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { ogJpeg } from "@/lib/og-jpeg"
import { ogPhotoForPath } from "@/lib/og-photo"
import { OG_SANS, OG_SERIF, loadOgFonts } from "@/lib/og-fonts"
import { OG_INK, ogScrim } from "@/lib/og-card"

export const runtime = "nodejs"
export const alt =
  "Come train with Adrian Ding — leadership workshops and corporate training"
export const size = { width: 1200, height: 630 }
export const contentType = "image/jpeg"

/**
 * Site-wide social card — every non-workshop page inherits this route. This
 * is design "F2", round 10 of `og-mockups/` (see that folder's `NOTES.md`
 * rounds 9-10 for the full history), approved by Chan on 2026-09-29 and
 * ported mechanically from `round10/render10.mjs`. Distinct from the
 * per-course card family (`workshops/[slug]/opengraph-image.tsx`, layout
 * "L1" + wordmark "E6") — that route and its shared helpers in
 * `src/lib/og-card.tsx` are untouched by this file except for `OG_INK` and
 * `ogScrim()`, which this card reuses as-is.
 *
 * Layout: treated room-plate background (same `ogPhotoForPath` pipeline the
 * per-course cards use) behind a hook block vertically centered by ink
 * bounds — "COME TRAIN WITH" (Red Hat Display, tracked) over a huge "Adrian
 * Ding" (Prata) — and a red-blazer portrait cutout bottom-anchored on the
 * right. No maroon bar, no stats, no vertical wordmark spine — those belong
 * to the per-course family, not this card. Footer names the two offerings
 * ("WORKSHOPS · CORPORATE TRAINING") bottom-left.
 *
 * Every position below is the exact measured value from `render10.mjs`, not
 * eyeballed:
 * - `HOOK_TOP: 224` centers the hook block's ink bounds at y:231-398 in the
 *   630px canvas (231px top margin, 231px bottom margin, delta 0px).
 * - `CONTENT_LEFT: 68` is the block's container left; Prata's "A" has a
 *   small left side-bearing, so the block's true optical ink-left edge lands
 *   at x:64 — `FOOTER_LEFT: 64` matches that measured value so the footer
 *   text lines up with "Adrian Ding" above it, not the container edge.
 * - Portrait `383x610` is capped by the 20px headroom floor (taller would
 *   either crop the head or shrink below it), bottom-anchored, right:0 —
 *   32px clear of the hook block's measured right ink edge (x:785).
 *
 * Verify against `next build`, not `next dev` (Turbopack dev rejects the
 * inlined bitmaps that the production render handles fine).
 */

const CONTENT_LEFT = 68
const HOOK_TOP = 224
const FOOTER_LEFT = 64
const FOOTER_BOTTOM = 68
const PORTRAIT_W = 383
const PORTRAIT_H = 610

async function loadPortraitDataUri() {
  const buf = await readFile(
    join(process.cwd(), "src/app/og-assets/ad-hero-portrait.png")
  )
  return `data:image/png;base64,${buf.toString("base64")}`
}

export default async function OgImage() {
  const [photoSrc, portraitSrc, fonts] = await Promise.all([
    ogPhotoForPath("images/mascot/ad-bg-2.png", "landing"),
    loadPortraitDataUri(),
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
      <img
        src={portraitSrc}
        alt=""
        width={PORTRAIT_W}
        height={PORTRAIT_H}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: PORTRAIT_W,
          height: PORTRAIT_H,
          objectFit: "contain",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CONTENT_LEFT,
          top: HOOK_TOP,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: OG_SANS,
            fontSize: 26,
            letterSpacing: 3,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          COME TRAIN WITH
        </div>
        <div
          style={{
            marginTop: 4,
            display: "flex",
            fontFamily: OG_SERIF,
            fontSize: 128,
            color: "#ffffff",
            letterSpacing: -3,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Adrian Ding
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: FOOTER_LEFT,
          bottom: FOOTER_BOTTOM,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: OG_SANS,
            fontSize: 22,
            letterSpacing: 3,
            color: "#ffffff",
          }}
        >
          WORKSHOPS
        </div>
        <div
          style={{
            display: "flex",
            marginLeft: 28,
            marginRight: 28,
            fontFamily: OG_SANS,
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          ·
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: OG_SANS,
            fontSize: 22,
            letterSpacing: 3,
            color: "#ffffff",
          }}
        >
          CORPORATE TRAINING
        </div>
      </div>
    </div>,
    { ...size, fonts }
  )

  // WhatsApp drops any card over ~300 KB — see `ogJpeg`.
  return ogJpeg(card)
}
