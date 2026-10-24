import { expect, test } from "@playwright/test"

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
  await dialog
    .getByRole("button", { name: /fill this form with sample data/i })
    .click()
  await dialog.getByRole("button", { name: "Continue", exact: true }).click()
  await dialog.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(
    dialog.getByRole("button", { name: "Finish", exact: true })
  ).toBeDisabled()
  await page.keyboard.press("Escape")
  await expect(page.getByText("9 seats left").first()).toBeVisible()
  await expect(
    page.getByRole("link", { name: /coach@example.test/ }).first()
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

test("retired local sample returns not found", async ({ page }) => {
  const response = await page.goto(
    "/workshops/local-sample-exceptional-salesmanship"
  )
  expect(response?.status()).toBe(404)
})

test("@layout calendar circles fit their day cells at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto("/workshops")
  const date = page.getByRole("button", { name: "20", exact: true })
  await date.scrollIntoViewIfNeeded()
  const bounds = await date.evaluate((cell) => {
    const box = cell.getBoundingClientRect()
    const circle = cell.querySelector("svg")!.getBoundingClientRect()
    return { left: circle.left - box.left, right: box.right - circle.right }
  })
  expect(bounds.left).toBeGreaterThanOrEqual(-0.5)
  expect(bounds.right).toBeGreaterThanOrEqual(-0.5)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
})
