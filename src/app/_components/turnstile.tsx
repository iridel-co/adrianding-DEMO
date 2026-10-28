"use client"

import { useEffect, useRef, useState } from "react"

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      action: string
      size: "compact" | "flexible"
      theme: "light"
      callback: (token: string) => void
      "expired-callback": () => void
      "error-callback": (code?: string) => boolean
    }
  ) => string
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let loading: Promise<TurnstileApi> | null = null
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    let settled = false
    const fail = () => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      script.remove()
      loading = null
      reject(new Error("Verification script unavailable"))
    }
    const timeout = setTimeout(fail, 15000)
    script.onerror = fail
    script.onload = () => {
      if (settled) return
      if (!window.turnstile) return fail()
      settled = true
      clearTimeout(timeout)
      resolve(window.turnstile)
    }
    document.head.appendChild(script)
  })
  return loading
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
  const [status, setStatus] = useState<
    "loading" | "ready" | "verified" | "expired" | "failed"
  >("loading")
  const [errorCode, setErrorCode] = useState<string | undefined>()
  const [retryKey, setRetryKey] = useState(0)
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(() =>
      setWide(element.clientWidth >= 300)
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    let active = true
    let cleanup: (() => void) | undefined
    callback.current(null)
    loadTurnstile()
      .then((api) => {
        if (!active || !container.current) return
        setStatus("ready")
        const id = api.render(container.current, {
          sitekey: siteKey,
          action,
          size: wide ? "flexible" : "compact",
          theme: "light",
          callback: (token) => {
            if (!active) return
            setStatus("verified")
            callback.current(token)
          },
          "expired-callback": () => {
            if (!active) return
            setStatus("expired")
            callback.current(null)
          },
          "error-callback": (code) => {
            if (!active) return true
            setStatus("failed")
            setErrorCode(code)
            callback.current(null)
            return true
          },
        })
        cleanup = () => api.remove(id)
      })
      .catch(() => {
        if (active) setStatus("failed")
      })
    return () => {
      active = false
      cleanup?.()
      callback.current(null)
    }
  }, [siteKey, action, resetKey, retryKey, wide])
  return (
    <div
      className="my-5 w-full"
      role="group"
      aria-label="Security verification"
    >
      <p className="sr-only" role="status">
        {status === "verified"
          ? "Verification complete."
          : status === "loading"
            ? "Loading verification…"
            : "Complete the check below before sending your form."}
      </p>
      <div ref={container} className="w-full" />
      {(status === "failed" || status === "expired") && (
        <>
          <p
            role="alert"
            className="text-destructive mt-3 text-sm leading-relaxed"
          >
            {status === "expired"
              ? "Verification expired. Please verify again."
              : errorCode === "110200"
                ? "Verification is not configured for this website. Please contact us directly."
                : errorCode === "110100" || errorCode === "110110"
                  ? "Verification is temporarily unavailable. Please contact us directly."
                  : "We couldn't complete verification. Check your connection and try again."}
          </p>
          <button
            type="button"
            className="border-border text-foreground hover:bg-muted mt-3 min-h-11 rounded-full border bg-white px-4 text-sm font-medium transition-colors"
            onClick={() => {
              setStatus("loading")
              setErrorCode(undefined)
              setRetryKey((value) => value + 1)
            }}
          >
            Retry verification
          </button>
        </>
      )}
    </div>
  )
}
