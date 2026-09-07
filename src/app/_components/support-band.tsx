import { Mail, MessageSquare, Phone } from "lucide-react"

/**
 * "Talk to a human" band — AD asked for a way to reach customer care from the
 * conversion pages, since a question you can't get answered is a registration
 * you don't get. Used on workshop detail pages, corporate training, and both
 * confirmation pages.
 *
 * Contact details match the footer (`site-footer.tsx`); update both together.
 */

const PHONE_DISPLAY = "0920 900 7709"
const PHONE_HREF = "tel:+639209007709"
const EMAIL = "coachadrianding@maximumimpact.online"

export function SupportBand({
  heading = "Questions before you register?",
  blurb = "Talk to someone on the team — not a form. We answer within one business day, and same-day on weekdays.",
}: {
  heading?: string
  blurb?: string
}) {
  return (
    <section className="bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-xl">
          <h2 className="font-serif text-[1.75rem] leading-[1.15] tracking-[-0.02em] sm:text-[2.25rem]">
            {heading}
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">{blurb}</p>
        </div>

        <ul className="flex shrink-0 flex-col gap-3">
          <li>
            <ContactLink
              href={PHONE_HREF}
              icon={Phone}
              label="Call"
              value={PHONE_DISPLAY}
            />
          </li>
          <li>
            <ContactLink
              href={`sms:+639209007709`}
              icon={MessageSquare}
              label="Text"
              value={PHONE_DISPLAY}
            />
          </li>
          <li>
            <ContactLink
              href={`mailto:${EMAIL}`}
              icon={Mail}
              label="Email"
              value={EMAIL}
            />
          </li>
        </ul>
      </div>
    </section>
  )
}

function ContactLink({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <a
      href={href}
      className="bg-background ring-border/70 hover:ring-brand/50 focus-visible:ring-brand flex min-h-11 items-center gap-3 rounded-md px-4 py-3 ring-1 transition-[box-shadow,color] focus-visible:ring-2 focus-visible:outline-none"
    >
      <Icon className="text-brand size-4 shrink-0" />
      <span className="text-muted-foreground w-11 shrink-0 text-xs tracking-[0.1em] uppercase">
        {label}
      </span>
      <span className="text-sm font-medium break-all">{value}</span>
    </a>
  )
}
