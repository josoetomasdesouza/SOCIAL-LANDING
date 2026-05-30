/**
 * WS-07 — Institutional ActionDrawer migration validation.
 *
 * Prerequisites:
 *   pnpm dev  (http://localhost:3000/demo)
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:institutional
 */
import { chromium } from "playwright"

const BASE = process.env.DEMO_URL ?? "http://localhost:3000/demo"

function record(results, step, ok, detail) {
  results.push({ step, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? ` — ${detail}` : ""}`)
}

async function dismissDrawer(page) {
  await page.keyboard.press("Escape")
  await page.waitForTimeout(700)
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

  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(1200)

  const institutional = page.getByRole("heading", { name: "Institucional", exact: true }).locator("xpath=ancestor::button[1]")
  await institutional.scrollIntoViewIfNeeded()
  await institutional.click()
  await page.waitForTimeout(800)

  const contactTrigger = page.getByRole("button", { name: "Fale conosco" }).first()
  await contactTrigger.scrollIntoViewIfNeeded()
  const beforeContactOpen = events.length
  await contactTrigger.click()
  await page.waitForTimeout(600)
  const contactOpen = events.slice(beforeContactOpen)
  const contactDrawerOpen = contactOpen.find((e) => e.type === "drawer.opened")
  record(
    results,
    "1. institutional:contact open events",
    contactDrawerOpen?.payload?.drawerId === "institutional:contact" &&
      contactOpen.some((e) => e.type === "surface.opened" && e.payload?.surfaceId === "institutional:contact"),
    `drawerId=${contactDrawerOpen?.payload?.drawerId}`
  )

  const beforeContactClose = events.length
  await dismissDrawer(page)
  const contactClose = events.slice(beforeContactClose)
  record(
    results,
    "2. institutional:contact close Escape",
    contactClose.some((e) => e.type === "drawer.closed" && e.payload?.drawerId === "institutional:contact"),
    `events=${contactClose.map((e) => e.type).join(",")}`
  )

  const overflowAfterContact = await page.evaluate(() => document.body.style.overflow)
  record(
    results,
    "2b. overflow clean after contact close",
    overflowAfterContact === "",
    `overflow="${overflowAfterContact}"`
  )

  const teamTrigger = page.getByRole("button", { name: "Ver equipe completa" })
  await teamTrigger.scrollIntoViewIfNeeded()
  const beforeTeamOpen = events.length
  await teamTrigger.click()
  await page.waitForTimeout(600)
  const teamOpen = events.slice(beforeTeamOpen)
  const teamDrawerOpen = teamOpen.find((e) => e.type === "drawer.opened")
  record(
    results,
    "3. institutional:team open events",
    teamDrawerOpen?.payload?.drawerId === "institutional:team" &&
      teamOpen.some((e) => e.type === "surface.opened" && e.payload?.surfaceId === "institutional:team"),
    `drawerId=${teamDrawerOpen?.payload?.drawerId}`
  )

  const beforeTeamClose = events.length
  await dismissDrawer(page)
  const teamClose = events.slice(beforeTeamClose)
  record(
    results,
    "4. institutional:team close Escape",
    teamClose.some((e) => e.type === "drawer.closed" && e.payload?.drawerId === "institutional:team"),
    `events=${teamClose.map((e) => e.type).join(",")}`
  )

  const projectTrigger = page.getByRole("button", { name: /Escola Verde/i })
  await projectTrigger.scrollIntoViewIfNeeded()
  const beforeProjectOpen = events.length
  await projectTrigger.click()
  await page.waitForTimeout(600)
  const projectOpen = events.slice(beforeProjectOpen)
  const projectDrawerOpen = projectOpen.find((e) => e.type === "drawer.opened")
  record(
    results,
    "5. institutional:project open events",
    projectDrawerOpen?.payload?.drawerId === "institutional:project" &&
      projectOpen.some((e) => e.type === "surface.opened" && e.payload?.surfaceId === "institutional:project"),
    `drawerId=${projectDrawerOpen?.payload?.drawerId}`
  )

  const beforeProjectClose = events.length
  await dismissDrawer(page)
  const projectClose = events.slice(beforeProjectClose)
  record(
    results,
    "6. institutional:project close Escape",
    projectClose.some((e) => e.type === "drawer.closed" && e.payload?.drawerId === "institutional:project"),
    `events=${projectClose.map((e) => e.type).join(",")}`
  )

  const overflowFinal = await page.evaluate(() => document.body.style.overflow)
  record(results, "7. overflow clean final", overflowFinal === "", `overflow="${overflowFinal}"`)

  const criticalErrors = consoleErrors.filter(
    (e) => !e.includes("favicon") && !e.includes("404") && !e.includes("Failed to load resource")
  )
  record(
    results,
    "8. no critical console errors",
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
