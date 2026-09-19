import { ImageResponse } from "next/og"
import { ogJpeg } from "@/lib/og-jpeg"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { WORKSHOPS, getWorkshop } from "@/lib/workshops"

export const runtime = "nodejs"
export const alt = "Public workshop with Coach Adrian Ding"
export const size = { width: 1200, height: 630 }
export const contentType = "image/jpeg"

export function generateStaticParams() {
  return WORKSHOPS.map((w) => ({ slug: w.slug }))
}

const ASSETS = join(process.cwd(), "src/app/og-assets")

/**
 * Per-course social card.
 *
 * The client's traffic model sends an ad straight to a course page, and those
 * links get forwarded, pasted into group chats and shared — all of which
 * previewed with the site-wide card before this existed, so every course looked
 * like the same generic link. This gives each one its own photo, title and date.
 *
 * Same Satori constraints as the root card (`src/app/opengraph-image.tsx`):
 * fonts must be TTF, every absolutely positioned element needs explicit numeric
 * width/height, and assets are inlined as data URIs because root-relative paths
 * do not resolve. Course photos are JPEG, which Satori does decode — unlike the
 * `.webp` the site itself serves.
 *
 * Verify against `next build`, not `next dev` (Turbopack dev rejects the inlined
 * bitmaps that the production render handles fine).
 */
export default async function WorkshopOgImage({
  params,
}: {
  // Next 15 hands `params` to metadata routes as a Promise, exactly as it does
  // to the page. Typing it as a plain object compiles fine and silently yields
  // `undefined` for every slug, so all eight cards render the same fallback.
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const workshop = getWorkshop(slug)

  const [photo, seasons, redHat] = await Promise.all([
    readFile(
      join(
        process.cwd(),
        "public",
        workshop?.image ?? "/images/gallery/sunlife/photo-3.jpg"
      )
    ),
    readFile(join(ASSETS, "TheSeasons-Bold.ttf")),
    readFile(join(ASSETS, "RedHatDisplay-600.ttf")),
  ])
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`

  // Drop the weekday and the time range — a social card has room for the date
  // and nothing else, and "Friday" is not what makes someone click.
  const dateLine = workshop?.schedule.split("·")[0]?.replace(/^\w+day,\s*/, "")

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
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          display: "flex",
          background:
            "linear-gradient(90deg, rgba(10,6,6,0.94) 0%, rgba(10,6,6,0.78) 46%, rgba(10,6,6,0.16) 100%)",
        }}
      />
      {/* Brand rule down the left edge — the one maroon element, so the card
          is recognisably his at thumbnail size. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 14,
          height: 630,
          display: "flex",
          background: "#980F09",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 78,
          top: 0,
          width: 760,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "RedHat",
            fontSize: 18,
            letterSpacing: 3.6,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          PUBLIC WORKSHOP · CEBU
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontFamily: "TheSeasons",
            fontSize: workshop && workshop.title.length > 28 ? 68 : 84,
            color: "#ffffff",
            lineHeight: 1.04,
            letterSpacing: -1,
          }}
        >
          {workshop?.title ?? "Workshop"}
        </div>
        {dateLine && (
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontFamily: "RedHat",
              fontSize: 26,
              color: "#e0554a",
            }}
          >
            {dateLine.trim()}
          </div>
        )}
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontFamily: "RedHat",
            fontSize: 21,
            color: "rgba(255,255,255,0.74)",
          }}
        >
          {workshop?.venue ?? "SEDA Ayala Center Cebu"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 46,
            fontFamily: "RedHat",
            fontSize: 19,
            letterSpacing: 2.6,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          WITH COACH ADRIAN DING
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
