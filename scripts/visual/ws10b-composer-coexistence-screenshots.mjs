/**
 * WS-10B — capture arrival drawer coexistence screenshots.
 *
 * Usage:
 *   pnpm dev --port 3003
 *   node scripts/visual/ws10b-composer-coexistence-screenshots.mjs
 */
import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const BASE = process.env.WS10B_BASE_URL ?? "http://localhost:3003/demo"
const OUT = join(process.cwd(), "docs/audit")

async function openArrival(page) {
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(600)
  await page.getByTestId("appointment-arrival-place-hint").click()
  await page.waitForSelector('[data-testid="appointment-arrival-drawer"]', { timeout: 8000 })
  await page.waitForTimeout(1200)
}

async function capture(name, viewport) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport })
  await openArrival(page)
  await page.screenshot({ path: join(OUT, name), fullPage: false })
  await browser.close()
}

await mkdir(OUT, { recursive: true })
await capture("ws10b-after-320-slow.png", { width: 320, height: 568 })
await capture("ws10b-after-320-rush.png", { width: 320, height: 568 })
await capture("ws10b-after-390-slow.png", { width: 390, height: 844 })
console.log("WS-10B screenshots saved to docs/audit/")
