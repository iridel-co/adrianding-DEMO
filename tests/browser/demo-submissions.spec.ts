import { expect, test } from "@playwright/test"
import {
  submitCorporateDemo,
  submitWorkshopDemo,
} from "@/app/_lib/demo-submissions"
import { parseHandoff } from "@/app/_lib/handoff"
import {
  corporateInquiryAcceptedSchema,
  corporateInquiryAnswersSchema,
  corporateInquiryErrorSchema,
  corporateInquiryKeySchema,
  corporateInquiryRequestSchema,
} from "@/lib/corporate-inquiry"

const workshopInput = {
  fullName: "Juan Dela Cruz",
  email: "juan@example.com",
  phone: "09171234567",
  occupation: "Sales manager",
  salaryRange: "Prefer not to say",
  city: "Cebu",
  consent: true,
}
const corporateInput = {
  fullName: "Maria Santos",
  email: "maria@example.com",
  phone: "09171234567",
  company: "Example Company",
  role: "L&D manager",
  program: "Leadership Training & Development",
  attendees: "16 – 30",
  targetDate: "November 2026",
  venue: "Cebu",
  context: "New managers",
  consent: true,
  alsoInterested: [],
}
const roughDate = { mode: "text" as const, text: corporateInput.targetDate }
const pickedDates = {
  mode: "pick" as const,
  from: "2026-11-20",
  to: "2026-11-21",
}

test("@policy complete demo payloads stay separate from stored confirmations", () => {
  const workshop = submitWorkshopDemo("exceptional-salesmanship", workshopInput)
  expect(workshop.payload).toEqual({
    slug: "exceptional-salesmanship",
    ...workshopInput,
  })
  expect(workshop.confirmation).not.toHaveProperty("salaryRange")
  expect(workshop.confirmation).not.toHaveProperty("consent")
  const corporate = submitCorporateDemo(corporateInput, roughDate)
  const { targetDate, ...answers } = corporateInput
  expect(corporate.payload).toEqual({ ...answers, targetDateText: targetDate })
  for (const field of ["phone", "role", "context", "consent"]) {
    expect(corporate.confirmation).not.toHaveProperty(field)
  }
  expect(parseHandoff(workshop.confirmation)).toEqual(workshop.confirmation)
  expect(parseHandoff(corporate.confirmation)).toEqual(corporate.confirmation)
})

test("@policy invalid submissions and malformed confirmations fail validation", () => {
  expect(() => submitWorkshopDemo("", workshopInput)).toThrow()
  expect(() =>
    submitWorkshopDemo("sales", { ...workshopInput, consent: false })
  ).toThrow()
  expect(() =>
    submitCorporateDemo({ ...corporateInput, phone: null }, roughDate)
  ).toThrow()
  for (const value of [
    null,
    { kind: "workshop" },
    { kind: "corporate" },
    {
      ...submitCorporateDemo(corporateInput, roughDate).confirmation,
      alsoInterested: [null],
    },
    {
      ...submitWorkshopDemo("sales", workshopInput).confirmation,
      fullName: 42,
    },
  ]) {
    expect(parseHandoff(value)).toBeNull()
  }
})

test("@policy corporate preparation keeps raw dates and validates the separate intake contract", () => {
  const prepared = submitCorporateDemo(
    {
      ...corporateInput,
      targetDate: "20 November 2026 – 21 November 2026",
      email: "MARIA@EXAMPLE.COM",
    },
    pickedDates
  )
  expect(prepared.payload).toMatchObject({
    targetDateFrom: pickedDates.from,
    targetDateTo: pickedDates.to,
    email: "maria@example.com",
    consent: true,
  })
  expect(prepared.payload).not.toHaveProperty("targetDate")
  expect(prepared.payload).not.toHaveProperty("targetDateText")
  expect(prepared.confirmation.targetDate).toBe(
    "20 November 2026 – 21 November 2026"
  )
  const request = { ...prepared.payload, turnstileToken: "fresh-token" }
  expect(corporateInquiryRequestSchema.parse(request)).toEqual({
    ...request,
    website: "",
  })
  expect(corporateInquiryAcceptedSchema.parse({ accepted: true })).toEqual({
    accepted: true,
  })
  expect(
    corporateInquiryErrorSchema.parse({ error: "idempotency_key_mismatch" })
  ).toEqual({ error: "idempotency_key_mismatch" })
  expect(
    corporateInquiryErrorSchema.safeParse({
      error: { code: "invalid_request", message: "Invalid" },
    }).success
  ).toBe(false)
  expect(
    corporateInquiryKeySchema.safeParse("6f1c2b8e-3d4a-4b5c-9e7f-0a1b2c3d4e5f")
      .success
  ).toBe(true)
})

test("@policy corporate intake rejects incompatible dates, fields and transport values", () => {
  const answers = submitCorporateDemo(corporateInput, roughDate).payload
  for (const invalid of [
    { targetDateText: "" },
    { targetDateFrom: "2026-11-20" },
    { targetDateText: "", targetDateTo: "2026-11-21" },
    {
      targetDateText: "",
      targetDateFrom: "2026-11-21",
      targetDateTo: "2026-11-20",
    },
    { targetDateText: "", targetDateFrom: "2026-02-30" },
    { phone: "abcdefg" },
    { phone: "1234567890123456" },
    { consent: false },
    { context: "x".repeat(5001) },
    { alsoInterested: Array(21).fill("Leadership") },
    { targetDate: "Display text is not a portal field" },
  ])
    expect(
      corporateInquiryAnswersSchema.safeParse({ ...answers, ...invalid })
        .success
    ).toBe(false)
  expect(
    corporateInquiryAnswersSchema.safeParse({
      ...answers,
      targetDateText: undefined,
      targetDateFrom: "2026-11-20",
    }).success
  ).toBe(true)
  for (const turnstileToken of [undefined, "", "x".repeat(2049)]) {
    expect(
      corporateInquiryRequestSchema.safeParse({ ...answers, turnstileToken })
        .success
    ).toBe(false)
  }
  expect(corporateInquiryKeySchema.safeParse("not-a-uuid").success).toBe(false)
  expect(
    corporateInquiryAcceptedSchema.safeParse({ accepted: false }).success
  ).toBe(false)
})
