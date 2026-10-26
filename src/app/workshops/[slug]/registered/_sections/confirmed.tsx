"use client"

import { Check } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import { firstNameOf, type WorkshopReceipt } from "@/app/_lib/handoff"
import type { Workshop } from "@/lib/workshops"

const STEPS = [
  {
    label: "Request accepted",
    detail: "The Portal accepted this registration request.",
  },
  {
    label: "Payment instructions",
    detail: "Check the registration email for instructions.",
  },
  {
    label: "Payment review",
    detail: "Reply with proof so the team can confirm funds.",
  },
  {
    label: "Workshop preparation",
    detail: "Check the workshop details and primer below.",
  },
]

export function RegisteredConfirmed({
  workshop,
  receipt,
}: {
  workshop: Workshop
  receipt: WorkshopReceipt | null
}) {
  const firstName = firstNameOf(receipt?.fullName)
  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {receipt && (
            <span className="bg-brand text-brand-foreground flex size-12 items-center justify-center rounded-full">
              <Check className="size-6" strokeWidth={2.5} />
            </span>
          )}
          <h1 className="mt-7 font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] text-balance sm:text-[3.25rem] lg:text-[4rem]">
            {firstName
              ? `Registration accepted, ${firstName}.`
              : receipt
                ? "Registration accepted."
                : "Workshop registration"}
          </h1>
          <p className="text-muted-foreground mt-6 text-lg leading-relaxed text-pretty lg:text-xl">
            {receipt ? (
              <>
                Your request for{" "}
                <span className="text-foreground font-medium">
                  {workshop.title}
                </span>{" "}
                was accepted. This page records that response; it does not show
                current payment status.
              </>
            ) : (
              <>
                There is no accepted registration receipt in this tab. Visit the
                workshop page to register, or contact the team about an existing
                registration.
              </>
            )}
          </p>
        </Reveal>
        {receipt && "reference" in receipt.result && (
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
        )}
        <p className="text-muted-foreground mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed">
          {receipt && "reference" in receipt.result
            ? "Email jobs were queued with acceptance; delivery is not confirmed here. If instructions are missing, check spam or contact the team."
            : receipt
              ? "Your request was accepted. Contact the team if you need help with registration details."
              : "Contact the team if you need help finding an existing registration."}
        </p>
      </div>
    </section>
  )
}
