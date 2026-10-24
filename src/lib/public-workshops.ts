import {
  formatPublicPrice,
  publicSessionTimestamps,
  type PublicSession,
  type PublicWorkshop,
} from "./public-content"

export function sessionSchedule(session: PublicSession | null) {
  if (!session) return "Dates to be announced"
  const dates = publicSessionTimestamps(session)
  const date = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: "Asia/Manila",
  })
  const time = new Intl.DateTimeFormat("en-PH", {
    timeStyle: "short",
    timeZone: "Asia/Manila",
  })
  return `${date.format(new Date(dates.start))}${session.endDate !== session.date ? ` – ${date.format(new Date(dates.end))}` : ""} · ${time.format(new Date(dates.start))} – ${time.format(new Date(dates.end))}`
}

export function workshopPrice(workshop: PublicWorkshop) {
  const price = workshop.nextSession?.price ?? workshop.defaultPrice
  // Promotional pricing notes stay hidden until early-bird display is ready.
  return price ? formatPublicPrice(price) : "Contact us for pricing"
}

export function sessionAvailability(session: PublicSession | null) {
  return !session
    ? "Dates to be announced"
    : session.isRegistrationOpen
      ? session.seatsLeft === undefined || session.seatsLeft > session.capacity
        ? "Contact us to register"
        : session.seatsLeft === 0
          ? "Fully booked"
          : `${session.seatsLeft} ${session.seatsLeft === 1 ? "seat" : "seats"} left`
      : "Registration closed"
}
