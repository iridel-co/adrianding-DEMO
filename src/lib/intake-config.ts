import "server-only"
import type { IntakeConfig } from "./intake"

export function getIntakeConfig(): IntakeConfig {
  let origin = ""
  try {
    const url = new URL(process.env.PORTAL_API_URL ?? "")
    if (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
      origin = url.origin
  } catch {
    /* Missing configuration leaves intake disabled. */
  }
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
  const turnstileEnabled = process.env.TURNSTILE_ENABLED !== "false"
  return {
    origin,
    siteKey,
    turnstileEnabled,
    enabled: Boolean(origin && (!turnstileEnabled || siteKey.trim())),
  }
}
