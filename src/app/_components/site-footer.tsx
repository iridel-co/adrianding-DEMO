import { getPublicProfile } from "@/lib/public-api"
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
  // Demo-review route: the three transactional email templates, for the client
  // to sign off on before the send wiring is built in phase 2.
  { href: "/email-templates", label: "Email templates" },
]

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: TikTokIcon,
}
const SOCIAL_LABELS = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
}

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

export async function SiteFooter() {
  const profile = await getPublicProfile()
  const socials = profile.socialLinks.filter((link) =>
    /^https?:\/\//i.test(link.url)
  )
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
              {profile.shortBio}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3 md:justify-start">
              {socials.map(({ network, url }) => {
                const Icon = SOCIAL_ICONS[network]
                const label = SOCIAL_LABELS[network]
                return (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`hover:text-brand hover:border-brand/40 flex ${network === "tiktok" ? "size-9" : "size-11"} items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors`}
                  >
                    <Icon className="size-4" />
                  </a>
                )
              })}
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
            {profile.emails.map((email) => {
              const at = email.lastIndexOf("@")
              const dot = email.lastIndexOf(".")
              return (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 text-sm text-white/60 transition-colors hover:text-white sm:text-[0.9375rem]"
                >
                  <Mail className="size-5 shrink-0" />
                  <span className="sm:hidden">
                    {at > 0 ? (
                      <>
                        {email.slice(0, at)}
                        <br />
                        {email.slice(at, dot > at ? dot : undefined)}
                        {dot > at && (
                          <>
                            <br />
                            {email.slice(dot)}
                          </>
                        )}
                      </>
                    ) : (
                      email
                    )}
                  </span>
                  <span className="hidden break-all sm:inline">{email}</span>
                </a>
              )
            })}
            {profile.phone && (
              <a
                href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2.5 text-sm text-white/60 transition-colors hover:text-white sm:text-lg"
              >
                <Phone className="size-5 shrink-0" />
                {profile.phone}
              </a>
            )}
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
