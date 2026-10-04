import { expect, test } from "@playwright/test"

const workshop = "/workshops/exceptional-salesmanship"

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-04T04:00:00Z"))
})

test("main navigation works with keyboard activation", async ({
  page,
}, testInfo) => {
  await page.goto("/")
  if (testInfo.project.name === "mobile") {
    const menu = page.getByRole("button", { name: "Open menu" })
    await menu.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("dialog")).toBeVisible()
  }
  const navigation =
    testInfo.project.name === "mobile"
      ? page.getByRole("dialog")
      : page.getByRole("navigation", { name: "Main" })
  const about = navigation.getByRole("link", { name: "About", exact: true })
  await about.focus()
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
  await expect(page).toHaveURL(workshop)
})

test("workshop registration validates, preserves steps and personalizes confirmation", async ({
  page,
}) => {
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
  await dialog.getByRole("button", { name: "Complete registration" }).click()
  await expect(page).toHaveURL(`${workshop}/registered`)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "You're on the list, Juan."
  )
})

test("corporate inquiry validates and submits all four steps", async ({
  page,
}) => {
  await page.goto("/corporate-training?program=leadership#inquiry")
  const form = page.locator("form")
  await form.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(form.getByText("Please enter your full name.")).toBeVisible()
  await form
    .getByRole("button", {
      name: "Demo shortcut: fill this form with sample data",
    })
    .click()
  for (const step of [2, 3, 4]) {
    await form.getByRole("button", { name: "Continue", exact: true }).click()
    await expect(form.getByText(new RegExp(`Step ${step} of 4`))).toBeVisible()
  }
  await expect(page).toHaveURL(
    /\/corporate-training\?program=leadership#inquiry$/
  )
  await form.getByRole("button", { name: "Send inquiry" }).click()
  await expect(page).toHaveURL(/\/corporate-training\/inquiry-received$/)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Thanks, Maria. We've got your inquiry."
  )
  await expect(
    page.getByText("Acme Manufacturing", { exact: true }).first()
  ).toBeVisible()
})

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
