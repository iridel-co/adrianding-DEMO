import { expect, test, type Locator } from "@playwright/test"

async function expectInsideViewport(element: Locator, width: number) {
  const box = await element.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(-1)
  expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1)
}

for (const width of [360, 768]) {
  test(`@layout Home content and controls fit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1024 })
    await page.goto("/")
    await expect(page.locator(".he-word")).toBeVisible()
    await expectInsideViewport(page.locator(".he-word"), width)
    const paths = page.locator("#which-path")
    await paths.scrollIntoViewIfNeeded()
    for (const action of await paths.locator(".group\\/cta").all()) {
      await expectInsideViewport(action, width)
      const card = action.locator("xpath=ancestor::a")
      const cardBox = await card.boundingBox()
      const actionBox = await action.boundingBox()
      expect(actionBox!.x).toBeGreaterThanOrEqual(cardBox!.x - 1)
      expect(actionBox!.x + actionBox!.width).toBeLessThanOrEqual(
        cardBox!.x + cardBox!.width + 1
      )
    }

    for (const [nextName, previousName] of [
      ["Next programs", "Previous programs"],
      ["Scroll to more workshops", "Scroll to previous workshops"],
    ]) {
      const next = page.getByRole("button", { name: nextName, exact: true })
      const previous = page.getByRole("button", {
        name: previousName,
        exact: true,
      })
      await next.scrollIntoViewIfNeeded()
      await expect(next).toBeVisible()
      await expect(next).toBeEnabled()
      await expectInsideViewport(next, width)
      await next.focus()
      await page.keyboard.press("Enter")
      await expect(previous).toBeEnabled()
      await previous.click()
      await expect(previous).toBeDisabled()
    }
  })
}
