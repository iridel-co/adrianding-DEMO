import { expect, test } from "@playwright/test"

for (const width of [360, 768]) {
  test(`@layout Corporate mobile actions and step navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto("/corporate-training?program=leadership#inquiry")
    const form = page.locator("form")
    await expect(form.getByText(/Enquiring about Leadership/)).toBeVisible()
    const forward = form.getByRole("button", {
      name: "Continue",
      exact: true,
    })
    await forward.click()
    await expect(form.getByText("Please enter your full name.")).toBeVisible()
    await form
      .getByRole("button", {
        name: "Demo shortcut: fill this form with sample data",
      })
      .click()
    for (const step of [2, 3, 4]) {
      await forward.click()
      const heading = form.getByRole("heading", {
        name: new RegExp(`Step ${step} of 4`),
      })
      await expect(heading).toBeFocused()
    }
    const consent = form.getByRole("checkbox")
    const send = form.getByRole("button", { name: "Send inquiry" })
    await consent.uncheck()
    await expect(send).toBeVisible()
    await expect(send).toBeDisabled()
    await consent.check()
    await expect(send).toBeEnabled()
    await form.getByRole("button", { name: "Back", exact: true }).click()
    await expect(
      form.getByRole("heading", { name: /Step 3 of 4/ })
    ).toBeFocused()
    await expect(form.locator('select[name="program"]')).toHaveValue(
      "Leadership Training & Development"
    )
    await expect(form.getByRole("checkbox", { checked: true })).toHaveCount(1)
    await forward.click()
    await send.click()
    await expect(page).toHaveURL(/\/corporate-training\/inquiry-received$/)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Thanks, Maria. We've got your inquiry."
    )
  })
}

test("@layout Corporate review and confirmation wrap long submitted values", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 844 })
  await page.goto("/corporate-training#inquiry")
  const form = page.locator("form")
  await form
    .getByRole("button", {
      name: "Demo shortcut: fill this form with sample data",
    })
    .click()
  await form.locator('input[name="fullName"]').fill("Alex".repeat(40))
  await form.getByRole("button", { name: "Continue", exact: true }).click()
  await form.locator('input[name="company"]').fill("Company".repeat(40))
  await form.getByRole("button", { name: "Continue", exact: true }).click()
  await form.locator('input[name="venue"]').fill("Venue".repeat(50))
  await form.getByRole("button", { name: "Continue", exact: true }).click()
  const review = form.locator("dl")
  expect(await review.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true
  )
  await form.getByRole("button", { name: "Send inquiry" }).click()
  await expect(page).toHaveURL(/\/corporate-training\/inquiry-received$/)
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Alex".repeat(40)
  )
  await expect(
    page.getByText("Venue".repeat(50), { exact: true })
  ).toBeVisible()
  for (const element of await page.locator("h1, dd").all()) {
    expect(
      await element.evaluate((el) => el.scrollWidth <= el.clientWidth)
    ).toBe(true)
  }
})

test("Corporate form labels, errors and overlapping Continue activations", async ({
  page,
}) => {
  await page.goto("/corporate-training#inquiry")
  const form = page.locator("form")
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
  await expect(form.getByRole("heading", { name: /Step 2 of 4/ })).toBeVisible()
  await form.getByRole("button", { name: "Back", exact: true }).click()
  await expect(name).toHaveValue("Maria Santos")
  await forward.dblclick({ delay: 0 })
  await expect(form.getByRole("heading", { name: /Step 2 of 4/ })).toBeVisible()
  await forward.click()
  await expect(
    form.getByLabel("Preferred programme", { exact: true })
  ).toHaveValue("Leadership Training & Development")
  await expect(
    form.getByLabel("Number of attendees", { exact: true })
  ).toHaveValue("16 – 30")
  await expect(form.getByLabel("From", { exact: true })).toHaveValue(
    "2026-11-10"
  )
  await form.getByLabel("From", { exact: true }).fill("2026-11-11")
  await form.getByLabel("To (optional)", { exact: true }).focus()
  await forward.click()
  await expect(form.locator("dl")).toContainText(
    "11 November 2026 – 12 November 2026"
  )
  await form.getByRole("button", { name: "Back", exact: true }).click()
  await form.getByRole("tab", { name: "Not fixed yet" }).click()
  await forward.click()
  await expect(form.getByLabel("Possible date", { exact: true })).toBeFocused()
  await expect(
    form.getByLabel("Possible date", { exact: true })
  ).toHaveAccessibleDescription("Even a rough month helps us hold a date.")
})
