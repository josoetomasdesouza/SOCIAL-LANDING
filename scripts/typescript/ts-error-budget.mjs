/**
 * WS-05 — TypeScript error budget gate.
 *
 * Policy: baseline errors are tolerated; NEW errors block merge.
 * Does NOT require zero errors.
 *
 * Usage:
 *   pnpm ts:budget
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  buildSnapshot,
  fingerprint,
  parseTscOutput,
  runTsc,
} from "./collect-ts-errors.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASELINE_PATH = path.join(__dirname, "ts-error-baseline.json")

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`Missing baseline: ${BASELINE_PATH}`)
    console.error("Run: pnpm ts:baseline:refresh")
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"))
}

function main() {
  const baseline = loadBaseline()
  const baselineSet = new Set(baseline.fingerprints ?? [])
  const output = runTsc()
  const errors = parseTscOutput(output)
  const current = buildSnapshot(errors)
  const currentSet = new Set(current.fingerprints)

  const newErrors = current.fingerprints.filter((fp) => !baselineSet.has(fp))
  const fixedErrors = baseline.fingerprints.filter((fp) => !currentSet.has(fp))

  console.log("--- TypeScript Error Budget (WS-05) ---")
  console.log(`Baseline total: ${baseline.total}`)
  console.log(`Current total:  ${current.total}`)
  console.log(`New errors:     ${newErrors.length}`)
  console.log(`Fixed errors:   ${fixedErrors.length}`)

  if (newErrors.length > 0) {
    console.error("\n❌ BLOCKED — new TypeScript errors (not in baseline):")
    for (const fp of newErrors) {
      const err = current.errors.find((e) => fingerprint(e) === fp)
      if (err) {
        console.error(`  ${err.file}:${err.line}:${err.col} ${err.code} — ${err.message}`)
      } else {
        console.error(`  ${fp}`)
      }
    }
    console.error("\nFix the errors or refresh baseline intentionally (WS-05 maintainer only).")
    process.exit(1)
  }

  if (current.total > baseline.total) {
    console.error("\n❌ BLOCKED — error count increased above baseline.")
    process.exit(1)
  }

  if (fixedErrors.length > 0) {
    console.log("\n✅ PASS (with reductions — consider refreshing baseline in a follow-up PR):")
    for (const fp of fixedErrors.slice(0, 10)) {
      console.log(`  fixed: ${fp}`)
    }
    if (fixedErrors.length > 10) {
      console.log(`  … and ${fixedErrors.length - 10} more`)
    }
  } else {
    console.log("\n✅ PASS — no new TypeScript errors.")
  }

  process.exit(0)
}

main()
