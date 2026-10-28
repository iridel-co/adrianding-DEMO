import { expect, test } from "@playwright/test"
import { fillRegistration } from "./helpers/form-data"
import { execFileSync } from "node:child_process"
import path from "node:path"

const rendered: {
  videos: string[]
  decorativeImage: string
  informativeImage: string
  emptyList: string
  emptyCalendar: string
  capacity: { trigger: string; label: string; enabled: boolean }[]
} = JSON.parse(
  execFileSync(
    process.execPath,
    [path.resolve("scripts/quality/render-workshop-fixtures.cjs")],
    { encoding: "utf8" }
  )
)

test("@policy missing CMS images preserve decorative and informative semantics", async ({
  page,
}) => {
  await page.setContent(rendered.decorativeImage)
  await expect(page.getByRole("img")).toHaveCount(0)
  await expect(page.locator("span")).toHaveAttribute("aria-hidden", "true")
  await page.setContent(rendered.informativeImage)
  await expect(
    page.getByRole("img", {
      name: "Coach portrait (image unavailable)",
      exact: true,
    })
  ).toHaveCount(1)
})

test("@policy empty catalogue and event-free calendar retain useful states", async ({
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

test("@policy CMS registration triggers respect full and closed sessions", async ({
  page,
}) => {
  for (const fixture of rendered.capacity) {
    await page.setContent(fixture.trigger)
    const trigger = page.getByRole("button", {
      name: fixture.label,
      exact: true,
    })
    if (fixture.enabled) await expect(trigger).toBeEnabled()
    else await expect(trigger).toBeDisabled()
    await expect(page.getByRole("dialog")).toHaveCount(0)
  }
})

// The public API publishes per-session capacity, remaining seats and open status.
// Exercise the CMS-backed page instead of rendering the retired local catalogue.
test("@policy workshop preserves the registration layout without a simulated reservation", async ({
  page,
}) => {
  await page.goto("/workshops/exceptional-salesmanship")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Exceptional Salesmanship"
  )
  const rail = page.locator("#workshop-registration-card")
  await expect(rail.getByText("Starts in", { exact: true })).toBeVisible()
  await rail.getByRole("button", { name: "Reserve your seat" }).click()
  const dialog = page.getByRole("dialog", { name: "Reserve your seat" })
  await fillRegistration(dialog)
  await dialog.getByRole("button", { name: "Continue", exact: true }).click()
  await dialog.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(
    dialog.getByRole("button", { name: "Finish", exact: true })
  ).toBeDisabled()
  await page.keyboard.press("Escape")
  await expect(page.getByText("9 seats left").first()).toBeVisible()
  await expect(
    page
      .getByRole("link", { name: /coachadrianding@maximumimpact.online/ })
      .first()
  ).toBeVisible()
  for (const suffix of ["registered"]) {
    await page.goto(`/workshops/exceptional-salesmanship/${suffix}`)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Workshop registration"
    )
    await expect(
      page.getByText("There is no accepted registration receipt in this tab.", {
        exact: false,
      })
    ).toBeVisible()
    await expect(page.getByText("Unpaid", { exact: true })).toHaveCount(0)
  }
})

test("unknown CMS workshop returns not found", async ({ page }) => {
  const response = await page.goto("/workshops/not-a-published-workshop")
  expect(response?.status()).toBe(404)
})

for (const storage of ["malformed", "invalid", "unavailable"] as const) {
  test(`@policy confirmation pages stay neutral with ${storage} receipt storage`, async ({
    page,
  }) => {
    await page.addInitScript((state) => {
      if (state === "malformed")
        sessionStorage.setItem("ad-portal-receipt-v1", "{broken")
      else if (state === "invalid")
        sessionStorage.setItem(
          "ad-portal-receipt-v1",
          JSON.stringify({ version: 1, receipt: { accepted: true } })
        )
      else
        Object.defineProperty(window, "sessionStorage", {
          get() {
            throw new Error("Storage blocked")
          },
        })
    }, storage)
    await page.goto("/workshops/exceptional-salesmanship/registered")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Workshop registration"
    )
    await expect(page.getByText("Unpaid", { exact: true })).toHaveCount(0)
    await page.goto("/corporate-training/inquiry-received")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Your corporate training inquiry"
    )
    await expect(
      page.getByText("No accepted inquiry receipt", { exact: false })
    ).toBeVisible()
  })
}

test("retired local sample returns not found", async ({ page }) => {
  const response = await page.goto(
    "/workshops/local-sample-exceptional-salesmanship"
  )
  expect(response?.status()).toBe(404)
})

test("@layout original calendar circles have room at both edges at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto("/workshops")
  const date = page.getByRole("button", { name: "20", exact: true })
  await date.scrollIntoViewIfNeeded()
  const bounds = await date.evaluate((cell) => {
    const circle = cell.querySelector("svg")!.getBoundingClientRect()
    const grid = cell.parentElement!
    const clip = grid.parentElement!.getBoundingClientRect()
    const first = grid.firstElementChild!.getBoundingClientRect()
    const last = grid.lastElementChild!.getBoundingClientRect()
    const radius = (circle.width * 1.1) / 2
    return {
      width: circle.width,
      left: first.left + first.width / 2 - radius - clip.left,
      right: clip.right - (last.left + last.width / 2 + radius),
    }
  })
  expect(bounds.width).toBeCloseTo(48, 0)
  expect(bounds.left).toBeGreaterThanOrEqual(-0.5)
  expect(bounds.right).toBeGreaterThanOrEqual(-0.5)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
})

test("@policy workshop video is absent without an attached CMS URL", async ({
  page,
}) => {
  for (const markup of rendered.videos.slice(0, 3)) expect(markup).toBe("")
  await page.setContent(rendered.videos[3])
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/abc123"
  )
})
