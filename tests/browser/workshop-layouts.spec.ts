import { expect, test } from "@playwright/test"
import { fillRegistration } from "./helpers/form-data"

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
  await next.click()
  await page.getByRole("button", { name: /^Sales/ }).click()
  await expect(previous).toBeDisabled()
  await expect(page.getByText("Showing 1 of 2 workshops")).toBeVisible()
})
test("Workshop form labels, errors and overlapping Continue activations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto("/workshops/exceptional-salesmanship")
  await page.getByRole("button", { name: "Register now", exact: true }).click()
  const form = page
    .getByRole("dialog", { name: "Reserve your seat" })
    .locator("form")
  await expect(
    form.getByRole("heading", { name: /Step 1 of 3/ })
  ).not.toBeFocused()
  const name = form.getByLabel("Full name", { exact: true })
  await name.press("Enter")
  await expect(name).toBeFocused()
  await expect(name).toHaveAttribute("aria-invalid", "true")
  await expect(name).toHaveAccessibleDescription("Please enter your full name.")
  await form.getByText("Full name", { exact: true }).click()
  await expect(name).toBeFocused()
  await fillRegistration(form)
  await form
    .locator('input[name="email"]')
    .fill(`${"a".repeat(70)}@example.com`)
  await expect(name).toHaveAttribute("aria-invalid", "false")
  await name.press("Enter")
  await expect(form.getByRole("heading", { name: /Step 2 of 3/ })).toBeVisible()
  await form.getByRole("button", { name: "Back", exact: true }).click()
  const forward = form.getByRole("button", { name: "Continue", exact: true })
  await forward.evaluate((button: HTMLButtonElement) => {
    button.click()
    button.click()
  })
  await expect(form.getByRole("heading", { name: /Step 2 of 3/ })).toBeVisible()
  await form.getByRole("button", { name: "Back", exact: true }).click()
  await expect(name).toHaveValue("Juan Dela Cruz")
  await forward.dblclick({ delay: 0 })
  await expect(form.getByRole("heading", { name: /Step 2 of 3/ })).toBeVisible()
  await expect(
    form.getByLabel("Salary range (required)", { exact: true })
  ).toHaveText("₱50,000 – ₱80,000")
  const range = form.getByRole("combobox", { name: "Salary range (required)" })
  await range.focus()
  await range.press("Enter")
  await expect(page.getByRole("listbox")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(range).toBeFocused()
  await expect(form).toBeVisible()
  await forward.click()
  await expect(form.getByRole("heading", { name: /Step 3 of 3/ })).toBeFocused()
  const dialog = page.getByRole("dialog", { name: "Reserve your seat" })
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true
  )
  await form.getByRole("button", { name: "Back", exact: true }).click()
  await expect(form.locator('input[name="occupation"]')).toHaveValue(
    "Insurance advisor"
  )
})

test("long workshop card titles fit with tags and details @layout", async ({
  page,
  isMobile,
}) => {
  const title = "bobCat_testWorkshop_007"
  for (const width of isMobile ? [360] : [360, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto(width === 360 ? "/workshops" : "/")
    const card = page
      .locator('a[href="/workshops/exceptional-salesmanship"]')
      .filter({ has: page.locator("h3") })
      .first()
    await card.scrollIntoViewIfNeeded()
    await page.evaluate(() => document.fonts.ready.then(() => undefined))

    const checkLayout = async (expectWrap: boolean) => {
      await expect
        .poll(() =>
          card.evaluate((link, expectWrap) => {
            const heading = link.querySelector("h3")!
            const tags = link.querySelector('ul[aria-label="Focus areas"]')!
            const date = heading.previousElementSibling!
            const details = heading.nextElementSibling!
            const bounds = link.getBoundingClientRect()
            const range = document.createRange()
            range.selectNodeContents(heading)
            const lines = Array.from(range.getClientRects())
            const content = [
              ...lines,
              ...Array.from(tags.children, (tag) =>
                tag.getBoundingClientRect()
              ),
              date.getBoundingClientRect(),
              details.getBoundingClientRect(),
            ]
            return (
              (!expectWrap ||
                new Set(lines.map((line) => line.top)).size > 1) &&
              content.every(
                (rect) =>
                  rect.width > 0 &&
                  rect.height > 0 &&
                  rect.left >= bounds.left - 1 &&
                  rect.right <= bounds.right + 1 &&
                  rect.top >= bounds.top - 1 &&
                  rect.bottom <= bounds.bottom + 1
              ) &&
              tags.getBoundingClientRect().bottom <=
                date.getBoundingClientRect().top &&
              details.getBoundingClientRect().height >= details.scrollHeight - 1
            )
          }, expectWrap)
        )
        .toBe(true)
    }

    if (width === 1440) {
      const details = card.locator("h3 + div")
      await expect(details).toHaveCSS("opacity", "0")
      await card.hover()
      await expect(details).toHaveCSS("opacity", "1")
    }
    await expect(card.getByText("CMS workshop summary.")).toBeVisible()
    await expect(card.getByText("Register", { exact: true })).toBeVisible()
    await checkLayout(false)
    await card.evaluate((link, title) => {
      link.querySelector("h3")!.textContent = title
      const tags = link.querySelector('ul[aria-label="Focus areas"]')!
      const template = tags.firstElementChild!
      tags.replaceChildren(
        ...["Communication", "Leadership", "Sales", "Customer Experience"].map(
          (label) => {
            const tag = template.cloneNode(true) as HTMLElement
            tag.lastChild!.textContent = label
            return tag
          }
        )
      )
    }, title)
    await checkLayout(width === 360)
  }
})
