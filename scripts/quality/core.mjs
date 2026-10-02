import path from "node:path"

export const stages = ["edit", "checkpoint", "handoff"]

export function normalizeFile(file) {
  const value = file.replaceAll("\\", "/").replace(/^\.\//, "")
  if (
    !value ||
    value.startsWith("-") ||
    path.posix.isAbsolute(value) ||
    /^[A-Za-z]:/.test(value) ||
    value.split("/").includes("..")
  ) {
    throw new Error(`Expected a repository-relative path: ${file}`)
  }
  return value
}

export function parseOptions(args) {
  const options = {
    stage: "checkpoint",
    files: [],
    plan: false,
    all: false,
    staged: false,
    base: "",
  }
  for (const arg of args) {
    if (arg === "--plan") options.plan = true
    else if (arg === "--all") options.all = true
    else if (arg === "--staged") options.staged = true
    else if (arg.startsWith("--stage=")) options.stage = arg.slice(8)
    else if (arg.startsWith("--base=")) {
      options.base = arg.slice(7)
      if (!options.base || options.base.startsWith("-"))
        throw new Error("Invalid base ref")
    } else if (arg.startsWith("--file="))
      options.files.push(normalizeFile(arg.slice(7)))
    else throw new Error(`Unknown option: ${arg}`)
  }
  if (!stages.includes(options.stage))
    throw new Error("Stage must be edit, checkpoint, or handoff")
  if (
    [
      options.all,
      options.staged,
      !!options.base,
      options.files.length > 0,
    ].filter(Boolean).length > 1
  ) {
    throw new Error(
      "Choose one scope: --all, --staged, --base, or repeated --file"
    )
  }
  return options
}

export function validateConfig(config, scripts) {
  if (
    config.version !== 1 ||
    !Array.isArray(config.checks) ||
    !config.checks.length
  )
    throw new Error("Expected version 1 and nonempty checks")
  const ids = new Set()
  for (const check of config.checks) {
    if (!check.id || ids.has(check.id))
      throw new Error("Check IDs must be unique and nonempty")
    ids.add(check.id)
    if (
      !stages.includes(check.stage) ||
      typeof check.script !== "string" ||
      !scripts[check.script]
    )
      throw new Error(`Invalid stage or missing npm script: ${check.id}`)
    if (
      !Array.isArray(check.patterns) ||
      !check.patterns.length ||
      check.patterns.some((p) => typeof p !== "string")
    )
      throw new Error(`Missing patterns: ${check.id}`)
    check.patterns.forEach((p) => new RegExp(p))
  }
}

export function buildPlan(config, files, options) {
  const force =
    options.all ||
    files.some((file) =>
      /^(?:package(?:-lock)?\.json|quality\.config\.json|\.nvmrc$|\.gitattributes$|\.prettier|\.stylelintrc|(?:eslint|postcss)\.config\.|scripts\/quality\/|\.github\/workflows\/)/.test(
        file
      )
    )
  return config.checks.filter(
    (check) =>
      stages.indexOf(check.stage) <= stages.indexOf(options.stage) &&
      (force ||
        files.some((file) =>
          check.patterns.some((pattern) => new RegExp(pattern).test(file))
        ))
  )
}
