import { expect, test } from "@playwright/test"

test("Corporate programme arrows work on touch rails and in normal motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/corporate-training")
  const next = page.getByRole("button", {
    name: "Next programmes",
    exact: true,
  })
  const previous = page.getByRole("button", {
    name: "Previous programmes",
    exact: true,
  })
  await next.scrollIntoViewIfNeeded()
  await expect(previous).toBeDisabled()
  await next.click()
  await expect(previous).toBeEnabled()
  await previous.click()
  await expect(previous).toBeDisabled()
})

test("focused CMS workshop resets edge tracking after desktop-to-mobile resize", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/workshops")
  const card = page
    .getByRole("link", { name: /Exceptional Salesmanship/ })
    .first()
  await card.scrollIntoViewIfNeeded()
  await card.focus()
  await page.setViewportSize({ width: 360, height: 800 })
  const next = page.getByRole("button", {
    name: "Scroll to more workshops",
    exact: true,
  })
  const previous = page.getByRole("button", {
    name: "Scroll to previous workshops",
    exact: true,
  })
  await next.scrollIntoViewIfNeeded()
  await next.click()
  await expect(previous).toBeEnabled()
  await previous.click()
  await expect(previous).toBeDisabled()
})
