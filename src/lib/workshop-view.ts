import { z } from "zod"
import type { IntakeConfig } from "./intake"
import type { PublicWorkshop, PublicWorkshopDetail } from "./public-content"
import { formatPublicPrice, publicSessionTimestamps } from "./public-content"
import type { Workshop } from "./workshops"
import {
  pastSessionDate,
  sessionSchedule,
  workshopPrice,
} from "./public-workshops"

// Keep the existing workshop presentation model at the CMS boundary.
export function workshopView(
  content: PublicWorkshopDetail,
  phone = "",
  intake?: IntakeConfig,
  selectedSessionId?: string,
  lastSession?: PublicWorkshop["lastSession"]
): Workshop & { primerVideoUrl: string | null } {
  const session =
    content.sessions.find((item) => item.id === selectedSessionId) ??
    content.sessions.find((item) => item.isRegistrationOpen) ??
    content.sessions[0] ??
    null
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
  }).format(new Date())
  const completedSession = session ? null : (content.lastSession ?? lastSession)
  const past = Boolean(
    completedSession ||
    (session && !session.isRegistrationOpen && session.endDate < today)
  )
  return {
    slug: content.slug,
    title: content.title,
    tags: content.tags as Workshop["tags"],
    start: session ? publicSessionTimestamps(session).start : "",
    schedule: completedSession
      ? pastSessionDate(completedSession)
      : sessionSchedule(session),
    venue: past
      ? (completedSession ?? session)?.venueName?.trim() ||
        "Venue not specified"
      : session?.venueName.trim() || content.defaultVenue.name.trim(),
    city: past
      ? (completedSession ?? session)?.city?.trim() || ""
      : session?.city.trim() || content.defaultVenue.city.trim(),
    price: completedSession
      ? formatPublicPrice(completedSession.price)
      : workshopPrice({ ...content, nextSession: session }),
    image: content.heroImage?.url ?? "",
    status: past
      ? "past"
      : session?.isRegistrationOpen
        ? "open"
        : (session?.status ?? "closed"),
    registrationOpen: !past && (session?.isRegistrationOpen ?? false),
    contactPhone: phone,
    intake,
    workshopSessionId:
      session && z.uuid().safeParse(session.id).success
        ? session.id
        : undefined,
    summary: content.summary,
    intro: content.intro,
    audience:
      content.audience.trim() ||
      (past ? "" : "Audience details to be announced"),
    format: content.format.trim() || (past ? "" : "Format to be announced"),
    curriculum: detailsOrAnnouncement(
      content.curriculum,
      past ? "" : "Curriculum to be announced"
    ),
    inclusions: detailsOrAnnouncement(
      content.inclusions,
      past ? "" : "Inclusions to be announced"
    ),
    problem: content.problem,
    outcomes: detailsOrAnnouncement(
      content.outcomes,
      past ? "" : "Learning outcomes to be announced"
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
  return details.length || !fallback ? details : [fallback]
}
