import { z } from "zod"

export const SALARY_RANGES = [
  "Under ₱30,000",
  "₱30,000 – ₱50,000",
  "₱50,000 – ₱80,000",
  "₱80,000 – ₱120,000",
  "Over ₱120,000",
  "Prefer not to say",
] as const

export const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(7, "Enter a valid mobile number."),
  occupation: z.string().min(2, "Tell us what you do."),
  salaryRange: z.enum(SALARY_RANGES, {
    message: "Select a range.",
  }),
  city: z.string().optional(),
  consent: z.literal(true, {
    message: "You need to agree to continue.",
  }),
})

export type FormValues = z.infer<typeof schema>

export const STEPS: { title: string; fields: (keyof FormValues)[] }[] = [
  { title: "Who's registering", fields: ["fullName", "email", "phone"] },
  { title: "About you", fields: ["occupation", "salaryRange", "city"] },
  { title: "Confirm", fields: ["consent"] },
]
