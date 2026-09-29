import { OG_SANS, OG_SERIF } from "@/lib/og-fonts"

/**
 * Shared pieces for both `opengraph-image.tsx` routes — the layout L1 +
 * wordmark E6 combination Chan approved out of `og-mockups/round5/` (see
 * `NOTES.md` there for the full A/B history). Ported mechanically from the
 * mockup's `render5.mjs` / `emboss.mjs`, not redesigned.
 */

export const OG_INK = "#0a0606"
export const OG_MAROON = "#980F09"
export const OG_ACCENT = "#c9453a"
export const OG_SCRIM =
  "linear-gradient(90deg, rgba(8,6,6,0.92) 0%, rgba(8,6,6,0.62) 46%, rgba(8,6,6,0.3) 78%, rgba(8,6,6,0.5) 100%)"

// Title sizes scaled ~0.93 for Prata's metrics (its caps run ~14% taller and
// wider than a standard display serif at the same fontSize — matches the
// `size-adjust: 93%` used on the site's own Prata load, see `layout.tsx`).
// Verified this keeps a ~2-line wrap for every current workshop title at the
// same `maxWidth` (measured via the approach in `measure-titles.mjs`),
// nothing collides with the bottom block or the wordmark column. `eyebrow`
// is sans (Red Hat Display), unaffected.
export const OG_SCALE = { eyebrow: 32, longTitle: 78, shortTitle: 110 } as const
export const OG_MARGIN = 44
export const OG_CONTENT_LEFT = 68
/** Clears the wordmark spine (starts at x:1112) with ~30px to spare. */
export const OG_CONTENT_RIGHT_LIMIT = 1080
export const OG_CONTENT_WIDTH = OG_CONTENT_RIGHT_LIMIT - OG_CONTENT_LEFT

/**
 * "SEDA Ayala Center Cebu, E-bloc" + "Cebu City" -> the venue unchanged,
 * since the venue string already names the city. Only appends the city when
 * the venue string doesn't already contain it — verified against every
 * current workshop record in `src/lib/workshops.ts`, all of which already
 * name Cebu in `venue`. Kept as a real branch (not simplified away) for the
 * first workshop record that doesn't.
 */
export function addressLine(venue: string, city: string): string {
  const cityWord = city.split(" ")[0]?.toLowerCase() ?? ""
  return venue.toLowerCase().includes(cityWord) ? venue : `${venue} · ${city}`
}

/**
 * Vertical "Adrian Ding" wordmark, rotated -90deg and chopped at the right
 * canvas edge (`left:1112` + rotated width (`height` below) runs past the
 * 1200px canvas — Satori doesn't draw what's off-canvas, no
 * `overflow:hidden` needed). `originX:1112` is fixed by the content-column
 * layout (`OG_CONTENT_RIGHT_LIMIT`), not by the font.
 *
 * `originY:605` fixes the wordmark's bottom margin at a constant
 * `630 - 605 = 25px` regardless of font — the top margin is whatever's left
 * after the rendered text width (`605 - textWidth`). `fontSize:103` is the
 * Prata value that puts that rendered width at ~583px (measured by the
 * approach in `og-mockups/round2b/measure.mjs`), giving a ~22px top margin,
 * full name intact, chop still right-edge only. `height` is `fontSize * 1.15`, the same
 * line-height multiplier the original geometry used, so the horizontal chop
 * stays proportionally similar (~26% of the rotated footprint vs. the
 * original ~32%).
 *
 * Rendering is "E6 soft glow" from `og-mockups/round5/emboss.mjs`: three
 * decreasing-opacity white copies stacked behind the black text (offsets
 * 6/4/2px, opacity 0.12/0.2/0.3), black copy on top. Reads as a subtle
 * backlit halo rather than a print-registration artifact, and survives a
 * 500px thumbnail (round 4's plain black-on-photo variants didn't).
 */
const SPINE = {
  left: 1112,
  top: 605,
  width: 1400,
  height: 103 * 1.15,
  fontSize: 103,
}

function spineCopy(
  key: string,
  left: number,
  top: number,
  color: string,
  opacity: number
) {
  return (
    <div
      key={key}
      style={{
        position: "absolute",
        left,
        top,
        width: SPINE.width,
        height: SPINE.height,
        display: "flex",
        alignItems: "flex-start",
        transform: "rotate(-90deg)",
        transformOrigin: "top left",
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: OG_SERIF,
          fontSize: SPINE.fontSize,
          lineHeight: 1,
          letterSpacing: -2,
          color,
          opacity,
          whiteSpace: "nowrap",
        }}
      >
        Adrian Ding
      </div>
    </div>
  )
}

// Screen offset (leftPx, downPx) -> box-local (left,top) delta, per the
// rotation math verified in round5/emboss.mjs: dTop = -leftPx, dLeft = -downPx.
function offsetFor(leftPx: number, downPx: number) {
  return { dLeft: -downPx, dTop: -leftPx }
}

/** Returns an array of layered `<div>`s (glow copies + the black top copy) —
 *  spread these directly into a parent's children, e.g. `{...ogWordmarkSpine()}`
 *  isn't valid JSX, so callers do `{ogWordmarkSpine()}` and React renders the
 *  array; each layer carries its own `key`. */
export function ogWordmarkSpine() {
  const glow = [6, 4, 2].map((d, i) => {
    const o = offsetFor(d, d)
    const opacity = [0.12, 0.2, 0.3][i]
    return spineCopy(
      `glow-${d}`,
      SPINE.left + o.dLeft,
      SPINE.top + o.dTop,
      "#ffffff",
      opacity
    )
  })
  return [...glow, spineCopy("main", SPINE.left, SPINE.top, "#050505", 1)]
}

export function ogScrim() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1200,
        height: 630,
        display: "flex",
        background: OG_SCRIM,
      }}
    />
  )
}

export function ogMaroonBar() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 10,
        height: 630,
        display: "flex",
        background: OG_MAROON,
      }}
    />
  )
}

export function ogEyebrow(text: string) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: OG_SANS,
        fontSize: OG_SCALE.eyebrow,
        letterSpacing: 3.2,
        color: "rgba(255,255,255,0.75)",
      }}
    >
      {text}
    </div>
  )
}

export function ogTitle(text: string, isLong: boolean) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: OG_SERIF,
        fontSize: isLong ? OG_SCALE.longTitle : OG_SCALE.shortTitle,
        color: "#ffffff",
        lineHeight: 1.02,
        letterSpacing: -1.5,
        maxWidth: OG_CONTENT_WIDTH - 20,
      }}
    >
      {text}
    </div>
  )
}
