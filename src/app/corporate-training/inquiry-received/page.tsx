import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SupportBand } from "@/app/_components/support-band"
import { InquiryReceived } from "./_sections/received"
import { InquiryCommitment } from "./_sections/commitment"
import { InquirySummary } from "./_sections/summary"
import { InquiryCredibility } from "./_sections/credibility"

export const metadata: Metadata = {
  title: "Corporate training inquiry — Coach Adrian Ding",
  description: "Corporate training inquiry details and contact information.",
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
        <InquiryCredibility />
        <SupportBand
          heading="Need to reach us sooner?"
          blurb="Contact the team to discuss your programme or clarify your inquiry."
        />
      </main>
      <SiteFooter />
    </>
  )
}
