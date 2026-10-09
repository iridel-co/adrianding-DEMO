import { expect, test } from "@playwright/test"

test("inquiry CTA can revisit the same fragment while preserving programme prefill", async ({
  page,
}) => {
  await page.goto("/corporate-training?program=leadership#inquiry")
  const cta = page.getByRole("link", { name: "Start an inquiry", exact: true })
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
    await cta.click()
    await expect(
      page.locator("#inquiry").getByRole("heading").first()
    ).toBeInViewport()
    await expect(page).toHaveURL(/program=leadership#inquiry$/)
  }
})

test("landing corporate choice opens the page introduction", async ({
  page,
}) => {
  await page.goto("/#which-path")
  const choice = page.locator("#which-path a[href='/corporate-training']")
  await choice.click()
  await expect(page).toHaveURL(/\/corporate-training$/)
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport()
})

test("cross-page Train with Me landing yields to immediate visitor scrolling", async ({
  page,
}) => {
  await page.clock.install()
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/about")
  await page
    .getByRole("link", { name: "Train with Me", exact: true })
    .first()
    .click()
  await expect(page).toHaveURL(/\/#which-path$/)
  // Interrupt before the delayed landing correction, then exercise its full deadline.
  await page.evaluate(() => {
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: 200 }))
    window.scrollTo({ top: 0, behavior: "instant" })
  })
  await page.clock.fastForward(3000)
  await expect(page.locator(".he-word")).toBeInViewport()
  await expect(page.locator("#which-path")).not.toBeInViewport()
})

test("active same-page smooth scrolling yields to a touch gesture", async ({
  page,
}) => {
  await page.clock.install()
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/corporate-training")
  await page
    .getByRole("link", { name: "Start an inquiry", exact: true })
    .click()
  await page.evaluate(() => {
    window.dispatchEvent(new Event("touchstart"))
    window.scrollTo({ top: 0, behavior: "instant" })
  })
  // Exercise both the settling interval and the corrective-scroll deadline.
  await page.clock.fastForward(3000)
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport()
  await expect(page.locator("#inquiry")).not.toBeInViewport()
})
