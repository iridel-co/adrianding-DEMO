import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { inspectSourceSize } from "./source-size-core.mjs"

try {
  const root = fileURLToPath(new URL("../../", import.meta.url))
  const config = JSON.parse(
    readFileSync(
      new URL("../../source-size.config.json", import.meta.url),
      "utf8"
    )
  )
  const result = inspectSourceSize(root, config)
  console.log(
    `Source size: ${result.rows.length} src .ts/.tsx/.css files; nonempty physical lines including comments (warn >${config.warnLines}, fail >${config.maxLines}; explicit per-file maxima). Generated output outside src is excluded.`
  )
  result.warnings.forEach((message) => console.warn(`WARN ${message}`))
  result.errors.forEach((message) => console.error(`FAIL ${message}`))
  process.exitCode = result.errors.length ? 1 : 0
} catch (error) {
  console.error(`Source size: ${error.message}`)
  process.exitCode = 1
}
