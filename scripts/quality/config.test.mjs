import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { buildPlan, parseOptions, validateConfig } from "./core.mjs"

const config = JSON.parse(
  readFileSync(new URL("../../quality.config.json", import.meta.url), "utf8")
)
const pkg = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8")
)
const ids = (files, stage) =>
  buildPlan(config, files, parseOptions([`--stage=${stage}`])).map((c) => c.id)

test("repository mapping covers CSS, source, tooling, and fresh build plus OG", () => {
  validateConfig(config, pkg.scripts)
  assert.deepEqual(ids(["docs/index.md"], "handoff"), ["format"])
  assert.deepEqual(ids(["src/app/globals.css"], "handoff"), [
    "format",
    "css",
    "build-and-og",
    "browser",
  ])
  assert.deepEqual(ids(["src/app/page.tsx"], "checkpoint"), [
    "format",
    "lint",
    "types",
  ])
  assert.ok(ids(["scripts/check-og.mjs"], "handoff").includes("build-and-og"))
  assert.equal(pkg.scripts["check:build"], "npm run build && npm run check:og")
  assert.equal(pkg.scripts["test:browser"], "npm run build && playwright test")
  for (const file of [
    "tests/browser/public-site.spec.ts",
    "playwright.config.ts",
  ]) {
    assert.deepEqual(ids([file], "handoff"), [
      "format",
      "lint",
      "types",
      "browser",
    ])
  }
  for (const file of [
    "package-lock.json",
    ".nvmrc",
    ".gitattributes",
    "scripts/quality/run.mjs",
    ".github/workflows/lint.yml",
    ".stylelintrc.json",
    "postcss.config.mjs",
  ]) {
    assert.equal(ids([file], "handoff").length, config.checks.length, file)
  }
  assert.ok(!config.checks.some((c) => c.script === "test:unit"))
})
