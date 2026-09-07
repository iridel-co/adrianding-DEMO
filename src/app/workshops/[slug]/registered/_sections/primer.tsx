import { PrimerPlayer } from "@/app/_components/primer-player"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import type { Workshop } from "@/lib/workshops"

/**
 * Primer slot. AD wanted the confirmation page to start the coaching
 * relationship rather than just acknowledge a form — a short message from him,
 * watched before the day, is the cheapest way to do that.
 */

export function RegisteredPrimer({ workshop }: { workshop: Workshop }) {
  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <SplitReveal className="font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem]">
          Start before the day starts.
        </SplitReveal>
        <p className="text-muted-foreground mt-5 leading-relaxed">
          Five minutes now makes the room worth more on the day. Watch this
          while the details are fresh — the rest of the prep arrives in your
          primer email a week out.
        </p>

        <Reveal className="mt-10">
          <PrimerPlayer title={workshop.title} blurb={workshop.primerBlurb} />
        </Reveal>
      </div>
    </section>
  )
}
