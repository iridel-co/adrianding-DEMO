"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/app/_components/reveal"
import {
  firstNameOf,
  readReceipt,
  type CorporateReceipt,
} from "@/app/_lib/handoff"

const STEPS = [
  {
    title: "We review what you sent",
    body: "The programme, team size and timing give the team context for reviewing your request.",
  },
  {
    title: "A call to understand the team",
    body: "A conversation with whoever owns the outcome. What is actually going wrong, what good looks like, and what the room can realistically absorb in a day.",
  },
  {
    title: "A proposal built around it",
    body: "A written programme with the outline, the flow of the day, the reinforcement mechanism and the investment. Built for your team, not lifted off a shelf.",
  },
]

export function InquiryReceived() {
  const [handoff, setHandoff] = useState<CorporateReceipt | null>(null)

  useEffect(() => {
    setHandoff(readReceipt("corporate"))
  }, [])

  const firstName = firstNameOf(handoff?.fullName)
  const company = handoff?.company?.trim()

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Centred to match the workshop confirmation header — the check and the
            headline read as one confirmation mark on a shared axis. */}
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center [overflow-wrap:anywhere]">
          <span className="bg-brand text-brand-foreground flex size-12 items-center justify-center rounded-full">
            {handoff ? <Check className="size-6" strokeWidth={2.5} /> : "?"}
          </span>

          <h1 className="mt-7 max-w-full font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] sm:text-[3.25rem] lg:text-[4rem]">
            {handoff && firstName
              ? `Thanks, ${firstName}. We've got your inquiry.`
              : handoff
                ? "Thanks — we've got your inquiry."
                : "Your corporate training inquiry"}
          </h1>

          <p className="text-muted-foreground mt-6 text-lg leading-relaxed lg:text-xl">
            {handoff ? (
              <>
                Your inquiry was saved{company ? ` for ${company}` : ""}.
                Requester and team email jobs were queued; delivery is not
                confirmed here.
              </>
            ) : (
              <>
                No accepted inquiry receipt is available in this tab. Return to
                the inquiry form to send your request.
              </>
            )}
          </p>
          <Button asChild variant="brand" size="lg" className="mt-8">
            <Link href="/">
              <ArrowLeft aria-hidden />
              Back to home
            </Link>
          </Button>
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
