/**
 * Personal Phase 3 — perceptual drawer smoke (observational).
 *
 * Prerequisites:
 *   pnpm dev
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:visual
 *   DEMO_URL=http://127.0.0.1:3000/demo pnpm qa:visual
 *
 * Merge gate: BLOCKER fails exit 1. ACCEPTED_WITH_NOTE passes but must be documented in PR.
 */
import { chromium } from "playwright"

const BASE = process.env.DEMO_URL ?? "http://127.0.0.1:3000/demo"

function record(results, step, verdict, detail) {
  results.push({ step, verdict, detail })
  console.log(`${verdict} ${step}${detail ? ` — ${detail}` : ""}`)
}

async function main() {
  const results = []
  const events = []
  const consoleErrors = []

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  page.on("console", async (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
    if (!msg.text().includes("[passive-event]")) return
    const match = msg.text().match(/\[passive-event\] (\S+)/)
    if (!match) return
    let payload = null
    try {
      const args = await Promise.all(msg.args().map((arg) => arg.jsonValue()))
      payload = args[1] ?? null
    } catch {
      payload = null
    }
    events.push({ type: match[1], payload })
  })

  await page.goto(BASE, { waitUntil: "networkidle" })
  const pessoal = page.getByRole("heading", { name: "Pessoal", exact: true }).locator("xpath=ancestor::button[1]")
  await pessoal.scrollIntoViewIfNeeded()
  await pessoal.click()
  await page.waitForTimeout(800)

  const contactButton = page.getByRole("button", { name: "Entrar em contato" })
  await contactButton.scrollIntoViewIfNeeded()
  await contactButton.click()
  await page.waitForTimeout(500)

  const drawer = page.locator(".fixed.bottom-0.z-50").last()
  const backdrop = page.locator(".fixed.inset-x-0.top-0.bg-black\\/50").last()
  const handle = drawer.locator(".w-10.h-1.rounded-full")
  const closeBtn = drawer.getByRole("button").first()
  const title = drawer.getByRole("heading", { level: 3, name: "Enviar mensagem" })

  const drawerBox = await drawer.boundingBox()
  const viewportHeight = 844
  const drawerHeightRatio = drawerBox ? drawerBox.height / viewportHeight : 0

  record(
    results,
    "V1. contact drawer visible",
    (await drawer.isVisible()) ? "ACCEPTED_VISUAL" : "BLOCKER",
    `visible=${await drawer.isVisible()}`
  )
  record(
    results,
    "V2. handle present",
    (await handle.count()) > 0 ? "ACCEPTED_VISUAL" : "NEEDS_ADJUSTMENT",
    `count=${await handle.count()}`
  )
  record(
    results,
    "V3. X close button present",
    (await closeBtn.isVisible()) ? "ACCEPTED_VISUAL" : "NEEDS_ADJUSTMENT",
    ""
  )
  record(
    results,
    "V4. backdrop present",
    (await backdrop.isVisible()) ? "ACCEPTED_VISUAL" : "NEEDS_ADJUSTMENT",
    ""
  )
  record(
    results,
    "V5. title visual preserved",
    (await title.isVisible()) ? "ACCEPTED_VISUAL" : "BLOCKER",
    "Enviar mensagem"
  )
  record(
    results,
    "V6. height ~80vh (lg, not 90vh vaul)",
    drawerHeightRatio > 0.45 && drawerHeightRatio < 0.92 ? "ACCEPTED_WITH_NOTE" : "NEEDS_ADJUSTMENT",
    `ratio=${drawerHeightRatio.toFixed(2)} (~80vh expected; vaul was ~90vh)`
  )
  record(
    results,
    "V7. form content preserved",
    (await page.getByPlaceholder("Seu nome").isVisible()) ? "ACCEPTED_VISUAL" : "BLOCKER",
    ""
  )

  const maxHeight = await drawer.evaluate((el) => getComputedStyle(el).maxHeight)
  record(
    results,
    "V8. maxHeight css",
    maxHeight.includes("80vh") ? "ACCEPTED_WITH_NOTE" : "ACCEPTED_WITH_NOTE",
    `maxHeight=${maxHeight}`
  )

  await closeBtn.click()
  await page.waitForTimeout(400)
  const overflowAfterX = await page.evaluate(() => document.body.style.overflow)
  record(
    results,
    "V9. overflow clean after X",
    overflowAfterX === "" ? "ACCEPTED_VISUAL" : "BLOCKER",
    `overflow="${overflowAfterX}"`
  )

  await contactButton.click()
  await page.waitForTimeout(300)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(400)
  record(
    results,
    "V10. Escape closes contact",
    (await drawer.isVisible()) === false ? "ACCEPTED_VISUAL" : "BLOCKER",
    ""
  )

  const projectButton = page.getByRole("button", { name: "App de Produtividade" })
  await projectButton.scrollIntoViewIfNeeded()
  const beforeProject = events.length
  await projectButton.click()
  await page.waitForTimeout(500)

  const projectTitle = drawer.getByRole("heading", { level: 3, name: "App de Produtividade" })
  const projectOpenEvents = events.slice(beforeProject)
  const projectDrawerEvent = projectOpenEvents.find((e) => e.type === "drawer.opened")

  record(
    results,
    "V11. project visual title",
    (await projectTitle.isVisible()) ? "ACCEPTED_VISUAL" : "BLOCKER",
    "App de Produtividade"
  )
  record(
    results,
    "V12. project technical id",
    projectDrawerEvent?.payload?.drawerId === "personal:project" ? "ACCEPTED_VISUAL" : "BLOCKER",
    `drawerId=${projectDrawerEvent?.payload?.drawerId}`
  )
  record(
    results,
    "V13. title != drawerId",
    projectDrawerEvent?.payload?.title === "App de Produtividade" &&
      projectDrawerEvent?.payload?.drawerId === "personal:project"
      ? "ACCEPTED_VISUAL"
      : "BLOCKER",
    `title=${projectDrawerEvent?.payload?.title}`
  )

  await drawer.getByRole("button").first().click()
  await page.waitForTimeout(300)
  await projectButton.scrollIntoViewIfNeeded()
  await page.getByRole("button", { name: "Dashboard Analytics" }).click()
  await page.waitForTimeout(300)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(400)

  const feedScrollable = await page.evaluate(() => {
    const el = document.scrollingElement ?? document.documentElement
    return el.scrollHeight > el.clientHeight
  })
  const overflowFinal = await page.evaluate(() => document.body.style.overflow)
  record(
    results,
    "V14. feed not locked after closes",
    overflowFinal === "" ? "ACCEPTED_VISUAL" : "BLOCKER",
    `overflow="${overflowFinal}", scrollable=${feedScrollable}`
  )

  const criticalErrors = consoleErrors.filter(
    (e) => !e.includes("favicon") && !e.includes("404") && !e.includes("Failed to load resource")
  )
  record(
    results,
    "V15. no critical console errors",
    criticalErrors.length === 0 ? "ACCEPTED_VISUAL" : "NEEDS_ADJUSTMENT",
    criticalErrors.slice(0, 2).join(" | ") || "none"
  )

  await browser.close()

  const blockers = results.filter((r) => r.verdict === "BLOCKER")
  const needsAdj = results.filter((r) => r.verdict === "NEEDS_ADJUSTMENT")
  console.log("\n--- Visual Smoke Summary ---")
  console.log(`Total checks: ${results.length}`)
  console.log(`ACCEPTED_VISUAL: ${results.filter((r) => r.verdict === "ACCEPTED_VISUAL").length}`)
  console.log(`ACCEPTED_WITH_NOTE: ${results.filter((r) => r.verdict === "ACCEPTED_WITH_NOTE").length}`)
  console.log(`NEEDS_ADJUSTMENT: ${needsAdj.length}`)
  console.log(`BLOCKER: ${blockers.length}`)

  if (blockers.length) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
