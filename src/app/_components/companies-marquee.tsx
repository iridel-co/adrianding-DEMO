"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Marquee } from "@/app/_components/marquee"
import { COMPANY_GROUPS, type CompanyLogo } from "@/lib/companies"
import { cn } from "@/lib/utils"

/**
 * Companies-served marquee — category pills that filter the wall, over one to
 * three full-colour logo rows that drift in alternating directions. Select any
 * pills to reveal only those industries; "All industries" clears the filter.
 * Clients without logo artwork yet render as a name chip.
 *
 * Each logo is a plain <Image> with the company name as its `alt` — no tooltip,
 * so the moving wall adds no focus stops to the tab order. Rows drift
 * continuously; prefers-reduced-motion users get the reduced-motion fallback
 * defined in the shared Marquee engine.
 *
 * Header/heading is the caller's job; this is just the moving wall, so it can
 * drop straight into the landing page and the corporate-training page.
 */

const ROW_SPEEDS = [32, 26, 30]
const ROW_DIRS = ["left", "right", "left"] as const

// Wide wordmarks get the full row height; square emblems / stacked marks are
// capped shorter so they don't tower over the wordmarks beside them. The
// `min-w` floor matters: the Marquee sizes its loop from the rendered track
// width, and an image that hasn't decoded yet reports ~0 width — a whole row of
// those measures far too short and the loop renders bunched at one edge. The
// floor keeps every slot a sane width from first paint, decoded or not.
const WIDE_BOX = "h-12 min-w-28 sm:h-14 sm:min-w-32 lg:h-16 lg:min-w-40"
const SQUARE_BOX = "h-9 min-w-16 sm:h-10 sm:min-w-20 lg:h-12 lg:min-w-24"

function CompanyMark({ company }: { company: CompanyLogo }) {
  const isSquare = company.shape === "square"
  if (company.src) {
    return (
      <Image
        src={company.src}
        alt={company.name}
        width={210}
        height={52}
        // Eager, not lazy: a lazy logo stays 0-width until it scrolls in, which
        // throws off the loop measurement.
        loading="eager"
        style={{ width: "auto" }}
        className={cn(
          "w-auto object-contain opacity-90 transition duration-300 hover:opacity-100",
          isSquare ? SQUARE_BOX : WIDE_BOX
        )}
      />
    )
  }
  return (
    <span
      className={cn(
        "border-border/60 text-muted-foreground inline-flex items-center justify-center rounded-md border px-4 text-base font-medium whitespace-nowrap",
        isSquare ? SQUARE_BOX : WIDE_BOX
      )}
    >
      {company.name}
    </span>
  )
}

function LogoRow({
  companies,
  direction,
  speed,
}: {
  companies: CompanyLogo[]
  direction: "left" | "right"
  speed: number
}) {
  if (companies.length === 0) return null
  return (
    <Marquee direction={direction} speed={speed} className="py-2">
      {companies.map((c) => (
        <CompanyMark key={c.name} company={c} />
      ))}
    </Marquee>
  )
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}

const FADE_MS = 300

export function CompaniesMarquee() {
  const [selected, setSelected] = useState<string[]>([])
  // The wall lags the pills by one fade: `shown` only catches up once the old
  // set has faded out, so switching tags cross-fades instead of popping.
  const [shown, setShown] = useState<string[]>([])
  const [fading, setFading] = useState(false)

  const toggle = (category: string) =>
    setSelected((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )

  useEffect(() => {
    if (selected.join("|") === shown.join("|")) return
    setFading(true)
    const t = setTimeout(() => {
      setShown(selected)
      setFading(false)
    }, FADE_MS)
    return () => clearTimeout(t)
  }, [selected, shown])

  const visible = useMemo(() => {
    const groups =
      shown.length === 0
        ? COMPANY_GROUPS
        : COMPANY_GROUPS.filter((g) => shown.includes(g.category))
    return groups.flatMap((g) => g.logos)
  }, [shown])

  const rowCount = visible.length > 24 ? 3 : visible.length > 9 ? 2 : 1
  // Deal logos across rows round-robin, not in contiguous slices. The roster is
  // grouped by category and only the first couple of categories have logo
  // artwork, so a straight slice piles every artwork-less category into the last
  // row(s) — which then drift as sparse, gappy strips of name chips. Dealing
  // every Nth item gives each row the same blend of wordmarks and chips and
  // near-equal counts.
  const rows = Array.from({ length: rowCount }, (_, r) =>
    visible.filter((_, i) => i % rowCount === r)
  )

  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 sm:px-8">
        <Pill
          label="All industries"
          active={selected.length === 0}
          onClick={() => setSelected([])}
        />
        {COMPANY_GROUPS.map((g) => (
          <Pill
            key={g.category}
            label={g.category}
            active={selected.includes(g.category)}
            onClick={() => toggle(g.category)}
          />
        ))}
      </div>

      {/* Outer layer owns the cross-fade and never remounts, so opacity
          transitions both ways. Inner layer remounts on every filter change so
          each Marquee re-measures its track from scratch — that swap happens
          while this layer sits at opacity 0, so it's invisible. */}
      <div
        className={cn(
          "mt-10 transition-opacity ease-out",
          fading ? "opacity-0" : "opacity-100"
        )}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        <div key={shown.join("|") || "all"} className="space-y-3">
          {rows.map((companies, i) => (
            <LogoRow
              key={i}
              companies={companies}
              direction={ROW_DIRS[i]}
              speed={ROW_SPEEDS[i]}
            />
          ))}
        </div>
      </div>
    </>
  )
}
