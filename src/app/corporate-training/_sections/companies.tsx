import { SplitReveal } from "@/app/_components/split-reveal"
import { CompaniesMarquee } from "@/app/_components/companies-marquee"

/**
 * Corporate Training — the logo wall again, framed for a corporate buyer.
 */
export function CorporateCompanies() {
  return (
    <section className="bg-muted/40 overflow-hidden pt-0 pb-24 lg:pb-36">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <SplitReveal className="max-w-3xl font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.75rem]">
          You&rsquo;d be in good company
        </SplitReveal>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed lg:text-xl">
          A sample of the organisations that have run programs with Adrian.
        </p>
      </div>
      <div className="mt-16">
        <CompaniesMarquee />
      </div>
    </section>
  )
}
