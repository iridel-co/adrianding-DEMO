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
 * The serif is exported as `OG_SERIF`, one constant, so switching the card
 * family to Prata (if Chan carries the site-wide font-switch decision over
 * to the cards) is a one-line change here — swap the filename below to a
 * converted Prata TTF and nothing else in either route needs to change.
 */

const ASSETS = join(process.cwd(), "src/app/og-assets")

export const OG_SERIF = "TheSeasons"
export const OG_SANS = "RedHat"

export async function loadOgFonts() {
  const [seasons, redHat] = await Promise.all([
    readFile(join(ASSETS, "TheSeasons-Bold.ttf")),
    readFile(join(ASSETS, "RedHatDisplay-600.ttf")),
  ])
  return [
    {
      name: OG_SERIF,
      data: seasons,
      style: "normal" as const,
      weight: 700 as const,
    },
    {
      name: OG_SANS,
      data: redHat,
      style: "normal" as const,
      weight: 600 as const,
    },
  ]
}
