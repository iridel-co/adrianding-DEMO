import { z } from "zod"
import { CORPORATE_PROGRAMMES } from "@/lib/specializations"

export const SPEC_TITLES = CORPORATE_PROGRAMMES.map((s) => s.title) as [
  string,
  ...string[],
]

export const PROGRAMS = [
  ...CORPORATE_PROGRAMMES.map((s) => s.title),
  "Not sure yet — help us scope it",
] as const

export const ATTENDEE_BANDS = [
  "1 – 15",
  "16 – 30",
  "31 – 50",
  "51 – 100",
  "More than 100",
] as const

export const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid work email."),
  phone: z.string().min(7, "Enter a valid contact number."),
  company: z.string().min(2, "Which company?"),
  role: z.string().min(2, "Your role or title."),
  program: z.enum(PROGRAMS, { message: "Pick the closest programme." }),
  attendees: z.enum(ATTENDEE_BANDS, { message: "Roughly how many people?" }),
  targetDate: z.string().min(2, "Even a rough month helps us hold a date."),
  venue: z.string().min(2, "Where would this run?"),
  context: z.string().optional(),
  consent: z.literal(true, { message: "You need to agree to continue." }),
  alsoInterested: z.array(z.enum(SPEC_TITLES)).optional(),
})

export type FormValues = z.infer<typeof schema>

export const STEPS: { title: string; fields: (keyof FormValues)[] }[] = [
  { title: "Your details", fields: ["fullName", "email", "phone"] },
  { title: "Your company", fields: ["company", "role"] },
  {
    title: "Your programme",
    fields: ["program", "alsoInterested", "attendees", "targetDate", "venue"],
  },
  { title: "Confirm", fields: ["consent"] },
]
