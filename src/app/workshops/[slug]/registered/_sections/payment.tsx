import { WorkshopAvailabilityText } from "@/app/_components/workshop-availability-text"
import { Banknote, Mail, QrCode } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import type { Workshop } from "@/lib/workshops"

/**
 * The urgency block — deliberately the loudest thing on the page.
 *
 * AD's complaint was that registration ended in a dead "done" state, so nothing
 * ever pushed the visitor to actually pay. A held seat with a stated expiry and
 * a visible seat count is the only mechanism this page has; it gets the full
 * brand ground so it cannot be scrolled past.
 *
 * TODO: client sign-off — the 48-hour hold window is a proposed policy, not a
 * confirmed one. Confirm before delivery, or soften the copy.
 * TODO: bank account name/number and the GCash QR image are placeholders. No
 * real details exist yet; swap them in and delete the placeholder styling.
 */

export function RegisteredPayment({ workshop }: { workshop: Workshop }) {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <Reveal>
          <div className="bg-brand text-brand-foreground rounded-xl p-8 sm:p-10 lg:p-14">
            <h2 className="font-serif text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]">
              Your seat is held for 48 hours.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 lg:text-lg">
              The demo illustrates the proposed payment window. Send payment and
              reply with the proof to make it permanent.
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
                  Remaining
                </p>
                {/* TODO: seat counts are CMS-managed in the real build. */}
                <p className="mt-1.5 text-2xl font-semibold tracking-[-0.01em] lg:text-3xl">
                  <WorkshopAvailabilityText
                    workshop={workshop}
                    onDark
                    className="font-normal"
                  />
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
              <div className="min-w-0 rounded-lg bg-black/15 p-6 lg:p-8">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Banknote className="size-4" />
                  Bank transfer
                </p>
                <dl className="mt-5 flex flex-col gap-4">
                  <div>
                    <dt className="text-xs tracking-[0.1em] text-white/55 uppercase">
                      Account name
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      Maximum Impact Training &amp; Consultancy
                      <span className="ml-2 rounded-sm bg-white/15 px-1.5 py-0.5 text-[0.6875rem] tracking-[0.08em] text-white/75 uppercase">
                        Placeholder
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-[0.1em] text-white/55 uppercase">
                      Bank &amp; account number
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      Bank name · 0000 0000 0000
                      <span className="ml-2 rounded-sm bg-white/15 px-1.5 py-0.5 text-[0.6875rem] tracking-[0.08em] text-white/75 uppercase">
                        Placeholder
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-[0.1em] text-white/55 uppercase">
                      Reference
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      Your full name + {workshop.title}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg bg-black/15 p-6 text-center lg:p-8">
                <div className="flex aspect-square w-full max-w-[190px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-white/30 bg-white/5">
                  <QrCode className="size-9 text-white/60" />
                  <span className="px-4 text-[0.6875rem] leading-snug tracking-[0.08em] text-white/60 uppercase">
                    GCash QR — placeholder
                  </span>
                </div>
                <p className="mt-4 text-sm text-white/70">
                  Scan to pay by e-wallet. Same reference, same proof.
                </p>
              </div>
            </div>

            <p className="mt-8 flex items-start gap-3 text-base leading-relaxed lg:text-lg">
              <Mail className="mt-1 size-5 shrink-0" />
              <span>
                <span className="font-semibold">
                  Reply to your confirmation email with a photo or screenshot of
                  the payment.
                </span>{" "}
                That reply is what turns the hold into a confirmed seat — we
                answer every one the same working day.
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
