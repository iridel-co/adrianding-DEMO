import { expect, test } from "@playwright/test"
import { execFileSync } from "node:child_process"
import path from "node:path"

type Fixture = {
  seatsLeft: number | null
  trigger: string
  confirmation: string | null
  metadata: { title: string }
}

// Use real React JSX in a separate process; Playwright transforms imported TSX
// into component placeholders. No demo data or public test routes are changed.
const rendered: {
  capacity: Fixture[]
  emptyList: string
  emptyCalendar: string
} = JSON.parse(
  execFileSync(
    process.execPath,
    [path.resolve("scripts/quality/render-workshop-fixtures.cjs")],
    { encoding: "utf8" }
  )
)
const fixtures = rendered.capacity

test("empty catalogue and event-free calendar show distinct useful states", async ({
  page,
}) => {
  await page.setContent(rendered.emptyList)
  await expect(page.getByText("No workshops scheduled yet.")).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Ask about in-house training" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Show all workshops" })
  ).toHaveCount(0)
  await page.setContent(rendered.emptyCalendar)
  await expect(page.getByRole("status")).toHaveText(
    "No workshops scheduled this month."
  )
})

test("registration triggers render disabled for full and unknown capacity", async ({
  page,
}) => {
  for (const fixture of fixtures) {
    await page.setContent(fixture.trigger)
    const trigger = page.getByRole("button")
    if (fixture.seatsLeft === 1) await expect(trigger).toBeEnabled()
    else await expect(trigger).toBeDisabled()
    await expect(page.getByRole("dialog")).toHaveCount(0)
  }
})

test("full and unknown confirmation fixtures show no booking success or payment", async ({
  page,
}) => {
  for (const fixture of fixtures.filter((item) => item.confirmation)) {
    await page.setContent(fixture.confirmation!)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      fixture.seatsLeft === 0 ? "Fully booked" : "Availability unavailable"
    )
    await expect(page.getByText("Your seat is held for 48 hours.")).toHaveCount(
      0
    )
    expect(fixture.metadata.title).toContain("Registration unavailable")
  }
})
