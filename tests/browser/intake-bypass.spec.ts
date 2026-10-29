import { expect, test } from "@playwright/test"
import { fillInquiry, fillRegistration } from "./helpers/form-data"

test.describe("@policy temporary Turnstile bypass", () => {
  test.skip(
    process.env.TEST_TURNSTILE_DISABLED !== "1",
    "Requires the bypass fixture build"
  )

  for (const kind of ["corporate", "registration"] as const) {
    test(`${kind} submits without loading verification`, async ({ page }) => {
      const verificationRequests: string[] = []
      page.on("request", (request) => {
        if (request.url().includes("challenges.cloudflare.com"))
          verificationRequests.push(request.url())
      })
      let posted: Record<string, unknown> | undefined
      await page.route(
        `**/api/${kind === "corporate" ? "corporate-inquiries" : "registrations"}`,
        async (route) => {
          const headers = {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "content-type,idempotency-key",
          }
          if (route.request().method() === "OPTIONS")
            return route.fulfill({ status: 204, headers })
          posted = route.request().postDataJSON()
          await route.fulfill({
            status: 202,
            headers,
            json: { accepted: true },
          })
        }
      )
      await page.goto(
        kind === "corporate"
          ? "/corporate-training"
          : "/workshops/exceptional-salesmanship"
      )
      if (kind === "registration")
        await page
          .getByRole("button", { name: "Register now", exact: true })
          .click()
      const form =
        kind === "corporate"
          ? page.locator("#inquiry form")
          : page.getByRole("dialog", { name: "Reserve your seat" })
      await expect(form).not.toContainText("details and verification")
      if (kind === "corporate") await fillInquiry(form)
      else await fillRegistration(form)
      for (let step = 1; step < (kind === "corporate" ? 4 : 3); step++) {
        await form
          .getByRole("button", { name: "Continue", exact: true })
          .click()
      }
      await expect(
        form.getByRole("group", { name: "Security verification", exact: true })
      ).toHaveCount(0)
      await form
        .getByRole("button", {
          name: kind === "corporate" ? "Send inquiry" : "Finish",
          exact: true,
        })
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          kind === "corporate"
            ? "/corporate-training/inquiry-received"
            : "/workshops/exceptional-salesmanship/registered$"
        )
      )
      await expect.poll(() => posted).toBeDefined()
      expect(posted).toMatchObject({
        turnstileToken: "",
        consent: true,
        website: "",
      })
      expect(verificationRequests).toEqual([])
    })
  }
})
