import { PrimerPlayer } from "@/app/_components/primer-player"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"

/**
 * Primer slot. The gap between an inquiry and a proposal is where corporate
 * leads go cold, so the wait does some selling: how a programme is actually
 * built, in Adrian's own voice, before the call.
 */

export function InquiryPrimer() {
  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <SplitReveal className="font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem]">
          Worth five minutes before we talk
        </SplitReveal>
        <p className="text-muted-foreground mt-5 leading-relaxed">
          If you&rsquo;re the one who has to justify the budget internally, this
          is the short version of how a programme gets designed — and why the
          reinforcement after the day matters more than the day itself.
        </p>

        <Reveal className="mt-10">
          <PrimerPlayer
            title="How a Maximum Impact programme is built"
            blurb="Adrian on the diagnosis-first approach: what we ask before designing anything, and the 30-day mechanism that keeps the change in place after everyone goes back to work."
          />
        </Reveal>
      </div>
    </section>
  )
}
