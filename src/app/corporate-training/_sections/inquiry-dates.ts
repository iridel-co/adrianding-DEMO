/** `YYYY-MM-DD` for today, so the pickers can't offer a date in the past. */
export function todayIso() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * Turns the two `<input type="date">` values into the single human-readable
 * string the rest of the flow carries (review step, handoff, confirmation page).
 *
 * Formats from the raw `YYYY-MM-DD` parts rather than `new Date(iso)` — that
 * parses as UTC midnight, which renders as the *previous* day for anyone west
 * of Greenwich, and this is a Philippine audience picking Philippine dates.
 */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function formatIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return ""
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export function composeDateRange(from: string, to: string) {
  const a = from ? formatIso(from) : ""
  const b = to ? formatIso(to) : ""
  if (a && b && a !== b) return `${a} – ${b}`
  return a || b || ""
}
