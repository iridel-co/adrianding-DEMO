import { Play } from "lucide-react"

export function PrimerPlayer({
  title,
  blurb,
  videoUrl,
  className = "",
}: {
  title: string
  blurb: string
  videoUrl?: string | null
  className?: string
}) {
  let url: URL | null = null
  try {
    url = videoUrl ? new URL(videoUrl) : null
  } catch {
    url = null
  }
  if (url && url.protocol !== "https:" && url.protocol !== "http:") url = null
  const youtube =
    url?.hostname === "youtu.be"
      ? url.pathname.slice(1)
      : url && /(^|\.)youtube\.com$/.test(url.hostname)
        ? (url.searchParams.get("v") ?? url.pathname.split("/embed/")[1])
        : null
  const vimeo =
    url && /(^|\.)vimeo\.com$/.test(url.hostname)
      ? url.pathname.split("/").filter(Boolean).pop()
      : null
  const embed =
    youtube && /^[\w-]+$/.test(youtube)
      ? `https://www.youtube-nocookie.com/embed/${youtube}`
      : vimeo && /^\d+$/.test(vimeo)
        ? `https://player.vimeo.com/video/${vimeo}`
        : null
  return (
    <figure className={className}>
      <div className="ring-border/70 relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-neutral-950 ring-1">
        {embed ? (
          <iframe
            src={embed}
            title={title}
            loading="lazy"
            allow="fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : url && /\.(mp4|webm|ogg)$/i.test(url.pathname) ? (
          <video
            src={url.href}
            controls
            preload="none"
            aria-label={title}
            className="absolute inset-0 size-full"
          />
        ) : (
          <>
            <div
              aria-hidden
              className="absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(120% 100% at 50% 110%, oklch(0.4331 0.1689 29.22 / 0.55) 0%, transparent 62%)",
              }}
            />
            <div className="relative flex flex-col items-center gap-4 px-6 text-center">
              {url ? (
                <a
                  href={url.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Watch ${title}`}
                  className="ring-brand/40 bg-brand/25 flex size-16 items-center justify-center rounded-full text-white ring-1 backdrop-blur-sm"
                >
                  <Play className="size-6 translate-x-0.5 fill-current" />
                </a>
              ) : (
                <span
                  aria-hidden
                  className="ring-brand/40 bg-brand/25 flex size-16 items-center justify-center rounded-full text-white ring-1 backdrop-blur-sm"
                >
                  <Play className="size-6 translate-x-0.5 fill-current" />
                </span>
              )}
              <span className="font-serif text-xl text-white sm:text-2xl">
                {title}
              </span>
              <span className="text-xs text-white/55">
                {url ? "Watch the primer video" : "Primer video unavailable"}
              </span>
            </div>
          </>
        )}
      </div>
      <figcaption className="text-muted-foreground mt-3 text-sm leading-relaxed">
        {blurb}
      </figcaption>
    </figure>
  )
}
