import { focusInvalidStep } from "@/app/_lib/focus-invalid-step"
import {
  STEPS as corporateSteps,
  type FormValues as CorporateValues,
} from "@/app/corporate-training/_sections/inquiry-model"
import {
  STEPS as registrationSteps,
  type FormValues as RegistrationValues,
} from "@/app/workshops/[slug]/_sections/registration-model"
import { expect, test } from "@playwright/test"
import { IntakeController, type IntakeConfig } from "@/lib/intake"
import {
  registrationAnswersSchema,
  registrationAcceptedSchema,
} from "@/lib/registration"

const config: IntakeConfig = {
  origin: "https://portal.example.test",
  siteKey: "fixture-key",
  turnstileEnabled: true,
  enabled: true,
}
const answers = {
  workshopSessionId: "12345678-abcd-4000-8000-123456789abc",
  fullName: "Maria Santos",
  email: "MARIA@example.test",
  phone: "+63 917 123 4567",
  occupation: "HR Manager",
  salaryRange: "Prefer not to say",
  city: "Cebu",
  consent: true,
}
let stored: Map<string, string>
let previous: PropertyDescriptor | undefined
const json = (body: unknown, status = 202) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
test.beforeEach(() => {
  stored = new Map()
  previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage")
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
      removeItem: (key: string) => stored.delete(key),
    },
  })
})
test.afterEach(() => {
  if (previous) Object.defineProperty(globalThis, "sessionStorage", previous)
  else Reflect.deleteProperty(globalThis, "sessionStorage")
})

test("@policy intake strictly validates every answer and both accepted shapes", () => {
  expect(registrationAnswersSchema.parse(answers).email).toBe(
    "maria@example.test"
  )
  for (const extra of [{ slug: "sales" }, { quantity: 2 }, { price: 6500 }])
    expect(
      registrationAnswersSchema.safeParse({ ...answers, ...extra }).success
    ).toBe(false)
  for (const patch of [
    { phone: "123" },
    { occupation: "x" },
    { consent: false },
    { workshopSessionId: "session-1" },
    { fullName: "x".repeat(201) },
  ])
    expect(
      registrationAnswersSchema.safeParse({ ...answers, ...patch }).success
    ).toBe(false)
  expect(registrationAcceptedSchema.parse({ accepted: true })).toEqual({
    accepted: true,
  })
  expect(
    registrationAcceptedSchema.parse({
      accepted: true,
      reference: "AD-PSW-0001",
      isPaid: false,
    })
  ).toHaveProperty("reference")
  expect(
    registrationAcceptedSchema.safeParse({
      accepted: true,
      reference: "AD-PSW-0001",
      isPaid: true,
    }).success
  ).toBe(false)
})

test("@policy ambiguous retries and tab recovery keep answers/key but use a fresh token", async () => {
  const requests: RequestInit[] = []
  const send: typeof fetch = async (_url, init) => {
    requests.push(init!)
    if (requests.length === 1) throw new TypeError("response lost after save")
    return json({ accepted: true, reference: "AD-PSW-0001", isPaid: false })
  }
  const first = new IntakeController("registration", "attempt", send)
  expect(await first.submit(config, answers, "token-a")).toBeNull()
  expect(first.snapshot().locked).toBe(true)
  expect(
    await first.submit(
      config,
      { ...answers, email: "changed@example.test" },
      "token-b"
    )
  ).toBeNull()
  expect(requests).toHaveLength(1)
  expect(stored.get("attempt")).not.toContain("token-a")
  const recovered = new IntakeController("registration", "attempt", send)
  recovered.beginForm()
  expect(recovered.snapshot().answers?.email).toBe("maria@example.test")
  expect(
    await recovered.submit(config, recovered.snapshot().answers, "token-c")
  ).toHaveProperty("reference", "AD-PSW-0001")
  expect(
    (requests[0].headers as Record<string, string>)["Idempotency-Key"]
  ).toBe((requests[1].headers as Record<string, string>)["Idempotency-Key"])
  const a = JSON.parse(requests[0].body as string),
    b = JSON.parse(requests[1].body as string)
  expect(a.turnstileToken).not.toBe(b.turnstileToken)
  delete a.turnstileToken
  delete b.turnstileToken
  expect(a).toEqual(b)
  expect(requests[0]).toMatchObject({
    method: "POST",
    credentials: "omit",
    cache: "no-store",
  })
  expect(requests[0].signal).toBeInstanceOf(AbortSignal)
})

test("@policy overlapping clicks and completed attempts cannot create accidental new requests", async () => {
  const requests: RequestInit[] = []
  let complete!: (response: Response) => void
  const send: typeof fetch = async (_url, init) => {
    requests.push(init!)
    return requests.length === 1
      ? new Promise<Response>((resolve) => {
          complete = resolve
        })
      : json({ accepted: true })
  }
  const controller = new IntakeController("registration", "overlap", send)
  const first = controller.submit(config, answers, "token-a")
  expect(await controller.submit(config, answers, "token-b")).toBeNull()
  expect(requests).toHaveLength(1)
  complete(json({ accepted: true }))
  await first
  expect(
    await controller.submit(
      config,
      { ...answers, fullName: "Another Person" },
      "token-c"
    )
  ).toBeNull()
  expect(requests).toHaveLength(1)
  controller.beginForm()
  expect(
    await controller.submit(
      config,
      { ...answers, fullName: "Another Person" },
      "token-d"
    )
  ).toEqual({ accepted: true })
  expect(requests).toHaveLength(2)
  expect(
    (requests[0].headers as Record<string, string>)["Idempotency-Key"]
  ).not.toBe((requests[1].headers as Record<string, string>)["Idempotency-Key"])
})

test("@policy rejected input can be corrected; unavailable/conflicting results never confirm", async () => {
  const cases = [
    [409, "sold_out", false],
    [409, "session_unavailable", false],
    [400, "verification_failed", false],
    [409, "idempotency_key_mismatch", true],
    [503, "intake_unavailable", true],
    [503, "email_unavailable", true],
    [408, "request_timeout", true],
  ] as const
  for (const [status, code, locked] of cases) {
    const controller = new IntakeController("registration", code, async () =>
      json({ error: code }, status)
    )
    expect(await controller.submit(config, answers, "token-a")).toBeNull()
    expect(controller.snapshot()).toMatchObject({ errorCode: code, locked })
  }
  for (const response of [
    new Response("Bad gateway", { status: 502 }),
    json({ accepted: true }, 200),
    json({ accepted: true, reference: "missing-paid" }),
  ]) {
    const controller = new IntakeController(
      "registration",
      "invalid-response",
      async () => response
    )
    expect(await controller.submit(config, answers, "token-a")).toBeNull()
    expect(controller.snapshot().locked).toBe(true)
  }
  let count = 0
  const bodies: unknown[] = []
  const controller = new IntakeController(
    "registration",
    "correct",
    async (_url, init) => {
      bodies.push(JSON.parse(init!.body as string))
      return ++count === 1
        ? json({ error: "invalid_submission" }, 400)
        : json({ accepted: true })
    }
  )
  await controller.submit(config, answers, "token-a")
  expect(controller.snapshot().locked).toBe(false)
  await controller.submit(
    config,
    { ...answers, occupation: "Updated role" },
    "token-b"
  )
  expect(bodies[1]).toHaveProperty("occupation", "Updated role")
})

test("@policy disabled intake performs no POST or key persistence", async () => {
  let calls = 0
  const controller = new IntakeController(
    "registration",
    "disabled",
    async () => {
      calls++
      return json({ accepted: true })
    }
  )
  expect(
    await controller.submit({ ...config, enabled: false }, answers, "token-a")
  ).toBeNull()
  expect(calls).toBe(0)
  expect(stored.size).toBe(0)
})

test("@policy final validation returns to the earliest invalid step and focuses its field", () => {
  const previous = globalThis.requestAnimationFrame
  globalThis.requestAnimationFrame = (callback) => {
    callback(0)
    return 0
  }
  try {
    const steps: number[] = [],
      fields: string[] = []
    focusInvalidStep<CorporateValues>(
      {
        email: { type: "validate", message: "Invalid email" },
        venue: { type: "validate", message: "Invalid venue" },
      },
      corporateSteps,
      (step) => steps.push(step),
      (field) => fields.push(field)
    )
    focusInvalidStep<RegistrationValues>(
      { city: { type: "validate", message: "Enter a city" } },
      registrationSteps,
      (step) => steps.push(step),
      (field) => fields.push(field)
    )
    expect(steps).toEqual([0, 1])
    expect(fields).toEqual(["email", "city"])
  } finally {
    if (previous) globalThis.requestAnimationFrame = previous
    else Reflect.deleteProperty(globalThis, "requestAnimationFrame")
  }
})

for (const kind of ["registration", "corporate"] as const) {
  test(`@policy ${kind} diagnostic bypass sends without a site key or token`, async () => {
    let calls = 0
    const controller = new IntakeController(
      kind,
      "bypass",
      async (_url, init) => {
        calls++
        expect(JSON.parse(init!.body as string).turnstileToken).toBe("")
        return json({ accepted: true })
      }
    )
    const input =
      kind === "registration"
        ? answers
        : {
            fullName: "Maria Santos",
            email: "maria@example.test",
            phone: "+639171234567",
            company: "Test Company",
            role: "HR Manager",
            program: "Leadership",
            attendees: "16 to 30",
            targetDateText: "Next month",
            venue: "Our office",
            consent: true,
          }
    expect(
      await controller.submit(
        { ...config, turnstileEnabled: false, siteKey: "" },
        input,
        ""
      )
    ).toEqual({ accepted: true })
    expect(calls).toBe(1)
    const protectedController = new IntakeController(
      kind,
      "protected",
      async () => {
        calls++
        return json({ accepted: true })
      }
    )
    expect(await protectedController.submit(config, input, "")).toBeNull()
    expect(calls).toBe(1)
  })
}
