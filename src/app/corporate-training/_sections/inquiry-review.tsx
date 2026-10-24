import type { FormValues } from "./inquiry-model"

export function CorporateInquiryReview({
  values,
}: {
  values: () => Omit<FormValues, "attendees"> & { attendees: string }
}) {
  const data = values()
  return (
    <dl className="bg-muted/40 space-y-2 rounded-sm p-4 text-sm">
      <Row k="Name" v={data.fullName || "—"} />
      <Row k="Email" v={data.email || "—"} />
      <Row k="Company" v={data.company || "—"} />
      <Row k="Role" v={data.role || "—"} />
      <Row k="Programme" v={data.program || "—"} />
      <Row
        k="Also interested in"
        v={(data.alsoInterested ?? []).join(", ") || "—"}
      />
      <Row k="Attendees" v={data.attendees || "—"} />
      <Row k="Target date" v={data.targetDate || "—"} />
      <Row k="Venue" v={data.venue || "—"} />
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
