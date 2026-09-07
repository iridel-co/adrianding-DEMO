import { SplitReveal } from "@/app/_components/split-reveal"
import { TestimonialColumns } from "@/app/_components/testimonial-columns"
import { TESTIMONIALS } from "@/lib/testimonials"

/**
 * Social proof on the workshop detail page — the full testimonial set, not the
 * corporate subset, because a public-workshop visitor is buying a seat for
 * themselves and needs to hear from individuals as well as sponsors.
 *
 * Reuses the landing page's drifting-columns layout so the page feels part of
 * the site even when it is the only page someone ever sees.
 */
export function WorkshopTestimonials() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-[0.5fr_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)] lg:self-start">
          <SplitReveal className="font-serif text-[2.25rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.25rem]">
            What people say after a day in the room
          </SplitReveal>
          <p className="text-muted-foreground mt-6 max-w-sm leading-relaxed">
            Attendees come from banks, insurers, developers and family
            businesses — and most arrive because someone in their team came
            first.
          </p>
        </div>
        <TestimonialColumns testimonials={TESTIMONIALS} />
      </div>
    </section>
  )
}
