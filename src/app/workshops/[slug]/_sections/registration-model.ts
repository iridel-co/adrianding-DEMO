import { z } from "zod"
import { registrationAnswersSchema } from "@/lib/registration"

export const SALARY_RANGES = [
  "Under ₱30,000",
  "₱30,000 – ₱50,000",
  "₱50,000 – ₱80,000",
  "₱80,000 – ₱120,000",
  "Over ₱120,000",
  "Prefer not to say",
] as const

export const schema = registrationAnswersSchema
  .omit({ workshopSessionId: true })
  .extend({
    salaryRange: z.enum(SALARY_RANGES, { message: "Select a range." }),
  })
export type FormValues = z.infer<typeof schema>

export const STEPS: { title: string; fields: (keyof FormValues)[] }[] = [
  { title: "Who's registering", fields: ["fullName", "email", "phone"] },
  { title: "About you", fields: ["occupation", "salaryRange", "city"] },
  { title: "Confirm", fields: ["consent"] },
]
