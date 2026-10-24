import { z } from "zod"
import { registrationAcceptedSchema } from "@/lib/registration"
import { corporateInquiryAcceptedSchema } from "@/lib/corporate-inquiry"

/**
 * Form → confirmation-page bridge.
 *
 * Both forms are frontend-only (no API, no CRM), but the confirmation pages
 * still have to read back what was submitted so they feel like a real
 * post-submit destination rather than a static page. `sessionStorage` carries
 * the payload across the `router.push` and dies with the tab — nothing is sent
 * anywhere, which is what the demo's own footnote promises.
 *
 * Every read/write is wrapped: private-mode Safari and "block site data"
 * settings throw on access, and a confirmation page that crashes is far worse
 * than one that falls back to generic copy. Every consumer must render
 * correctly when this returns `null`.
 */

const KEY = "ad-demo-handoff"

const handoffSchema = z.discriminatedUnion("kind", [
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

export type Handoff = z.infer<typeof handoffSchema>
export type WorkshopHandoff = Extract<Handoff, { kind: "workshop" }>
export type CorporateHandoff = Extract<Handoff, { kind: "corporate" }>

export function parseHandoff(input: unknown): Handoff | null {
  const result = handoffSchema.safeParse(input)
  return result.success ? result.data : null
}

export function saveHandoff(payload: Handoff): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    // Storage unavailable — the confirmation page falls back to generic copy.
  }
}

export function readHandoff<K extends Handoff["kind"]>(
  kind: K
): Extract<Handoff, { kind: K }> | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = parseHandoff(JSON.parse(raw))
    if (parsed?.kind === kind) {
      return parsed as Extract<Handoff, { kind: K }>
    }
    return null
  } catch {
    return null
  }
}

export function clearHandoff(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Nothing to do — see above.
  }
}

/** First name for a greeting, or `null` when there's nothing to greet with. */
export function firstNameOf(fullName: string | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0]
  return first ? first : null
}

// Only validated Portal acceptance can populate the current confirmation pages.
const receiptSchema = z.discriminatedUnion("kind", [
  handoffSchema.options[0].extend({
    accepted: z.literal(true),
    workshopSessionId: z.uuid(),
    workshopTitle: z.string(),
    schedule: z.string(),
    venue: z.string(),
    price: z.string(),
    result: registrationAcceptedSchema,
  }),
  handoffSchema.options[1].extend({
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
