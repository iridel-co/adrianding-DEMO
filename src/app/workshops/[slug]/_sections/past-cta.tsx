import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/app/_components/reveal"
import { NEXT_WORKSHOP, type Workshop } from "@/lib/workshops"

/**
 * Closer for a workshop that has already run. Without this the page is a dead
 * end — the date has passed, the registration CTA is hidden, and someone who
 * arrived from a search result or an old ad link has nowhere to go.
 *
 * Points at the soonest open workshop. `NEXT_WORKSHOP` is `undefined` when the
 * catalogue has no open dates left, so the fallback sends them to the full
 * listing instead of rendering a broken link.
 */
export function PastCta({ workshop }: { workshop: Workshop }) {
  const next = NEXT_WORKSHOP

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
        <Reveal>
          <h2 className="font-serif text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.75rem]">
            This one has already run
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg leading-relaxed">
            {workshop.title} was held on {workshop.schedule.split(" · ")[0]}.
            {next
              ? " The next open workshop is below — same room, same format, same day-long intensive."
              : " New dates are announced a few weeks ahead — the full calendar has what is currently open."}
          </p>
        </Reveal>

        {next ? (
          <Reveal className="mt-10">
            <div className="bg-muted/50 ring-border/70 mx-auto max-w-xl rounded-lg px-7 py-8 text-left ring-1">
              <p className="font-serif text-2xl leading-tight tracking-[-0.01em]">
                {next.title}
              </p>
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
                  {next.venue}, {next.city}
                </li>
              </ul>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
              <Button asChild variant="brand" size="lg">
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
