import { expect, test } from "@playwright/test"

for (const width of [360, 1024]) {
  test(`@layout CMS session preview fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/workshops")
    const date = page.getByRole("button", { name: "20", exact: true })
    await date.click()
    const preview = page.getByRole("dialog", { name: "Workshop preview" })
    await expect(preview).toBeVisible()
    const box = await preview.boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(width)
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(900)
    await page.keyboard.press("Escape")
    await expect(preview).toBeHidden()
    await expect(date).toBeFocused()
  })
}
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
test("phone filters overlay chevrons disappear at terminal edges", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 871 })
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
