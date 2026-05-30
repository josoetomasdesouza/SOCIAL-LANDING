/**
 * WS-06 — Influencer ActionDrawer migration validation.
 *
 * Prerequisites:
 *   pnpm dev  (http://localhost:3000/demo)
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:influencer
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

  const influencer = page.getByRole("heading", { name: "Influencer", exact: true }).locator("xpath=ancestor::button[1]")
  await influencer.scrollIntoViewIfNeeded()
  await influencer.click()
  await page.waitForTimeout(800)

  const linksTrigger = page.getByRole("button", { name: "Ver todos os links" })
  await linksTrigger.scrollIntoViewIfNeeded()
  const beforeLinksOpen = events.length
  await linksTrigger.click()
  await page.waitForTimeout(600)
  const linksOpen = events.slice(beforeLinksOpen)
  const linksDrawerOpen = linksOpen.find((e) => e.type === "drawer.opened")
  record(
    results,
    "1. influencer:links open events",
    linksDrawerOpen?.payload?.drawerId === "influencer:links" &&
      linksOpen.some((e) => e.type === "surface.opened" && e.payload?.surfaceId === "influencer:links"),
    `drawerId=${linksDrawerOpen?.payload?.drawerId}`
  )

  const beforeLinksClose = events.length
  await dismissDrawer(page)
  const linksClose = events.slice(beforeLinksClose)
  record(
    results,
    "2. influencer:links close Escape",
    linksClose.some((e) => e.type === "drawer.closed" && e.payload?.drawerId === "influencer:links"),
    `events=${linksClose.map((e) => e.type).join(",")}`
  )

  const overflowAfterLinks = await page.evaluate(() => document.body.style.overflow)
  record(
    results,
    "2b. overflow clean after links close",
    overflowAfterLinks === "",
    `overflow="${overflowAfterLinks}"`
  )

  const mediaKitTrigger = page.getByRole("button", { name: "Ver media kit comercial" })
  await mediaKitTrigger.scrollIntoViewIfNeeded()
  const beforeMediaOpen = events.length
  await mediaKitTrigger.click()
  await page.waitForTimeout(600)
  const mediaOpen = events.slice(beforeMediaOpen)
  const mediaDrawerOpen = mediaOpen.find((e) => e.type === "drawer.opened")
  record(
    results,
    "3. influencer:media-kit open events",
    mediaDrawerOpen?.payload?.drawerId === "influencer:media-kit" &&
      mediaOpen.some((e) => e.type === "surface.opened" && e.payload?.surfaceId === "influencer:media-kit"),
    `drawerId=${mediaDrawerOpen?.payload?.drawerId}`
  )

  const beforeMediaClose = events.length
  await dismissDrawer(page)
  const mediaClose = events.slice(beforeMediaClose)
  record(
    results,
    "4. influencer:media-kit close Escape",
    mediaClose.some((e) => e.type === "drawer.closed" && e.payload?.drawerId === "influencer:media-kit"),
    `events=${mediaClose.map((e) => e.type).join(",")}`
  )

  const collabTrigger = page.getByRole("button", { name: "Nike" })
  await collabTrigger.scrollIntoViewIfNeeded()
  const beforeCollabOpen = events.length
  await collabTrigger.click()
  await page.waitForTimeout(600)
  const collabOpen = events.slice(beforeCollabOpen)
  record(
    results,
    "5. collab trigger opens media-kit",
    collabOpen.some((e) => e.type === "drawer.opened" && e.payload?.drawerId === "influencer:media-kit"),
    `drawerId=${collabOpen.find((e) => e.type === "drawer.opened")?.payload?.drawerId}`
  )

  await dismissDrawer(page)

  const overflowFinal = await page.evaluate(() => document.body.style.overflow)
  record(results, "6. overflow clean final", overflowFinal === "", `overflow="${overflowFinal}"`)

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
