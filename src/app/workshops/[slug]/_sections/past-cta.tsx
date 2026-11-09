import { sessionSchedule, workshopVenue } from "@/lib/public-workshops"
import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/app/_components/reveal"
import type { Workshop } from "@/lib/workshops"
import { getPublicWorkshops } from "@/lib/public-api"
import { BloomFieldBackground } from "@/app/_components/bloom-field-background"

/**
 * Closer for a workshop that has already run. Without this the page is a dead
 * end — the date has passed, the registration CTA is hidden, and someone who
 * arrived from a search result or an old ad link has nowhere to go.
 *
 * Points at the soonest open workshop. `NEXT_WORKSHOP` is `undefined` when the
 * catalogue has no open dates left, so the fallback sends them to the full
 * listing instead of rendering a broken link.
 */
export async function PastCta({ workshop }: { workshop: Workshop }) {
  const upcoming = (await getPublicWorkshops()).find(
    (item) => item.nextSession?.isRegistrationOpen
  )
  const next = upcoming
    ? {
        ...upcoming,
        schedule: sessionSchedule(upcoming.nextSession),
        venue: upcoming.nextSession?.venueName,
        city: upcoming.nextSession?.city,
      }
    : null

  return (
    <section className="bg-brand text-brand-foreground relative overflow-hidden py-16 lg:py-24">
      <BloomFieldBackground />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center sm:px-8">
        <Reveal>
          <h2 className="font-serif text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.75rem]">
            This one has already run
          </h2>
          <p className="text-brand-foreground/90 mx-auto mt-5 max-w-xl text-lg leading-relaxed">
            {workshop.schedule === "Date not specified"
              ? workshop.title + " has already taken place."
              : workshop.title +
                " was held on " +
                workshop.schedule.split(" · ")[0] +
                "."}
            {next
              ? " Explore the next open workshop below."
              : " New dates are announced a few weeks ahead — the full calendar has what is currently open."}
          </p>
        </Reveal>

        {next ? (
          <Reveal className="mt-10">
            <div className="bg-background text-foreground mx-auto max-w-lg rounded-xl px-5 py-7 text-left shadow-lg sm:px-8">
              <p className="text-brand text-xs font-semibold tracking-wider uppercase">
                Next workshop
              </p>
              <h3 className="mt-2 font-serif text-2xl leading-tight tracking-[-0.01em]">
                {next.title}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {next.summary}
              </p>
              <ul className="text-muted-foreground mt-5 space-y-2 text-sm">
                <li className="flex items-center gap-2.5">
                  <CalendarDays className="text-brand size-4 shrink-0" />
                  {next.schedule}
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="text-brand size-4 shrink-0" />
                  {workshopVenue(next.venue, next.city)}
                </li>
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild variant="brand" size="lg">
                  <Link href={`/workshops/${next.slug}`}>
                    See this workshop
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/workshops">All upcoming dates</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal className="mt-10">
            <div>
              <Button asChild variant="secondary" size="lg">
                <Link href="/workshops">
                  See the workshop calendar
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
