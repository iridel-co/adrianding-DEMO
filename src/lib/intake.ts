import { z } from "zod"
import {
  corporateInquiryAnswersSchema,
  corporateInquiryRequestSchema,
  corporateInquiryAcceptedSchema,
} from "./corporate-inquiry"
import {
  registrationAnswersSchema,
  registrationRequestSchema,
  registrationAcceptedSchema,
} from "./registration"

export type IntakeConfig = { origin: string; siteKey: string; enabled: boolean }
export type IntakeKind = "registration" | "corporate"
export type RegistrationAccepted = z.infer<typeof registrationAcceptedSchema>
export type CorporateAccepted = z.infer<typeof corporateInquiryAcceptedSchema>
export type IntakeAccepted = RegistrationAccepted | CorporateAccepted
const endpoints = {
  registration: "/api/registrations",
  corporate: "/api/corporate-inquiries",
}
const errors: Record<string, string> = {
  invalid_submission: "Check your details and try again.",
  verification_failed: "Verification expired or failed. Please verify again.",
  submission_rejected:
    "This submission could not be accepted. Please contact the team.",
  origin_not_allowed:
    "Online submissions are unavailable for this website. Please contact the team.",
  sold_out:
    "This session is full. Choose another session; no new seat was saved.",
  session_unavailable:
    "This session is no longer available. Refresh the workshops and choose another run.",
  idempotency_key_mismatch:
    "This submission conflicts with an earlier request. Please contact the team.",
  body_too_large:
    "Your submission is too long. Shorten the details and try again.",
  intake_unavailable:
    "Online submissions are temporarily unavailable. Retry your previous answers later.",
  verification_unavailable:
    "Verification is temporarily unavailable. Please retry later.",
  email_unavailable:
    "Registration could not be confirmed. Please retry your previous answers later.",
}
class IntakeError extends Error {
  constructor(
    public code: string,
    public uncertain = true
  ) {
    super(
      errors[code] ??
        "We could not confirm your submission. Please try again or contact the team."
    )
  }
}
function answersFor(kind: IntakeKind, input: unknown) {
  return (
    kind === "registration"
      ? registrationAnswersSchema
      : corporateInquiryAnswersSchema
  ).parse(input) as Record<string, unknown>
}
async function post(
  kind: IntakeKind,
  config: IntakeConfig,
  answers: Record<string, unknown>,
  key: string,
  token: string,
  website: string,
  send: typeof fetch
) {
  const request = (
    kind === "registration"
      ? registrationRequestSchema
      : corporateInquiryRequestSchema
  ).safeParse({ ...answers, website, turnstileToken: token })
  if (!request.success) throw new IntakeError("invalid_submission", false)
  const body = JSON.stringify(request.data)
  if (new TextEncoder().encode(body).byteLength > 65536)
    throw new IntakeError("body_too_large", false)
  let response: Response
  try {
    response = await send(new URL(endpoints[kind], config.origin), {
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body,
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new IntakeError("network_error")
  }
  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new IntakeError("invalid_response")
  }
  if (response.status === 202) {
    const accepted = (
      kind === "registration"
        ? registrationAcceptedSchema
        : corporateInquiryAcceptedSchema
    ).safeParse(data)
    if (accepted.success) return accepted.data
    throw new IntakeError("invalid_response")
  }
  const parsed = z.object({ error: z.string() }).safeParse(data)
  const code = parsed.success ? parsed.data.error : "invalid_response"
  const definiteCodes = [
    "invalid_json",
    "invalid_submission",
    "invalid_idempotency_key",
    "headers_not_allowed",
    "verification_failed",
    "submission_rejected",
    "origin_not_allowed",
    "sold_out",
    "session_unavailable",
    "body_too_large",
    "unsupported_content_type",
  ]
  const definite =
    [400, 403, 409, 413, 415].includes(response.status) &&
    definiteCodes.includes(code)
  throw new IntakeError(code, !definite)
}

type Attempt = {
  key: string
  answers: Record<string, unknown>
  locked: boolean
}
export type IntakeState = {
  submitting: boolean
  locked: boolean
  error: string | null
  errorCode: string | null
  answers: Record<string, unknown> | null
}
export const initialIntakeState: IntakeState = {
  submitting: false,
  locked: false,
  error: null,
  errorCode: null,
  answers: null,
}

// A controller survives dialog remounts; tab storage recovers ambiguous attempts.
export class IntakeController {
  private attempt: Attempt | null = null
  private accepted: IntakeAccepted | null = null
  private completedAnswers: Record<string, unknown> | null = null
  private listeners = new Set<() => void>()
  private recovered = false
  private storageAvailable = true
  private state: IntakeState = initialIntakeState
  constructor(
    private kind: IntakeKind,
    private storageKey: string,
    private send: typeof fetch = fetch
  ) {}
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
  snapshot = () => this.state
  beginForm() {
    if (this.accepted) {
      this.accepted = null
      this.completedAnswers = null
      this.update(initialIntakeState)
    }
    this.recover()
  }
  private update(patch: Partial<IntakeState>) {
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((listener) => listener())
  }
  private persist() {
    try {
      if (this.attempt)
        sessionStorage.setItem(
          this.storageKey,
          JSON.stringify({ version: 1, ...this.attempt })
        )
      else sessionStorage.removeItem(this.storageKey)
    } catch {
      this.storageAvailable = false
    }
  }
  recover() {
    if (this.recovered) return
    this.recovered = true
    try {
      const raw = sessionStorage.getItem(this.storageKey)
      if (!raw) return
      const record = z
        .object({
          version: z.literal(1),
          key: z.uuidv4(),
          answers: z.record(z.string(), z.unknown()),
          locked: z.boolean(),
        })
        .parse(JSON.parse(raw))
      this.attempt = {
        key: record.key,
        answers: answersFor(this.kind, record.answers),
        locked: record.locked,
      }
      this.update({
        answers: this.attempt.answers,
        locked: this.attempt.locked,
        error: this.attempt.locked
          ? "Please verify again to retry your submission."
          : null,
      })
    } catch {
      this.storageAvailable = false
    }
  }
  async submit(
    config: IntakeConfig,
    input: unknown,
    token: string,
    website = ""
  ): Promise<IntakeAccepted | null> {
    if (this.state.submitting) return null
    if (!config.enabled || !config.siteKey || !config.origin) {
      this.update({
        error:
          "Online submissions are currently unavailable. Please contact the team directly.",
        errorCode: "intake_unavailable",
      })
      return null
    }
    if (this.state.errorCode === "idempotency_key_mismatch") return null
    let answers: Record<string, unknown>
    try {
      answers = answersFor(this.kind, input)
    } catch {
      this.update({
        error: "Check your details and try again.",
        errorCode: "invalid_submission",
      })
      return null
    }
    if (this.accepted) {
      if (JSON.stringify(answers) === JSON.stringify(this.completedAnswers))
        return this.accepted
      this.update({
        error:
          "This request has completed. Open a new form to start a separate request.",
        errorCode: "attempt_completed",
      })
      return null
    }
    if (
      this.attempt?.locked &&
      JSON.stringify(answers) !== JSON.stringify(this.attempt.answers)
    ) {
      this.update({
        error: "Please retry the previous submission or contact the team.",
        errorCode: "answers_changed",
      })
      return null
    }
    this.attempt = {
      key: this.attempt?.key ?? crypto.randomUUID(),
      answers: structuredClone(answers),
      locked: true,
    }
    this.persist()
    this.update({
      submitting: true,
      locked: true,
      error: null,
      errorCode: null,
      answers: this.attempt.answers,
    })
    try {
      const result = await post(
        this.kind,
        config,
        this.attempt.answers,
        this.attempt.key,
        token,
        website,
        this.send
      )
      this.accepted = result
      this.completedAnswers = this.attempt.answers
      this.attempt = null
      this.persist()
      this.update({ locked: true })
      return result
    } catch (failure) {
      const error =
        failure instanceof IntakeError
          ? failure
          : new IntakeError("network_error")
      if (this.attempt) this.attempt.locked = error.uncertain
      this.persist()
      this.update({
        locked: error.uncertain,
        errorCode: error.code,
        error:
          error.message +
          (!this.storageAvailable && error.uncertain
            ? " Please keep this tab open until your retry completes."
            : ""),
      })
      return null
    } finally {
      this.update({ submitting: false })
    }
  }
}
