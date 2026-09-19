import { Counter } from "@/app/_components/counter"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import { COMPANY_GROUPS } from "@/lib/companies"
import { CERTIFICATIONS } from "@/lib/certifications"
import { SPECIALIZATIONS } from "@/lib/specializations"

/**
 * About — "The work, in numbers". The longer counterpart to the landing page's
 * four-up <LandingStats>: the story section above makes the case in prose, and
 * this cashes it out in figures before the journey rail picks the narrative
 * back up.
 *
 * Editorial treatment, same as the landing figures — no cards, no rules between
 * cells, whitespace and type scale carry it. One headline number set at display
 * size does the work of a hero image, then six supporting figures underneath.
 *
 * The roster, track and accreditation counts are derived from the same data the
 * rest of the site renders, so adding a client logo or a certification moves the
 * number here too instead of leaving a stale hard-coded claim.
 */

const ROSTER_COUNT = COMPANY_GROUPS.reduce((n, g) => n + g.logos.length, 0)
// Rounded down to the nearest ten — "90+" is a claim that stays true as the
// roster grows; the exact count would go stale the moment a logo is added.
const ROSTER_FLOOR = Math.floor(ROSTER_COUNT / 10) * 10

const FIGURES = [
  { value: 20, suffix: "+", label: "Years in the training circuit" },
  { value: 500, prefix: "Top ", label: "PH companies trained" },
  { value: ROSTER_FLOOR, suffix: "+", label: "Companies on the roster" },
  // TODO: confirm industry count with the client (PRD marks this a placeholder).
  { value: 9, suffix: "+", label: "Industries served" },
  { value: SPECIALIZATIONS.length, label: "Core program tracks" },
  { value: CERTIFICATIONS.length, label: "International accreditations" },
]

export function AboutNumbers() {
  return (
    <section className="border-border/70 border-t">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
        <h2 className="text-muted-foreground font-serif text-lg italic lg:text-xl">
          The work, in numbers
        </h2>

        {/* Headline figure. Baseline-aligned against its caption on desktop so
            the number and the first line of the label share a baseline rather
            than floating in their own boxes. */}
        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
          <p className="text-foreground text-[4.5rem] leading-[0.85] font-bold tracking-[-0.045em] whitespace-nowrap tabular-nums sm:text-[7rem] lg:text-[9.5rem]">
            <Counter to={20000} suffix="+" duration={2.4} />
          </p>
          <div className="max-w-md">
            <SplitReveal
              as="h3"
              className="font-serif text-[1.75rem] leading-[1.15] tracking-[-0.02em] lg:text-[2.25rem]"
            >
              Professionals trained
            </SplitReveal>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty lg:text-lg">
              Across boardrooms, ballrooms and plant floors — from graduate
              intake batches to executive committees, in-house and in public
              workshops.
            </p>
          </div>
        </div>

        {/* Supporting figures. `whitespace-nowrap` keeps a mid-count value from
            wrapping and shoving its caption out of step with its neighbours —
            the same trap the landing grid documents. */}
        <Reveal
          stagger={0.08}
          className="border-border/70 mt-20 grid grid-cols-2 gap-x-8 gap-y-12 border-t pt-14 sm:gap-x-12 lg:mt-28 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-16 lg:pt-20"
        >
          {FIGURES.map((f) => (
            <div key={f.label}>
              <p className="text-foreground text-[2rem] leading-none font-bold tracking-[-0.03em] whitespace-nowrap tabular-nums sm:text-5xl lg:text-6xl">
                <Counter to={f.value} prefix={f.prefix} suffix={f.suffix} />
              </p>
              <p className="text-muted-foreground mt-5 max-w-[22ch] text-xs leading-snug tracking-[0.14em] uppercase lg:mt-6 lg:text-sm">
                {f.label}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
