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

// Test-owned data goes through the same controls visitors use; no production shortcut.
export async function fillRegistration(form: Locator) {
  await form.locator('input[name="fullName"]').fill("Juan Dela Cruz")
  await form.locator('input[name="email"]').fill("juan.delacruz@example.com")
  await form.locator('input[name="phone"]').fill("0917 555 0148")
  await next(form, 2, 3)
  await form.locator('input[name="occupation"]').fill("Insurance advisor")
  await form
    .locator('select[name="salaryRange"]')
    .selectOption("₱50,000 – ₱80,000")
  await form.locator('input[name="city"]').fill("Cebu City")
  await next(form, 3, 3)
  await form.getByRole("checkbox").check()
  await backToStart(form, 3)
}

export async function fillInquiry(form: Locator) {
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
  await form
    .getByLabel("Preferred programme", { exact: true })
    .selectOption("leadership")
  await form
    .getByRole("checkbox", { name: "CMS Program 1", exact: true })
    .locator("..")
    .click()
  await expect(
    form.getByRole("checkbox", { name: "CMS Program 1", exact: true })
  ).toBeChecked()
  await form
    .getByLabel("Number of attendees", { exact: true })
    .selectOption("16 – 30")
  await form.getByLabel("From", { exact: true }).fill("2026-11-10")
  await form.getByLabel("To (optional)", { exact: true }).fill("2026-11-12")
  await form.locator('input[name="venue"]').fill("Our head office in Cebu City")
  await next(form, 4, 4)
  await form.getByRole("checkbox", { name: /I agree/ }).check()
  await backToStart(form, 4)
}
