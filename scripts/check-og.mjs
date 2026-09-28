/**
 * Smoke-tests the built Open Graph card files — no server, no browser, reads
 * straight off `.next/server/app/`.
 *
 * The site-wide card prerenders to `opengraph-image.body` at the app root; each
 * workshop's card prerenders to the same filename one directory down, one per
 * slug in `generateStaticParams` (`src/app/workshops/[slug]/opengraph-image.tsx`).
 * That route builds its param list from every entry in `WORKSHOPS` with no
 * status filter, so the expected slug list here is read the same way — off
 * `src/lib/workshops.ts` — rather than hardcoded, so a workshop added or
 * removed there is reflected here automatically.
 *
 * For every card, asserts: file exists, decodes as JPEG or PNG, is exactly
 * 1200×630, and is under 300 KB — WhatsApp's link-preview fetcher silently
 * drops anything over that and falls back to a text-only card (see
 * `src/lib/og-jpeg.ts`).
 *
 * Run after `npm run build`:  npm run check:og
 *
 * To exercise the failure path without touching real build output, point
 * CHECK_OG_EXTRA_SLUG at a slug that has no card (e.g. a typo'd one) — it's
 * appended to the expected list and reported missing:
 *   CHECK_OG_EXTRA_SLUG=does-not-exist npm run check:og
 */
import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import sharp from "sharp"

const ROOT = process.cwd()
const APP_DIR = join(ROOT, ".next/server/app")
const WORKSHOPS_SRC = join(ROOT, "src/lib/workshops.ts")

// Hard ceiling so a corrupt file or a sharp hang can never leave this process
// running unattended — every check below is local disk + in-memory decode and
// should finish in well under a second per card.
const TIMEOUT_MS = 15_000
const timeoutGuard = setTimeout(() => {
  console.error(`check:og timed out after ${TIMEOUT_MS}ms — aborting`)
  process.exit(1)
}, TIMEOUT_MS)
timeoutGuard.unref?.()

const MAX_BYTES = 300 * 1024
const EXPECTED_WIDTH = 1200
const EXPECTED_HEIGHT = 630

/**
 * Mirrors `generateStaticParams` in the workshop OG route: every slug in
 * `WORKSHOPS`, no filtering. Regex over the source file rather than importing
 * it — this script runs as plain Node with no TS loader, and the data file is
 * a flat array literal, so this is a faithful read, not a guess.
 */
function readWorkshopSlugs() {
  if (!existsSync(WORKSHOPS_SRC)) {
    throw new Error(`source of truth missing: ${WORKSHOPS_SRC}`)
  }
  const src = readFileSync(WORKSHOPS_SRC, "utf8")
  const arrayStart = src.indexOf("export const WORKSHOPS")
  if (arrayStart === -1) {
    throw new Error("could not find `export const WORKSHOPS` in workshops.ts")
  }
  const body = src.slice(arrayStart)
  const slugs = [...body.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1])
  if (slugs.length === 0) {
    throw new Error("parsed zero workshop slugs — regex or source drifted")
  }
  return slugs
}

async function checkCard(route, filePath) {
  if (!existsSync(filePath)) {
    return { route, ok: false, reason: `missing: ${filePath}` }
  }

  const bytes = statSync(filePath).size
  const buf = readFileSync(filePath)

  let meta
  try {
    meta = await sharp(buf).metadata()
  } catch (err) {
    return { route, ok: false, reason: `not a decodable image: ${err.message}` }
  }

  const problems = []
  if (meta.format !== "jpeg" && meta.format !== "png") {
    problems.push(`format is ${meta.format}, expected jpeg or png`)
  }
  if (meta.width !== EXPECTED_WIDTH || meta.height !== EXPECTED_HEIGHT) {
    problems.push(
      `${meta.width}x${meta.height}, expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}`
    )
  }
  if (bytes >= MAX_BYTES) {
    problems.push(
      `${(bytes / 1024).toFixed(1)} KB, must be under ${MAX_BYTES / 1024} KB`
    )
  }

  return {
    route,
    ok: problems.length === 0,
    format: meta.format ?? "?",
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    kb: bytes / 1024,
    reason: problems.join("; "),
  }
}

async function main() {
  if (!existsSync(APP_DIR)) {
    console.error(`no build output at ${APP_DIR} — run \`npm run build\` first`)
    process.exitCode = 1
    clearTimeout(timeoutGuard)
    return
  }

  const slugs = readWorkshopSlugs()
  if (process.env.CHECK_OG_EXTRA_SLUG) {
    slugs.push(process.env.CHECK_OG_EXTRA_SLUG)
  }

  const targets = [
    { route: "/", filePath: join(APP_DIR, "opengraph-image.body") },
    ...slugs.map((slug) => ({
      route: `/workshops/${slug}`,
      filePath: join(APP_DIR, "workshops", slug, "opengraph-image.body"),
    })),
  ]

  const results = await Promise.all(
    targets.map((t) => checkCard(t.route, t.filePath))
  )

  const rows = results.map((r) => ({
    route: r.route,
    format: r.format ?? "-",
    dimensions: r.width ? `${r.width}x${r.height}` : "-",
    kb: r.kb !== undefined ? r.kb.toFixed(1) : "-",
    status: r.ok ? "PASS" : `FAIL (${r.reason})`,
  }))
  console.table(rows)

  const failures = results.filter((r) => !r.ok)
  if (failures.length > 0) {
    console.error(
      `\ncheck:og — ${failures.length}/${results.length} card(s) failed:`
    )
    for (const f of failures) {
      console.error(`  ${f.route}: ${f.reason}`)
    }
    process.exitCode = 1
  } else {
    console.log(`\ncheck:og — all ${results.length} cards passed.`)
  }

  clearTimeout(timeoutGuard)
}

main().catch((err) => {
  clearTimeout(timeoutGuard)
  console.error("check:og crashed:", err)
  process.exitCode = 1
})
