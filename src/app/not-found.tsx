import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Page not found — Coach Adrian Ding",
  robots: { index: false, follow: false },
}

/* Any unknown URL, or a workshop that no longer exists. Same look as the
   "no receipt" state on the thank-you pages, with a way back in. */
export default function NotFound() {
  return (
    <>
      <SiteNavbar />
      <main>
        <section className="bg-muted/40 py-24 lg:py-36">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center sm:px-8">
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
              404
            </p>
            <h1 className="mt-5 font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] text-balance sm:text-[3.25rem] lg:text-[4rem]">
              This page isn&rsquo;t here.
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed text-pretty lg:text-xl">
              The link may be old, or the workshop may have ended. Try the
              upcoming workshops or head back home.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="brand" size="lg">
                <Link href="/">
                  <ArrowLeft aria-hidden />
                  Back to home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/workshops">See workshops</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
