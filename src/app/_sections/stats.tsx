import { CmsCounter } from "@/app/_components/cms-counter"
import { getPublicProfile } from "@/lib/public-api"
import { Reveal } from "@/app/_components/reveal"

/**
 * Landing — "By the numbers". Editorial / magazine treatment: a quiet
 * department heading, then four figures set large in the serif with a
 * caption-style line under each. No cards, no rules, no dividers — whitespace
 * and type carry it. Sits directly under <LandingCompanies> on the same
 * bg-background ground with no divider, so the client roster and the figures
 * read as one credibility block — which is what the PRD asks for, and what
 * hands the visitor straight to the fork below.
 */

export async function LandingStats() {
  const profile = await getPublicProfile()
  const STATS = profile.stats.filter((stat) => stat.pages.includes("home"))
  if (!STATS.length) return null
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 pt-4 pb-12 sm:px-8 lg:pt-6 lg:pb-16">
        <h2 className="text-muted-foreground font-serif text-lg italic lg:text-xl">
          By the numbers
        </h2>

        <Reveal
          stagger={0.12}
          className="mt-8 grid grid-cols-2 gap-x-8 gap-y-14 sm:gap-x-16 sm:gap-y-16 lg:mt-12 lg:grid-cols-[1fr_1.2fr_1.35fr_1fr] lg:gap-x-12 lg:gap-y-0 xl:gap-x-16"
        >
          {STATS.map((s) => (
            <div key={s.label} className="min-w-0">
              <p className="text-foreground text-[2rem] leading-none font-bold tracking-[-0.03em] break-words tabular-nums sm:text-5xl lg:text-6xl xl:text-7xl">
                <CmsCounter value={s.value} />
              </p>
              <p className="text-muted-foreground mt-6 max-w-[24ch] text-sm leading-snug text-pretty lg:mt-8 lg:text-base">
                {s.label}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
