"use client"

import { useEffect, useMemo, useSyncExternalStore } from "react"
import {
  IntakeController,
  initialIntakeState,
  type IntakeConfig,
  type IntakeKind,
} from "@/lib/intake"

const controllers = new Map<string, IntakeController>()
export function useIntake(
  kind: IntakeKind,
  config: IntakeConfig,
  identity: string
) {
  const controller = useMemo(() => {
    const key = `ad-portal-attempt-v1:${config.origin}:${kind}:${identity}`
    if (!controllers.has(key))
      controllers.set(key, new IntakeController(kind, key))
    return controllers.get(key)!
  }, [kind, config.origin, identity])
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.snapshot,
    () => initialIntakeState
  )
  useEffect(() => controller.beginForm(), [controller])
  return {
    ...state,
    submit: (answers: unknown, token: string, website = "") =>
      controller.submit(config, answers, token, website),
  }
}
