import type { LucideIcon } from "lucide-react"

export function ReviewDetails({
  items,
}: {
  items: {
    label: string
    value: string
    icon: LucideIcon
    emphasis?: boolean
  }[]
}) {
  return (
    <dl className="border-border/60 bg-muted/30 grid gap-x-6 gap-y-5 rounded-xl border p-5 sm:grid-cols-2">
      {items.map(({ label, value, icon: Icon, emphasis }) => (
        <div
          key={label}
          className={`flex min-w-0 gap-3 ${emphasis ? "sm:col-span-2" : ""}`}
        >
          <Icon aria-hidden className="text-brand mt-0.5 size-4 shrink-0" />
          <div className="min-w-0">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd
              className={`text-foreground mt-1 leading-snug [overflow-wrap:anywhere] ${emphasis ? "text-lg font-semibold" : "text-sm font-medium"}`}
            >
              {value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
