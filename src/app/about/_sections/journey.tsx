import { SplitReveal } from "@/app/_components/split-reveal"
import { JourneyTimeline } from "@/app/_components/timeline"
import { JOURNEY } from "@/lib/timeline"

/**
 * About — the guided journey rail (Adrian's certs + milestones), scrubbed to
 * scroll so the reader moves through it one moment at a time.
 */
export function AboutJourney() {
  return (
    <section className="bg-muted/40 py-28 lg:py-44">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <SplitReveal className="font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[4rem]">
          The journey so far
        </SplitReveal>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed lg:text-xl">
          Twenty years in the training circuit, and the certifications along the
          way that shaped how the work gets done. Scroll through it.
        </p>
        <div className="mt-20 lg:mt-28">
          <JourneyTimeline entries={JOURNEY} />
        </div>
      </div>
    </section>
  )
}
