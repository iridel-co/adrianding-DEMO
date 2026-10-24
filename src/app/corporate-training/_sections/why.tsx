import { CmsCounter } from "@/app/_components/cms-counter"
import { getPublicProfile } from "@/lib/public-api"
import { Reveal } from "@/app/_components/reveal"

/**
 * Corporate Training — the case, tied to the numbers. Flows directly off the
 * intro (no hard divider). Three stats in a row, no header.
 */

export async function CorporateWhy() {
  const profile = await getPublicProfile()
  const POINTS = profile.stats.filter((stat) =>
    stat.pages.includes("corporate")
  )
  if (!POINTS.length) return null
  return (
    <section className="mx-auto max-w-5xl px-6 pt-20 pb-24 sm:px-8 sm:pt-24 lg:pt-32 lg:pb-36">
      <Reveal stagger={0.12} className="grid gap-12 sm:grid-cols-3">
        {POINTS.map((p) => (
          <div key={p.label} className="min-w-0">
            <p className="text-brand text-5xl font-semibold tracking-[-0.02em] break-words lg:text-6xl">
              <CmsCounter value={p.value} />
            </p>
            <p className="text-foreground mt-3 text-sm font-semibold tracking-[0.08em] uppercase">
              {p.label}
            </p>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {p.description}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
