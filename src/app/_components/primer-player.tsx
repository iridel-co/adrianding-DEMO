import { Play } from "lucide-react"

/**
 * Primer-video slot, shown on workshop detail pages and on both confirmation
 * pages. There is no video yet — the client supplies one per course — so this is
 * a deliberately styled poster frame rather than an empty grey box: it has to
 * read as "a video sits here" in a demo AD is judging, not as an oversight.
 *
 * Swap the inner frame for an `<iframe>` when the real embed URLs land; the
 * caption, aspect box and note stay as-is.
 */
export function PrimerPlayer({
  title,
  blurb,
  className = "",
}: {
  title: string
  blurb: string
  className?: string
}) {
  return (
    <figure className={className}>
      <div className="ring-border/70 relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-neutral-950 ring-1">
        {/* Soft brand wash so the frame reads as art-directed, not as an empty well. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 110%, oklch(0.4331 0.1689 29.22 / 0.55) 0%, transparent 62%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-4 px-6 text-center">
          <span className="ring-brand/40 bg-brand/25 flex size-16 items-center justify-center rounded-full text-white ring-1 backdrop-blur-sm">
            <Play className="size-6 translate-x-0.5 fill-current" />
          </span>
          <span className="font-serif text-xl text-white sm:text-2xl">
            {title}
          </span>
          <span className="text-xs text-white/55">
            Primer video — the client&rsquo;s recording drops in here
          </span>
        </div>
      </div>
      <figcaption className="text-muted-foreground mt-3 text-sm leading-relaxed">
        {blurb}
      </figcaption>
    </figure>
  )
}
