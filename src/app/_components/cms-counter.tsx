import { Counter } from "./counter"

import { parseCmsCounter } from "@/lib/public-content"

export function CmsCounter({
  value,
  duration,
}: {
  value: string
  duration?: number
}) {
  const parsed = parseCmsCounter(value)
  return parsed ? <Counter {...parsed} duration={duration} /> : <>{value}</>
}
