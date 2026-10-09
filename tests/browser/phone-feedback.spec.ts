import { expect, test } from "@playwright/test"

test("phone filters overlay chevrons disappear at terminal edges", async ({
  page,
}) => {
  await page.setViewportSize({ width: 454, height: 871 })
  await page.goto("/workshops")
  const next = page.getByRole("button", {
    name: "More focus areas",
    exact: true,
  })
  const previous = page.getByRole("button", {
    name: "Previous focus areas",
    exact: true,
  })
  await expect(next).toBeVisible()
  await expect(previous).toHaveCount(0)
  const row = page.getByRole("group", { name: "Filter by focus" })
  await row.evaluate((el) => {
    el.scrollLeft = el.scrollWidth
  })
  await expect(next).toHaveCount(0)
  await expect(previous).toBeVisible()
  await row.evaluate((el) => {
    el.scrollLeft = 0
  })
  await expect(previous).toHaveCount(0)
})

test("historical workshops appear in listing and calendar with registration closed", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-07T04:00:00Z") })
  await page.goto("/workshops")
  const section = page.getByRole("region", { name: "Past workshops" })
  await expect(
    section.getByRole("link", { name: /Building Winning Cultures/ })
  ).toBeVisible()
  for (let i = 0; i < 11; i++)
    await page.getByRole("button", { name: "Previous month" }).click()
  await page.getByRole("button", { name: "14", exact: true }).click()
  const preview = page.getByRole("dialog", { name: "Workshop preview" })
  await expect(preview.getByText("Registration closed")).toBeVisible()
  await preview
    .getByRole("link", { name: /View workshop.*Building Winning Cultures/ })
    .click()
  await expect(page).toHaveURL(/building-winning-cultures-2025$/)
})
for (const width of [360, 1440]) {
  test(`@layout sticky registration waits for the primary card at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 871 })
    await page.goto("/workshops/exceptional-salesmanship")
    const card = page.locator("#workshop-registration-card")
    const sticky = page.locator("div.fixed[aria-hidden]")
    await card.scrollIntoViewIfNeeded()
    await expect(sticky).toHaveAttribute("aria-hidden", "true")
    await card.evaluate((el) =>
      window.scrollTo({
        top: el.getBoundingClientRect().bottom + window.scrollY - 20,
        behavior: "instant",
      })
    )
    await expect(sticky).toHaveAttribute("aria-hidden", "true")
    await card.evaluate((el) =>
      window.scrollTo({
        top: el.getBoundingClientRect().bottom + window.scrollY + 20,
        behavior: "instant",
      })
    )
    await expect(sticky).toHaveAttribute("aria-hidden", "false")
    await page.setViewportSize({
      width: width === 1440 ? 431 : 1440,
      height: 871,
    })
    await card.scrollIntoViewIfNeeded()
    await expect(sticky).toHaveAttribute("aria-hidden", "true")
    await expect(sticky).toHaveAttribute("inert", "")
    await page.locator("#workshop-register-cta").scrollIntoViewIfNeeded()
    await expect(sticky).toHaveAttribute("aria-hidden", "true")
    await card.evaluate((el) =>
      window.scrollTo({
        top: el.getBoundingClientRect().bottom + window.scrollY + 20,
        behavior: "instant",
      })
    )
    await expect(sticky).toHaveAttribute("aria-hidden", "false")
  })
}
