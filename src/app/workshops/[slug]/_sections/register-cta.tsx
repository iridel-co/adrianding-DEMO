import { WorkshopAvailabilityText } from "@/app/_components/workshop-availability-text"
import { CtaBanner } from "@/components/common/cta-banner"
import { BloomFieldBackground } from "@/app/_components/bloom-field-background"
import { getWorkshopAvailability } from "@/lib/workshop-availability"
import type { Workshop } from "@/lib/workshops"
import { RegistrationDialog } from "./registration-dialog"

export function RegisterCta({ workshop }: { workshop: Workshop }) {
  const availability = getWorkshopAvailability(workshop)
  return (
    <div id="workshop-register-cta" className="relative overflow-hidden">
      <BloomFieldBackground />
      <CtaBanner
        variant="brand"
        className="relative bg-transparent"
        heading={
          availability.canRegister
            ? "Ready to save your seat?"
            : availability.label
        }
        subtext={
          <>
            <span className="block sm:inline">{workshop.schedule}</span>
            <span className="hidden sm:inline"> · </span>
            <span className="mt-2 block sm:mt-0 sm:inline">
              {workshop.venue}, {workshop.city}
            </span>
            <span className="hidden sm:inline"> · </span>
            <span className="mt-2 block sm:mt-0 sm:inline">
              <WorkshopAvailabilityText workshop={workshop} onDark />
            </span>
          </>
        }
        actions={<RegistrationDialog workshop={workshop} variant="secondary" />}
      />
    </div>
  )
}
