import { Counter } from "@/app/_components/counter"
import { Reveal } from "@/app/_components/reveal"

/**
 * Corporate Training — the case, tied to the numbers. Flows directly off the
 * intro (no hard divider). Three stats in a row, no header.
 */

const POINTS = [
  {
    value: 20000,
    suffix: "+",
    label: "professionals trained",
    body: "Two decades of rooms — from frontline supervisors to executive teams.",
  },
  {
    value: 500,
    prefix: "Top ",
    label: "PH companies",
    body: "Multinationals, banks, hospitals, retailers and family businesses.",
  },
  {
    value: 30,
    suffix: "-day",
    label: "reinforcement",
    body: "Every program includes a follow-through mechanism so the change sticks.",
  },
]

export function CorporateWhy() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-20 pb-24 sm:px-8 sm:pt-24 lg:pt-32 lg:pb-36">
      <Reveal stagger={0.12} className="grid gap-12 sm:grid-cols-3">
        {POINTS.map((p) => (
          <div key={p.label}>
            <p className="text-brand text-5xl font-semibold tracking-[-0.02em] lg:text-6xl">
              <Counter to={p.value} prefix={p.prefix} suffix={p.suffix} />
            </p>
            <p className="text-foreground mt-3 text-sm font-semibold tracking-[0.08em] uppercase">
              {p.label}
            </p>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {p.body}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
