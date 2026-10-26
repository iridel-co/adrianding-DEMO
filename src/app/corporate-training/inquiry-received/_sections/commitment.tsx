import { getPublicProfile } from "@/lib/public-api"
import { CalendarClock, Mail, Phone } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"

export async function InquiryCommitment() {
  const profile = await getPublicProfile()
  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <Reveal>
          <div className="bg-brand text-brand-foreground rounded-xl p-8 sm:p-10 lg:p-14">
            <h2 className="font-serif text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]">
              Keep in touch with the team.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 lg:text-lg">
              Use the contact information below if you need to discuss your
              request.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:gap-8">
              <Item
                icon={Mail}
                label="First reply"
                value={profile.emails[0] ?? "Email the team"}
                href={
                  profile.emails[0] ? `mailto:${profile.emails[0]}` : undefined
                }
                detail="Email the team with questions about your programme."
              />
              <Item
                icon={CalendarClock}
                label="Discovery call"
                value="Discuss your team"
                detail="Arrange a conversation about your goals and timing."
              />
              {profile.phone && (
                <Item
                  icon={Phone}
                  label="Need it sooner?"
                  value={profile.phone}
                  detail="Call or text to discuss your inquiry."
                  href={`tel:${profile.phone}`}
                />
              )}
            </div>

            <p className="mt-8 flex items-start gap-3 text-base leading-relaxed lg:text-lg">
              <Mail className="mt-1 size-5 shrink-0" />
              <span>
                If anything in your inquiry changes, contact the team with your
                updated details.
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Item({
  icon: Icon,
  label,
  value,
  detail,
  href,
}: {
  icon: typeof Mail
  label: string
  value: string
  detail: string
  href?: string
}) {
  return (
    <div className="rounded-lg bg-black/15 p-6 lg:p-8">
      <p className="flex items-center gap-2 text-xs tracking-[0.14em] text-white/60 uppercase">
        <Icon className="size-4" />
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold tracking-[-0.01em] lg:text-2xl">
        {href ? (
          <a href={href} className="underline-offset-4 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{detail}</p>
    </div>
  )
}
