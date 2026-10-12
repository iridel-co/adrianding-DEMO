import { expect, test } from "@playwright/test"

for (const width of [319, 639, 640, 1440]) {
  test(`@layout Shared footer fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/about")
    await page.evaluate(() => document.fonts.ready)
    const footer = page.locator("footer")
    await footer.scrollIntoViewIfNeeded()
    const words = footer.locator("[aria-hidden] > div > p")
    if (width < 640) {
      for (const word of await words.all()) {
        const box = await word.boundingBox()
        expect(box).not.toBeNull()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
      }
    } else {
      await expect(words.first()).toBeHidden()
      await expect(
        footer.getByText("Adrian Ding", { exact: true })
      ).toBeVisible()
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width)
  })
}

test("Closing the mobile menu restores keyboard focus without a scroll jump", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto("/about")
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: "instant" }))
  const menu = page.getByRole("button", { name: "Open menu" })
  await menu.click()
  await expect(page.getByRole("dialog")).toBeVisible()
  const position = await page.evaluate(() => window.scrollY)
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toBeHidden()
  await expect(menu).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(position)
})
