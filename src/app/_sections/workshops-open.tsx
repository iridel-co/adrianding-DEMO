import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { EventCards } from "@/app/_components/event-cards"
import { SplitReveal } from "@/app/_components/split-reveal"
import { getPublicWorkshops } from "@/lib/public-api"

/**
 * Landing — the open public workshops, listed right after the workshop/corporate
 * fork (<LandingPaths>): the concrete next step for anyone who picked the
 * "for individuals" lane. This is the conversion moment, so the copy pulls
 * forward. Heading + "see all" link ride the top row; <EventCards> pins its
 * scroll arrows bottom-right under the carousel.
 */
export async function LandingWorkshopsOpen() {
  const workshops = (await getPublicWorkshops()).filter(
    (workshop) => workshop.nextSession
  )
  if (workshops.length === 0) return null

  return (
    <section className="bg-background py-24 lg:py-36">
      <div className="mx-auto mb-6 flex max-w-7xl flex-wrap items-baseline justify-between gap-x-6 gap-y-3 px-6 sm:px-8 lg:mb-8">
        <SplitReveal className="max-w-3xl font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.75rem]">
          Join Our Workshops
        </SplitReveal>
        <Link
          href="/workshops"
          className="text-brand group inline-flex items-center gap-2 text-sm font-semibold tracking-[0.12em] uppercase"
        >
          See all workshops
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <EventCards workshops={workshops} />
    </section>
  )
}
