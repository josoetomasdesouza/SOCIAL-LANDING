/**
 * WS-08.8 — Multi-vertical AI regression harness.
 *
 * Runs canonical conversational flows from fixtures against:
 *   - ecommerce (frozen reference)
 *   - restaurant
 *   - health
 *
 * Prerequisites:
 *   pnpm dev  (http://localhost:3000/demo)
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:ai-regression
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { chromium } from "playwright"
import {
  addContextItem,
  ensureComposerInputReady,
  getComposerThreadText,
  getLastAiTurn,
  getLastAiTurnText,
  isCriticalConsoleError,
  openVertical,
  patternRegex,
  record,
  sendComposerMessage,
} from "./ai-regression-lib.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const FIXTURE_PATH = path.join(ROOT, "scripts/qa/fixtures/ai-canonical-flows.json")
const flows = JSON.parse(readFileSync(FIXTURE_PATH, "utf8"))

async function runExpectFlow(page, flow, verticalKey) {
  const results = []
  results._vertical = verticalKey
  results._scenario = flow.scenario

  const stepLabel = `${verticalKey}/${flow.id} ${flow.scenario}`

  if (flow.skipAutomated) {
    record(results, stepLabel, true, `SKIP — ${flow.skipReason ?? "manual only"}`)
    return results
  }

  if (flow.setupPrompt) {
    await sendComposerMessage(page, flow.setupPrompt)
  }

  if (flow.contextSourceId && flow.scenario !== "drawer-linkage") {
    if (flow.scenario === "contextual-follow-up") {
      const input = page.getByPlaceholder(/Pergunte sobre/i)
      await input.click({ force: true })
      await page.waitForTimeout(400)
    }

    await addContextItem(page, {
      sourceId: flow.contextSourceId,
      heading: flow.contextHeading,
      scope: flow.contextScope ?? "feed",
    })
  }

  if (flow.drawer?.blockTestId && flow.contextSourceId && flow.scenario === "drawer-linkage") {
    const input = page.getByPlaceholder(/Pergunte sobre/i)
    await input.click({ force: true })
    await page.waitForTimeout(400)
    await addContextItem(page, {
      sourceId: flow.contextSourceId,
      heading: flow.contextHeading,
      scope: flow.contextScope ?? "feed",
    })
  }

  if (flow.prompt) {
    await sendComposerMessage(page, flow.prompt)
  }

  const expect = flow.expect ?? {}
  const blockTestId = expect.blockTestId

  if (flow.scenario === "drawer-linkage") {
    const block = flow.drawer.blockTestId
      ? page.getByTestId(flow.drawer.blockTestId).last()
      : page.locator("body")

    if (flow.drawer.clickPattern) {
      await block.getByText(patternRegex(flow.drawer.clickPattern)).first().click()
    } else if (flow.drawer.clickRole) {
      await block.getByRole(flow.drawer.clickRole).click()
    }

    await page.waitForTimeout(600)
    const drawerOpen = await page.getByText(patternRegex(flow.drawer.openPattern)).first().isVisible()
    record(results, stepLabel, drawerOpen, drawerOpen ? "drawer/surface open" : "drawer missing")
    return results
  }

  let blockVisible = false
  let blockText = ""

  if (blockTestId) {
    const block = page.getByTestId(blockTestId).last()
    blockVisible = await block.isVisible()
    if (blockVisible) {
      blockText = (await block.textContent()) ?? ""
    }
  } else if (expect.visualBlock) {
    blockText = await getComposerThreadText(page)
    blockVisible = patternRegex(expect.contentPattern).test(blockText)
  } else {
    blockText = await getComposerThreadText(page)
  }

  if (expect.visualBlock === false) {
    const lastTurn = await getLastAiTurn(page)
    blockText = await getLastAiTurnText(page)

    const namedBlockVisible = blockTestId
      ? await lastTurn.getByTestId(blockTestId).isVisible().catch(() => false)
      : false
    const lastMenuVisible = await lastTurn
      .getByTestId("restaurant-conversation-menu-block")
      .isVisible()
      .catch(() => false)
    const lastHealthVisible = await lastTurn
      .getByTestId("health-conversation-results-block")
      .isVisible()
      .catch(() => false)

    const hasForbiddenBlock = namedBlockVisible || lastMenuVisible || lastHealthVisible

    const textOk = expect.contentPattern ? patternRegex(expect.contentPattern).test(blockText) : true
    const forbiddenOk = expect.forbiddenPattern
      ? !patternRegex(expect.forbiddenPattern).test(blockText)
      : true

    record(
      results,
      stepLabel,
      !hasForbiddenBlock && textOk && forbiddenOk,
      `visualBlock=false text=${textOk} forbidden=${forbiddenOk}`
    )
    return results
  }

  const contentOk = expect.contentPattern
    ? patternRegex(expect.contentPattern).test(blockText || (await getComposerThreadText(page)))
    : blockVisible

  let interactiveOk = true
  if (expect.minInteractive && blockTestId) {
    const block = page.getByTestId(blockTestId).last()
    const count = await block.locator("button").count()
    interactiveOk = count >= expect.minInteractive
  }

  const forbiddenOk = expect.forbiddenPattern
    ? !patternRegex(expect.forbiddenPattern).test(blockText)
    : true

  record(
    results,
    stepLabel,
    (blockTestId ? blockVisible : blockVisible || contentOk) && contentOk && interactiveOk && forbiddenOk,
    (blockText || "").slice(0, 80)
  )

  return results
}

async function main() {
  console.log("--- AI Regression Harness (WS-08.8) ---")
  console.log(`Fixture: v${flows.version} @ ${flows.baselineCommit}`)
  console.log(`Demo: ${process.env.DEMO_URL ?? "http://localhost:3000/demo"}\n`)

  const consoleErrors = []
  const allResults = []

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })

  for (const [verticalKey, vertical] of Object.entries(flows.verticals)) {
    console.log(`\n=== ${verticalKey.toUpperCase()} (${vertical.heading}) ===`)

    for (const flow of vertical.flows) {
      await openVertical(page, vertical.heading)
      const flowResults = await runExpectFlow(page, flow, verticalKey)
      allResults.push(...flowResults.filter((r) => r.step))
    }
  }

  const criticalErrors = consoleErrors.filter(isCriticalConsoleError)
  record(allResults, "global/no-critical-console-errors", criticalErrors.length === 0, criticalErrors.slice(0, 2).join(" | ") || "none")

  await browser.close()

  const failed = allResults.filter((r) => r.step && !r.ok)
  const passed = allResults.filter((r) => r.step && r.ok)

  console.log("\n--- Regression Matrix ---")
  const byVertical = {}
  for (const r of passed.concat(failed)) {
    if (!r.vertical) continue
    byVertical[r.vertical] ??= { pass: 0, fail: 0 }
    if (r.ok) byVertical[r.vertical].pass += 1
    else byVertical[r.vertical].fail += 1
  }
  for (const [v, counts] of Object.entries(byVertical)) {
    console.log(`${v}: ${counts.pass}/${counts.pass + counts.fail} scenarios`)
  }

  console.log("\n--- Summary ---")
  console.log(`Steps passed: ${passed.length}/${passed.length + failed.length}`)

  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.step).join(", "))
    console.log("\nSee: docs/ai/AI_REGRESSION_RULES.md")
    process.exit(1)
  }

  console.log("\nRegression harness: GREEN")
  console.log("Canonical flows: docs/ai/AI_CANONICAL_FLOWS.md")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
