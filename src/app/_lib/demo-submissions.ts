import { z } from "zod"
import { schema as workshopSchema } from "@/app/workshops/[slug]/_sections/registration-model"
import { schema as corporateSchema } from "@/app/corporate-training/_sections/inquiry-model"
import type { WorkshopHandoff, CorporateHandoff } from "./handoff"
import {
  corporateInquiryAnswersSchema,
  corporateInquiryDates,
  type CorporateDateSelection,
} from "@/lib/corporate-inquiry"

// These local results do not represent a recorded lead or a reserved seat.
export function submitWorkshopDemo(slug: string, input: unknown) {
  const payload = {
    slug: z.string().min(1).parse(slug),
    ...workshopSchema.parse(input),
  }
  const confirmation: WorkshopHandoff = {
    kind: "workshop",
    slug: payload.slug,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
  }
  return { payload, confirmation }
}

export function submitCorporateDemo(
  input: unknown,
  dates: CorporateDateSelection
) {
  const { targetDate, ...answers } = corporateSchema.parse(input)
  const payload = corporateInquiryAnswersSchema.parse({
    ...answers,
    ...corporateInquiryDates(dates),
  })
  const confirmation: CorporateHandoff = {
    kind: "corporate",
    fullName: payload.fullName,
    email: payload.email,
    company: payload.company,
    program: payload.program,
    attendees: payload.attendees,
    targetDate,
    venue: payload.venue,
    alsoInterested: payload.alsoInterested ?? [],
  }
  return { payload, confirmation }
}
