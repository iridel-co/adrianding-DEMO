import { z } from "zod"
import { corporateInquiryFieldsSchema } from "./corporate-inquiry"

export const registrationAnswersSchema = corporateInquiryFieldsSchema
  .pick({
    fullName: true,
    email: true,
    phone: true,
    consent: true,
  })
  .extend({
    workshopSessionId: z.uuid(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .pipe(z.email({ message: "Enter a valid email address." })),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^\+?[0-9 ().-]+$/, "Enter a valid mobile number.")
      .refine((value) => {
        const digits = value.replace(/\D/g, "").length
        return digits >= 7 && digits <= 15
      }, "Enter a valid mobile number."),
    occupation: z.string().trim().min(2, "Tell us what you do.").max(200),
    salaryRange: z.string().trim().min(1, "Select a range.").max(100),
    city: z.string().trim().max(200).optional(),
  })
export const registrationRequestSchema = registrationAnswersSchema.extend({
  website: z
    .string()
    .max(200)
    .refine((value) => value === "")
    .optional()
    .default(""),
  turnstileToken: z.string().min(1).max(2048),
})
export const registrationAcceptedSchema = z.union([
  z.strictObject({ accepted: z.literal(true) }),
  z.strictObject({
    accepted: z.literal(true),
    reference: z.string().min(1),
    isPaid: z.literal(false),
  }),
])
