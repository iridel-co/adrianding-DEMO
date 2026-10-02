import { execFileSync, spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import {
  buildPlan,
  normalizeFile,
  parseOptions,
  validateConfig,
} from "./core.mjs"

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean)
}

try {
  const options = parseOptions(process.argv.slice(2))
  const config = JSON.parse(readFileSync("quality.config.json", "utf8"))
  const pkg = JSON.parse(readFileSync("package.json", "utf8"))
  validateConfig(config, pkg.scripts ?? {})
  const files = [
    ...new Set(
      (options.files.length
        ? options.files
        : options.all
          ? []
          : options.base
            ? git([
                "diff",
                "--name-only",
                "-z",
                "--no-renames",
                `${options.base}...HEAD`,
                "--",
              ])
            : options.staged
              ? git([
                  "diff",
                  "--cached",
                  "--name-only",
                  "-z",
                  "--no-renames",
                  "--",
                ])
              : [
                  ...git(["diff", "--name-only", "-z", "--no-renames", "--"]),
                  ...git([
                    "diff",
                    "--cached",
                    "--name-only",
                    "-z",
                    "--no-renames",
                    "--",
                  ]),
                  ...git(["ls-files", "--others", "--exclude-standard", "-z"]),
                ]
      ).map(normalizeFile)
    ),
  ].sort()
  const checks = buildPlan(config, files, options)
  console.log(
    `Quality ${options.stage}: ${options.all ? "all checks" : `${files.length} changed paths`}`
  )
  files.forEach((file) => console.log(`  ${file}`))
  checks.forEach((check) =>
    console.log(`  ${check.id}: npm run ${check.script}`)
  )
  const unmatched = files.filter(
    (file) =>
      !config.checks.some((check) =>
        check.patterns.some((p) => new RegExp(p).test(file))
      )
  )
  if (unmatched.length)
    throw new Error(
      `Unmapped paths; add patterns before claiming coverage: ${unmatched.join(", ")}`
    )
  if (!checks.length) {
    console.log("No checks selected; no quality proof established.")
    process.exit(2)
  }
  if (options.plan) process.exit(0)
  // Invoked through npm, this avoids Windows .cmd shell quoting and Unix-only env syntax.
  const npmCli = process.env.npm_execpath
  if (!npmCli) throw new Error("Run through npm: npm run quality -- ...")
  for (const check of checks) {
    const start = performance.now()
    const result = spawnSync(process.execPath, [npmCli, "run", check.script], {
      stdio: "inherit",
      shell: false,
    })
    console.log(
      `${check.id}: ${result.status === 0 ? "PASS" : "FAIL"} (${((performance.now() - start) / 1000).toFixed(1)}s)`
    )
    if (result.error) console.error(result.error.message)
    if (result.status !== 0) process.exit(result.status ?? 1)
  }
  console.log(
    "Selected checks passed. Browser, hosted, and external-system proof require their own checks."
  )
} catch (error) {
  console.error(error.message)
  process.exit(2)
}
