import { SplitReveal } from "@/app/_components/split-reveal"
import { TestimonialColumns } from "@/app/_components/testimonial-columns"
import { TESTIMONIALS } from "@/lib/testimonials"

/**
 * Landing — what clients say. A full-width heading introduces
 * two columns of quote cards cycling upward (one column on mobile). Hovering a
 * column stops that column only.
 */
// Header note: earlier copy ("booked him twice") implied repeat bookings we
// can't substantiate; the headline leans on what the quotes say instead.

export function LandingTestimonials() {
  return (
    <section className="bg-background py-12 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-8 lg:gap-20">
        <div>
          <SplitReveal className="max-w-[28ch] font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.75rem]">
            The language that
            <br />
            outlasts the room
          </SplitReveal>
        </div>
        <TestimonialColumns testimonials={TESTIMONIALS} />
      </div>
    </section>
  )
}
