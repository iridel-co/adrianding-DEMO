import { expect, test } from "@playwright/test"
import { getWorkshopAvailability } from "../../src/lib/workshop-availability"

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-04T04:00:00Z") })
})

test("@policy availability distinguishes capacity states and reopening", () => {
  for (const seatsLeft of [40, 11, 1]) {
    expect(
      getWorkshopAvailability({ status: "open", seatsLeft, seatsTotal: 40 })
    ).toEqual({
      state: "available",
      canRegister: true,
      label: `${seatsLeft} ${seatsLeft === 1 ? "seat" : "seats"} left`,
    })
  }
  expect(
    getWorkshopAvailability({ status: "open", seatsLeft: 0, seatsTotal: 40 })
  ).toEqual({
    state: "full",
    canRegister: false,
    label: "Fully booked",
  })
  for (const status of ["past", "closed"] as const) {
    expect(
      getWorkshopAvailability({ status, seatsLeft: 11, seatsTotal: 40 })
        .canRegister
    ).toBe(false)
  }
  for (const [seatsLeft, seatsTotal] of [
    [null, 40],
    [1, null],
    [-1, 40],
    [41, 40],
    [1.5, 40],
    [1, 0],
    [NaN, 40],
    [1, Infinity],
  ]) {
    expect(
      getWorkshopAvailability({ status: "open", seatsLeft, seatsTotal }).state
    ).toBe("unknown")
  }
  // Reopening is derived from the new snapshot; no stale sold-out flag persists.
  expect(
    getWorkshopAvailability({ status: "open", seatsLeft: 2, seatsTotal: 40 })
      .canRegister
  ).toBe(true)
})

for (const width of [360, 1024]) {
  test(`@layout Workshop controls and calendar preview at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/workshops")
    const next = page.getByRole("button", {
      name: "Scroll to more workshops",
      exact: true,
    })
    const previous = page.getByRole("button", {
      name: "Scroll to previous workshops",
      exact: true,
    })
    if (width < 1024) {
      await next.scrollIntoViewIfNeeded()
      await expect(previous).toBeDisabled()
      await next.focus()
      await page.keyboard.press("Enter")
      await expect(previous).toBeEnabled()
      await page.getByRole("button", { name: /^Sales/ }).click()
      await expect(previous).toBeDisabled()
      await expect(page.getByText("Showing 2 of 7 workshops")).toBeVisible()
      await page.setViewportSize({ width: 1440, height: 900 })
      await expect(next).toHaveCount(0)
      await page.setViewportSize({ width, height: 900 })
      await expect(next).toBeEnabled()
    } else {
      await expect(next).toHaveCount(0)
    }
    const date = page.getByRole("button", { name: "9", exact: true })
    await date.click()
    const preview = page.getByRole("dialog", { name: "Workshop preview" })
    await expect(preview).toBeVisible()
    const box = await preview.boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(width)
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(900)
    if (
      testInfo.project.name === "desktop" &&
      [360, 768, 1440].includes(width)
    ) {
      await page.screenshot({
        path: testInfo.outputPath("calendar-preview.png"),
      })
    }
    await page.keyboard.press("Escape")
    await expect(preview).toBeHidden()
    await expect(date).toBeFocused()
    await date.click()
    await preview
      .getByRole("link", { name: /View workshop.*Exceptional Salesmanship/ })
      .click()
    await expect(page).toHaveURL(/\/workshops\/exceptional-salesmanship$/)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width)
  })
}

for (const width of [360]) {
  test(`@layout Workshop dialog retains fields and gates consent at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto("/workshops/exceptional-salesmanship")
    await page
      .getByRole("button", { name: "Register now", exact: true })
      .click()
    const dialog = page.getByRole("dialog", { name: "Reserve your seat" })
    await dialog.getByRole("button", { name: /Demo shortcut/ }).click()
    await dialog
      .locator('input[name="email"]')
      .fill(`${"a".repeat(70)}@example.com`)
    const next = dialog.getByRole("button", { name: "Continue", exact: true })
    await next.click()
    await expect(
      dialog.getByRole("heading", { name: /Step 2 of 3/ })
    ).toBeFocused()
    await next.click()
    await expect(
      dialog.getByRole("heading", { name: /Step 3 of 3/ })
    ).toBeFocused()
    const submit = dialog.getByRole("button", { name: "Finish" })
    await dialog.getByRole("checkbox").uncheck()
    await expect(submit).toBeDisabled()
    await expect(submit).toBeVisible()
    if (testInfo.project.name === "desktop" && width === 360) {
      await page.screenshot({
        path: testInfo.outputPath("registration-consent.png"),
      })
    }
    const back = dialog.getByRole("button", { name: "Back", exact: true })
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)
    ).toBe(true)
    await back.click()
    await expect(dialog.locator('input[name="occupation"]')).toHaveValue(
      "Insurance advisor"
    )
    await next.click()
    await dialog.getByRole("checkbox").check()
    await submit.click()
    await expect(page).toHaveURL(/\/registered$/)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width)
  })
}

test("past workshop and direct confirmation do not offer registration or payment", async ({
  page,
}) => {
  await page.goto("/workshops/building-winning-cultures-2025")
  await expect(
    page.getByRole("button", { name: /Register|Reserve|waitlist/i })
  ).toHaveCount(0)
  await expect(
    page.getByText("Registration closed", { exact: true })
  ).toBeVisible()
  await page.goto("/workshops/building-winning-cultures-2025/registered")
  await expect(
    page.getByRole("heading", { name: "Registration closed" })
  ).toBeVisible()
  await expect(page.getByText("Your seat is held for 48 hours.")).toHaveCount(0)
})

test("Corporate programme arrows work on touch rails and in normal motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/corporate-training")
  const next = page.getByRole("button", {
    name: "Next programmes",
    exact: true,
  })
  const previous = page.getByRole("button", {
    name: "Previous programmes",
    exact: true,
  })
  await next.scrollIntoViewIfNeeded()
  await expect(previous).toBeDisabled()
  await next.click()
  await expect(previous).toBeEnabled()
  await previous.click()
  await expect(previous).toBeDisabled()
})

test("focused Home workshop resets edge tracking after desktop-to-mobile resize", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  const card = page
    .getByRole("link", { name: /Exceptional Salesmanship/ })
    .first()
  await card.scrollIntoViewIfNeeded()
  await card.focus()
  await page.setViewportSize({ width: 360, height: 800 })
  const next = page.getByRole("button", {
    name: "Scroll to more workshops",
    exact: true,
  })
  const previous = page.getByRole("button", {
    name: "Scroll to previous workshops",
    exact: true,
  })
  await next.scrollIntoViewIfNeeded()
  await next.click()
  await expect(previous).toBeEnabled()
  await previous.click()
  await expect(previous).toBeDisabled()
})

test("Workshop form labels, errors and overlapping Continue activations", async ({
  page,
}) => {
  await page.goto("/workshops/exceptional-salesmanship")
  await page.getByRole("button", { name: "Register now", exact: true }).click()
  const form = page
    .getByRole("dialog", { name: "Reserve your seat" })
    .locator("form")
  const name = form.getByLabel("Full name", { exact: true })
  await form.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(name).toBeFocused()
  await expect(name).toHaveAttribute("aria-invalid", "true")
  await expect(name).toHaveAccessibleDescription("Please enter your full name.")
  await form.getByText("Full name", { exact: true }).click()
  await expect(name).toBeFocused()
  await form.getByRole("button", { name: /Demo shortcut/ }).click()
  await expect(name).toHaveAttribute("aria-invalid", "false")
  const forward = form.getByRole("button", { name: "Continue", exact: true })
  await forward.evaluate((button: HTMLButtonElement) => {
    button.click()
    button.click()
  })
  await expect(form.getByRole("heading", { name: /Step 2 of 3/ })).toBeVisible()
  await form.getByRole("button", { name: "Back", exact: true }).click()
  await expect(name).toHaveValue("Juan Dela Cruz")
  await forward.dblclick({ delay: 0 })
  await expect(form.getByRole("heading", { name: /Step 2 of 3/ })).toBeVisible()
  await expect(
    form.getByLabel("Salary range (required)", { exact: true })
  ).toHaveValue("₱50,000 – ₱80,000")
})
