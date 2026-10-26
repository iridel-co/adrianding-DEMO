import { SplitReveal } from "@/app/_components/split-reveal"
import { ProgramCarousel } from "@/app/_components/program-carousel"
import { getPublicPrograms } from "@/lib/public-api"

export async function CorporatePrograms() {
  const programs = await getPublicPrograms()
  const CARDS = programs.map((program) => ({
    key: program.slug,
    title: program.title,
    blurb: program.summary,
    usefulFor: program.usefulFor,
    image: program.image?.url ?? null,
    imageAlt: program.image?.alt ?? "",
  }))
  return (
    <section className="bg-muted/40 py-24 lg:py-36">
      <ProgramCarousel
        items={CARDS}
        heading={
          <div className="max-w-2xl">
            <SplitReveal className="font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.5rem]">
              Programs <span className="text-brand">we run in-house</span>
            </SplitReveal>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Coach Adrian&rsquo;s corporate training programmes, delivered
              in-house for your company — at your office or offsite, for one
              team or the whole organisation. Each is tailored to your
              people&rsquo;s roles, industry and goals, drawing on twenty years
              on the training circuit.
              <span className="hidden lg:pointer-fine:inline">
                {" "}
                Hover a programme to see who it&rsquo;s for.
              </span>
            </p>
          </div>
        }
      />
    </section>
  )
}
