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
