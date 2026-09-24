import { SplitReveal } from "@/app/_components/split-reveal"
import { Reveal } from "@/app/_components/reveal"
import {
  SpecRevealCards,
  type SpecCard,
} from "@/app/_components/spec-reveal-cards"
import {
  SPECIALIZATIONS,
  SPECIALIZATION_IMAGES,
  SPECIALIZATION_IMAGE_ALTS,
  SPECIALIZATION_IMAGE_POSITIONS,
} from "@/lib/specializations"

/**
 * Landing — Coach Adrian's six in-house corporate training programmes, framed
 * explicitly as run for companies and their teams (2026-09-24 copy pass).
 * Each is a reveal card: at rest it shows the title and full blurb; hovering
 * or keyboard-focusing a card (desktop, real pointer only) swaps the blurb
 * for "Useful for" + 4 bullets and an Inquire button, and grows the card.
 * Touch devices and screens below `lg` never expand — every card is static
 * at the detail height. Sits on the muted ground between the credibility
 * block and the workshop/corporate fork.
 *
 * Reads `SPECIALIZATIONS` (the real six) on purpose, never
 * `CORPORATE_PROGRAMMES` — the four placeholder programmes are corporate-page
 * only.
 */

const CARDS: SpecCard[] = SPECIALIZATIONS.map((spec) => ({
  key: spec.key,
  title: spec.title,
  blurb: spec.blurb,
  usefulFor: spec.usefulFor,
  image: SPECIALIZATION_IMAGES[spec.key],
  imageAlt: SPECIALIZATION_IMAGE_ALTS[spec.key],
  imagePosition: SPECIALIZATION_IMAGE_POSITIONS[spec.key],
}))

export function LandingSpecializations() {
  return (
    <section className="bg-muted/40 py-24 lg:py-36">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
          {/* Left rail — heading + framing line, held in view while the
              card stack on the right scrolls past. */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SplitReveal className="font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] lg:text-[3rem]">
              In-house programs,
              <br />
              <span className="text-brand">two decades</span> deep
            </SplitReveal>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              Coach Adrian&rsquo;s corporate training programmes, run in-house
              for companies and their teams — at your office or offsite, and
              shaped around your people and goals.
              <span className="hidden lg:pointer-fine:inline">
                {" "}
                Hover one to see who it&rsquo;s for.
              </span>
            </p>
          </div>

          {/* Right — the six reveal cards. A horizontal snap rail below `lg`
              (six stacked cards ran ~2 phone screens on their own), the
              vertical expand-on-hover stack from `lg` up. `-mx-6`/`px-6`
              lets the rail bleed to the viewport edges while its first card
              still lines up with the section gutter. */}
          <Reveal
            stagger={0.08}
            className="no-scrollbar -mx-6 mt-12 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-1 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:mt-0 lg:snap-none lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
          >
            <SpecRevealCards items={CARDS} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
