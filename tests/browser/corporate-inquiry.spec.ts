import { expect, test } from "@playwright/test"
import {
  corporateInquiryDates,
  corporateInquiryAcceptedSchema,
  corporateInquiryAnswersSchema,
  corporateInquiryErrorSchema,
  corporateInquiryKeySchema,
  corporateInquiryRequestSchema,
} from "@/lib/corporate-inquiry"

const corporateInput = {
  fullName: "Maria Santos",
  email: "maria@example.com",
  phone: "09171234567",
  company: "Example Company",
  role: "L&D manager",
  program: "Leadership Training & Development",
  attendees: "16 – 30",

  venue: "Cebu",
  context: "New managers",
  consent: true,
  alsoInterested: [],
}
const roughDate = { mode: "text" as const, text: "November 2026" }
const pickedDates = {
  mode: "pick" as const,
  from: "2026-11-20",
  to: "2026-11-21",
}

test("@policy corporate preparation keeps raw dates and validates the separate intake contract", () => {
  const prepared = corporateInquiryAnswersSchema.parse({
    ...corporateInput,
    ...corporateInquiryDates(pickedDates),
    email: "MARIA@EXAMPLE.COM",
  })
  expect(prepared).toMatchObject({
    targetDateFrom: pickedDates.from,
    targetDateTo: pickedDates.to,
    email: "maria@example.com",
    consent: true,
  })
  expect(prepared).not.toHaveProperty("targetDate")
  expect(prepared).not.toHaveProperty("targetDateText")
  const request = { ...prepared, turnstileToken: "fresh-token" }
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
  const answers = corporateInquiryAnswersSchema.parse({
    ...corporateInput,
    ...corporateInquiryDates(roughDate),
  })
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
