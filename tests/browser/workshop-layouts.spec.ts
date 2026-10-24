import { expect, test } from "@playwright/test"

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

test("focused CMS workshop resets edge tracking after desktop-to-mobile resize", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/workshops")
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
  await next.click()
  await page.getByRole("button", { name: /^Sales/ }).click()
  await expect(previous).toBeDisabled()
  await expect(page.getByText("Showing 1 of 2 workshops")).toBeVisible()
})
test("Workshop form labels, errors and overlapping Continue activations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto("/workshops/exceptional-salesmanship")
  await page.getByRole("button", { name: "Register now", exact: true }).click()
  const form = page
    .getByRole("dialog", { name: "Reserve your seat" })
    .locator("form")
  await expect(
    form.getByRole("heading", { name: /Step 1 of 3/ })
  ).not.toBeFocused()
  const name = form.getByLabel("Full name", { exact: true })
  await form.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(name).toBeFocused()
  await expect(name).toHaveAttribute("aria-invalid", "true")
  await expect(name).toHaveAccessibleDescription("Please enter your full name.")
  await form.getByText("Full name", { exact: true }).click()
  await expect(name).toBeFocused()
  await form.getByRole("button", { name: /Demo shortcut/ }).click()
  await form
    .locator('input[name="email"]')
    .fill(`${"a".repeat(70)}@example.com`)
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
  await forward.click()
  await expect(form.getByRole("heading", { name: /Step 3 of 3/ })).toBeFocused()
  const dialog = page.getByRole("dialog", { name: "Reserve your seat" })
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true
  )
  await form.getByRole("button", { name: "Back", exact: true }).click()
  await expect(form.locator('input[name="occupation"]')).toHaveValue(
    "Insurance advisor"
  )
})
