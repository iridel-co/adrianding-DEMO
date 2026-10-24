import { expect, test } from "@playwright/test"

const workshop = "/workshops/exceptional-salesmanship"

test("gallery removal preserves public journeys @layout", async ({ page }) => {
  for (const route of ["/", "/workshops", "/corporate-training", workshop]) {
    await page.goto(route)
    await expect(page.locator('a[href^="/gallery"]')).toHaveCount(0)
    await expect(
      page.getByText("Inside the room", { exact: true })
    ).toHaveCount(0)
    await expect(page.getByText("Past events", { exact: true })).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  }
  for (const route of ["/gallery", "/gallery/evercare"]) {
    const response = await page.goto(route)
    expect(response?.status()).toBe(404)
  }
})

test("motion controls persist pause and exclude duplicate focus stops @layout", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/corporate-training")
  for (const label of ["company logos", "testimonials"]) {
    const control = page.getByRole("button", {
      name: `Pause ${label}`,
      exact: true,
    })
    await control.scrollIntoViewIfNeeded()
    await control.click()
    const resume = page.getByRole("button", {
      name: `Resume ${label}`,
      exact: true,
    })
    await expect(resume).toHaveAttribute("aria-pressed", "true")
    const section = page.locator("section").filter({
      has: page.getByRole("button", {
        name: new RegExp(`^(Pause|Resume) ${label}$`),
      }),
    })
    const track = section
      .locator(".will-change-transform:visible, .flex.w-max.flex-none:visible")
      .first()
    const transform = () =>
      track.evaluate((el) => getComputedStyle(el).transform)
    const pausedPosition = await transform()
    await section.hover()
    await page.mouse.move(0, 0)
    if (label === "company logos") {
      await section
        .getByRole("button", { name: "All industries", exact: true })
        .focus()
    } else {
      await section.locator("figure:visible").first().focus()
    }
    await resume.focus()
    await page.clock.runFor(400)
    expect(await transform()).toBe(pausedPosition)
    const clone = section.locator("[aria-hidden][inert]:visible figure").first()
    if (await clone.count()) {
      await clone.evaluate((el) => (el as HTMLElement).focus())
      await expect(clone).not.toBeFocused()
    }
    await resume.click()
    await page.mouse.move(0, 0)
    await expect.poll(transform).not.toBe(pausedPosition)
    if (label === "company logos") {
      await page
        .getByRole("button", { name: "Pause company logos", exact: true })
        .click()
      await section
        .getByRole("button", { name: "All industries", exact: true })
        .click()
      await expect(
        page.getByRole("button", { name: "Resume company logos", exact: true })
      ).toHaveAttribute("aria-pressed", "true")
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(
    page.getByRole("button", {
      name: /(?:Pause|Resume) (?:testimonials|company logos)/,
    })
  ).toHaveCount(0)
  await expect(page.locator("figure:visible").first()).toBeVisible()
})

test.beforeEach(async ({ page }) => {
  // Keep demo dates deterministic while Date.now advances for GSAP's scroll timing.
  await page.clock.install({ time: new Date("2026-10-04T04:00:00Z") })
})

test("document scrolling follows the visitor's motion preference", async ({
  page,
}) => {
  await page.goto("/corporate-training")
  const startedAt = await page.evaluate(() => Date.now())
  await expect
    .poll(() => page.evaluate(() => Date.now()))
    .toBeGreaterThan(startedAt)
  const scrollBehavior = () =>
    page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior
    )
  await expect.poll(scrollBehavior).toBe("auto")
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await expect.poll(scrollBehavior).toBe("smooth")
})

test("inquiry landing stops controlling scroll after keyboard interaction", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.addInitScript(() => {
    const scrollTo = window.scrollTo.bind(window)
    window.scrollTo = (options?: ScrollToOptions | number, y?: number) => {
      if (typeof options === "number") scrollTo(options, y ?? 0)
      else {
        if (options?.behavior === "smooth") {
          document.documentElement.setAttribute(
            "data-smooth-scroll-started",
            "true"
          )
        }
        scrollTo(options)
      }
    }
  })
  await page.goto("/corporate-training?program=leadership#inquiry")
  await expect(
    page
      .locator("form")
      .getByText(/Enquiring about Leadership Training & Development/)
  ).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator("html")).toHaveAttribute(
    "data-smooth-scroll-started",
    "true"
  )
  await page.keyboard.press("ArrowUp")
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
  // Exercise the old corrective-scroll deadline without adding a wall-clock sleep.
  await page.clock.fastForward(3000)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test("main navigation works with keyboard activation", async ({
  page,
}, testInfo) => {
  const webkit = testInfo.project.name.startsWith("webkit")
  await page.goto("/")
  if (testInfo.project.name.includes("mobile")) {
    const menu = page.getByRole("button", { name: "Open menu" })
    const home = page.getByRole("link", { name: "Coach Adrian Ding — home" })
    await expect(home).toBeVisible()
    await home.focus()
    if (webkit) await menu.focus()
    else {
      await page.keyboard.press("Tab")
      await page.keyboard.press("Tab")
    }
    await expect(menu).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("dialog")).toBeVisible()
  }
  const navigation = testInfo.project.name.includes("mobile")
    ? page.getByRole("dialog")
    : page.getByRole("navigation", { name: "Main" })
  const about = navigation.getByRole("link", { name: "About", exact: true })
  if (testInfo.project.name.includes("mobile")) {
    const home = navigation.getByRole("link", { name: /Adrian Ding/ })
    await expect(home).toBeVisible()
    await home.focus()
  } else {
    const home = navigation.getByRole("link", {
      name: "Coach Adrian Ding — home",
    })
    await expect(home).toBeVisible()
    await home.focus()
  }
  // Windows WebKit excludes links from sequential Tab navigation by default.
  // Verify keyboard activation there; Chromium/Firefox also verify Tab order.
  if (webkit) await about.focus()
  else await page.keyboard.press("Tab")
  await expect(about).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})

test("workshop filters toggle and reset the listing", async ({ page }) => {
  await page.goto("/workshops")
  await expect(page.getByText("Local sample", { exact: true })).toHaveCount(0)
  await expect(page.getByText(/Early bird/i)).toHaveCount(0)
  const sales = page.getByRole("button", { name: /^Sales/ })
  await sales.click()
  await expect(sales).toHaveAttribute("aria-pressed", "true")
  const listing = page.locator("section").filter({ has: sales })
  await expect(
    listing.getByRole("link", { name: /Exceptional Leadership/ })
  ).toHaveCount(0)
  await expect(
    page.getByRole("link", { name: /Exceptional Salesmanship/ }).first()
  ).toBeVisible()
  await page.getByRole("button", { name: /^All/ }).click()
  await expect(sales).toHaveAttribute("aria-pressed", "false")
  await expect(
    page.getByRole("link", { name: /Exceptional Leadership/ }).first()
  ).toBeVisible()
})

test("calendar changes months and opens a workshop by keyboard", async ({
  page,
}) => {
  await page.goto("/workshops")
  await expect(page.getByText("November 2026", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Next month" }).click()
  await expect(page.getByText("December 2026", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Previous month" }).click()
  await expect(page.getByText("November 2026", { exact: true })).toBeVisible()
  const date = page.getByRole("button", { name: "20", exact: true })
  await date.focus()
  await page.keyboard.press("Enter")
  const preview = page.getByRole("dialog", { name: "Workshop preview" })
  await expect(preview).toBeVisible()
  await expect(preview.getByText("9 seats left", { exact: true })).toBeVisible()
  await expect(preview.getByText("9", { exact: true })).toHaveClass(
    /text-brand/
  )
  await preview
    .getByRole("link", { name: /View workshop.*Exceptional Salesmanship/ })
    .click()
  await expect(page).toHaveURL(
    `${workshop}?session=12345678-abcd-4000-8000-123456789abc`
  )
  await expect(page.getByText(/Early bird/i)).toHaveCount(0)
})

test("CMS content supplies dynamic programmes, client industries and contact details", async ({
  page,
}) => {
  await page.goto("/corporate-training")
  await expect(
    page.getByRole("heading", { name: "CMS Program 2", exact: true })
  ).toBeVisible()
  const clients = page.locator("section").filter({
    has: page.getByRole("button", { name: "All industries", exact: true }),
  })
  await expect(
    clients.getByText("CMS Client 1", { exact: true }).first()
  ).toBeVisible()
  const technology = clients.getByRole("button", {
    name: "Technology",
    exact: true,
  })
  await technology.click()
  await expect(technology).toHaveAttribute("aria-pressed", "true")
  await expect(clients.getByText("CMS Client 2", { exact: true })).toHaveCount(
    0
  )
  await clients
    .getByRole("button", { name: "All industries", exact: true })
    .click()
  await expect(
    clients.getByText("CMS Client 2", { exact: true }).first()
  ).toBeVisible()
  await expect(
    page
      .getByText("CMS Person 1", { exact: true })
      .filter({ visible: true })
      .first()
  ).toBeVisible()
  await expect(
    page.locator('a[href="mailto:coach@example.test"]').first()
  ).toBeVisible()
  await page.goto("/workshops")
  const newTag = page.getByRole("button", { name: /^New CMS tag/ })
  await newTag.click()
  await expect(newTag).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.getByRole("link", { name: /Exceptional Leadership/ })
  ).toHaveCount(0)
})
