import { expect, test, type Locator } from "@playwright/test"

async function expectInsideViewport(element: Locator, width: number) {
  const box = await element.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(-1)
  expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1)
}

for (const width of [360, 390, 402, 768]) {
  test(`Home content and controls fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1024 })
    await page.goto("/")
    await expect(page.locator(".he-word")).toBeVisible()
    await expectInsideViewport(page.locator(".he-word"), width)
    if (width < 640) {
      const portrait = await page.locator(".he-portrait").boundingBox()
      expect(portrait).not.toBeNull()
      expect(
        Math.abs(portrait!.x + portrait!.width / 2 - width / 2)
      ).toBeLessThan(2)
    }

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

test("About tablet milestones remain connected to their year", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto("/about")
  const year = page
    .getByRole("heading", { name: "2004", exact: true })
    .filter({ visible: true })
  const milestone = page
    .getByRole("heading", {
      name: "Certified Trainer — Peak Potentials",
      exact: true,
    })
    .filter({ visible: true })
  await milestone.scrollIntoViewIfNeeded()
  await expectInsideViewport(milestone, 768)
  const yearBox = await year.boundingBox()
  const milestoneBox = await milestone.boundingBox()
  expect(yearBox).not.toBeNull()
  expect(milestoneBox!.x - (yearBox!.x + yearBox!.width)).toBeLessThan(100)
})

for (const width of [360, 390, 402]) {
  test(`Home portrait stays centered after resizing to ${width}px with motion enabled`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.setViewportSize({ width: 1440, height: 824 })
    await page.goto("/")
    await expect(page.locator(".he-portrait")).toBeVisible()
    await page.setViewportSize({ width, height: 824 })
    await page.mouse.move(width - 1, 400)
    await expect
      .poll(async () => {
        const box = await page.locator(".he-portrait").boundingBox()
        return box ? Math.abs(box.x + box.width / 2 - width / 2) : Infinity
      })
      .toBeLessThan(2)
  })
}
