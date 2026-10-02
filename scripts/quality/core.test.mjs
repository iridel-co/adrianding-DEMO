import test from "node:test"
import assert from "node:assert/strict"
import {
  buildPlan,
  normalizeFile,
  parseOptions,
  validateConfig,
} from "./core.mjs"

const config = {
  version: 1,
  checks: [
    { id: "format", script: "format", stage: "edit", patterns: ["."] },
    { id: "types", script: "types", stage: "checkpoint", patterns: ["\\.ts$"] },
    { id: "build", script: "build", stage: "handoff", patterns: ["^src/"] },
  ],
}
test("docs avoid types and build; source handoff includes both", () => {
  assert.deepEqual(
    buildPlan(config, ["README.md"], parseOptions(["--stage=handoff"])).map(
      (c) => c.id
    ),
    ["format"]
  )
  assert.deepEqual(
    buildPlan(
      config,
      ["src/deleted.ts"],
      parseOptions(["--stage=handoff"])
    ).map((c) => c.id),
    ["format", "types", "build"]
  )
})
test("dependency changes and all scope force every eligible check", () => {
  assert.equal(
    buildPlan(config, ["package-lock.json"], parseOptions(["--stage=handoff"]))
      .length,
    3
  )
  assert.equal(
    buildPlan(config, [], parseOptions(["--all", "--stage=handoff"])).length,
    3
  )
  assert.equal(
    buildPlan(config, ["package.json"], parseOptions(["--stage=edit"])).length,
    1
  )
})
test("paths normalize Windows separators and reject traversal and absolute paths", () => {
  assert.equal(normalizeFile("src\\a file.ts"), "src/a file.ts")
  for (const file of ["../a", "src/../a", "C:\\a", "/a", "-a", ""])
    assert.throws(() => normalizeFile(file))
})
test("arguments reject ambiguity, typos and invalid stages", () => {
  for (const args of [
    ["--all", "--staged"],
    ["--stage=unknown"],
    ["--wat"],
    ["--base="],
    ["--file=a", "--base=main"],
  ])
    assert.throws(() => parseOptions(args))
  assert.equal(parseOptions(["--file=a b.ts", "--file=c.ts"]).files.length, 2)
})
test("configuration fails on missing scripts, duplicate IDs, or bad regex", () => {
  validateConfig(config, { format: "x", types: "x", build: "x" })
  assert.throws(() => validateConfig(config, { format: "x" }))
  assert.throws(() =>
    validateConfig(
      { version: 1, checks: [config.checks[0], config.checks[0]] },
      { format: "x" }
    )
  )
  assert.throws(() =>
    validateConfig(
      { version: 1, checks: [{ ...config.checks[0], patterns: ["["] }] },
      { format: "x" }
    )
  )
})
