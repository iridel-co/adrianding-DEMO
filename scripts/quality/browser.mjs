import { createServer } from "node:http"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { cmsReply } from "../../tests/fixtures/cms.mjs"

// Build and serve against the same API fixture; the normal app uses .env.local.
const fixture = createServer((request, response) => {
  if (request.method !== "GET") {
    response.writeHead(405).end()
    return
  }
  const { status, body } = cmsReply(new URL(request.url, "http://localhost"))
  response.writeHead(status, { "Content-Type": "application/json" })
  response.end(JSON.stringify(body))
})
fixture.listen(0, "127.0.0.1")
await once(fixture, "listening")
const env = {
  ...process.env,
  PORTAL_API_URL: `http://127.0.0.1:${fixture.address().port}`,
  WORKSHOP_INTAKE_ENABLED: "false",
  CORPORATE_INTAKE_ENABLED: "false",
  TEST_INTAKE_ENABLED: "0",
}

async function run(file, args, runEnv = env) {
  const child = spawn(process.execPath, [file, ...args], {
    env: runEnv,
    stdio: "inherit",
  })
  const [code, signal] = await once(child, "exit")
  if (code !== 0)
    throw new Error(`Browser check command failed (${signal ?? code})`)
}

try {
  const args = process.argv.slice(2)
  const enabledOnly = args.some((arg) => arg.includes("intake-enabled.spec"))
  if (!enabledOnly) {
    await run("node_modules/next/dist/bin/next", ["build"])
    await run("node_modules/@playwright/test/cli.js", ["test", ...args])
  }
  if (enabledOnly || args.length === 0) {
    const enabledEnv = {
      ...env,
      WORKSHOP_INTAKE_ENABLED: "true",
      CORPORATE_INTAKE_ENABLED: "true",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "local-fixture-key",
      TEST_INTAKE_ENABLED: "1",
    }
    await run("node_modules/next/dist/bin/next", ["build"], enabledEnv)
    await run(
      "node_modules/@playwright/test/cli.js",
      ["test", "tests/browser/intake-enabled.spec.ts", "--project=desktop"],
      enabledEnv
    )
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  fixture.closeAllConnections()
  await new Promise((resolve) => fixture.close(resolve))
}
