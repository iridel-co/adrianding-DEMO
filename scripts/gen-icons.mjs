/**
 * Generates the browser-tab and home-screen icons from the AD monogram.
 *
 * Source of truth is `public/images/logos/ad-logo-white.svg` — the same mark the
 * navbar uses on dark — on a transparent ground, the mark alone with no plate
 * behind it.
 *
 * Known trade-off, accepted deliberately: a white glyph on transparent reads on
 * a dark browser tab strip and all but disappears on a light one. A coloured
 * plate solves both and was rejected; white was the explicit choice over black.
 *
 * Outputs (Next's file conventions in `src/app/`, picked up automatically):
 *   icon.png        512  — <link rel="icon">
 *   apple-icon.png  180  — iOS home screen / Safari pinned
 *   favicon.ico     32+48 — legacy request for /favicon.ico
 *
 * Run: node scripts/gen-icons.mjs
 */
import { readFile, writeFile } from "node:fs/promises"
import sharp from "sharp"

const LOGO = "public/images/logos/ad-logo-white.svg"
// The mark is wider than it is tall, so the canvas is filled on the WIDTH and the
// height falls where it may — sizing the square viewBox instead left the glyph
// floating in the middle of a mostly-empty square. The source SVG carries its own
// transparent margin, so it is trimmed before this ratio means anything.
const GLYPH_WIDTH_RATIO = 0.86

const svg = await readFile(LOGO)

async function icon(size) {
  const glyph = await sharp(svg, { density: 200 })
    .trim({ threshold: 1 })
    .resize({ width: Math.round(size * GLYPH_WIDTH_RATIO) })
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: glyph, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/**
 * Minimal ICO container holding PNG entries. Every browser that still asks for
 * /favicon.ico reads PNG-in-ICO, and it saves pulling in an encoder dependency
 * for a 22-byte header.
 */
function ico(pngs) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngs.length, 4)

  let offset = 6 + pngs.length * 16
  const dir = []
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2) // palette
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // colour planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    dir.push(e)
  }
  return Buffer.concat([header, ...dir, ...pngs.map((p) => p.data)])
}

const [i512, i180, i48, i32] = await Promise.all([512, 180, 48, 32].map(icon))

await writeFile("src/app/icon.png", i512)
await writeFile("src/app/apple-icon.png", i180)
await writeFile(
  "src/app/favicon.ico",
  ico([
    { size: 32, data: i32 },
    { size: 48, data: i48 },
  ])
)

console.log("icons written: src/app/icon.png, apple-icon.png, favicon.ico")
