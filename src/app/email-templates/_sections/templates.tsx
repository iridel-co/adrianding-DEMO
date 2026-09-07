import Image from "next/image"

/**
 * Client-facing email copy + layout deliverables (PRD "Email Templates"). These
 * are static previews for review — the actual send triggers (Resend) are Phase
 * 2. All three share one branded frame.
 */

type EmailTemplate = {
  id: string
  name: string
  trigger: string
  subject: string
  greeting: string
  body: string[]
  panel?: { title: string; rows: [string, string][] }
  video?: boolean
  closing: string
}

const TEMPLATES: EmailTemplate[] = [
  {
    id: "workshop-confirmation",
    name: "1 · Workshop Registration Confirmation",
    trigger:
      "Sent immediately after the workshop registration form is submitted.",
    subject: "You're registered — Exceptional Salesmanship, Oct 9",
    greeting: "Hi {first_name},",
    body: [
      "Thanks for registering for Exceptional Salesmanship. Your seat is held pending payment.",
      "To confirm it, please settle the workshop fee using the details below, then reply to this same email thread with a photo or screenshot of your proof of payment. Our team will review it and send a final confirmation once you're marked as paid.",
      "A short primer video is included below to set up the day.",
    ],
    panel: {
      title: "Event details",
      rows: [
        ["Workshop", "Exceptional Salesmanship"],
        ["Date", "Friday, October 9, 2026 · 9:00 AM – 5:00 PM"],
        ["Venue", "SEDA Ayala Center Cebu, E-bloc"],
        ["Fee", "₱[placeholder]"],
        [
          "Payment",
          "Bank: [name] · Acct: Maximum Impact PH · [number]  /  QR attached",
        ],
      ],
    },
    video: true,
    closing:
      "Questions? Just reply here or reach us at coachadrianding@maximumimpact.online.",
  },
  {
    id: "payment-confirmation",
    name: "2 · Payment Confirmation",
    trigger: "Sent when staff mark the registrant as PAID in the CRM.",
    subject: "Payment confirmed — see you on Oct 9",
    greeting: "Hi {first_name},",
    body: [
      "Your payment is confirmed and your seat for Exceptional Salesmanship is secured. We're glad you're coming.",
      "Please arrive by 8:30 AM for registration. Bring a notebook and something to write with — the day is hands-on. AM/PM snacks and lunch are provided.",
      "The event primer video is below. We'll also send a reminder the day before.",
    ],
    panel: {
      title: "Your workshop",
      rows: [
        ["Date", "Friday, October 9, 2026 · 9:00 AM – 5:00 PM"],
        ["Venue", "SEDA Ayala Center Cebu, E-bloc"],
        [
          "Includes",
          "Training manual · certificate · snacks + lunch · 30-day follow-through · online reunion",
        ],
      ],
    },
    video: true,
    closing: "See you there. — The Maximum Impact PH team",
  },
  {
    id: "corporate-acknowledgment",
    name: "3 · Corporate Training Inquiry Acknowledgment",
    trigger:
      "Sent immediately after the corporate training inquiry form is submitted.",
    subject: "We've received your inquiry",
    greeting: "Hi {first_name},",
    body: [
      "Thanks for reaching out about corporate training for {company}. We've received your inquiry and someone from our team will get back to you within 2 business days to understand what you need and put together a proposal.",
      "Here's what you sent us — reply to this email if any of it needs correcting before we start scoping.",
      "For context while you wait: Adrian has trained more than 20,000 professionals across the Top 500 companies in the Philippines over 20+ years — from multinationals and banks to family businesses.",
    ],
    panel: {
      title: "Your inquiry",
      rows: [
        ["Programme", "{program}"],
        ["Attendees", "{attendees}"],
        ["Target date", "{target_date}"],
        ["Venue", "{venue}"],
      ],
    },
    closing:
      "If it's time-sensitive, reply here or call 0920 900 7709 and we'll prioritise it.",
  },
]

export function EmailTemplates() {
  return (
    <div className="space-y-16">
      {TEMPLATES.map((t) => (
        <article
          key={t.id}
          id={t.id}
          className="scroll-mt-[calc(var(--nav-h)+1.5rem)]"
        >
          <h2 className="font-serif text-2xl tracking-tight">{t.name}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{t.trigger}</p>

          <div className="border-border/70 mx-auto mt-5 max-w-[600px] overflow-hidden rounded-md border">
            <div className="border-border/60 text-muted-foreground border-b px-6 py-3 text-xs">
              <span className="text-foreground font-medium">Subject:</span>{" "}
              {t.subject}
            </div>

            <div className="bg-brand flex items-center gap-2.5 px-6 py-5">
              <Image
                src="/images/logos/ad-logo-white.svg"
                alt=""
                width={72}
                height={72}
                className="h-8 w-8 object-contain"
              />
              <span className="text-brand-foreground font-serif text-lg tracking-tight">
                Coach Adrian Ding
              </span>
            </div>

            <div className="space-y-4 px-6 py-7 text-sm leading-relaxed">
              <p className="text-foreground">{t.greeting}</p>
              {t.body.map((p, i) => (
                <p key={i} className="text-muted-foreground">
                  {p}
                </p>
              ))}

              {t.panel && (
                <div className="bg-muted/50 rounded-sm p-4">
                  <p className="text-foreground text-xs font-semibold tracking-[0.1em] uppercase">
                    {t.panel.title}
                  </p>
                  <dl className="mt-2 space-y-1.5">
                    {t.panel.rows.map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[7rem_1fr] gap-2">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="text-foreground">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {t.video && (
                <div className="bg-muted/50 text-muted-foreground flex aspect-video items-center justify-center rounded-sm text-xs">
                  ▶ Primer video embed
                </div>
              )}

              <p className="text-muted-foreground">{t.closing}</p>
            </div>

            <div className="border-border/60 text-muted-foreground border-t px-6 py-4 text-xs">
              Maximum Impact PH · coachadrianding@maximumimpact.online · 0920
              900 7709
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
