import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SupportBand } from "@/app/_components/support-band"
import { getPublicProfile, getPublicWorkshop } from "@/lib/public-api"
import { workshopView } from "@/lib/workshop-view"
import { RegisteredReceipt } from "./_sections/receipt"

export const metadata = {
  title: "Workshop registration — Coach Adrian Ding",
  robots: { index: false, follow: false },
}
export default async function WorkshopRegisteredPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [content, profile] = await Promise.all([
    getPublicWorkshop(slug),
    getPublicProfile(),
  ])
  const workshop = workshopView(content, profile.phone)
  return (
    <>
      <SiteNavbar />
      <main>
        <RegisteredReceipt workshop={workshop} />
        <SupportBand
          heading="Questions about your registration?"
          blurb="Contact the team for registration and payment questions."
        />
      </main>
      <SiteFooter />
    </>
  )
}
