/**
 * WS-08.7 — AI resolver observation regression harness.
 *
 * Aggregates existing vertical QA scripts into a single stability report.
 * Does NOT modify runtime — orchestration only.
 *
 * Prerequisites:
 *   pnpm dev  (http://localhost:3000/demo)
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:ai-observation
 */
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

const SUITES = [
  { name: "qa:events", script: "scripts/runtime/demo-event-checklist.mjs", expected: "8/8" },
  { name: "qa:restaurant", script: "scripts/convergence/restaurant-ai-resolver-validation.mjs", expected: "6/6" },
  { name: "qa:health", script: "scripts/convergence/health-ai-resolver-validation.mjs", expected: "7/7" },
]

function runSuite(script) {
  return new Promise((resolve) => {
    const child = spawn("node", [script], {
      cwd: ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString()
      process.stdout.write(chunk)
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
      process.stderr.write(chunk)
    })

    child.on("close", (code) => {
      const summaryMatch = stdout.match(/Steps passed: (\d+\/\d+)/)
      resolve({
        ok: code === 0,
        summary: summaryMatch?.[1] ?? (code === 0 ? "?" : "FAIL"),
        stdout,
        stderr,
      })
    })
  })
}

async function main() {
  console.log("--- AI Observation Regression (WS-08.7) ---")
  console.log(`Base: ${ROOT}`)
  console.log(`Demo: ${process.env.DEMO_URL ?? "http://localhost:3000/demo"}\n`)

  const results = []

  for (const suite of SUITES) {
    console.log(`\n=== ${suite.name} ===`)
    const result = await runSuite(suite.script)
    results.push({ ...suite, ...result })
  }

  console.log("\n--- Observation Matrix ---")
  for (const r of results) {
    const status = r.ok ? "PASS" : "FAIL"
    console.log(`${status}  ${r.name}  —  ${r.summary} (expected ${r.expected})`)
  }

  const failed = results.filter((r) => !r.ok)
  console.log("\n--- Summary ---")
  console.log(`Suites passed: ${results.length - failed.length}/${results.length}`)

  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.name).join(", "))
    console.log("\nHuman follow-up: scripts/qa/ai-observation-checklist.md")
    process.exit(1)
  }

  console.log("\nAutomated observation: GREEN")
  console.log("Human checklist: scripts/qa/ai-observation-checklist.md")
  console.log("Docs: docs/ai/AI_OBSERVATION_MATRIX.md")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
