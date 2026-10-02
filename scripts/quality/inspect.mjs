import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

// Read-only inventory. No installation, execution of repo code, or file writes.
const pkg = JSON.parse(readFileSync("package.json", "utf8"))
const deps = { ...pkg.dependencies, ...pkg.devDependencies }
const scripts = pkg.scripts ?? {}
const ignored = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".tmp",
  ".next",
  ".cache",
  "vendor",
])
const files = []
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory() && !ignored.has(entry.name)) walk(file)
    else if (entry.isFile())
      files.push(file.replaceAll("\\", "/").replace(/^\.\//, ""))
  }
}
walk(".")
const hasTs = files.some((f) => /\.tsx?$/.test(f))
const hasReact = !!deps.react
const hasTests = files.some(
  (f) =>
    !f.startsWith("scripts/quality/") &&
    /(?:\.(test|spec)\.[cm]?[jt]sx?$|(^|\/)test_[^/]+\.py$)/.test(f)
)
const missing = []
function requireItem(condition, message) {
  console.log(`${condition ? "FOUND" : "MISSING"}: ${message}`)
  if (!condition) missing.push(message)
}
console.log(
  `Repo: ${pkg.name ?? "(unnamed)"}; ${files.length} files; TypeScript=${hasTs}; React=${hasReact}`
)
for (const script of [
  "format:check",
  "lint",
  "test:quality",
  "build",
  ...(hasTs ? ["typecheck"] : []),
]) {
  requireItem(
    !!scripts[script],
    `npm script ${script} (map equivalent existing names in quality.config.json)`
  )
}
requireItem(!!deps.prettier, "Prettier dependency")
requireItem(!!deps.eslint, "ESLint dependency")
requireItem(
  files.some((f) =>
    /(^|\/)(eslint\.config\.[cm]?[jt]s|\.eslintrc(?:\..+)?)$/.test(f)
  ),
  "ESLint configuration"
)
requireItem(
  !!pkg.prettier ||
    files.some((f) =>
      /(^|\/)(\.prettierrc(?:\..+)?|prettier\.config\.[cm]?[jt]s)$/.test(f)
    ),
  "Prettier configuration"
)
requireItem(
  hasTests,
  "application behavioral tests (pending PR02; runner tests are tooling coverage only)"
)
if (hasTs) {
  requireItem(!!deps.typescript, "TypeScript dependency")
  requireItem(
    files.some((f) => /(^|\/)tsconfig[^/]*\.json$/.test(f)),
    "TypeScript project configuration"
  )
  requireItem(
    !!deps["typescript-eslint"] || !!deps["@typescript-eslint/parser"],
    "TypeScript ESLint support"
  )
}
if (hasReact)
  requireItem(!!deps["eslint-plugin-react-hooks"], "React Hooks ESLint rules")
requireItem(existsSync("quality.config.json"), "quality.config.json")
requireItem(
  files.some((f) => /^\.github\/workflows\//.test(f)),
  "CI workflow (inspect whether it actually runs checks)"
)
requireItem(
  [
    "package-lock.json",
    "npm-shrinkwrap.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lock",
    "bun.lockb",
  ].some(existsSync),
  "dependency lockfile"
)
const risky = files.filter((f) =>
  /(^|\/)(auth|payments?|billing|migrations?|api|server)(\/|\.)/i.test(f)
)
if (risky.length)
  console.log(
    `REVIEW: ${risky.length} possible security/data-contract files; add authorization, validation, migration, and integration checks for actual behavior.`
  )
console.log(
  `\n${missing.length} setup gaps. Presence is inventory evidence, not proof of effective configuration. See docs/development/quality.md.`
)
process.exitCode = missing.length ? 2 : 0
