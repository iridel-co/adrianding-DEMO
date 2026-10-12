"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import type { Workshop } from "@/lib/workshops"
import { getWorkshopAvailability } from "@/lib/workshop-availability"
import { RegistrationForm } from "./registration-form"

type Props = {
  workshop: Workshop
  triggerLabel?: string
  variant?: ButtonProps["variant"]
  className?: string
  tabIndex?: number
}

/**
 * Owns the registration trigger and modal, sharing the workshop availability
 * snapshot with the form and using its slug for the confirmation route.
 */
export function RegistrationDialog({
  workshop,
  triggerLabel = "Register now",
  variant = "brand",
  className,
  tabIndex,
}: Props) {
  const availability = getWorkshopAvailability(workshop)
  return (
    <Dialog>
      <DialogTrigger asChild disabled={!availability.canRegister}>
        <Button
          variant={variant}
          size="lg"
          className={className}
          tabIndex={tabIndex}
        >
          {availability.canRegister ? triggerLabel : availability.label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] min-w-0 gap-6 overflow-x-hidden overflow-y-auto p-6 sm:max-w-2xl sm:p-10">
        <DialogHeader className="gap-3">
          <DialogTitle className="text-3xl font-semibold tracking-tight">
            Reserve your seat
          </DialogTitle>
          <DialogDescription className="text-base">
            Takes a minute. You&rsquo;ll get payment details by email right
            after.
          </DialogDescription>
        </DialogHeader>
        <RegistrationForm
          slug={workshop.slug}
          workshopTitle={workshop.title}
          schedule={workshop.schedule}
          venue={`${workshop.venue}, ${workshop.city}`}
          availability={availability}
        />
      </DialogContent>
    </Dialog>
  )
}
