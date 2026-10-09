import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { normalizeFile } from "./core.mjs"

export function validateSizeConfig(config) {
  const integer = (value) => Number.isSafeInteger(value) && value > 0
  if (
    !config ||
    Object.keys(config).some(
      (key) => !["version", "warnLines", "maxLines", "overrides"].includes(key)
    ) ||
    config?.version !== 1 ||
    !integer(config.warnLines) ||
    !integer(config.maxLines) ||
    config.warnLines >= config.maxLines ||
    !config.overrides ||
    typeof config.overrides !== "object" ||
    Array.isArray(config.overrides)
  )
    throw new Error(
      "Expected version 1, positive warnLines < maxLines, and overrides object"
    )
  for (const [file, override] of Object.entries(config.overrides)) {
    if (normalizeFile(file) !== file || !/^src\/.*\.(?:ts|tsx|css)$/.test(file))
      throw new Error(`Invalid source override path: ${file}`)
    if (
      !override ||
      Object.keys(override).some(
        (key) => !["maxLines", "reason", "expires"].includes(key)
      ) ||
      !integer(override.maxLines) ||
      override.maxLines <= config.maxLines ||
      typeof override.reason !== "string" ||
      !override.reason.trim() ||
      (override.expires !== undefined &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(override.expires) ||
          !Number.isFinite(Date.parse(override.expires)) ||
          new Date(override.expires).toISOString().slice(0, 10) !==
            override.expires))
    )
      throw new Error(`Invalid source override: ${file}`)
  }
}

export function countSourceLines(bytes) {
  if (bytes.includes(0)) throw new Error("Source contains binary NUL bytes")
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  const lines = text ? text.split(/\r\n|\n|\r/) : []
  if (lines.at(-1) === "") lines.pop()
  return {
    physical: lines.length,
    nonempty: lines.filter((line) => line.trim()).length,
  }
}

export function inspectSourceSize(
  root,
  config,
  today = new Date().toISOString().slice(0, 10)
) {
  validateSizeConfig(config)
  const files = []
  const walk = (directory) => {
    for (const entry of readdirSync(path.join(root, directory), {
      withFileTypes: true,
    })) {
      const file = `${directory}/${entry.name}`
      if (entry.isDirectory()) walk(file)
      else if (/\.(?:ts|tsx|css)$/.test(entry.name)) {
        if (!entry.isFile())
          throw new Error(`Source must be a regular file: ${file}`)
        files.push(file)
      }
    }
  }
  walk("src")
  const errors = [],
    warnings = [],
    rows = []
  for (const file of files.sort()) {
    let counts
    try {
      counts = countSourceLines(readFileSync(path.join(root, file)))
    } catch (error) {
      errors.push(`${file}: ${error.message}`)
      continue
    }
    const override = config.overrides[file]
    if (override?.expires && override.expires < today)
      errors.push(`${file}: override expired ${override.expires}`)
    if (override && counts.nonempty <= config.maxLines)
      errors.push(`${file}: unused override; remove it`)
    const max = override?.maxLines ?? config.maxLines
    const message = `${file}: ${counts.nonempty} nonempty / ${counts.physical} physical lines (maximum ${max})`
    if (counts.nonempty > max) errors.push(message)
    else if (counts.nonempty > config.warnLines) warnings.push(message)
    rows.push({ file, ...counts, max })
  }
  for (const file of Object.keys(config.overrides)) {
    if (!files.includes(file))
      errors.push(`${file}: override does not match an existing source file`)
  }
  return { rows, errors, warnings }
}
