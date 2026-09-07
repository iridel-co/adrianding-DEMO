import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SupportBand } from "@/app/_components/support-band"
import { WORKSHOPS, getWorkshop } from "@/lib/workshops"
import { RegisteredConfirmed } from "./_sections/confirmed"
import { RegisteredPayment } from "./_sections/payment"
import { RegisteredPrimer } from "./_sections/primer"
import { RegisteredExpect } from "./_sections/expect"

/**
 * Post-registration destination for a workshop. AD's complaint was that the
 * form ended in an inline "done" state and the visitor was left with nothing to
 * do — this is the page version of the confirmation email: what happens next,
 * how to pay (the block that carries the urgency), the primer video, and the
 * details they'd otherwise have to scroll back to find.
 *
 * `noindex` — it is a private destination, not a landing page, and it renders
 * personalised copy from the form handoff when one exists.
 */

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return WORKSHOPS.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const w = getWorkshop(slug)
  if (!w)
    return {
      title: "Workshop not found",
      robots: { index: false, follow: false },
    }
  return {
    title: `You're registered — ${w.title} · Coach Adrian Ding`,
    description: `Next steps for your seat at ${w.title}, ${w.schedule}.`,
    robots: { index: false, follow: false },
  }
}

export default async function WorkshopRegisteredPage({ params }: Params) {
  const { slug } = await params
  const workshop = getWorkshop(slug)
  if (!workshop) notFound()

  return (
    <>
      <SiteNavbar />
      <main>
        <RegisteredConfirmed workshop={workshop} />
        <RegisteredPayment workshop={workshop} />
        <RegisteredPrimer workshop={workshop} />
        <RegisteredExpect workshop={workshop} />
        <SupportBand
          heading="Questions about your registration?"
          blurb="Payment, invoicing, a name change on the seat — reach the team directly and we'll sort it the same working day."
        />
      </main>
      <SiteFooter />
    </>
  )
}
