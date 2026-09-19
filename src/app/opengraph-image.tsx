import { ImageResponse } from "next/og"
import { ogJpeg } from "@/lib/og-jpeg"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const runtime = "nodejs"
export const alt =
  "Coach Adrian Ding — Leadership Development & Corporate Training"
export const size = { width: 1200, height: 630 }
export const contentType = "image/jpeg"

const ASSETS = join(process.cwd(), "src/app/og-assets")

/**
 * Social card, composed to read as the same cover as the editorial hero
 * (`_sections/hero-editorial.tsx`): the mono `ad-bg-2` plate, the portrait
 * cut-out right-of-centre, the wordmark in The Seasons on the left.
 *
 * Everything is read off disk and inlined as a data URI — Satori resolves no
 * root-relative `/images/...` paths — and `og-assets/` holds the formats Satori
 * accepts, which are NOT the ones the site itself uses:
 *   - portrait as PNG, not the site's `.webp` (Satori's decoder throws on it)
 *   - fonts as TTF, not the site's `.woff2` ("Unsupported OpenType signature")
 * Regenerate those from the originals with fontTools / Pillow if the source
 * assets change.
 *
 * Every absolutely positioned element carries explicit numeric width/height:
 * `width: "auto"` resolves to zero here and the element silently disappears.
 *
 * Verify this against `next build` (it prerenders to
 * `.next/server/app/opengraph-image.body`), not `next dev` — Turbopack dev
 * rejects the inlined PNGs with "Input buffer contains unsupported image
 * format" while the production render of the identical code is fine.
 */
export default async function OgImage() {
  const [bg, portrait, seasons, redHat] = await Promise.all([
    readFile(join(process.cwd(), "public/images/mascot/ad-bg-2.png")),
    readFile(join(ASSETS, "ad-hero-portrait.png")),
    readFile(join(ASSETS, "TheSeasons-Bold.ttf")),
    readFile(join(ASSETS, "RedHatDisplay-600.ttf")),
  ])
  const bgSrc = `data:image/png;base64,${bg.toString("base64")}`
  const portraitSrc = `data:image/png;base64,${portrait.toString("base64")}`

  const stat = (value: string, label: string) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          fontFamily: "TheSeasons",
          fontSize: 46,
          color: "#e0554a",
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 6,
          fontFamily: "RedHat",
          fontSize: 15,
          letterSpacing: 2.4,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {label}
      </div>
    </div>
  )

  const card = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#141414",
      }}
    >
      <img
        src={bgSrc}
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
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          display: "flex",
          background:
            "linear-gradient(90deg, rgba(8,6,6,0.94) 0%, rgba(8,6,6,0.8) 42%, rgba(8,6,6,0.28) 72%, rgba(8,6,6,0.5) 100%)",
        }}
      />
      <img
        src={portraitSrc}
        alt=""
        width={477}
        height={760}
        style={{
          position: "absolute",
          right: 20,
          top: -26,
          width: 477,
          height: 760,
          objectFit: "contain",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 0,
          width: 700,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "TheSeasons",
            fontSize: 104,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          Adrian Ding
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontFamily: "RedHat",
            fontSize: 19,
            letterSpacing: 3.4,
            color: "rgba(255,255,255,0.76)",
          }}
        >
          LEADERSHIP COACH · CORPORATE TRAINER
        </div>
        <div style={{ display: "flex", marginTop: 44, gap: 60 }}>
          {stat("20+", "YEARS")}
          {stat("20,000+", "LEADERS TRAINED")}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "TheSeasons", data: seasons, style: "normal", weight: 700 },
        { name: "RedHat", data: redHat, style: "normal", weight: 600 },
      ],
    }
  )

  // WhatsApp drops any card over ~300 KB — see `ogJpeg`.
  return ogJpeg(card)
}
