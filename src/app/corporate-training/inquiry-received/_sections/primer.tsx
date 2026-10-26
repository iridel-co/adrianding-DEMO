import { getPublicProfile } from "@/lib/public-api"
import { PrimerPlayer } from "@/app/_components/primer-player"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"

/**
 * Primer slot. The gap between an inquiry and a proposal is where corporate
 * leads go cold, so the wait does some selling: how a programme is actually
 * built, in Adrian's own voice, before the call.
 */

export async function InquiryPrimer() {
  const { corporatePrimer } = await getPublicProfile()
  if (!corporatePrimer.videoUrl) return null
  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <SplitReveal className="font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem]">
          Worth five minutes before we talk
        </SplitReveal>
        <p className="text-muted-foreground mt-5 leading-relaxed">
          {corporatePrimer.blurb}
        </p>

        <Reveal className="mt-10">
          <PrimerPlayer
            title="How a Maximum Impact programme is built"
            blurb={corporatePrimer.blurb}
            videoUrl={corporatePrimer.videoUrl}
          />
        </Reveal>
      </div>
    </section>
  )
}
