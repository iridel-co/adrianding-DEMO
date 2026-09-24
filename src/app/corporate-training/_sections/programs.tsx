import { SplitReveal } from "@/app/_components/split-reveal"
import {
  ProgramCarousel,
  type ProgramCard,
} from "@/app/_components/program-carousel"
import {
  CORPORATE_PROGRAMMES,
  SPECIALIZATION_IMAGES,
  SPECIALIZATION_IMAGE_ALTS,
  SPECIALIZATION_IMAGE_POSITIONS,
} from "@/lib/specializations"

/**
 * Corporate Training — "Programs we run in-house": a horizontal,
 * constant-width carousel (see `program-carousel.tsx`), not the landing
 * page's reveal-card stack. Ten cards from `CORPORATE_PROGRAMMES` — Adrian's
 * six real programmes plus four 2026-09-24 placeholders, shown here (and on
 * the inquiry form) so the long list can be judged; never on the landing
 * page. Hovering (desktop + pointer) a card widens it to show who the
 * programme is for and an Inquire button that jumps to the inquiry form
 * with that programme preselected. On touch or below `lg`, every card is
 * static — title, bullets, Inquire, no expand. Added 2026-09-19; copy
 * rewritten 2026-09-24 to say plainly these are in-house corporate
 * programmes. The landing page's `SpecRevealCards` section is deliberately
 * unchanged.
 */
const CARDS: ProgramCard[] = CORPORATE_PROGRAMMES.map((spec) => ({
  key: spec.key,
  title: spec.title,
  blurb: spec.blurb,
  usefulFor: spec.usefulFor,
  image: SPECIALIZATION_IMAGES[spec.key],
  imageAlt: SPECIALIZATION_IMAGE_ALTS[spec.key],
  imagePosition: SPECIALIZATION_IMAGE_POSITIONS[spec.key],
}))

export function CorporatePrograms() {
  return (
    <section className="bg-muted/40 py-24 lg:py-36">
      <ProgramCarousel
        items={CARDS}
        heading={
          <div className="max-w-2xl">
            <SplitReveal className="font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.5rem]">
              Programs <span className="text-brand">we run in-house</span>
            </SplitReveal>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Coach Adrian&rsquo;s corporate training programmes, delivered
              in-house for your company — at your office or offsite, for one
              team or the whole organisation. Each is tailored to your
              people&rsquo;s roles, industry and goals, drawing on twenty years
              on the training circuit.
              <span className="hidden lg:pointer-fine:inline">
                {" "}
                Hover a programme to see who it&rsquo;s for.
              </span>
            </p>
          </div>
        }
      />
    </section>
  )
}
