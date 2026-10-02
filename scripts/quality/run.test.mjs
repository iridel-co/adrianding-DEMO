import test from "node:test"
import assert from "node:assert/strict"
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  renameSync,
  unlinkSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync, execFileSync } from "node:child_process"

const runner = fileURLToPath(new URL("./run.mjs", import.meta.url))
test("plan is read-only; missing scripts fail; execution stops at failure", () => {
  const root = mkdtempSync(path.join(tmpdir(), "portable-quality-test-"))
  try {
    const config = {
      version: 1,
      checks: ["first", "fail", "last"].map((id) => ({
        id,
        script: id,
        stage: "edit",
        patterns: ["."],
      })),
    }
    writeFileSync(
      path.join(root, "quality.config.json"),
      JSON.stringify(config)
    )
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ scripts: { first: "x", fail: "x", last: "x" } })
    )
    const npmCli = path.join(root, "fake-npm.cjs")
    writeFileSync(
      npmCli,
      "require('node:fs').appendFileSync('executed.txt', process.argv[3] + '\\n'); process.exit(process.argv[3] === 'fail' ? 7 : 0);"
    )
    const run = (args) =>
      spawnSync(process.execPath, [runner, ...args], {
        cwd: root,
        env: { ...process.env, npm_execpath: npmCli },
        encoding: "utf8",
      })
    const plan = run(["--all", "--plan"])
    assert.equal(plan.status, 0, plan.stderr)
    assert.throws(() => readFileSync(path.join(root, "executed.txt")))
    const executed = run(["--all"])
    assert.equal(executed.status, 7, executed.stderr)
    assert.equal(
      readFileSync(path.join(root, "executed.txt"), "utf8"),
      "first\nfail\n"
    )
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ scripts: { first: "x" } })
    )
    assert.equal(run(["--all", "--plan"]).status, 2)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("Git scopes include deletes, both rename paths, and untracked paths; base excludes dirty edits", () => {
  const root = mkdtempSync(path.join(tmpdir(), "quality-git-test-"))
  try {
    const git = (...args) =>
      execFileSync("git", args, { cwd: root, encoding: "utf8" })
    git("init", "--quiet")
    git("config", "user.name", "Quality fixture")
    git("config", "user.email", "quality@example.invalid")
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ scripts: { check: "unused" } })
    )
    writeFileSync(
      path.join(root, "quality.config.json"),
      JSON.stringify({
        version: 1,
        checks: [
          { id: "check", script: "check", stage: "edit", patterns: ["."] },
        ],
      })
    )
    for (const name of ["old.txt", "deleted.txt", "edited.txt"])
      writeFileSync(path.join(root, name), "original\n")
    git(
      "add",
      "package.json",
      "quality.config.json",
      "old.txt",
      "deleted.txt",
      "edited.txt"
    )
    git("commit", "--quiet", "-m", "test: initial fixture")
    const base = git("rev-parse", "HEAD").trim()
    renameSync(path.join(root, "old.txt"), path.join(root, "new.txt"))
    unlinkSync(path.join(root, "deleted.txt"))
    git("add", "old.txt", "new.txt", "deleted.txt")
    writeFileSync(path.join(root, "edited.txt"), "changed\n")
    writeFileSync(path.join(root, "untracked space.txt"), "new\n")
    const run = (...args) =>
      spawnSync(process.execPath, [runner, ...args, "--plan"], {
        cwd: root,
        encoding: "utf8",
      })
    const staged = run("--staged")
    assert.equal(staged.status, 0, staged.stderr)
    for (const name of ["deleted.txt", "old.txt", "new.txt"])
      assert.ok(staged.stdout.includes(`  ${name}\n`), staged.stdout)
    assert.ok(!staged.stdout.includes("  edited.txt\n"))
    const dirty = run()
    assert.equal(dirty.status, 0, dirty.stderr)
    assert.ok(dirty.stdout.includes("  edited.txt\n"))
    assert.ok(dirty.stdout.includes("  untracked space.txt\n"))
    assert.equal(run(`--base=${base}`).status, 2) // No committed changes, so no proof.
    git("commit", "--quiet", "-m", "test: rename and delete fixture")
    const branch = run(`--base=${base}`)
    assert.equal(branch.status, 0, branch.stderr)
    for (const name of ["deleted.txt", "old.txt", "new.txt"])
      assert.ok(branch.stdout.includes(`  ${name}\n`))
    assert.ok(!branch.stdout.includes("  edited.txt\n"))
    assert.ok(!branch.stdout.includes("  untracked space.txt\n"))
    assert.equal(run("--file=untracked space.txt").status, 0)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
