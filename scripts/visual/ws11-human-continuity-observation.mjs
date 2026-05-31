/**
 * Pós-WS-11 — human continuity observation capture (facilitator aid).
 * Not a substitute for external human session.
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const BASE = process.env.WS11H_BASE_URL ?? "http://localhost:3003/demo"
const OUT = join(process.cwd(), "docs/audit")

async function snap(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: false })
}

async function openAppointment(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(700)
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(500)
}

async function flow1(page) {
  const log = { id: "flow-1-casual-scroll-arrival", steps: [] }
  await openAppointment(page)
  log.steps.push({ action: "landed", scrollY: await page.evaluate(() => window.scrollY) })
  await snap(page, "ws11h-f1-01-land.png")

  await page.evaluate(() => window.scrollBy(0, 260))
  await page.waitForTimeout(900)
  log.steps.push({ action: "after-scroll", scrollY: await page.evaluate(() => window.scrollY) })
  await snap(page, "ws11h-f1-02-scrolled.png")

  await page.evaluate(() => {
    document.querySelector('[data-testid="appointment-arrival-place-hint"]')?.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    )
  })
  await page.waitForTimeout(1200)
  log.steps.push({ action: "arrival-open", scrollY: await page.evaluate(() => window.scrollY) })
  await snap(page, "ws11h-f1-03-arrival.png")

  await page.keyboard.press("Escape")
  await page.waitForTimeout(700)
  const afterReturn = await page.evaluate(() => window.scrollY)
  log.steps.push({ action: "after-return", scrollY: afterReturn })
  await snap(page, "ws11h-f1-04-return.png")

  await page.evaluate(() => window.scrollBy(0, 180))
  await page.waitForTimeout(600)
  log.steps.push({ action: "continue-browse", scrollY: await page.evaluate(() => window.scrollY) })
  await snap(page, "ws11h-f1-05-continue.png")

  log.scrollRestored = afterReturn > 80
  return log
}

async function flow2(page) {
  const log = { id: "flow-2-rush-booking-arrival", steps: [], startedAt: Date.now() }
  await openAppointment(page)
  await page.getByRole("button", { name: /agendar horario/i }).first().click()
  await page.waitForTimeout(500)
  log.steps.push({ action: "booking-open" })
  await snap(page, "ws11h-f2-01-booking.png")

  await page.keyboard.press("Escape")
  await page.waitForTimeout(400)
  await page.evaluate(() => {
    document.querySelector('[data-testid="appointment-arrival-place-hint"]')?.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    )
  })
  await page.waitForTimeout(700)
  log.steps.push({ action: "arrival-open" })
  await snap(page, "ws11h-f2-02-arrival.png")

  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)
  log.steps.push({ action: "back-feed" })
  await snap(page, "ws11h-f2-03-feed.png")

  log.durationMs = Date.now() - log.startedAt
  return log
}

async function flow3(page) {
  const log = { id: "flow-3-320-casual", viewport: "320x568", steps: [] }
  await openAppointment(page)
  await page.waitForTimeout(1500)
  log.steps.push({ action: "dwell-hero" })
  await snap(page, "ws11h-f3-01-hero.png")

  await page.getByTestId("appointment-arrival-place-hint").click()
  await page.waitForTimeout(2000)
  log.steps.push({ action: "arrival-dwell" })
  await snap(page, "ws11h-f3-02-arrival.png")

  await page.keyboard.press("Escape")
  await page.waitForTimeout(800)
  log.steps.push({ action: "return" })
  await snap(page, "ws11h-f3-03-return.png")

  return log
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const page390 = await browser.newPage({ viewport: { width: 390, height: 844 } })
const f1 = await flow1(page390)
const f2 = await flow2(page390)
await page390.close()

const page320 = await browser.newPage({ viewport: { width: 320, height: 568 } })
const f3 = await flow3(page320)
await page320.close()
await browser.close()

const payload = {
  capturedAt: new Date().toISOString(),
  baseUrl: BASE,
  note: "Facilitator proxy — replace with external human session when available",
  flows: [f1, f2, f3],
}
await writeFile(join(OUT, "ws11h-observation-log.json"), JSON.stringify(payload, null, 2))
console.log(JSON.stringify(payload, null, 2))
