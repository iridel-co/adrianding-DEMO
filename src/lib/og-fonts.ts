import { readFile } from "node:fs/promises"
import { join } from "node:path"

/**
 * Single source for the two fonts every social card needs. Both routes
 * (`src/app/opengraph-image.tsx`, `src/app/workshops/[slug]/opengraph-image.tsx`)
 * previously read these files themselves, duplicated; this is the shared
 * version the approved mockups (`og-mockups/round5/render5.mjs`) render with.
 *
 * TTF, not the site's own `.woff2` — Satori's font decoder throws on woff2.
 *
 * The serif is exported as `OG_SERIF`, one constant, so this is the one
 * switch point. Cards currently render with **Prata** (SIL OFL,
 * `Prata-Regular.ttf`) — The Seasons is a paid commercial face and Chan
 * doesn't have a license for it yet (2026-09-28). Prata ships one weight
 * only (400/regular), so `og-card.tsx` must never ask this family for 700 —
 * Satori fake-bolds or fails on a missing weight. Switching back to The
 * Seasons once it's licensed (including server-side rendering rights, which
 * is a separate grant from a webfont license) is: swap the filename/weight
 * below back to `TheSeasons-Bold.ttf` / 700, then re-check the wordmark fit
 * in `og-card.tsx` (`SPINE.fontSize` etc.) — Prata's metrics are wider/taller
 * than The Seasons', so the geometry was re-measured for it and doesn't
 * carry over as-is.
 */

const ASSETS = join(process.cwd(), "src/app/og-assets")

export const OG_SERIF = "Prata"
export const OG_SANS = "RedHat"

export async function loadOgFonts() {
  const [prata, redHat] = await Promise.all([
    readFile(join(ASSETS, "Prata-Regular.ttf")),
    readFile(join(ASSETS, "RedHatDisplay-600.ttf")),
  ])
  return [
    {
      name: OG_SERIF,
      data: prata,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: OG_SANS,
      data: redHat,
      style: "normal" as const,
      weight: 600 as const,
    },
  ]
}
