import sharp from "sharp"

/**
 * Re-encodes a generated social card from PNG to JPEG.
 *
 * `ImageResponse` only ever emits PNG, and a 1200×630 card with a full-bleed
 * photograph lands at 0.7–1.3 MB. That is fine for Twitter/X, iMessage and
 * Slack, and fatal on WhatsApp: its preview fetcher drops any og:image over
 * ~300 KB and falls back to a text-only link card, which is exactly what the
 * client saw when course links were forwarded into group chats. Messenger is
 * more tolerant but times out on the same fat payloads over mobile data.
 *
 * JPEG at q78 brings the same card to ~90–160 KB with no visible loss at the
 * size these are ever rendered. Quality is deliberately below the usual 85 —
 * headroom matters more than pixel purity when the ceiling is hard.
 *
 * Both cards are prerendered by `generateStaticParams`, so this runs at build
 * time, not per request.
 */
export async function ogJpeg(image: Response): Promise<Response> {
  const png = Buffer.from(await image.arrayBuffer())
  const jpeg = await sharp(png)
    .jpeg({
      quality: 78,
      // Baseline, not progressive. sharp's `mozjpeg` preset would shave another
      // ~15% but forces progressive on with it, and that is not a trade worth
      // making on a payload already this far under the limit — every link
      // scraper in the wild decodes baseline without argument.
      progressive: false,
      chromaSubsampling: "4:2:0",
    })
    .toBuffer()

  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg" },
  })
}
