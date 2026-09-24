import {
  Compass,
  GraduationCap,
  HeartHandshake,
  MessagesSquare,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react"
import type { WorkshopTag } from "@/lib/workshops"

/**
 * Focus-area pills for a workshop's `tags` (added 2026-09-19, client feedback).
 * Server-safe — no `"use client"`, no hooks. Both sizes are built for dark/photo
 * grounds only (white text, translucent dark/light fill) — do not reuse on a
 * light section background as-is.
 *
 * Rendered in sentence case, not interactive (no link, no hover state) —
 * purely informational, unlike the tappable chips in
 * `workshop-tag-filter.tsx`, which reuses `WORKSHOP_TAG_ICONS` below to stay
 * in sync with this icon map.
 */
export const WORKSHOP_TAG_ICONS: Record<WorkshopTag, typeof Compass> = {
  Leadership: Compass,
  Sales: TrendingUp,
  Communication: MessagesSquare,
  Coaching: Sprout,
  "Customer Experience": HeartHandshake,
  Culture: Users,
  "Train-the-Trainer": GraduationCap,
}

const SIZE_CLASS = {
  sm: "inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-sm",
  md: "inline-flex min-h-9 items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm",
} as const

const ICON_SIZE_CLASS = {
  sm: "size-3.5 shrink-0",
  md: "size-4 shrink-0",
} as const

export function WorkshopTagPills({
  tags,
  size = "sm",
  className = "",
}: {
  tags: WorkshopTag[]
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <ul
      aria-label="Focus areas"
      className={`flex flex-wrap gap-1.5 ${className}`}
    >
      {tags.map((tag) => {
        const Icon = WORKSHOP_TAG_ICONS[tag]
        return (
          <li key={tag} className={SIZE_CLASS[size]}>
            <Icon className={ICON_SIZE_CLASS[size]} aria-hidden />
            {tag}
          </li>
        )
      })}
    </ul>
  )
}
