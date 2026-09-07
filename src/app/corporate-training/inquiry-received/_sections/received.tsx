"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import {
  firstNameOf,
  readHandoff,
  type CorporateHandoff,
} from "@/app/_lib/handoff"

/**
 * Confirmation header and the three steps that follow an inquiry.
 *
 * The handoff is read in an effect, not during render — SSR has no
 * `sessionStorage`, and branching the first client render on it would
 * hydration-mismatch. Everything here reads correctly with no handoff at all;
 * only the greeting and the company name are personalised.
 *
 * The reply-window promise used to sit here as a coloured line; it now carries
 * the full brand-ground block in `commitment.tsx` directly below, matching the
 * workshop confirmation's payment block. A corporate enquirer's real question
 * after submitting is "when will I hear back", and it deserves the loudest
 * treatment on the page rather than a sentence in a paragraph stack.
 */

const STEPS = [
  {
    title: "We review what you sent",
    body: "Adrian reads every inquiry himself — the programme, the team size and the timing, against what has worked for teams in the same position.",
  },
  {
    title: "A call to understand the team",
    body: "A short call, usually 30 minutes, with whoever owns the outcome. What is actually going wrong, what good looks like, and what the room can realistically absorb in a day.",
  },
  {
    title: "A proposal built around it",
    body: "A written programme with the outline, the flow of the day, the reinforcement mechanism and the investment. Built for your team, not lifted off a shelf.",
  },
]

export function InquiryReceived() {
  const [handoff, setHandoff] = useState<CorporateHandoff | null>(null)

  useEffect(() => {
    setHandoff(readHandoff("corporate"))
  }, [])

  const firstName = firstNameOf(handoff?.fullName)
  const company = handoff?.company?.trim()

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Centred to match the workshop confirmation header — the check and the
            headline read as one confirmation mark on a shared axis. */}
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="bg-brand text-brand-foreground flex size-12 items-center justify-center rounded-full">
            <Check className="size-6" strokeWidth={2.5} />
          </span>

          <h1 className="mt-7 font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] sm:text-[3.25rem] lg:text-[4rem]">
            {firstName
              ? `Thanks, ${firstName}. We've got your inquiry.`
              : "Thanks — we've got your inquiry."}
          </h1>

          <p className="text-muted-foreground mt-6 text-lg leading-relaxed lg:text-xl">
            {company ? (
              <>
                It is with Adrian and the team now, and we&rsquo;re already
                looking at what has worked for teams the size of{" "}
                <span className="text-foreground font-medium">{company}</span>.
              </>
            ) : (
              <>
                It is with Adrian and the team now, and we&rsquo;re already
                looking at what has worked for teams in the same position.
              </>
            )}
          </p>
        </Reveal>

        <Reveal
          stagger={0.1}
          className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-3 lg:gap-12"
        >
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <div className="flex items-center gap-3">
                <span className="bg-brand text-brand-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {i + 1}
                </span>
                <span aria-hidden className="bg-border h-px flex-1" />
              </div>
              <h2 className="mt-5 font-serif text-xl tracking-[-0.01em] sm:text-2xl">
                {step.title}
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
