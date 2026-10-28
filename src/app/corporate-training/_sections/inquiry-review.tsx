import {
  UserRound,
  Mail,
  Building2,
  BriefcaseBusiness,
  BookOpen,
  Layers,
  Users,
  CalendarDays,
  MapPin,
} from "lucide-react"
import { ReviewDetails } from "@/app/_components/review-details"
import type { FormValues } from "./inquiry-model"

export function CorporateInquiryReview({
  values,
}: {
  values: () => Omit<FormValues, "attendees"> & { attendees: string }
}) {
  const data = values()
  return (
    <ReviewDetails
      items={[
        {
          label: "Programme",
          value: data.program || "—",
          icon: BookOpen,
          emphasis: true,
        },
        { label: "Name", value: data.fullName || "—", icon: UserRound },
        { label: "Email", value: data.email || "—", icon: Mail },
        { label: "Company", value: data.company || "—", icon: Building2 },
        { label: "Role", value: data.role || "—", icon: BriefcaseBusiness },
        {
          label: "Also interested in",
          value: (data.alsoInterested ?? []).join(", ") || "—",
          icon: Layers,
        },
        { label: "Attendees", value: data.attendees || "—", icon: Users },
        {
          label: "Target date",
          value: data.targetDate || "—",
          icon: CalendarDays,
        },
        { label: "Venue", value: data.venue || "—", icon: MapPin },
      ]}
    />
  )
}
