import { Mail, MessageSquare, Phone } from "lucide-react"
import { getPublicProfile } from "@/lib/public-api"
export async function SupportBand({
  heading = "Questions before you register?",
  blurb = "Talk to someone on the team — not a form. We answer within one business day, and same-day on weekdays.",
}: {
  heading?: string
  blurb?: string
}) {
  const profile = await getPublicProfile()
  if (!profile.phone && !profile.emails.length) return null
  const phone = profile.phone.replace(/[^\d+]/g, "")
  return (
    <section className="bg-muted/40" id="contact">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-xl">
          <h2 className="font-serif text-[1.75rem] leading-[1.15] tracking-[-0.02em] sm:text-[2.25rem]">
            {heading}
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">{blurb}</p>
        </div>
        <ul className="flex shrink-0 flex-col gap-3">
          {profile.phone && (
            <>
              <li>
                <ContactLink
                  href={`tel:${phone}`}
                  icon={Phone}
                  label="Call"
                  value={profile.phone}
                />
              </li>
              <li>
                <ContactLink
                  href={`sms:${phone}`}
                  icon={MessageSquare}
                  label="Text"
                  value={profile.phone}
                />
              </li>
            </>
          )}
          {profile.emails.map((email) => (
            <li key={email}>
              <ContactLink
                href={`mailto:${email}`}
                icon={Mail}
                label="Email"
                value={email}
              />
            </li>
          ))}
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
