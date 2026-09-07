import { CalendarDays, Check, MapPin, Tag } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import type { Workshop } from "@/lib/workshops"

/**
 * "What to expect" plus the details the registrant would otherwise have to
 * scroll back to the workshop page to find — the page version of the
 * confirmation email's summary block. `Meta` mirrors the detail page's overview
 * so the two read as one document.
 */

export function RegisteredExpect({ workshop }: { workshop: Workshop }) {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <SplitReveal className="max-w-2xl font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[3rem]">
          What the day looks like
        </SplitReveal>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <Reveal stagger={0.07} className="flex flex-col gap-6">
            {workshop.whatToExpect.map((line) => (
              <div key={line} className="flex gap-4">
                <span
                  aria-hidden
                  className="bg-brand mt-2.5 size-1.5 shrink-0 rounded-full"
                />
                <p className="text-foreground/90 leading-relaxed">{line}</p>
              </div>
            ))}
          </Reveal>

          <Reveal className="flex flex-col gap-10">
            <dl className="flex flex-col gap-6">
              <Meta
                icon={CalendarDays}
                label="When"
                value={workshop.schedule}
              />
              <Meta
                icon={MapPin}
                label="Where"
                value={`${workshop.venue}, ${workshop.city}`}
              />
              <Meta icon={Tag} label="Investment" value={workshop.price} />
            </dl>

            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-foreground text-sm font-semibold tracking-[0.08em] uppercase">
                Your seat includes
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {workshop.inclusions.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="text-brand mt-0.5 size-4 shrink-0" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="text-foreground mt-1.5 text-sm font-medium">{value}</dd>
    </div>
  )
}
