import { expect, test, type Page } from "@playwright/test"

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type,idempotency-key",
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
          body: `(() => { let next=0; const widgets=new Map(); window.__testActions=[]; window.turnstile={ render(element,options){const id=String(++next);widgets.set(id,{element,options});window.__testActions.push(options.action);element.textContent='Local verification fixture';setTimeout(()=>{if(widgets.has(id))options.callback('fixture-token-'+id)},10);return id}, remove(id){const widget=widgets.get(id);if(widget)widget.element.textContent='';widgets.delete(id)} };window.__verificationError=()=>{for(const widget of widgets.values())widget.options['error-callback']()};window.__expireVerification=()=>{for(const widget of widgets.values())widget.options['expired-callback']()};window.__verifyAgain=()=>{for(const widget of widgets.values())widget.options.callback('fixture-token-'+(++next))};})()`,
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
    await form
      .getByRole("button", { name: /fill this form with sample data/i })
      .click()
    await form.getByRole("button", { name: "Continue", exact: true }).click()
    await form.getByRole("button", { name: "Continue", exact: true }).click()
    await expect(
      form.getByRole("button", { name: "Finish", exact: true })
    ).toBeEnabled()
    return form
  }
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
      await form.getByRole("button", { name: "Finish", exact: true }).click()
      await expect(page).toHaveURL(/\/registered$/)
      await expect(
        page.getByRole("heading", { name: /Registration accepted/ })
      ).toBeVisible()
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
    await expect(form.getByRole("alert")).toContainText("could not confirm")
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
      await form
        .getByRole("button", { name: /fill this form with sample data/i })
        .click()
      const forward = form.getByRole("button", {
        name: "Continue",
        exact: true,
      })
      await forward.click()
      await forward.click()
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
      await form.getByRole("button", { name: "Send inquiry" }).click()
      await expect(page).toHaveURL(/inquiry-received$/)
      await expect(
        page.getByRole("heading", { name: /got your inquiry/ })
      ).toBeVisible()
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
