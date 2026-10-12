import type { FormValues } from "./registration-model"

export function RegistrationReview({
  values,
  workshopTitle,
  schedule,
  venue,
}: {
  values: <K extends keyof FormValues>(key: K) => FormValues[K]
  workshopTitle: string
  schedule: string
  venue: string
}) {
  return (
    <dl className="bg-muted/40 grid grid-cols-1 gap-x-4 gap-y-2 rounded-sm p-4 text-sm sm:grid-cols-[auto_1fr]">
      <Row k="Workshop" v={workshopTitle} />
      <Row k="Schedule" v={schedule} />
      <Row k="Venue" v={venue} />
      <Row k="Name" v={values("fullName") || "—"} />
      <Row k="Email" v={values("email") || "—"} />
    </dl>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground sm:text-right">{k}</dt>
      <dd className="text-foreground min-w-0 text-left font-medium [overflow-wrap:anywhere]">
        {v}
      </dd>
    </>
  )
}
