"use client"

import { useEffect, useState } from "react"
import { readReceipt, type WorkshopReceipt } from "@/app/_lib/handoff"
import type { Workshop } from "@/lib/workshops"
import { RegisteredConfirmed } from "./confirmed"
import { RegisteredPayment } from "./payment"
import { RegisteredPrimer } from "./primer"
import { RegisteredExpect } from "./expect"

export function RegisteredReceipt({
  workshop,
}: {
  workshop: Workshop & { primerVideoUrl?: string | null }
}) {
  const [receipt, setReceipt] = useState<WorkshopReceipt | null>(null)
  useEffect(
    () => setReceipt(readReceipt("workshop", workshop.slug)),
    [workshop.slug]
  )
  const selected = receipt
    ? {
        ...workshop,
        title: receipt.workshopTitle,
        schedule: receipt.schedule,
        venue: receipt.venue,
        city: "",
        price: receipt.price,
      }
    : workshop
  return (
    <>
      <RegisteredConfirmed workshop={selected} receipt={receipt} />
      {receipt && <RegisteredPayment workshop={selected} receipt={receipt} />}
      <RegisteredPrimer workshop={selected} />
      <RegisteredExpect workshop={selected} />
    </>
  )
}
