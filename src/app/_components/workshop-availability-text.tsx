import { getWorkshopAvailability } from "@/lib/workshop-availability"
import type { Workshop } from "@/lib/workshops"
import { cn } from "@/lib/utils"

/** Shared seat wording and emphasis; page containers own layout and size. */
export function WorkshopAvailabilityText({
  workshop,
  onDark = false,
  className,
}: {
  workshop: Pick<Workshop, "status" | "seatsLeft" | "seatsTotal">
  onDark?: boolean
  className?: string
}) {
  const availability = getWorkshopAvailability(workshop)
  return (
    <span className={cn("font-normal", className)}>
      {availability.canRegister ? (
        <>
          <strong
            className={cn(
              "font-semibold tabular-nums",
              !onDark && "text-brand"
            )}
          >
            {workshop.seatsLeft}
          </strong>{" "}
          {workshop.seatsLeft === 1 ? "seat" : "seats"} left
        </>
      ) : (
        availability.label
      )}
    </span>
  )
}
