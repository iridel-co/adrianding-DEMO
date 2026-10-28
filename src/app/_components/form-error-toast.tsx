"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  Toast,
  ToastContainer,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast"

export function FormErrorToast({ message }: { message?: string | null }) {
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => setDismissed(false), [message])
  if (!message || dismissed || typeof document === "undefined") return null
  return createPortal(
    <ToastContainer
      aria-live="polite"
      aria-label="Form notifications"
      role="region"
      className="right-4 bottom-4 z-[100] w-[calc(100%-2rem)]"
    >
      <Toast variant="destructive" onClose={() => setDismissed(true)}>
        <ToastTitle>Couldn’t send your form</ToastTitle>
        <ToastDescription>{message}</ToastDescription>
      </Toast>
    </ToastContainer>,
    document.body
  )
}
