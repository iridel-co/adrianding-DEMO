import { expect, test, type Locator } from "@playwright/test"

async function equalWidths(first: Locator, second: Locator) {
  const a = await first.boundingBox()
  const b = await second.boundingBox()
  expect(a).not.toBeNull()
  expect(b).not.toBeNull()
  expect(Math.abs(a!.width - b!.width)).toBeLessThanOrEqual(1)
}

for (const width of [360, 390, 440, 639]) {
  test(`Corporate mobile actions and step navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto("/corporate-training?program=leadership#inquiry")
    const form = page.locator("form")
    await expect(form.getByText(/Enquiring about Leadership/)).toBeVisible()
    const forward = form.getByRole("button", { name: "Continue", exact: true })
    const forwardBox = await forward.boundingBox()
    const formBox = await form.boundingBox()
    expect(forwardBox!.width).toBeGreaterThan(formBox!.width - 50)
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
      await expect
        .poll(async () => (await heading.boundingBox())!.y)
        .toBeGreaterThanOrEqual(80)
      await equalWidths(
        form.getByRole("button", { name: "Back", exact: true }),
        form.getByRole("button", {
          name: step === 4 ? "Send inquiry" : "Continue",
          exact: true,
        })
      )
      if (step === 3) {
        await equalWidths(
          form.getByRole("tab", { name: "Pick dates" }),
          form.getByRole("tab", { name: "Not fixed yet" })
        )
      }
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

test("Corporate review and confirmation wrap long submitted values", async ({
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
