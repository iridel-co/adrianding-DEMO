import { SplitReveal } from "@/app/_components/split-reveal"
import { TestimonialColumns } from "@/app/_components/testimonial-columns"
import { CORPORATE_TESTIMONIALS } from "@/lib/testimonials"

/**
 * Corporate Training — reuses the landing page's testimonial layout
 * (TestimonialColumns) with corporate-specific header text.
 */
export function CorporateTestimonials() {
  return (
    <section className="bg-muted/40 py-12 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-8 lg:grid-cols-[0.5fr_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)] lg:self-start">
          <SplitReveal className="font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.75rem]">
            From the people who signed off on it
          </SplitReveal>
        </div>
        <TestimonialColumns testimonials={CORPORATE_TESTIMONIALS} />
      </div>
    </section>
  )
}
