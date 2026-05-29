/**
 * Collect TypeScript errors from `tsc --noEmit`.
 *
 * Usage:
 *   node scripts/typescript/collect-ts-errors.mjs           # stdout JSON
 *   node scripts/typescript/collect-ts-errors.mjs --write   # refresh baseline file
 */
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASELINE_PATH = path.join(__dirname, "ts-error-baseline.json")
const ERROR_RE = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/gm

export function runTsc() {
  const result = spawnSync("pnpm", ["exec", "tsc", "--noEmit"], {
    encoding: "utf8",
    cwd: path.join(__dirname, "../.."),
  })
  return (result.stdout ?? "") + (result.stderr ?? "")
}

export function parseTscOutput(output) {
  const errors = []
  let match
  while ((match = ERROR_RE.exec(output)) !== null) {
    errors.push({
      file: match[1],
      line: Number(match[2]),
      col: Number(match[3]),
      code: match[4],
      message: match[5],
    })
  }
  return errors
}

export function fingerprint(error) {
  return `${error.file}:${error.line}:${error.col}:${error.code}`
}

export function buildSnapshot(errors) {
  const fingerprints = errors.map(fingerprint).sort()
  return {
    version: 1,
    capturedAt: new Date().toISOString().slice(0, 10),
    workstream: "WS-05",
    total: errors.length,
    fingerprints,
    errors: errors.sort((a, b) => fingerprint(a).localeCompare(fingerprint(b))),
  }
}

function main() {
  const write = process.argv.includes("--write")
  const output = runTsc()
  const errors = parseTscOutput(output)
  const snapshot = buildSnapshot(errors)

  if (write) {
    fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(snapshot, null, 2)}\n`)
    console.log(`Baseline written: ${errors.length} errors → ${BASELINE_PATH}`)
    process.exit(0)
  }

  console.log(JSON.stringify(snapshot, null, 2))
  process.exit(errors.length > 0 ? 2 : 0)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
