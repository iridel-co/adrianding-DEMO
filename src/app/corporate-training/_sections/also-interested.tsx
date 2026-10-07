"use client"
import { useId } from "react"
import { Check } from "lucide-react"
import { CORPORATE_PROGRAMMES } from "@/lib/specializations"
import { cn } from "@/lib/utils"
// "Also interested in" tiles (2026-09-24). Selected = filled brand + white
// check badge + slight scale + brand glow. The border AND the glow change
// together with the fill on hover in both states (memory rule).
const TILE_BASE =
  "relative flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm font-medium select-none transition-[background-color,border-color,box-shadow,color,scale] duration-200 ease-out motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
const TILE_OFF =
  "border-input bg-background text-foreground shadow-sm shadow-black/5 hover:border-brand/60 hover:bg-brand/5 hover:shadow-md hover:shadow-brand/15"
const TILE_ON =
  "border-brand bg-brand text-brand-foreground scale-[1.02] shadow-lg shadow-brand/35 hover:border-brand-accent hover:bg-brand-accent hover:shadow-brand-accent/45"
const TILE_ICON_BASE =
  "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors duration-200 motion-reduce:transition-none"
const TILE_ICON_OFF = "bg-brand/10 text-brand"
const TILE_ICON_ON = "bg-white/15 text-brand-foreground"
const TILE_CHECK_BASE =
  "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors duration-200 motion-reduce:transition-none"
const TILE_CHECK_OFF = "border-input border text-transparent"
const TILE_CHECK_ON = "bg-background text-brand"

export function AlsoInterested({
  primary,
  selected,
  onToggle,
}: {
  primary: string
  selected: string[]
  onToggle: (title: string) => void
}) {
  const helpId = useId()
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm leading-none font-medium">
        Also interested in (optional)
      </legend>
      <p id={helpId} className="text-muted-foreground mt-2 mb-3 text-xs">
        Tick any others you&rsquo;d like the proposal to cover.
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {CORPORATE_PROGRAMMES.filter((p) => p.title !== primary).map((p) => {
          const on = selected.includes(p.title)
          const Icon = p.icon
          return (
            <label
              key={p.key}
              className={cn(TILE_BASE, on ? TILE_ON : TILE_OFF)}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={on}
                onChange={() => onToggle(p.title)}
                aria-describedby={helpId}
              />
              <span
                className={cn(
                  TILE_ICON_BASE,
                  on ? TILE_ICON_ON : TILE_ICON_OFF
                )}
              >
                <Icon className="size-[1.125rem]" aria-hidden />
              </span>
              <span className="flex-1 leading-snug">{p.title}</span>
              <span
                aria-hidden
                className={cn(
                  TILE_CHECK_BASE,
                  on ? TILE_CHECK_ON : TILE_CHECK_OFF
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
