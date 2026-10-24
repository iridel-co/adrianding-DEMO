import { CmsCounter } from "@/app/_components/cms-counter"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import { getPublicProfile } from "@/lib/public-api"

export async function AboutNumbers() {
  const profile = await getPublicProfile()
  const [headline, ...FIGURES] = profile.stats.filter((stat) =>
    stat.pages.includes("about")
  )
  if (!headline) return null
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
          <p className="text-foreground text-[4.5rem] leading-[0.85] font-bold tracking-[-0.045em] break-words tabular-nums sm:text-[7rem] lg:text-[9.5rem]">
            <CmsCounter value={headline.value} duration={2.4} />
          </p>
          <div className="max-w-md">
            <SplitReveal
              as="h3"
              className="font-serif text-[1.75rem] leading-[1.15] tracking-[-0.02em] lg:text-[2.25rem]"
            >
              {headline.label}
            </SplitReveal>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty lg:text-lg">
              {headline.description}
            </p>
          </div>
        </div>

        <Reveal
          stagger={0.08}
          className="border-border/70 mt-20 grid grid-cols-2 gap-x-8 gap-y-12 border-t pt-14 sm:gap-x-12 lg:mt-28 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-16 lg:pt-20"
        >
          {FIGURES.map((f) => (
            <div key={f.label} className="min-w-0">
              <p className="text-foreground text-[2rem] leading-none font-bold tracking-[-0.03em] break-words tabular-nums sm:text-5xl lg:text-6xl">
                <CmsCounter value={f.value} />
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
