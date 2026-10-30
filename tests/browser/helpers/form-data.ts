import { expect, type Locator } from "@playwright/test"

async function next(form: Locator, step: number, total: number) {
  // Keyboard activation avoids mistaking repeated pointer setup for a double-click.
  await form
    .getByRole("button", { name: "Continue", exact: true })
    .press("Enter")
  await expect(
    form.getByRole("heading", { name: new RegExp(`Step ${step} of ${total}`) })
  ).toBeVisible()
}

async function backToStart(form: Locator, total: number) {
  for (let step = total - 1; step >= 1; step--) {
    await form.getByRole("button", { name: "Back", exact: true }).press("Enter")
    await expect(
      form.getByRole("heading", {
        name: new RegExp(`Step ${step} of ${total}`),
      })
    ).toBeVisible()
  }
}

export async function chooseSelect(
  form: Locator,
  label: string,
  option: string
) {
  await form.getByRole("combobox", { name: label, exact: true }).click()
  await form.page().getByRole("option", { name: option, exact: true }).click()
}

export async function chooseDate(form: Locator, label: string, iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  const target = new Date(year, month - 1, day)
  await form.getByLabel(label, { exact: true }).click()
  const popup = form.page().locator('[data-slot="popover-content"]')
  const monthLabel = target.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
  for (let attempt = 0; attempt < 24; attempt++) {
    const visibleMonth = await popup.locator(".rdp-caption_label").innerText()
    if (visibleMonth === monthLabel) break
    const backwards = new Date(visibleMonth) > target
    await popup
      .getByRole("button", {
        name: backwards ? "Go to the Previous Month" : "Go to the Next Month",
      })
      .click()
  }
  const monthName = target.toLocaleDateString("en-US", { month: "long" })
  await popup
    .getByRole("button", {
      name: new RegExp(`${monthName} ${day}(?:st|nd|rd|th)?, ${year}`),
    })
    .click()
  await expect(popup).toHaveCount(0)
}

// Test-owned data goes through the same controls visitors use; no production shortcut.
export async function fillRegistration(form: Locator) {
  await form.locator('input[name="fullName"]').fill("Juan Dela Cruz")
  await form.locator('input[name="email"]').fill("juan.delacruz@example.com")
  await form.locator('input[name="phone"]').fill("0917 555 0148")
  await next(form, 2, 3)
  await form.locator('input[name="occupation"]').fill("Insurance advisor")
  await chooseSelect(form, "Salary range (required)", "₱50,000 – ₱80,000")
  await form.locator('input[name="city"]').fill("Cebu City")
  await next(form, 3, 3)
  await form.getByRole("checkbox").check()
  await backToStart(form, 3)
}

export async function fillInquiry(form: Locator) {
  await form.page().clock.setFixedTime(new Date("2026-10-01T04:00:00Z"))
  await expect(form).toHaveAttribute("aria-busy", "false")
  await form.locator('input[name="fullName"]').fill("Maria Santos")
  await form.locator('input[name="email"]').fill("maria.santos@example.com")
  await form.locator('input[name="phone"]').fill("0917 555 0132")
  await next(form, 2, 4)
  await form.locator('input[name="company"]').fill("Acme Manufacturing")
  await form
    .locator('input[name="role"]')
    .fill("Head of Learning & Development")
  await next(form, 3, 4)
  await chooseSelect(
    form,
    "Preferred programme",
    "Leadership Training & Development"
  )
  await form
    .getByRole("checkbox", { name: "CMS Program 1", exact: true })
    .locator("..")
    .click()
  await expect(
    form.getByRole("checkbox", { name: "CMS Program 1", exact: true })
  ).toBeChecked()
  await chooseSelect(form, "Number of attendees", "16 – 30 people")
  await chooseDate(form, "From", "2026-11-10")
  await chooseDate(form, "To (optional)", "2026-11-12")
  await form.locator('input[name="venue"]').fill("Our head office in Cebu City")
  await next(form, 4, 4)
  await form.getByRole("checkbox", { name: /I agree/ }).check()
  await backToStart(form, 4)
}
