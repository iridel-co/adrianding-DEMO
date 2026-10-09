import { expect, test } from "@playwright/test"

const start = new Date("2026-10-09T09:00:00+08:00").getTime()
for (const width of [360, 1440]) {
  test(`@layout countdown contains large day counts at ${width}px`, async ({
    page,
  }) => {
    await page.clock.install({
      time: new Date(start - 1000 * 86400000 - 10000),
    })
    await page.setViewportSize({ width, height: 871 })
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto("/workshops/exceptional-salesmanship")
    const rail = page.locator("aside")
    const units = rail.getByRole("group")
    await expect(units).toHaveCount(4)
    await rail.scrollIntoViewIfNeeded()
    for (const days of [1000, 99]) {
      await page.clock.setSystemTime(new Date(start - days * 86400000 - 10000))
      await page.clock.runFor(1000)
      const boxes = await units.evaluateAll((elements) =>
        elements.map((element) => {
          const cell = element.getBoundingClientRect()
          const number =
            element.firstElementChild!.firstElementChild!.getBoundingClientRect()
          return {
            x: cell.x,
            y: cell.y,
            width: cell.width,
            numberLeft: number.left,
            numberRight: number.right,
          }
        })
      )
      for (const box of boxes) {
        expect(box.numberLeft).toBeGreaterThanOrEqual(box.x - 1)
        expect(box.numberRight).toBeLessThanOrEqual(box.x + box.width + 1)
      }
    }
    expect(errors).toEqual([])
  })
}

test("countdown rolls over to the workshop started message", async ({
  page,
}) => {
  await page.clock.install({ time: new Date(start - 2000) })
  await page.goto("/workshops/exceptional-salesmanship")
  await expect(page.locator("aside").getByRole("group")).toHaveCount(4)
  await page.clock.runFor(3000)
  await expect(
    page.locator("aside").getByText("This workshop has started.")
  ).toBeVisible()
  await expect(page.locator("aside").getByRole("group")).toHaveCount(0)
})
