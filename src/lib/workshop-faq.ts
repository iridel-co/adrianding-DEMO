/**
 * Registration FAQ shown on every workshop detail page.
 *
 * This is objection-handling, not documentation: each entry answers a reason
 * someone stops short of the form (is my money safe, what if I can't make it,
 * can I claim this back from my employer). Shared across all workshops because
 * the process is identical for every date.
 *
 * TODO: client sign-off on the transfer window, the reservation hold, and
 * whether an official receipt is issued by default.
 */

export type FaqItem = { q: string; a: string }

export const WORKSHOP_FAQ: FaqItem[] = [
  {
    q: "How do I pay, and when?",
    a: "Register first — no payment is taken on this page. You will get a confirmation email with bank transfer details and a QR code. Your seat is held for 48 hours from that email, and confirmed the moment we verify your payment.",
  },
  {
    q: "How do I send proof of payment?",
    a: "Reply to that same confirmation email with a screenshot or photo of your transfer. Keeping it in one thread means nothing gets lost, and you have the whole exchange in your own inbox.",
  },
  {
    q: "When do I know my seat is confirmed?",
    a: "Our team reviews every payment manually and marks your registration as paid. You will get a second email confirming it, along with the primer video and joining instructions.",
  },
  {
    q: "Can I send someone else in my place?",
    a: "Yes. Substitutions are free up to three days before the workshop — just reply in the same email thread with the new attendee's name and contact details.",
  },
  {
    q: "What if I can't make the date after paying?",
    a: "Let us know at least seven days before and we will move your seat to the next run of the same workshop at no extra cost. Inside seven days, you can still send a substitute.",
  },
  {
    q: "Can my company pay, and will I get an official receipt?",
    a: "Yes to both. An official receipt is issued under your company's name for reimbursement or accounting. Tell us the billing details when you reply with your proof of payment.",
  },
  {
    q: "Do you run this for a whole team?",
    a: "Yes — that runs as corporate training, built around your team rather than a public cohort. Group rates apply from ten attendees. Start a corporate inquiry and we will come back with a proposal.",
  },
  {
    q: "What do I need to bring?",
    a: "Yourself and a notebook. The training manual, certificate, snacks and lunch are all included. Each workshop page lists anything specific to that day.",
  },
]
