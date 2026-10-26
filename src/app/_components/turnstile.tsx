"use client"

import Script from "next/script"
import { useEffect, useRef, useState } from "react"

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      action: string
      size: "compact"
      callback: (token: string) => void
      "expired-callback": () => void
      "error-callback": () => boolean
    }
  ) => string
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export function Turnstile({
  siteKey,
  action,
  onToken,
  resetKey,
}: {
  siteKey: string
  action: "workshop-registration" | "corporate-inquiry"
  onToken: (token: string | null) => void
  resetKey: number
}) {
  const container = useRef<HTMLDivElement>(null)
  const callback = useRef(onToken)
  callback.current = onToken
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile) return
    callback.current(null)
    const api = window.turnstile
    const id = api.render(container.current, {
      sitekey: siteKey,
      action,
      size: "compact",
      callback: (token) => {
        setFailed(false)
        callback.current(token)
      },
      "expired-callback": () => callback.current(null),
      "error-callback": () => {
        callback.current(null)
        setFailed(true)
        return true
      },
    })
    return () => {
      api.remove(id)
      callback.current(null)
    }
  }, [ready, siteKey, action, resetKey, retryKey])
  return (
    <div className="my-5">
      <Script
        id="portal-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
        onError={() => {
          setFailed(true)
          callback.current(null)
        }}
      />
      <div ref={container} />
      {failed && (
        <p role="alert" className="text-destructive text-sm">
          Verification is unavailable. Check your connection and keep this tab
          open if a submission result is still unknown.
        </p>
      )}
      {failed && ready && (
        <button
          type="button"
          className="mt-2 min-h-11 underline"
          onClick={() => {
            setFailed(false)
            setRetryKey((value) => value + 1)
          }}
        >
          Retry verification
        </button>
      )}
    </div>
  )
}
