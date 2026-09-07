import { CalendarDays, Check, MapPin, Tag } from "lucide-react"
import { Countdown } from "@/app/_components/countdown"
import { PrimerPlayer } from "@/app/_components/primer-player"
import { TrustLogos } from "@/app/_components/trust-logos"
import { Button } from "@/components/ui/button"
import type { Workshop } from "@/lib/workshops"
import { RegistrationDialog } from "./registration-dialog"

/**
 * Workshop detail — the substance directly under the hero.
 *
 * The backlink, problem line and title live in `hero.tsx` now; this section
 * picks up at the intro paragraph so nothing is stated twice. Outcomes,
 * schedule/venue/price, the register rail with its countdown and scarcity line,
 * the primer slot and the client-logo strip all sit here, so the page stands on
 * its own for a visitor who arrived from an ad and will never see another page.
 */
export function WorkshopOverview({ workshop }: { workshop: Workshop }) {
  const isOpen = workshop.status === "open"
  const nearlyFull = workshop.seatsLeft > 0 && workshop.seatsLeft <= 12

  return (
    <section className="mx-auto max-w-5xl px-6 pt-16 pb-16 sm:px-8 lg:pt-24 lg:pb-24">
      <p className="max-w-2xl text-xl leading-[1.4] text-balance sm:text-2xl lg:text-[1.75rem]">
        {workshop.intro}
      </p>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <div className="flex-1">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase">
            You leave able to
          </h2>
          <ul className="mt-5 space-y-3">
            {workshop.outcomes.map((o) => (
              <li key={o} className="flex gap-3">
                <Check className="text-brand mt-1 size-4 shrink-0" />
                <span className="leading-relaxed">{o}</span>
              </li>
            ))}
          </ul>

          <dl className="border-border/60 mt-9 flex flex-col gap-6 border-t pt-8">
            <Meta icon={CalendarDays} label="When" value={workshop.schedule} />
            <Meta
              icon={MapPin}
              label="Where"
              value={`${workshop.venue}, ${workshop.city}`}
            />
            <Meta icon={Tag} label="Investment" value={workshop.price} />
          </dl>
        </div>

        {isOpen && (
          <aside className="bg-muted/40 w-full shrink-0 rounded-lg p-6 lg:max-w-xs">
            <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
              Starts in
            </p>
            <div className="mt-3">
              <Countdown target={workshop.start} />
            </div>

            {workshop.seatsLeft > 0 && (
              <p
                className={`mt-6 text-sm font-medium ${
                  nearlyFull ? "text-brand" : "text-foreground/80"
                }`}
              >
                {workshop.seatsLeft} of {workshop.seatsTotal} seats left
                {nearlyFull ? " — this date is filling up" : ""}
              </p>
            )}

            <RegistrationDialog
              slug={workshop.slug}
              workshopTitle={workshop.title}
              schedule={workshop.schedule}
              venue={`${workshop.venue}, ${workshop.city}`}
            >
              <Button variant="brand" size="lg" className="mt-5 w-full">
                Reserve your seat
              </Button>
            </RegistrationDialog>

            <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
              No payment on this page. Register first — we email you the payment
              details and hold your seat for 48 hours.
            </p>
          </aside>
        )}
      </div>

      <PrimerPlayer
        title={workshop.title}
        blurb={workshop.primerBlurb}
        className="mt-14"
      />

      <TrustLogos className="mt-14" />
    </section>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="text-foreground mt-1.5 text-sm font-medium">{value}</dd>
    </div>
  )
}
