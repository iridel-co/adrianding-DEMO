"use client"
import { startTransition } from "react"
import { useRouter } from "next/navigation"

export default function ContentError({ reset }: { reset: () => void }) {
  const router = useRouter()
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-serif text-4xl">
        Content is temporarily unavailable
      </h1>
      <p className="mt-6">We couldn't load this page. Please try again.</p>
      <button
        type="button"
        onClick={() => {
          startTransition(() => {
            router.refresh()
            reset()
          })
        }}
        className="mt-6 min-h-11 rounded-md border px-6 py-3"
      >
        Try again
      </button>
    </main>
  )
}
