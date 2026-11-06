import { z } from "zod"
import type { IntakeConfig } from "./intake"
import type { PublicWorkshopDetail } from "./public-content"
import { publicSessionTimestamps } from "./public-content"
import type { Workshop } from "./workshops"
import { sessionSchedule, workshopPrice } from "./public-workshops"

// Keep the existing workshop presentation model at the CMS boundary.
export function workshopView(
  content: PublicWorkshopDetail,
  phone = "",
  intake?: IntakeConfig,
  selectedSessionId?: string
): Workshop & { primerVideoUrl: string | null } {
  const session =
    content.sessions.find((item) => item.id === selectedSessionId) ??
    content.sessions.find((item) => item.isRegistrationOpen) ??
    content.sessions[0] ??
    null
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
  }).format(new Date())
  return {
    slug: content.slug,
    title: content.title,
    tags: content.tags as Workshop["tags"],
    start: session ? publicSessionTimestamps(session).start : "",
    schedule: sessionSchedule(session),
    venue: session?.venueName.trim() || content.defaultVenue.name.trim(),
    city: session?.city.trim() || content.defaultVenue.city.trim(),
    price: workshopPrice({ ...content, nextSession: session }),
    image: content.heroImage?.url ?? "",
    status: session?.isRegistrationOpen
      ? "open"
      : session && session.endDate < today
        ? "past"
        : (session?.status ?? "closed"),
    registrationOpen: session?.isRegistrationOpen ?? false,
    contactPhone: phone,
    intake,
    workshopSessionId:
      session && z.uuid().safeParse(session.id).success
        ? session.id
        : undefined,
    summary: content.summary,
    intro: content.intro,
    audience: content.audience.trim() || "Audience details to be announced",
    format: content.format.trim() || "Format to be announced",
    curriculum: detailsOrAnnouncement(
      content.curriculum,
      "Curriculum to be announced"
    ),
    inclusions: detailsOrAnnouncement(
      content.inclusions,
      "Inclusions to be announced"
    ),
    problem: content.problem,
    outcomes: detailsOrAnnouncement(
      content.outcomes,
      "Learning outcomes to be announced"
    ),
    whatToExpect: detailsOrAnnouncement(
      content.whatToExpect,
      "Workshop details to be announced"
    ),
    primerBlurb: content.primerBlurb,
    primerVideoUrl: content.primerVideoUrl,
    seatsTotal: session?.seatsLeft !== undefined ? session.capacity : 0,
    seatsLeft: session?.seatsLeft ?? 0,
  }
}

function detailsOrAnnouncement(values: string[], fallback: string) {
  const details = values.map((value) => value.trim()).filter(Boolean)
  return details.length ? details : [fallback]
}
