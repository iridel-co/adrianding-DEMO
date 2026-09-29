import type { Metadata } from "next"
import { Red_Hat_Display, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { ScrollRefresh } from "./_components/scroll-refresh"

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Prata — the site's display serif (logo, headings, pull quotes). Single
// weight (400); see globals.css for the `font-synthesis-weight: none` note
// on why no heading uses `font-bold` with it. Self-hosted via
// next/font/local (rather than next/font/google) because it needs a
// `size-adjust` descriptor tuned to the approved design's proportions —
// don't drop it.
const prata = localFont({
  variable: "--font-prata",
  display: "swap",
  src: [
    { path: "./fonts/Prata-Regular.woff2", weight: "400", style: "normal" },
  ],
  declarations: [{ prop: "size-adjust", value: "93%" }],
})

// Where this build actually lives — every metadata URL (canonical, og:url, and
// the generated og:image from `opengraph-image.tsx`) is resolved against it, so
// it has to be the host serving THIS deployment. Hard-coding the client's domain
// pointed og:image at adrianding.com/opengraph-image, which is their existing
// live site and 404s — link previews would have silently shown nothing.
// Vercel sets these itself; set NEXT_PUBLIC_SITE_URL to override at handoff.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production" &&
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
const TITLE = "Coach Adrian Ding — Leadership Development & Corporate Training"
const DESCRIPTION =
  "20+ years, 20,000+ leaders trained across HSBC, Wipro, Petron and more. Corporate training and public workshops from the CEO of Maximum Impact PH."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // og:image / twitter:image come from `app/opengraph-image.tsx` — listing them
  // here as well would override that generated card with a raw photo.
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Coach Adrian Ding",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // `data-scroll-behavior="smooth"` is not decoration: `scroll-smooth` puts
    // `scroll-behavior: smooth` on <html>, so the router's own scroll-to-top on
    // navigation becomes an *animated* scroll from wherever you were. Swapping
    // in the new route shortens the document and cancels that animation
    // mid-flight, which is why clicking a nav link from deep in a page used to
    // drop you halfway down the next one. This attribute tells Next to force an
    // instant jump for navigation scrolls while native hash anchors stay smooth.
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${redHatDisplay.variable} ${geistMono.variable} ${prata.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="bg-background text-foreground focus-visible:ring-brand sr-only z-50 rounded-sm px-4 py-2 text-sm font-medium focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:ring-2 focus-visible:outline-none"
        >
          Skip to content
        </a>
        {children}
        {/* Recomputes ScrollTrigger positions once fonts/images settle — see
            the component for why every reveal fires late without it. */}
        <ScrollRefresh />
      </body>
    </html>
  )
}
