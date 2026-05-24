/**
 * Personal Phase 3 — drawer migration validation (events + overflow).
 *
 * Prerequisites:
 *   pnpm dev
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:personal
 *   DEMO_URL=http://127.0.0.1:3000/demo pnpm qa:personal
 *
 * Merge gate: all steps PASS (9/9). Blocks converge PR if any FAIL.
 */
import { chromium } from "playwright"

const BASE = process.env.DEMO_URL ?? "http://127.0.0.1:3000/demo"

function record(results, step, ok, detail) {
  results.push({ step, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? ` — ${detail}` : ""}`)
}

async function main() {
  const events = []
  const consoleErrors = []
  const results = []

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  page.on("console", async (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
    if (!msg.text().includes("[passive-event]")) return
    const match = msg.text().match(/\[passive-event\] (\S+)/)
    if (!match) return
    const type = match[1]
    let payload = null
    try {
      const args = await Promise.all(msg.args().map((arg) => arg.jsonValue()))
      payload = args[1] ?? null
    } catch {
      payload = null
    }
    events.push({ type, payload })
  })

  await page.goto(BASE, { waitUntil: "networkidle" })
  const pessoal = page.getByRole("heading", { name: "Pessoal", exact: true }).locator("xpath=ancestor::button[1]")
  await pessoal.scrollIntoViewIfNeeded()
  await pessoal.click()
  await page.waitForTimeout(800)

  const contactButton = page.getByRole("button", { name: "Entrar em contato" })
  await contactButton.scrollIntoViewIfNeeded()

  const beforeContactOpen = events.length
  await contactButton.click()
  await page.waitForTimeout(600)
  const contactOpen = events.slice(beforeContactOpen)
  const contactDrawerOpen = contactOpen.find((e) => e.type === "drawer.opened")
  const contactSurfaceOpen = contactOpen.find((e) => e.type === "surface.opened")
  record(
    results,
    "1. personal:contact open events",
    contactDrawerOpen?.payload?.drawerId === "personal:contact" &&
      contactSurfaceOpen?.payload?.surfaceId === "personal:contact",
    `drawerId=${contactDrawerOpen?.payload?.drawerId}, surfaceId=${contactSurfaceOpen?.payload?.surfaceId}`
  )

  const beforeContactCloseBtn = events.length
  await page.locator(".fixed.bottom-0.z-50").getByRole("button").first().click()
  await page.waitForTimeout(600)
  const contactCloseBtn = events.slice(beforeContactCloseBtn)
  record(
    results,
    "2. personal:contact close button",
    contactCloseBtn.some((e) => e.type === "drawer.closed" && e.payload?.drawerId === "personal:contact") &&
      contactCloseBtn.some((e) => e.type === "surface.closed" && e.payload?.surfaceId === "personal:contact"),
    `drawer.closed=${contactCloseBtn.filter((e) => e.type === "drawer.closed").length}`
  )

  const overflowAfterContactBtn = await page.evaluate(() => document.body.style.overflow)
  record(
    results,
    "2b. overflow clean after contact button close",
    overflowAfterContactBtn === "",
    `overflow="${overflowAfterContactBtn}"`
  )

  await contactButton.scrollIntoViewIfNeeded()
  await contactButton.click()
  await page.waitForTimeout(400)
  const beforeContactEsc = events.length
  await page.keyboard.press("Escape")
  await page.waitForTimeout(600)
  const contactEsc = events.slice(beforeContactEsc)
  record(
    results,
    "3. personal:contact close Escape",
    contactEsc.some((e) => e.type === "drawer.closed" && e.payload?.drawerId === "personal:contact"),
    `events=${contactEsc.map((e) => e.type).join(",")}`
  )

  const projectButton = page.getByRole("button", { name: "App de Produtividade" })
  await projectButton.scrollIntoViewIfNeeded()
  const beforeProjectOpen = events.length
  await projectButton.click()
  await page.waitForTimeout(600)
  const projectOpen = events.slice(beforeProjectOpen)
  const projectDrawerOpen = projectOpen.find((e) => e.type === "drawer.opened")
  record(
    results,
    "4. personal:project open events",
    projectDrawerOpen?.payload?.drawerId === "personal:project" &&
      projectOpen.some((e) => e.type === "surface.opened" && e.payload?.surfaceId === "personal:project"),
    `drawerId=${projectDrawerOpen?.payload?.drawerId}, title=${projectDrawerOpen?.payload?.title}`
  )

  const beforeProjectCloseBtn = events.length
  await page.locator(".fixed.bottom-0.z-50").getByRole("button").first().click()
  await page.waitForTimeout(600)
  const projectCloseBtn = events.slice(beforeProjectCloseBtn)
  record(
    results,
    "5. personal:project close button",
    projectCloseBtn.some((e) => e.type === "drawer.closed" && e.payload?.drawerId === "personal:project"),
    `events=${projectCloseBtn.map((e) => e.type).join(",")}`
  )

  const projectButton2 = page.getByRole("button", { name: "Dashboard Analytics" })
  await projectButton2.scrollIntoViewIfNeeded()
  await projectButton2.click()
  await page.waitForTimeout(400)
  const beforeProjectEsc = events.length
  await page.keyboard.press("Escape")
  await page.waitForTimeout(600)
  const projectEsc = events.slice(beforeProjectEsc)
  record(
    results,
    "6. personal:project close Escape",
    projectEsc.some((e) => e.type === "drawer.closed" && e.payload?.drawerId === "personal:project"),
    `events=${projectEsc.map((e) => e.type).join(",")}`
  )

  const overflowFinal = await page.evaluate(() => document.body.style.overflow)
  record(results, "6b. overflow clean final", overflowFinal === "", `overflow="${overflowFinal}"`)

  const criticalErrors = consoleErrors.filter(
    (e) => !e.includes("favicon") && !e.includes("404") && !e.includes("Failed to load resource")
  )
  record(
    results,
    "7. no critical console errors",
    criticalErrors.length === 0,
    criticalErrors.slice(0, 3).join(" | ") || "none"
  )

  await browser.close()

  const failed = results.filter((r) => !r.ok)
  console.log("\n--- Summary ---")
  console.log(`Steps passed: ${results.length - failed.length}/${results.length}`)
  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.step).join(", "))
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
