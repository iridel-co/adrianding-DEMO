import Image from "next/image"
import { ALL_COMPANIES } from "@/lib/companies"

/**
 * Compact, static client-logo strip for the conversion pages.
 *
 * Deliberately NOT `companies-marquee.tsx` — that component is the landing
 * page's animated wall and is off-limits to edit. A cold visitor arriving from
 * an ad needs one quiet row of recognisable marks, not a moving feature.
 *
 * Picks by name from `companies.ts` so a logo file swap there flows through
 * here; any name that is missing artwork is simply skipped rather than falling
 * back to a text chip, since a half-empty strip reads worse than a shorter one.
 */

const FEATURED = [
  "HSBC",
  "Petron",
  "Wipro",
  "Unilever",
  "PLDT",
  "Nestlé",
  "Toyota",
]

const LOGOS = FEATURED.map((name) =>
  ALL_COMPANIES.find((c) => c.name === name)
).filter((c): c is NonNullable<typeof c> => Boolean(c?.src))

export function TrustLogos({
  label = "Trusted by teams at",
  className = "",
}: {
  label?: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
        {label}
      </p>
      <ul className="mt-5 flex flex-wrap items-center gap-x-9 gap-y-6">
        {LOGOS.map((logo) => (
          <li key={logo.name}>
            <Image
              src={logo.src as string}
              alt={logo.name}
              height={40}
              width={140}
              style={{ width: "auto" }}
              className={`object-contain opacity-55 grayscale ${
                logo.shape === "square" ? "h-7" : "h-5 sm:h-6"
              }`}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
