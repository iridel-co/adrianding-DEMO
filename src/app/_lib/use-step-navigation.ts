"use client"

import { useEffect, useRef, useState } from "react"

/** Serialize validation and commit only the step that was validated. */
export function useStepNavigation(stepCount: number, blocked: boolean) {
  const [step, setStep] = useState(0)
  const [pending, setPending] = useState(false)
  const blockedRef = useRef(blocked)
  useEffect(() => {
    blockedRef.current = blocked
  }, [blocked])
  const locked = useRef(false)
  const mounted = useRef(false)
  const current = useRef(step)
  const generation = useRef(0)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      generation.current += 1
    }
  }, [])
  const next = async (validate: (step: number) => Promise<boolean>) => {
    if (locked.current || blocked) return
    locked.current = true
    setPending(true)
    const captured = current.current
    const operation = generation.current
    try {
      const valid = await validate(captured)
      if (
        valid &&
        !blockedRef.current &&
        mounted.current &&
        operation === generation.current &&
        current.current === captured
      ) {
        current.current = Math.min(captured + 1, stepCount - 1)
        setStep(current.current)
      }
    } catch {
      // A failed validator keeps the current step and permits a retry.
    } finally {
      locked.current = false
      if (mounted.current && operation === generation.current) setPending(false)
    }
  }
  const back = () => {
    if (locked.current || blocked) return
    current.current = Math.max(current.current - 1, 0)
    setStep(current.current)
  }
  return { step, pending, next, back }
}
