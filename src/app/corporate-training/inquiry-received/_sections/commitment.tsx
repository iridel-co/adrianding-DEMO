import { CalendarClock, Mail, Phone } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"

/**
 * The corporate counterpart to the workshop confirmation's payment block — same
 * full-brand-ground treatment, because it answers the same kind of question at
 * the same point in the flow.
 *
 * A workshop registrant leaves owing money; a corporate enquirer leaves owing
 * nothing, so the urgency has to be inverted: the commitment is ours, not
 * theirs. Naming the reply window, who replies, and the one thing that speeds it
 * up is what stops this page reading as a dead end.
 *
 * TODO: client sign-off — the 2-business-day reply window and the "Adrian reads
 * every inquiry himself" claim are both proposed on his behalf. Confirm before
 * delivery.
 */
export function InquiryCommitment() {
  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <Reveal>
          <div className="bg-brand text-brand-foreground rounded-xl p-8 sm:p-10 lg:p-14">
            <h2 className="font-serif text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]">
              You&rsquo;ll hear back within 2 business days.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 lg:text-lg">
              From a person who has read what you sent — not an autoresponder,
              and not a generic brochure. Here is what that looks like.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:gap-8">
              <Item
                icon={Mail}
                label="First reply"
                value="Within 2 business days"
                detail="An email from the team with first thoughts on your programme and a couple of questions."
              />
              <Item
                icon={CalendarClock}
                label="Discovery call"
                value="30 minutes"
                detail="Booked at your convenience, with whoever owns the outcome on your side."
              />
              <Item
                icon={Phone}
                label="Need it sooner?"
                value="0920 900 7709"
                detail="Call or text and say it's time-sensitive — we'll move it up the queue."
                href="tel:+639209007709"
              />
            </div>

            <p className="mt-8 flex items-start gap-3 text-base leading-relaxed lg:text-lg">
              <Mail className="mt-1 size-5 shrink-0" />
              <span>
                <span className="font-semibold">
                  Nothing else is needed from you right now.
                </span>{" "}
                If anything in your inquiry changes — the headcount, the date,
                the budget holder — just reply to the acknowledgment email and
                we&rsquo;ll work from the new version.
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
