import { Banknote, Mail } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import type { WorkshopReceipt } from "@/app/_lib/handoff"
import type { Workshop } from "@/lib/workshops"

export function RegisteredPayment({
  workshop,
  receipt,
}: {
  workshop: Workshop
  receipt: WorkshopReceipt
}) {
  if (!("reference" in receipt.result)) return null
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <Reveal>
          <div className="bg-brand text-brand-foreground rounded-xl p-8 sm:p-10 lg:p-14">
            <h2 className="font-serif text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]">
              Check your email for payment instructions.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 lg:text-lg">
              Use the reference issued for this registration. Payment
              instructions and QR codes come from the team's email.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
              <div>
                <p className="text-xs tracking-[0.14em] text-white/60 uppercase">
                  Investment
                </p>
                <p className="mt-1.5 text-2xl font-semibold tracking-[-0.01em] lg:text-3xl">
                  {workshop.price}
                </p>
              </div>
              <div>
                <p className="text-xs tracking-[0.14em] text-white/60 uppercase">
                  Payment at registration
                </p>
                <p className="mt-1.5 text-2xl font-semibold tracking-[-0.01em] lg:text-3xl">
                  Unpaid
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
              <div className="min-w-0 rounded-lg bg-black/15 p-6 lg:p-8">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Banknote className="size-4" />
                  Registration reference
                </p>
                <dl className="mt-5 flex flex-col gap-4">
                  <div>
                    <dt className="text-xs tracking-[0.1em] text-white/55 uppercase">
                      Reference
                    </dt>
                    <dd className="mt-1 text-sm font-medium break-all">
                      {receipt.result.reference}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg bg-black/15 p-6 text-center lg:p-8">
                <p className="text-sm text-white/70">
                  Already paid? Contact the team to confirm your payment.
                </p>
              </div>
            </div>
            <p className="mt-8 flex items-start gap-3 text-base leading-relaxed lg:text-lg">
              <Mail className="mt-1 size-5 shrink-0" />
              <span>
                Reply to your registration email with proof of payment. The team
                will check your payment.
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
