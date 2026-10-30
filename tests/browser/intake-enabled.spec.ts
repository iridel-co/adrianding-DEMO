import { expect, test, type Page } from "@playwright/test"
import { fillInquiry, fillRegistration } from "./helpers/form-data"

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type,idempotency-key",
}

async function widgetRenderCount(page: Page) {
  return page.evaluate(
    () =>
      (window as unknown as { __testActions: string[] }).__testActions.length
  )
}

test.describe("@policy local enabled intake", () => {
  test.skip(
    process.env.TEST_INTAKE_ENABLED !== "1",
    "Runs only in the isolated enabled-intake fixture pass"
  )
  test.beforeEach(async ({ page }) => {
    await page.route(
      "https://challenges.cloudflare.com/turnstile/v0/api.js**",
      (route) =>
        route.fulfill({
          headers: cors,
          contentType: "application/javascript",
          body: `(() => { let next=0; const widgets=new Map(); window.__testActions=[];window.__testWidgetOptions=[]; window.turnstile={ render(element,options){const id=String(++next);widgets.set(id,{element,options});window.__testActions.push(options.action);window.__testWidgetOptions.push({size:options.size,theme:options.theme});element.innerHTML='<div style="width:'+(options.size==='compact'?'150px':'100%')+';min-width:'+(options.size==='compact'?'150px':'300px')+';height:'+(options.size==='compact'?'140px':'65px')+'">Local verification fixture</div>';setTimeout(()=>{if(widgets.has(id))options.callback('fixture-token-'+id)},10);return id}, remove(id){const widget=widgets.get(id);if(widget)widget.element.textContent='';widgets.delete(id)} };window.__verificationError=(code)=>{for(const widget of widgets.values())widget.options['error-callback'](code)};window.__expireVerification=()=>{for(const widget of widgets.values())widget.options['expired-callback']()};window.__verifyAgain=()=>{for(const widget of widgets.values())widget.options.callback('fixture-token-'+(++next))};})()`,
        })
    )
  })
  async function registration(page: Page) {
    await page.goto("/workshops/exceptional-salesmanship")
    await page
      .locator("#workshop-registration-card")
      .getByRole("button", { name: "Reserve your seat" })
      .click()
    const form = page.getByRole("dialog", { name: "Reserve your seat" })
    await fillRegistration(form)
    await form.getByRole("button", { name: "Continue", exact: true }).click()
    await form.getByRole("button", { name: "Continue", exact: true }).click()
    await expect(
      form.getByRole("button", { name: "Finish", exact: true })
    ).toBeEnabled()
    return form
  }
  for (const width of [320, 1440])
    test(`verification layout, expiry and retry fit at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 })
      const form = await registration(page)
      const verification = form.getByRole("group", {
        name: "Security verification",
        exact: true,
      })
      await expect(verification.getByRole("status")).toHaveText(
        "Verification complete."
      )
      await expect(verification).not.toHaveClass(/rounded|border|bg-muted/)
      const options = await page.evaluate(() =>
        (
          window as unknown as {
            __testWidgetOptions: { size: string; theme: string }[]
          }
        ).__testWidgetOptions.at(-1)
      )
      expect(options).toEqual({
        size: width === 320 ? "compact" : "flexible",
        theme: "light",
      })
      const widgetBounds = await verification
        .locator(":scope > div")
        .evaluate((element) => ({
          available: element.getBoundingClientRect().width,
          widget: element.firstElementChild!.getBoundingClientRect().width,
        }))
      expect(widgetBounds.widget).toBeLessThanOrEqual(
        widgetBounds.available + 1
      )
      if (width === 1440)
        expect(widgetBounds.widget).toBeCloseTo(widgetBounds.available, 0)
      await page.evaluate(() =>
        (
          window as unknown as { __verificationError: (code: string) => void }
        ).__verificationError("110200")
      )
      await expect(form.getByRole("alert")).toContainText(
        "not configured for this website"
      )
      await expect(
        form.getByRole("button", { name: "Finish", exact: true })
      ).toBeDisabled()
      await form
        .getByRole("button", { name: "Retry verification", exact: true })
        .click()
      await expect(
        form.getByRole("button", { name: "Finish", exact: true })
      ).toBeEnabled()
      await page.evaluate(() =>
        (
          window as unknown as { __expireVerification: () => void }
        ).__expireVerification()
      )
      await expect(form.getByRole("alert")).toContainText(
        "Verification expired"
      )
      await form
        .getByRole("button", { name: "Retry verification", exact: true })
        .click()
      await expect(
        form.getByRole("button", { name: "Finish", exact: true })
      ).toBeEnabled()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    })
  test("verification script download can retry without losing form answers", async ({
    page,
  }) => {
    let blocked = true
    await page.route(
      "https://challenges.cloudflare.com/turnstile/v0/api.js**",
      async (route) => {
        if (blocked) return route.abort()
        return route.fallback()
      }
    )
    await page.goto("/workshops/exceptional-salesmanship")
    await page
      .getByRole("button", { name: "Register now", exact: true })
      .click()
    const form = page.getByRole("dialog", { name: "Reserve your seat" })
    await fillRegistration(form)
    await form
      .getByRole("button", { name: "Continue", exact: true })
      .press("Enter")
    await form
      .getByRole("button", { name: "Continue", exact: true })
      .press("Enter")
    await expect(form.getByRole("alert")).toContainText(
      "couldn't complete verification"
    )
    blocked = false
    await form
      .getByRole("button", { name: "Retry verification", exact: true })
      .click()
    await expect(
      form.getByRole("button", { name: "Finish", exact: true })
    ).toBeEnabled()
    await form.getByRole("button", { name: "Back", exact: true }).click()
    await expect(form.locator('input[name="occupation"]')).toHaveValue(
      "Insurance advisor"
    )
  })
  test("stalled verification script times out and can retry", async ({
    page,
  }) => {
    await page.clock.install()
    let release: (() => void) | undefined
    let hold = true
    await page.route(
      "https://challenges.cloudflare.com/turnstile/v0/api.js**",
      async (route) => {
        if (!hold) return route.fallback()
        await new Promise<void>((resolve) => {
          release = resolve
        })
        await route.abort()
      }
    )
    await page.goto("/workshops/exceptional-salesmanship")
    await page
      .getByRole("button", { name: "Register now", exact: true })
      .click()
    const form = page.getByRole("dialog", { name: "Reserve your seat" })
    await fillRegistration(form)
    await form
      .getByRole("button", { name: "Continue", exact: true })
      .press("Enter")
    await form
      .getByRole("button", { name: "Continue", exact: true })
      .press("Enter")
    await expect(
      form.getByText("Loading verification…", { exact: true })
    ).toBeVisible()
    await page.clock.fastForward(16000)
    await expect(form.getByRole("alert")).toContainText(
      "couldn't complete verification"
    )
    hold = false
    release?.()
    await form
      .getByRole("button", { name: "Retry verification", exact: true })
      .click()
    await page.clock.resume()
    await expect(
      form.getByRole("button", { name: "Finish", exact: true })
    ).toBeEnabled()
  })
  for (const full of [true, false])
    test(`registration acceptance ${full ? "with reference" : "generic duplicate"}`, async ({
      page,
    }) => {
      const posted: Record<string, unknown>[] = []
      await page.route("**/api/registrations", async (route) => {
        if (route.request().method() !== "POST")
          return route.fulfill({ headers: cors, status: 204 })
        posted.push(route.request().postDataJSON())
        expect(route.request().headers()["idempotency-key"]).toMatch(
          /^[0-9a-f-]{36}$/i
        )
        await route.fulfill({
          headers: cors,
          status: 202,
          json: full
            ? { accepted: true, reference: "AD-PSW-0042", isPaid: false }
            : { accepted: true },
        })
      })
      const form = await registration(page)
      if (full) {
        const consent = form.getByRole("checkbox")
        await consent.uncheck()
        await form.getByRole("button", { name: "Finish", exact: true }).click()
        await expect(consent).toBeFocused()
        await expect(consent).toHaveAttribute("aria-invalid", "true")
        await expect(consent).toHaveAccessibleDescription(
          "You need to agree to continue."
        )
        expect(posted).toHaveLength(0)
        await form.getByRole("button", { name: "Back", exact: true }).click()
        await expect(form.locator('input[name="occupation"]')).toHaveValue(
          "Insurance advisor"
        )
        await form
          .getByRole("button", { name: "Continue", exact: true })
          .click()
        await consent.check()
      }
      const rendersBeforeSubmit = await widgetRenderCount(page)
      await form.getByRole("checkbox", { name: /I agree/ }).press("Enter")
      await expect(page).toHaveURL(/\/registered$/)
      expect(await widgetRenderCount(page)).toBe(rendersBeforeSubmit)
      await expect(
        page.getByRole("heading", { name: /Registration accepted/ })
      ).toBeVisible()
      await expect(
        page.getByRole("link", { name: "Back to home", exact: true })
      ).toHaveAttribute("href", "/")
      await expect(page.locator("iframe, video")).toHaveCount(0)
      await expect(page.getByText("Start before the day starts.")).toHaveCount(
        0
      )
      expect(posted).toHaveLength(1)
      expect(posted[0]).toMatchObject({
        workshopSessionId: "12345678-abcd-4000-8000-123456789abc",
        occupation: "Insurance advisor",
        consent: true,
        website: "",
      })
      for (const key of ["slug", "kind", "price", "quantity"])
        expect(posted[0]).not.toHaveProperty(key)
      if (full) {
        await expect(
          page.getByText("AD-PSW-0042", { exact: true })
        ).toBeVisible()
        await expect(page.getByText("Unpaid", { exact: true })).toBeVisible()
      } else {
        await expect(page.getByText("Unpaid", { exact: true })).toHaveCount(0)
        await expect(page.getByText(/Email jobs were queued/)).toHaveCount(0)
      }
      await expect(
        page.getByText(/48 hours|0000 0000|Your full name \+/)
      ).toHaveCount(0)
    })
  test("lost response retries the same saved attempt after closing the dialog", async ({
    page,
  }) => {
    const attempts: { key: string; body: Record<string, unknown> }[] = []
    await page.route("**/api/registrations", async (route) => {
      if (route.request().method() !== "POST")
        return route.fulfill({ headers: cors, status: 204 })
      attempts.push({
        key: route.request().headers()["idempotency-key"],
        body: route.request().postDataJSON(),
      })
      if (attempts.length === 1) return route.abort("failed")
      await route.fulfill({
        headers: cors,
        status: 202,
        json: { accepted: true, reference: "AD-PSW-RETRY", isPaid: false },
      })
    })
    const form = await registration(page)
    await form.getByRole("button", { name: "Finish", exact: true }).click()
    await expect(page.locator("[data-slot=toast]")).toContainText(
      "could not confirm"
    )
    await expect(form.getByText(/kept for a safe retry/)).toHaveCount(0)
    expect(
      await page
        .locator("[data-slot=toast]")
        .evaluate((el) => el.closest("form,[role=dialog]") === null)
    ).toBe(true)
    await expect(
      page.getByRole("region", { name: "Form notifications" })
    ).toBeVisible()
    await page.getByRole("button", { name: "Dismiss toast" }).click()
    await expect(page.locator("[data-slot=toast]")).toHaveCount(0)
    await expect(form).toBeVisible()
    await expect(
      form.getByRole("button", { name: "Back", exact: true })
    ).toBeDisabled()
    await page.keyboard.press("Escape")
    await page
      .locator("#workshop-registration-card")
      .getByRole("button", { name: "Reserve your seat" })
      .click()
    const reopened = page.getByRole("dialog", { name: "Reserve your seat" })
    await expect(
      reopened.getByRole("button", { name: "Finish", exact: true })
    ).toBeEnabled()
    await reopened.getByRole("button", { name: "Finish", exact: true }).click()
    await expect(page.getByText("AD-PSW-RETRY", { exact: true })).toBeVisible()
    expect(attempts).toHaveLength(2)
    expect(attempts[0].key).toBe(attempts[1].key)
    expect(attempts[0].body.turnstileToken).not.toBe(
      attempts[1].body.turnstileToken
    )
    delete attempts[0].body.turnstileToken
    delete attempts[1].body.turnstileToken
    expect(attempts[0].body).toEqual(attempts[1].body)
  })
  test("verification expiry blocks submission and storage failure preserves the accepted reference", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const set = Storage.prototype.setItem
      Storage.prototype.setItem = function (key, value) {
        if (key === "ad-portal-receipt-v1") throw new Error("Storage blocked")
        return set.call(this, key, value)
      }
    })
    let posts = 0
    await page.route("**/api/registrations", async (route) => {
      if (route.request().method() !== "POST")
        return route.fulfill({ headers: cors, status: 204 })
      posts++
      await route.fulfill({
        headers: cors,
        status: 202,
        json: { accepted: true, reference: "AD-PSW-MEMORY", isPaid: false },
      })
    })
    const form = await registration(page)
    await page.evaluate(() => {
      ;(
        window as unknown as { __expireVerification: () => void }
      ).__expireVerification()
    })
    await expect(
      form.getByRole("button", { name: "Finish", exact: true })
    ).toBeDisabled()
    expect(posts).toBe(0)
    await page.evaluate(() => {
      ;(window as unknown as { __verifyAgain: () => void }).__verifyAgain()
    })
    await page.evaluate(() => {
      ;(
        window as unknown as { __verificationError: () => void }
      ).__verificationError()
    })
    await form
      .getByRole("button", { name: "Retry verification", exact: true })
      .click()
    await form.getByRole("button", { name: "Finish", exact: true }).click()
    await expect(page.getByText("AD-PSW-MEMORY", { exact: true })).toBeVisible()
    await page.reload()
    await expect(
      page.getByText(/no accepted registration receipt/)
    ).toBeVisible()
  })
  for (const mode of ["pick", "text"])
    test(`corporate ${mode} dates submit titles and accepted-only receipt`, async ({
      page,
    }) => {
      if (mode === "pick")
        await page.setViewportSize({ width: 360, height: 800 })
      let body: Record<string, unknown> | undefined
      await page.route("**/api/corporate-inquiries", async (route) => {
        if (route.request().method() !== "POST")
          return route.fulfill({ headers: cors, status: 204 })
        body = route.request().postDataJSON()
        await route.fulfill({
          headers: cors,
          status: 202,
          json: { accepted: true },
        })
      })
      await page.goto("/corporate-training#inquiry")
      const form = page.locator("form")
      await fillInquiry(form)
      const forward = form.getByRole("button", {
        name: "Continue",
        exact: true,
      })
      if (mode === "pick")
        await form.locator('input[name="fullName"]').fill("Alex".repeat(40))
      await forward.click()
      if (mode === "pick")
        await form.locator('input[name="company"]').fill("Company".repeat(25))
      await forward.click()
      if (mode === "pick")
        await form.locator('input[name="venue"]').fill("Venue".repeat(50))
      if (mode === "text") {
        await form
          .getByRole("tab", { name: "Not fixed yet", exact: true })
          .click()
        await form
          .getByRole("textbox", { name: "Possible date", exact: true })
          .fill("Q1 2027, flexible")
      }
      await forward.click()
      await expect(
        form.getByRole("button", { name: "Send inquiry" })
      ).toBeEnabled()
      if (mode === "pick") {
        const consent = form.getByRole("checkbox", { name: /I agree/ })
        await consent.uncheck()
        await form.getByRole("button", { name: "Send inquiry" }).click()
        await expect(consent).toBeFocused()
        await expect(consent).toHaveAttribute("aria-invalid", "true")
        expect(body).toBeUndefined()
        await consent.check()
      }
      const rendersBeforeSubmit = await widgetRenderCount(page)
      await form.getByRole("checkbox", { name: /I agree/ }).press("Enter")
      await expect(page).toHaveURL(/inquiry-received$/)
      expect(await widgetRenderCount(page)).toBe(rendersBeforeSubmit)
      await expect(
        page.getByRole("heading", { name: /got your inquiry/ })
      ).toBeVisible()
      await expect(
        page.getByRole("link", { name: "Back to home", exact: true })
      ).toHaveAttribute("href", "/")
      if (mode === "pick") {
        await expect(page.getByRole("heading", { level: 1 })).toContainText(
          "Alex".repeat(40)
        )
        await expect(
          page.getByText("Venue".repeat(50), { exact: true })
        ).toBeVisible()
        for (const element of await page.locator("h1, dd").all())
          expect(
            await element.evaluate((el) => el.scrollWidth <= el.clientWidth)
          ).toBe(true)
      }
      expect(body).toMatchObject({
        program: "Leadership Training & Development",
        consent: true,
        website: "",
      })
      expect(body).not.toHaveProperty("targetDate")
      expect(body?.alsoInterested).toEqual(["CMS Program 1"])
      if (mode === "text") {
        expect(body).toHaveProperty("targetDateText", "Q1 2027, flexible")
        expect(body).not.toHaveProperty("targetDateFrom")
      } else {
        expect(body).toHaveProperty("targetDateFrom", "2026-11-10")
        expect(body).toHaveProperty("targetDateTo", "2026-11-12")
        expect(body).not.toHaveProperty("targetDateText")
      }
    })
})
