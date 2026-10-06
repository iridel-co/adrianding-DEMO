import { expect, test } from "@playwright/test"

for (const width of [319, 360, 390, 402, 639, 640, 768, 1024, 1440]) {
  test(`Shared footer fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/about")
    await page.evaluate(() => document.fonts.ready)
    const footer = page.locator("footer")
    await footer.scrollIntoViewIfNeeded()
    await expect(footer.getByRole("link", { name: "Staff login" })).toHaveCount(
      0
    )
    const words = footer.locator("[aria-hidden] > div > p")
    if (width < 640) {
      for (const word of await words.all()) {
        const box = await word.boundingBox()
        expect(box).not.toBeNull()
        expect(box!.x).toBeGreaterThan(4)
        expect(box!.x + box!.width).toBeLessThan(width - 4)
        const parent = await word.locator("..").boundingBox()
        if ((await word.textContent())?.trim() === "Ding") {
          // The g descender intentionally extends below the clipping wrapper.
          expect(box!.y + box!.height).toBeGreaterThan(
            parent!.y + parent!.height
          )
        } else {
          expect(box!.y + box!.height).toBeLessThan(parent!.y + parent!.height)
        }
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
