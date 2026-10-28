import { BookOpen, CalendarDays, MapPin, UserRound, Mail } from "lucide-react"
import { ReviewDetails } from "@/app/_components/review-details"
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
    <ReviewDetails
      items={[
        {
          label: "Workshop",
          value: workshopTitle,
          icon: BookOpen,
          emphasis: true,
        },
        { label: "Schedule", value: schedule, icon: CalendarDays },
        { label: "Venue", value: venue, icon: MapPin },
        { label: "Name", value: values("fullName") || "—", icon: UserRound },
        { label: "Email", value: values("email") || "—", icon: Mail },
      ]}
    />
  )
}
