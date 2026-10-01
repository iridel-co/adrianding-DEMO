import { readFile } from "node:fs/promises"
import { join } from "node:path"

/**
 * Photo treatment for social cards: full-bleed workshop/event photos get
 * cropped, auto-leveled and duotoned so any future workshop image reads as
 * one consistent family instead of a raw, differently-lit JPEG per course.
 *
 * Pipeline (ported from the approved scratch mockups —
 * `og-mockups/round4/prep.mjs` — generalized so it runs on any source image
 * instead of a hand-picked crop box per photo):
 *   1. `resize(1200, 630, { fit: "cover", position: sharp.strategy.attention })`
 *      — subject-aware auto-crop. Round 4's mockup used a manually tuned
 *      `extract()` box per photo; that doesn't scale to a CMS feeding in new
 *      workshop photos, so this uses sharp's attention strategy instead.
 *   2. `.normalise().gamma(1.6)` — stretch the histogram to the full dynamic
 *      range, then lift shadows without blowing out what little highlight
 *      there is. Fixes exactly the "dark and murky" problem round 4's
 *      before/after on the Exceptional Leadership photo documented.
 *   3. Charcoal -> warm-cream duotone (same recolor curve as every mockup
 *      round: `dark:[10,8,8]`, `light:[232,221,202]`) — grayscale + a
 *      contrast boost, then remapped through the two-color ramp per pixel.
 *
 * Runs at build time inside the (static) opengraph-image routes, so any
 * format sharp can read (jpg/png/webp/avif) works as a source — no
 * pre-generated JPEG copies need to be committed, and Phase 2's CMS can feed
 * its own image buffer through `treatOgPhoto` unchanged.
 *
 * sharp is loaded inside each function, not at the top of the file — see
 * `og-jpeg.ts` for why (Cloudflare Workers can't load it).
 */

const DUOTONE_DARK: [number, number, number] = [10, 8, 8]
const DUOTONE_LIGHT: [number, number, number] = [232, 221, 202]

async function duotone(
  buf: Buffer,
  dark: [number, number, number] = DUOTONE_DARK,
  light: [number, number, number] = DUOTONE_LIGHT
): Promise<Buffer> {
  const { default: sharp } = await import("sharp")
  const { data, info } = await sharp(buf)
    .grayscale()
    .linear(1.35, -30) // contrast boost before the recolor
    .raw()
    .toBuffer({ resolveWithObject: true })

  const rgba = Buffer.alloc((data.length / info.channels) * 4)
  for (let i = 0, p = 0; i < data.length; i += info.channels, p += 4) {
    const v = data[i] / 255
    rgba[p] = Math.round(dark[0] + (light[0] - dark[0]) * v)
    rgba[p + 1] = Math.round(dark[1] + (light[1] - dark[1]) * v)
    rgba[p + 2] = Math.round(dark[2] + (light[2] - dark[2]) * v)
    rgba[p + 3] = 255
  }

  return sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .jpeg({ quality: 90 })
    .toBuffer()
}

/** Treats a raw image buffer (any format sharp reads) into a duotoned,
 *  1200x630 JPEG data URI ready to inline as a Satori `<img src>`. */
export async function treatOgPhoto(buf: Buffer): Promise<string> {
  const { default: sharp } = await import("sharp")
  const resized = await sharp(buf)
    .resize(1200, 630, { fit: "cover", position: sharp.strategy.attention })
    .normalise()
    .gamma(1.6)
    .toBuffer()
  const jpeg = await duotone(resized)
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`
}

const FALLBACK_PATH = join(process.cwd(), "public/images/mascot/ad-bg-2.png")

/**
 * Reads a `public/`-relative image path, treats it, and returns a data URI.
 * Falls back to the site's own mono room plate (`ad-bg-2.png`, also treated
 * so the fallback reads as part of the same photo family) and warns with the
 * workshop's slug on any read/decode failure — a bad or missing photo must
 * never fail the build.
 */
export async function ogPhotoForPath(
  publicRelativePath: string | undefined,
  label: string
): Promise<string> {
  if (!publicRelativePath) {
    console.warn(
      `[og-photo] no image for "${label}" — using the fallback room plate`
    )
    return treatOgPhoto(await readFile(FALLBACK_PATH))
  }
  try {
    const buf = await readFile(
      join(process.cwd(), "public", publicRelativePath)
    )
    return await treatOgPhoto(buf)
  } catch (err) {
    console.warn(
      `[og-photo] failed to read/treat "${publicRelativePath}" for "${label}" (${(err as Error).message}) — using the fallback room plate`
    )
    return treatOgPhoto(await readFile(FALLBACK_PATH))
  }
}
