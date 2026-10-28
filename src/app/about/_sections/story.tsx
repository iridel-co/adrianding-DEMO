import Image from "next/image"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"

/**
 * About — the narrative. Belief chain from the deck: better people → better
 * companies → better country. Photo: ad-photo-2. The belief-chain line lives
 * in <AboutHero> above; this section opens on the "two things I love" line.
 */
export function AboutStory() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:px-8 lg:pt-28 lg:pb-36">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.78fr] lg:gap-24">
        <div>
          <SplitReveal
            as="h2"
            className="font-serif text-[2.25rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]"
          >
            Two things I love: coffee, and developing people.
          </SplitReveal>

          <Reveal delay={0.1} className="mt-10 space-y-6">
            <p className="text-muted-foreground text-lg leading-relaxed lg:text-xl">
              Adrian Ding is the CEO of Maximum Impact PH — a corporate trainer,
              leadership coach and keynote speaker with more than 20 years in
              the training circuit. He has trained over 20,000 professionals
              across many of the largest companies in the Philippines.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed lg:text-xl">
              He started where every trainer does: in front of a room, learning
              what actually moves people and what only sounds good. Two decades
              on, the conviction underneath the work has not changed — develop
              the person and the results follow. Better people build better
              companies, and better companies build a better country.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed lg:text-xl">
              The focus now is widening. The programs that Fortune 500 teams
              book are being opened to individuals through public workshops — so
              the work isn&rsquo;t only for those whose employer sends them.
            </p>
          </Reveal>
        </div>

        <Reveal className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="/images/mascot/ad-photo-2.webp"
            alt="Coach Adrian Ding"
            fill
            priority
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  )
}
