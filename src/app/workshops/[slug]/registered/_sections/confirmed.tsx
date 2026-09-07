"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import {
  firstNameOf,
  readHandoff,
  type WorkshopHandoff,
} from "@/app/_lib/handoff"
import type { Workshop } from "@/lib/workshops"

/**
 * Confirmation header + the process made visible.
 *
 * The handoff only exists for someone who just submitted the form in this tab,
 * so it is read in an effect (never during render — SSR has no
 * `sessionStorage`, and branching the first client render on it would
 * hydration-mismatch). Until it resolves, and forever on a direct visit, the
 * generic copy stands on its own: the page must never read as broken or
 * half-filled.
 *
 * The four steps are AD's actual process — register, pay, we confirm, primer
 * lands. Showing it as a tracker is the whole point of the page: the visitor
 * knows exactly where they are and what is owed next.
 */

const STEPS = [
  {
    label: "Registered",
    detail: "Your details are in. This step is done.",
  },
  {
    label: "You send payment",
    detail: "Bank transfer, then reply with the proof.",
  },
  {
    label: "We confirm it",
    detail: "We reply to lock the seat in your name.",
  },
  {
    label: "Primer email",
    detail: "Prep notes and the venue map, a week out.",
  },
]

export function RegisteredConfirmed({ workshop }: { workshop: Workshop }) {
  const [handoff, setHandoff] = useState<WorkshopHandoff | null>(null)

  useEffect(() => {
    setHandoff(readHandoff("workshop"))
  }, [])

  const firstName = firstNameOf(handoff?.fullName)
  const email = handoff?.email?.trim()

  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Centred: this is a moment, not a document — the check and the
            headline read as a single confirmation mark when they share an axis.
            The tracker below stays left-aligned in its columns. */}
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="bg-brand text-brand-foreground flex size-12 items-center justify-center rounded-full">
            <Check className="size-6" strokeWidth={2.5} />
          </span>

          <h1 className="mt-7 font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] text-balance sm:text-[3.25rem] lg:text-[4rem]">
            {firstName
              ? `You're on the list, ${firstName}.`
              : "You're on the list."}
          </h1>

          <p className="text-muted-foreground mt-6 text-lg leading-relaxed text-pretty lg:text-xl">
            Your place at{" "}
            <span className="text-foreground font-medium">
              {workshop.title}
            </span>{" "}
            — {workshop.schedule} at {workshop.venue}, {workshop.city} — is held
            while we wait on payment. Here is exactly what happens between now
            and the day.
          </p>
        </Reveal>

        <Reveal
          stagger={0.08}
          className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6"
        >
          {STEPS.map((step, i) => {
            const done = i === 0
            return (
              <div key={step.label}>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      done
                        ? "bg-brand text-brand-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                        : "bg-background text-muted-foreground ring-border/70 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1"
                    }
                  >
                    {done ? (
                      <Check className="size-4" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    aria-hidden
                    className={
                      done ? "bg-brand h-px flex-1" : "bg-border h-px flex-1"
                    }
                  />
                </div>
                <p
                  className={
                    done
                      ? "text-foreground mt-4 text-sm font-semibold tracking-[0.08em] uppercase"
                      : "text-muted-foreground mt-4 text-sm font-semibold tracking-[0.08em] uppercase"
                  }
                >
                  {step.label}
                </p>
                <p
                  className={
                    done
                      ? "text-muted-foreground mt-2 text-sm leading-relaxed"
                      : "text-muted-foreground/70 mt-2 text-sm leading-relaxed"
                  }
                >
                  {step.detail}
                </p>
              </div>
            )
          })}
        </Reveal>

        <p className="text-muted-foreground mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed">
          {email ? (
            <>
              A confirmation email is on its way to{" "}
              <span className="text-foreground font-medium break-all">
                {email}
              </span>
              . If it has not arrived within an hour, check your spam folder —
              then call us.
            </>
          ) : (
            <>
              A confirmation email is on its way to the address you registered
              with. If it has not arrived within an hour, check your spam folder
              — then call us.
            </>
          )}
        </p>
      </div>
    </section>
  )
}
