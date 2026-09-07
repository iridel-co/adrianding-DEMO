"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RegistrationForm } from "./registration-form"

type Props = {
  slug: string
  workshopTitle: string
  schedule: string
  venue: string
  children: React.ReactNode
}

/**
 * Wraps the multi-step registration form in a modal. `children` is the
 * trigger element (e.g. the "Register now" button). `slug` is what the form
 * redirects to on submit — see `registration-form.tsx`.
 */
export function RegistrationDialog({
  slug,
  workshopTitle,
  schedule,
  venue,
  children,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-6 overflow-y-auto p-10 sm:max-w-2xl">
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
          slug={slug}
          workshopTitle={workshopTitle}
          schedule={schedule}
          venue={venue}
        />
      </DialogContent>
    </Dialog>
  )
}
