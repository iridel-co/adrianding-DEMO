import { z } from "zod"
import type { PublicProgram } from "@/lib/public-content"
import { corporateInquiryFieldsSchema } from "@/lib/corporate-inquiry"

export const UNSURE_PROGRAM = "Not sure yet — help us scope it"

export const ATTENDEE_BANDS = [
  "1 – 15",
  "16 – 30",
  "31 – 50",
  "51 – 100",
  "More than 100",
] as const

export const schema = corporateInquiryFieldsSchema.extend({
  program: z
    .string({ error: "Pick the closest programme." })
    .trim()
    .min(1, "Pick the closest programme.")
    .max(200),
  attendees: z.enum(ATTENDEE_BANDS, { message: "Roughly how many people?" }),
  targetDate: z
    .string()
    .trim()
    .min(2, "Even a rough month helps us hold a date.")
    .max(200),
  alsoInterested: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
})

export const createSchema = (
  programs: Pick<PublicProgram, "slug" | "title">[]
) =>
  schema.superRefine((value, ctx) => {
    const slugs = new Set(programs.map((program) => program.slug))
    if (value.program !== UNSURE_PROGRAM && !slugs.has(value.program)) {
      ctx.addIssue({
        code: "custom",
        path: ["program"],
        message: "Pick a current programme.",
      })
    }
    if (
      value.alsoInterested?.some(
        (slug) => !slugs.has(slug) || slug === value.program
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["alsoInterested"],
        message: "Pick current programmes.",
      })
    }
  })

export type FormValues = z.infer<typeof schema>

export const STEPS: { title: string; fields: (keyof FormValues)[] }[] = [
  { title: "Your details", fields: ["fullName", "email", "phone"] },
  { title: "Your company", fields: ["company", "role"] },
  {
    title: "Your programme",
    fields: [
      "program",
      "alsoInterested",
      "attendees",
      "targetDate",
      "venue",
      "context",
    ],
  },
  { title: "Confirm", fields: ["consent"] },
]
