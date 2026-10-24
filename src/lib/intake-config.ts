import "server-only"
import type { IntakeConfig, IntakeKind } from "./intake"

export function getIntakeConfig(kind: IntakeKind): IntakeConfig {
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
  const flag =
    kind === "registration"
      ? process.env.WORKSHOP_INTAKE_ENABLED
      : process.env.CORPORATE_INTAKE_ENABLED
  return {
    origin,
    siteKey,
    enabled: flag === "true" && Boolean(origin && siteKey),
  }
}
