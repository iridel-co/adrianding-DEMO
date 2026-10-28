import { Reveal } from "@/app/_components/reveal"
import { TrustLogos } from "@/app/_components/trust-logos"

/**
 * Reassurance while they wait. The person who submitted the form usually has to
 * sell the idea internally before the call happens, so the three figures and
 * the logo row are here to be forwarded, not just read.
 *
 * Figures are sans `font-semibold` — the serif is reserved for headings, and
 * numerals set in it read decorative rather than factual.
 */

const FIGURES = [
  {
    value: "20+",
    label: "years in the room",
    body: "Two decades of live training, not a career pivot into it.",
  },
  {
    value: "20,000+",
    label: "professionals trained",
    body: "From frontline supervisors to executive teams.",
  },
  {
    value: "Top 500",
    label: "PH companies",
    body: "Multinationals, banks, hospitals, retailers and family businesses.",
  },
]

export function InquiryCredibility() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <Reveal stagger={0.1} className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {FIGURES.map((f) => (
            <div key={f.label}>
              <p className="text-brand text-4xl font-semibold tracking-[-0.02em] sm:text-5xl lg:text-6xl">
                {f.value}
              </p>
              <p className="text-foreground mt-3 text-sm font-semibold tracking-[0.08em] uppercase">
                {f.label}
              </p>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </Reveal>

        <Reveal className="mt-14 lg:mt-20">
          <TrustLogos label="You'd be in good company" />
        </Reveal>
      </div>
    </section>
  )
}
