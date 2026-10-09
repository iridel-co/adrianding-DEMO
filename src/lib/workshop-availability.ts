import type { Workshop } from "./workshops"

export type WorkshopAvailability = {
  state: "available" | "full" | "closed" | "unknown"
  canRegister: boolean
  label: string
}

/** Derives display availability; the booking service must enforce live capacity. */
export function getWorkshopAvailability(
  workshop: Pick<Workshop, "status" | "seatsLeft" | "seatsTotal">
): WorkshopAvailability {
  if (workshop.status !== "open") {
    return { state: "closed", canRegister: false, label: "Registration closed" }
  }
  const { seatsLeft, seatsTotal } = workshop
  if (
    !Number.isInteger(seatsLeft) ||
    !Number.isInteger(seatsTotal) ||
    seatsTotal <= 0 ||
    seatsLeft < 0 ||
    seatsLeft > seatsTotal
  ) {
    return {
      state: "unknown",
      canRegister: false,
      label: "Availability unavailable",
    }
  }
  if (seatsLeft === 0) {
    return { state: "full", canRegister: false, label: "Fully booked" }
  }
  return {
    state: "available",
    canRegister: true,
    label: `${seatsLeft} ${seatsLeft === 1 ? "seat" : "seats"} left`,
  }
}
