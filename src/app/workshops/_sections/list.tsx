import { WorkshopsCalendar } from "@/app/_components/workshops-calendar"
import { WorkshopTagFilter } from "@/app/_components/workshop-tag-filter"
import { getPublicWorkshop, getPublicWorkshops } from "@/lib/public-api"
import type { PublicWorkshop } from "@/lib/public-content"
import { PastWorkshops } from "./past"

/* Has run before and has nothing coming up. These move out of the main list
   (where they'd read "Dates to be announced") into Past workshops. A workshop
   that never had a session stays in the main list. */
function hasLapsed(workshop: PublicWorkshop) {
  return !workshop.nextSession && Boolean(workshop.lastSession)
}

export async function WorkshopsList() {
  const workshops = await getPublicWorkshops()
  const details = await Promise.all(
    workshops.map((workshop) => getPublicWorkshop(workshop.slug))
  )
  const calendar = workshops.flatMap((workshop, index) =>
    details[index].sessions.map((session) => ({
      ...workshop,
      nextSession: session,
    }))
  )
  const past = workshops
    .filter(hasLapsed)
    .sort((a, b) =>
      (b.lastSession?.date ?? "").localeCompare(a.lastSession?.date ?? "")
    )
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-8 pb-16 sm:px-8 lg:pt-10 lg:pb-20">
        <WorkshopsCalendar workshops={calendar} className="w-full" />
      </section>
      <section className="pb-20 lg:pb-32">
        <WorkshopTagFilter
          workshops={workshops.filter((workshop) => !hasLapsed(workshop))}
        />
      </section>
      <PastWorkshops workshops={past} />
    </>
  )
}
