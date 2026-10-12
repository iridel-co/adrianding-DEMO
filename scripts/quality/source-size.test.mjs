import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import {
  countSourceLines,
  inspectSourceSize,
  validateSizeConfig,
} from "./source-size-core.mjs"

const config = () => ({ version: 1, warnLines: 2, maxLines: 4, overrides: {} })
function fixture(run) {
  const root = mkdtempSync(path.join(os.tmpdir(), "source-size-"))
  mkdirSync(path.join(root, "src"))
  try {
    run(root, (file, content) =>
      writeFileSync(path.join(root, "src", file), content)
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test("counts nonempty physical lines without interpreting comments or JSX", () => {
  assert.deepEqual(
    countSourceLines(
      Buffer.from(
        'const url = "https://a"\r\n\r\n/* comment */\r\n<div>// text</div>\r\n'
      )
    ),
    { physical: 4, nonempty: 3 }
  )
  assert.deepEqual(countSourceLines(Buffer.from("")), {
    physical: 0,
    nonempty: 0,
  })
  assert.throws(() => countSourceLines(Buffer.from([0])), /binary/)
  assert.throws(() => countSourceLines(Buffer.from([0xff])), /encoded/)
})

test("strict thresholds warn above warning, fail above maximum, ignore assets", () =>
  fixture((root, write) => {
    write("exact.ts", "a\nb")
    write("warn.tsx", "a\nb\nc\nd")
    write("fail.css", "a\nb\nc\nd\ne")
    write("asset.png", Buffer.from([0, 0xff]))
    const result = inspectSourceSize(root, config())
    assert.equal(result.rows.length, 3)
    assert.equal(result.warnings.length, 1)
    assert.equal(result.errors.length, 1)
    assert.match(result.errors[0], /fail.css/)
  }))

test("per-file maxima remain bounded and stale or missing exceptions fail", () =>
  fixture((root, write) => {
    write("large.ts", "a\nb\nc\nd\ne")
    const cfg = config()
    cfg.overrides["src/large.ts"] = { maxLines: 5, reason: "Existing baseline" }
    assert.equal(inspectSourceSize(root, cfg).errors.length, 0)
    write("large.ts", "a\nb\nc\nd\ne\nf")
    assert.match(inspectSourceSize(root, cfg).errors[0], /maximum 5/)
    write("large.ts", "a")
    assert.match(inspectSourceSize(root, cfg).errors[0], /unused/)
    cfg.overrides["src/large.ts"].expires = "2026-01-01"
    assert.match(
      inspectSourceSize(root, cfg, "2026-01-02").errors[0],
      /expired/
    )
    cfg.overrides["src/missing.ts"] = { maxLines: 5, reason: "Missing" }
    assert.ok(
      inspectSourceSize(root, cfg).errors.some((error) =>
        /existing source/.test(error)
      )
    )
  }))

test("malformed config and exceptions fail closed", () => {
  for (const change of [
    { warnLines: 4 },
    { maxLines: 0 },
    { maxLines: 4.5 },
    { overrides: [] },
    { version: 2 },
  ])
    assert.throws(() => validateSizeConfig({ ...config(), ...change }))
  for (const [file, override] of [
    ["../escape.ts", { maxLines: 5, reason: "x" }],
    ["src/a.ts", { maxLines: 4, reason: "x" }],
    ["src/a.ts", { maxLines: 5, reason: " " }],
    ["src/a.ts", { maxLines: 5, reason: "x", expires: "2026-02-30" }],
  ])
    assert.throws(() =>
      validateSizeConfig({ ...config(), overrides: { [file]: override } })
    )
})

test("nontext source files report errors rather than disappearing", () =>
  fixture((root, write) => {
    write("binary.ts", Buffer.from([0]))
    write("invalid.tsx", Buffer.from([0xff]))
    assert.equal(inspectSourceSize(root, config()).errors.length, 2)
  }))
