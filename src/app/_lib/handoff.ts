import { z } from "zod"
import { registrationAcceptedSchema } from "@/lib/registration"
import { corporateInquiryAcceptedSchema } from "@/lib/corporate-inquiry"

const receiptFields = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("workshop"),
    slug: z.string().min(1),
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
  z.object({
    kind: z.literal("corporate"),
    fullName: z.string(),
    email: z.string(),
    company: z.string(),
    program: z.string(),
    attendees: z.string(),
    targetDate: z.string(),
    venue: z.string(),
    // Optional on older saved confirmations.
    alsoInterested: z.array(z.string()).optional(),
  }),
])

/** First name for a greeting, or `null` when there's nothing to greet with. */
export function firstNameOf(fullName: string | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0]
  return first ? first : null
}

// Only validated Portal acceptance can populate the current confirmation pages.
const receiptSchema = z.discriminatedUnion("kind", [
  receiptFields.options[0].extend({
    accepted: z.literal(true),
    workshopSessionId: z.uuid(),
    workshopTitle: z.string(),
    schedule: z.string(),
    venue: z.string(),
    price: z.string(),
    result: registrationAcceptedSchema,
  }),
  receiptFields.options[1].extend({
    accepted: z.literal(true),
    result: corporateInquiryAcceptedSchema,
  }),
])
type Receipt = z.infer<typeof receiptSchema>
export type WorkshopReceipt = Extract<Receipt, { kind: "workshop" }>
export type CorporateReceipt = Extract<Receipt, { kind: "corporate" }>
const RECEIPT_KEY = "ad-portal-receipt-v1"
let memoryReceipt: Receipt | null = null

export function saveReceipt(receipt: Receipt): boolean {
  const parsed = receiptSchema.safeParse(receipt)
  if (!parsed.success) return false
  memoryReceipt = parsed.data
  try {
    sessionStorage.setItem(
      RECEIPT_KEY,
      JSON.stringify({ version: 1, receipt: parsed.data })
    )
    return true
  } catch {
    return false
  }
}

export function readReceipt<K extends Receipt["kind"]>(
  kind: K,
  slug?: string
): Extract<Receipt, { kind: K }> | null {
  let receipt = memoryReceipt
  try {
    const raw = sessionStorage.getItem(RECEIPT_KEY)
    if (!receipt && raw)
      receipt = z
        .object({ version: z.literal(1), receipt: receiptSchema })
        .parse(JSON.parse(raw)).receipt
  } catch {
    /* The current SPA can retain acceptance when tab storage is blocked. */
  }
  if (
    !receipt ||
    receipt.kind !== kind ||
    (receipt.kind === "workshop" && slug !== undefined && receipt.slug !== slug)
  )
    return null
  return receipt as Extract<Receipt, { kind: K }>
}
