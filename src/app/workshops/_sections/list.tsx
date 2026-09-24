import { WorkshopsCalendar } from "@/app/_components/workshops-calendar"
import { WorkshopTagFilter } from "@/app/_components/workshop-tag-filter"
import { OPEN_WORKSHOPS } from "@/lib/workshops"

/**
 * Workshops parent — open dates as a static 2-column card grid (no hover
 * take-over here, unlike the landing row — every card always shows its full
 * content).
 *
 * The grid below offsets its right column down (`lg:mt-20` in
 * `event-cards.tsx`) for a light collage feel, while every card keeps a
 * uniform gap on both axes.
 *
 * The page's `<h1>` and intro copy now live in `<WorkshopsHero>` (full-bleed
 * banner, rendered before this in `page.tsx`) — that photo is the
 * above-the-fold LCP, so `EventCards` below no longer needs `priority`.
 *
 * Tag filter chips sit above the grid (OR semantics — see
 * `workshop-tag-filter.tsx`); the calendar is unfiltered.
 */
export function WorkshopsList() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-8 pb-16 sm:px-8 lg:pt-10 lg:pb-20">
        <WorkshopsCalendar workshops={OPEN_WORKSHOPS} className="w-full" />
      </section>

      <section className="pb-20 lg:pb-32">
        {/* Full-bleed row. */}
        <WorkshopTagFilter workshops={OPEN_WORKSHOPS} />
      </section>
    </>
  )
}
