import Link from "next/link"
import {
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Mail,
  Phone,
} from "lucide-react"

/**
 * Global footer — used on every page including the landing page. Carries the
 * standing "Demo by iridel.com" credit (Iridel lessons 2026-07-16).
 */

const NAV = [
  { href: "/workshops", label: "Workshops" },
  { href: "/corporate-training", label: "Corporate Training" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  // Demo-review route: the three transactional email templates, for the client
  // to sign off on before the send wiring is built in phase 2.
  { href: "/email-templates", label: "Email templates" },
]

// Kept in step with the hero's own SOCIALS (hero-editorial.tsx) — same five
// platforms in both places.
const SOCIALS = [
  {
    href: "https://www.instagram.com/coachadrianding/?hl=en",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.facebook.com/adrianding.mi/",
    label: "Facebook",
    Icon: Facebook,
  },
  {
    href: "https://ph.linkedin.com/in/coachadrianding",
    label: "LinkedIn",
    Icon: Linkedin,
  },
  {
    href: "https://www.youtube.com/channel/UCugWqssJknpyGE0k-jexhfA",
    label: "YouTube",
    Icon: Youtube,
  },
]

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M16.5 3c.3 2 1.5 3.6 3.5 3.9v2.7c-1.3.1-2.5-.2-3.6-.8v6.6c0 3.4-2.6 5.6-5.7 5.6A5.5 5.5 0 0 1 5 12.9c1-.7 2.2-1.1 3.5-1v2.9a2.7 2.7 0 0 0-1.2-.1 2.6 2.6 0 0 0 .5 5.1c1.5 0 2.8-1.2 2.8-3V3h3.9Z" />
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer
      data-navbar-theme="dark"
      className="overflow-hidden bg-black text-white/70"
    >
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="max-w-sm leading-relaxed text-white/50">
              Leadership development, corporate training and keynotes from the
              CEO of Maximum Impact PH. 20+ years, 20,000+ leaders trained.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3 md:justify-start">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:text-brand hover:border-brand/40 flex size-11 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
              <a
                href="https://www.tiktok.com/@coachadrianding"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:text-brand hover:border-brand/40 flex size-9 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors"
              >
                <TikTokIcon className="size-4" />
              </a>
            </div>
          </div>

          {/* Quick nav */}
          <nav aria-label="Footer" className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">
              Explore
            </p>
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="w-fit text-sm text-white/60 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">
              Contact
            </p>
            <a
              href="mailto:coachadrianding@maximumimpact.online"
              className="flex items-center gap-2.5 text-sm text-white/60 transition-colors hover:text-white sm:text-[0.9375rem]"
            >
              <Mail className="size-5 shrink-0" />
              {/* Clean, natural breaks on mobile instead of `break-all`
                  chopping mid-word wherever it happens to run out of room;
                  `sm:` and up keep the original single unbroken line. */}
              <span className="sm:hidden">
                coachadrianding
                <br />
                @maximumimpact
                <br />
                .online
              </span>
              <span className="hidden break-all sm:inline">
                coachadrianding@maximumimpact.online
              </span>
            </a>
            <a
              href="mailto:maximumimpactphilippines@yahoo.com"
              className="flex items-center gap-2.5 text-sm break-all text-white/60 transition-colors hover:text-white sm:text-[0.9375rem]"
            >
              <Mail className="size-5 shrink-0" />
              maximumimpactphilippines@yahoo.com
            </a>
            <a
              href="tel:+639209007709"
              className="flex items-center gap-2.5 text-sm text-white/60 transition-colors hover:text-white sm:text-lg"
            >
              <Phone className="size-5 shrink-0" />
              0920 900 7709
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-center sm:flex-row sm:items-center sm:text-left lg:mt-14">
          <p className="text-xs text-white/55">
            © {new Date().getFullYear()} Coach Adrian Ding · Maximum Impact PH.
            All rights reserved.
          </p>
          <a
            href="https://iridel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/55 transition-colors hover:text-white/80"
          >
            Demo by iridel.com
          </a>
        </div>
      </div>

      {/* Fit the wordmark width while retaining the intentional baseline crop
          on the Ding descender at both mobile and desktop sizes. */}
      <div aria-hidden className="w-full overflow-hidden select-none">
        <p
          className="-mb-[0.25em] hidden w-full text-center font-serif leading-[1.08] whitespace-nowrap text-white sm:block"
          style={{ fontSize: "clamp(90px, 17.5vw, 320px)" }}
        >
          Adrian Ding
        </p>
        <div className="[container-type:inline-size] flex w-full flex-col items-center px-2 text-center font-serif whitespace-nowrap text-white sm:hidden">
          <p className="leading-[1.08]" style={{ fontSize: "32.5cqw" }}>
            Adrian
          </p>
          {/* Optical centering leaves the g terminal inside the right edge;
              only its descender is cropped by the outer wrapper. */}
          <p
            className="-mt-[0.08em] mr-[0.037em] -mb-[0.22em] leading-[1.08]"
            style={{ fontSize: "46cqw" }}
          >
            Ding
          </p>
        </div>
      </div>
    </footer>
  )
}
