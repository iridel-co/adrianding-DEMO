import { expect, test } from "@playwright/test"

test("registration closes on the first click after touching an empty field", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-04T04:00:00Z") })
  await page.goto("/workshops/exceptional-salesmanship")
  for (const label of ["Reserve your seat", "Register now"]) {
    await page.getByRole("button", { name: label, exact: true }).first().click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await dialog
      .getByRole("textbox", { name: "Full name", exact: true })
      .focus()
    await dialog.getByRole("button", { name: "Close dialog" }).click()
    await expect(dialog).toBeHidden()
  }
})
