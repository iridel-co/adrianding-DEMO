import { expect, test, type Page } from "@playwright/test"

const workshop = "/workshops/exceptional-salesmanship"

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
  await expect(page.getByText("October 2026", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Next month" }).click()
  await expect(page.getByText("November 2026", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Previous month" }).click()
  await expect(page.getByText("October 2026", { exact: true })).toBeVisible()
  const date = page.getByRole("button", { name: "9", exact: true })
  await date.focus()
  await page.keyboard.press("Enter")
  const preview = page.getByRole("dialog", { name: "Workshop preview" })
  await expect(preview).toBeVisible()
  await preview
    .getByRole("link", { name: /View workshop.*Exceptional Salesmanship/ })
    .click()
  await expect(page).toHaveURL(workshop)
})

for (const blocked of [false, true]) {
  test(`workshop registration validates, preserves steps and confirms (storage blocked: ${blocked})`, async ({
    page,
  }) => {
    if (blocked) await blockStorage(page)
    await page.goto(workshop)
    await page
      .getByRole("button", { name: "Register now", exact: true })
      .first()
      .click()
    const dialog = page.getByRole("dialog", { name: "Reserve your seat" })
    await dialog.getByRole("button", { name: "Continue", exact: true }).click()
    await expect(dialog.getByText("Please enter your full name.")).toBeVisible()
    await dialog
      .getByRole("button", {
        name: "Demo shortcut: fill this form with sample data",
      })
      .click()
    await dialog.getByRole("button", { name: "Continue", exact: true }).click()
    await expect(dialog.getByText(/Step 2 of 3/)).toBeVisible()
    await dialog.getByRole("button", { name: "Back", exact: true }).click()
    await expect(dialog.getByPlaceholder("Juan Dela Cruz")).toHaveValue(
      "Juan Dela Cruz"
    )
    await dialog.getByRole("button", { name: "Continue", exact: true }).click()
    await dialog.getByRole("button", { name: "Continue", exact: true }).click()
    await expect(dialog.getByText(/Step 3 of 3/)).toBeVisible()
    await expect(page).toHaveURL(workshop)
    await dialog.getByRole("button", { name: "Finish" }).click()
    await expect(page).toHaveURL(`${workshop}/registered`)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      blocked ? "You're on the list." : "You're on the list, Juan."
    )
  })

  test(`corporate inquiry validates and confirms (storage blocked: ${blocked})`, async ({
    page,
  }) => {
    if (blocked) await blockStorage(page)
    await page.goto("/corporate-training?program=leadership#inquiry")
    const form = page.locator("form")
    // The URL prefill is applied after hydration; wait for its visible result
    // before exercising controls rendered by the server.
    await expect(
      form.getByText(/Enquiring about Leadership Training & Development/)
    ).toBeVisible()
    await form.getByRole("button", { name: "Continue", exact: true }).click()
    await expect(form.getByText("Please enter your full name.")).toBeVisible()
    await form
      .getByRole("button", {
        name: "Demo shortcut: fill this form with sample data",
      })
      .click()
    for (const step of [2, 3, 4]) {
      await form.getByRole("button", { name: "Continue", exact: true }).click()
      await expect(
        form.getByText(new RegExp(`Step ${step} of 4`))
      ).toBeVisible()
    }
    await expect(page).toHaveURL(
      /\/corporate-training\?program=leadership#inquiry$/
    )
    await form.getByRole("button", { name: "Send inquiry" }).click()
    await expect(page).toHaveURL(/\/corporate-training\/inquiry-received$/)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      blocked
        ? "Thanks — we've got your inquiry."
        : "Thanks, Maria. We've got your inquiry."
    )
    const company = page
      .getByText("Acme Manufacturing", { exact: true })
      .first()
    if (blocked) await expect(company).toHaveCount(0)
    else await expect(company).toBeVisible()
  })
}

for (const storage of ["missing", "malformed", "unavailable"] as const) {
  for (const route of [
    `${workshop}/registered`,
    "/corporate-training/inquiry-received",
  ]) {
    test(`${route} falls back with ${storage} storage`, async ({ page }) => {
      const errors: string[] = []
      page.on("pageerror", (error) => errors.push(error.message))
      await page.addInitScript((mode) => {
        const markRead = () => {
          document.documentElement.dataset.storageRead = "true"
        }
        if (mode === "unavailable") {
          Object.defineProperty(window, "sessionStorage", {
            get() {
              markRead()
              throw new Error("Storage blocked")
            },
          })
        } else if (mode === "malformed") {
          sessionStorage.setItem("ad-demo-handoff", "{invalid json")
        }
        if (mode !== "unavailable") {
          const read = Storage.prototype.getItem
          Storage.prototype.getItem = function (key) {
            if (key === "ad-demo-handoff") markRead()
            return read.call(this, key)
          }
        }
      }, storage)
      await page.goto(route)
      await expect(page.locator("html")).toHaveAttribute(
        "data-storage-read",
        "true"
      )
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        route.includes("registered")
          ? "You're on the list."
          : "Thanks — we've got your inquiry."
      )
      await expect(
        page.getByRole("link", { name: /Coach Adrian Ding — home/ })
      ).toBeVisible()
      expect(errors).toEqual([])
    })
  }
}

async function blockStorage(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new Error("Storage blocked")
      },
    })
  })
}
