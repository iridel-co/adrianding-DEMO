import { z } from "zod"

// Corporate intake contract reviewed against Portal main at 775a13f.
const requiredText = (max: number, min = 2, message?: string) =>
  z.string().trim().min(min, message).max(max)
const optionalText = (max: number, message?: string) =>
  z.string().trim().max(max, message).optional()
const optionalDate = z.union([z.iso.date(), z.literal("")]).optional()

export const corporateInquiryFieldsSchema = z.strictObject({
  fullName: requiredText(200, 2, "Please enter your full name."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email({ message: "Enter a valid work email." })),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^\+?[0-9 ().-]+$/, "Enter a contact number.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length
      return digits >= 7 && digits <= 15
    }, "Enter a contact number with 7 to 15 digits."),
  consent: z.literal(true, { message: "You need to agree to continue." }),
  company: requiredText(200, 2, "Which company?"),
  role: requiredText(200, 2, "Your role or title."),
  program: requiredText(200, 1),
  attendees: requiredText(100, 1),
  venue: requiredText(300, 2, "Where would this run?"),
  context: optionalText(5000, "Use 5,000 characters or fewer."),
  alsoInterested: z.array(requiredText(200, 1)).max(20).default([]),
})

const dateFields = z.object({
  targetDateFrom: optionalDate,
  targetDateTo: optionalDate,
  targetDateText: optionalText(200),
})

function validateDates(
  input: z.infer<typeof dateFields>,
  context: z.RefinementCtx
) {
  if (input.targetDateFrom && input.targetDateText) {
    context.addIssue({
      code: "custom",
      path: ["targetDateText"],
      message: "Choose picked dates or a rough date description.",
    })
  }
  if (!input.targetDateFrom && !input.targetDateText) {
    context.addIssue({
      code: "custom",
      path: ["targetDateFrom"],
      message: "Enter a start date or a rough date description.",
    })
  }
  if (input.targetDateTo && !input.targetDateFrom) {
    context.addIssue({
      code: "custom",
      path: ["targetDateFrom"],
      message: "An end date needs a start date.",
    })
  }
  if (
    input.targetDateFrom &&
    input.targetDateTo &&
    input.targetDateTo < input.targetDateFrom
  ) {
    context.addIssue({
      code: "custom",
      path: ["targetDateTo"],
      message: "End date cannot precede start date.",
    })
  }
}

export const corporateInquiryDatesSchema = dateFields.superRefine(validateDates)
export const corporateInquiryAnswersSchema = corporateInquiryFieldsSchema
  .extend(dateFields.shape)
  .superRefine(validateDates)
export const corporateInquiryRequestSchema =
  corporateInquiryAnswersSchema.safeExtend({
    website: z
      .string()
      .max(200)
      .refine((value) => value === "")
      .default(""),
    turnstileToken: z.string().min(1).max(2048),
  })
export const corporateInquiryKeySchema = z
  .uuidv4()
  .transform((value) => value.toLowerCase())
export const corporateInquiryAcceptedSchema = z.strictObject({
  accepted: z.literal(true),
})
export const corporateInquiryErrorSchema = z.object({ error: z.string() })

export type CorporateInquiryAnswers = z.infer<
  typeof corporateInquiryAnswersSchema
>
export type CorporateInquiryRequest = z.input<
  typeof corporateInquiryRequestSchema
>
export type CorporateDateSelection =
  | { mode: "pick"; from: string; to: string }
  | { mode: "text"; text: string }

export function corporateInquiryDates(selection: CorporateDateSelection) {
  return selection.mode === "pick"
    ? { targetDateFrom: selection.from, targetDateTo: selection.to }
    : { targetDateText: selection.text }
}
