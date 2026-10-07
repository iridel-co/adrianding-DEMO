import type { FormValues } from "./inquiry-model"

export function CorporateInquiryReview({
  values,
}: {
  values: <K extends keyof FormValues>(key: K) => FormValues[K]
}) {
  return (
    <dl className="bg-muted/40 space-y-2 rounded-sm p-4 text-sm">
      <Row k="Name" v={values("fullName") || "—"} />
      <Row k="Email" v={values("email") || "—"} />
      <Row k="Company" v={values("company") || "—"} />
      <Row k="Role" v={values("role") || "—"} />
      <Row k="Programme" v={values("program") || "—"} />
      <Row
        k="Also interested in"
        v={(values("alsoInterested") ?? []).join(", ") || "—"}
      />
      <Row k="Attendees" v={values("attendees") || "—"} />
      <Row k="Target date" v={values("targetDate") || "—"} />
      <Row k="Venue" v={values("venue") || "—"} />
    </dl>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-foreground min-w-0 text-right font-medium [overflow-wrap:anywhere]">
        {v}
      </dd>
    </div>
  )
}
