import { expect, test } from "@playwright/test"
import { fillInquiry, chooseSelect, chooseDate } from "./helpers/form-data"

for (const width of [360, 768]) {
  test(`@layout Corporate inquiry preview remains editable without submitting at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    let posts = 0
    page.on("request", (request) => {
      if (request.method() === "POST") posts += 1
    })
    await page.goto("/corporate-training?program=cms-program-2#inquiry")
    const form = page.locator("form")
    await expect(form.getByText(/Enquiring about CMS Program 2/)).toBeVisible()
    await expect(form.getByRole("status")).toContainText(
      "Online inquiries are currently unavailable"
    )
    const forward = form.getByRole("button", { name: "Continue", exact: true })
    await forward.click()
    await expect(form.getByText("Please enter your full name.")).toBeVisible()
    await fillInquiry(form)
    for (const step of [2, 3]) {
      await forward.click()
      await expect(
        form.getByRole("heading", { name: new RegExp(`Step ${step} of 4`) })
      ).toBeFocused()
    }
    await expect(
      form.getByLabel("Preferred programme", { exact: true })
    ).toHaveText("Leadership Training & Development")
    await chooseSelect(form, "Preferred programme", "CMS Program 2")
    await chooseDate(form, "From", "2026-11-13")
    await forward.click()
    await expect(
      form.getByText("End date cannot precede start date.")
    ).toBeVisible()
    await chooseDate(form, "From", "2026-11-10")
    const context = form.getByRole("textbox", {
      name: "Anything else we should know? (optional)",
    })
    await context.fill("x".repeat(5001))
    await forward.click()
    await expect(form.getByText("Use 5,000 characters or fewer.")).toBeVisible()
    await context.fill("Developing a new team.")
    await forward.click()
    await expect(form.locator("dl")).toContainText("CMS Program 2")
    const consent = form.getByRole("checkbox")
    await consent.uncheck()
    const send = form.getByRole("button", { name: "Send inquiry" })
    await expect(send).toBeDisabled()
    await consent.check()
    await expect(send).toBeDisabled()
    // Native/keyboard form submission must also stop before any save or redirect.
    await form.evaluate((element) =>
      (element as HTMLFormElement).requestSubmit()
    )
    await expect(
      page
        .getByRole("region", { name: "Form notifications" })
        .getByRole("alert")
    ).toContainText("Online inquiries are currently unavailable")
    await expect(page).not.toHaveURL(/inquiry-received$/)
    expect(posts).toBe(0)
    expect(
      await page.evaluate(() => sessionStorage.getItem("ad-demo-handoff"))
    ).toBeNull()
    await form.getByRole("button", { name: "Back", exact: true }).click()
    await expect(
      form.getByLabel("Preferred programme", { exact: true })
    ).toHaveText("CMS Program 2")
  })
}

test("@layout Corporate inquiry review wraps long values", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 })
  await page.goto("/corporate-training#inquiry")
  const form = page.locator("form")
  await fillInquiry(form)
  await form.getByLabel("Full name", { exact: true }).fill("Alex".repeat(40))
  await form.getByRole("button", { name: "Continue", exact: true }).click()
  await form.getByLabel("Company", { exact: true }).fill("Company".repeat(28))
  await form.getByRole("button", { name: "Continue", exact: true }).click()
  await form
    .getByLabel("Possible venue", { exact: true })
    .fill("Venue".repeat(50))
  await form.getByRole("button", { name: "Continue", exact: true }).click()
  const review = form.locator("dl")
  expect(await review.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true
  )
  await expect(
    form.getByRole("button", { name: "Send inquiry" })
  ).toBeDisabled()
})
test("Form dropdowns preserve the sticky header and scroll position", async ({
  page,
  isMobile,
}) => {
  await page.goto("/corporate-training#inquiry")
  const form = page.locator("form")
  await expect(form).toHaveAttribute("aria-busy", "false")
  await form.getByLabel("Full name", { exact: true }).fill("Ana Reviewer")
  await form.getByLabel("Work email", { exact: true }).fill("ana@example.com")
  await form.getByLabel("Contact number", { exact: true }).fill("0917 555 0132")
  const next = form.getByRole("button", { name: "Continue", exact: true })
  await next.press("Enter")
  await form.getByLabel("Company", { exact: true }).fill("Example Team")
  await form.getByLabel("Your role", { exact: true }).fill("Team lead")
  await next.press("Enter")
  await expect(form.getByRole("heading", { name: /Step 3 of 4/ })).toBeFocused()
  const header = page.locator("header").first()
  for (const label of ["Preferred programme", "Number of attendees"]) {
    const trigger = form.getByRole("combobox", { name: label, exact: true })
    await trigger.scrollIntoViewIfNeeded()
    const scrollY = await page.evaluate(() => window.scrollY)
    await trigger.click()
    await expect(page.getByRole("listbox")).toBeVisible()
    await expect
      .poll(() =>
        header.evaluate((el) => Math.round(el.getBoundingClientRect().top))
      )
      .toBe(0)
    if (!isMobile) await page.mouse.wheel(0, 300)
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
    await page.keyboard.press("Escape")
    await expect(trigger).toBeFocused()
    await expect
      .poll(() =>
        header.evaluate((el) => Math.round(el.getBoundingClientRect().top))
      )
      .toBe(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
  }
  await next.press("Enter")
  await expect(
    form.getByRole("combobox", { name: "Preferred programme", exact: true })
  ).toHaveAccessibleDescription("Pick the closest programme.")
})

test("Corporate form labels, errors and overlapping Continue activations", async ({
  page,
}) => {
  await page.goto("/corporate-training#inquiry")
  const form = page.locator("form")
  await expect(form).toHaveAttribute("aria-busy", "false")
  const name = form.getByLabel("Full name", { exact: true })
  await name.press("Enter")
  await expect(name).toBeFocused()
  await expect(name).toHaveAttribute("aria-invalid", "true")
  await expect(name).toHaveAccessibleDescription("Please enter your full name.")
  await form.getByText("Full name", { exact: true }).click()
  await expect(name).toBeFocused()
  await fillInquiry(form)
  await expect(name).toHaveAttribute("aria-invalid", "false")
  await name.press("Enter")
  await expect(form.getByRole("heading", { name: /Step 2 of 4/ })).toBeVisible()
  await form.getByRole("button", { name: "Back", exact: true }).click()
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
  ).toHaveText("Leadership Training & Development")
  await expect
    .poll(() =>
      form.evaluate((element) => {
        const headerBottom = document
          .querySelector("header")!
          .getBoundingClientRect().bottom
        return Math.round(element.getBoundingClientRect().top - headerBottom)
      })
    )
    .toBe(24)
  await expect(
    form.getByLabel("Number of attendees", { exact: true })
  ).toHaveText("16 – 30 people")
  await expect(form.getByLabel("From", { exact: true })).toContainText(
    "10 Nov 2026"
  )
  await chooseDate(form, "From", "2026-11-11")
  const endDate = form.getByLabel("To (optional)", { exact: true })
  await endDate.press("Enter")
  const calendar = page.locator('[data-slot="popover-content"]')
  await expect(
    calendar.getByRole("button", { name: /November 10th, 2026/ })
  ).toBeDisabled()
  const selectedDay = calendar.getByRole("button", {
    name: /November 12th, 2026/,
  })
  await expect(selectedDay).toBeFocused()
  await selectedDay.press("ArrowRight")
  await expect(
    calendar.getByRole("button", { name: /November 13th, 2026/ })
  ).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(endDate).toBeFocused()
  await endDate.click()
  await calendar
    .getByRole("button", { name: "Clear date", exact: true })
    .click()
  await expect(endDate).toHaveText("Pick a date")
  await chooseDate(form, "To (optional)", "2026-11-12")
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
