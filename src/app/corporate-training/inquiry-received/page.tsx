import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SupportBand } from "@/app/_components/support-band"
import { InquiryReceived } from "./_sections/received"
import { InquiryCommitment } from "./_sections/commitment"
import { InquirySummary } from "./_sections/summary"
import { InquiryPrimer } from "./_sections/primer"
import { InquiryCredibility } from "./_sections/credibility"

/**
 * Post-inquiry destination for corporate training. A corporate lead is a long
 * sales cycle, so this page does the job the old inline "sent" state could not:
 * sets the reply expectation, plays back what was submitted so the sender can
 * see nothing was lost, explains how a programme gets built, and re-states the
 * credibility that made them enquire.
 *
 * `noindex` — private destination, personalised from the form handoff.
 */

export const metadata: Metadata = {
  title: "Inquiry received — Coach Adrian Ding",
  description:
    "We have your corporate training inquiry. Here's what happens next and how a Maximum Impact programme gets built.",
  robots: { index: false, follow: false },
}

export default function InquiryReceivedPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <InquiryReceived />
        {/* The reply commitment on full brand ground — the corporate mirror of
            the workshop confirmation's payment block. */}
        <InquiryCommitment />
        <InquirySummary />
        <InquiryPrimer />
        <InquiryCredibility />
        <SupportBand
          heading="Need to reach us sooner?"
          blurb="If the timeline is tight or a board date is driving it, call or text — we'll move the conversation forward today rather than wait on email."
        />
      </main>
      <SiteFooter />
    </>
  )
}
