/**
 * WS-10B.1 — post WS-10A/10B perceptual validation capture.
 * Observation only — no code changes.
 *
 * Usage:
 *   pnpm dev (port 3003)
 *   node scripts/visual/ws10b1-validation-pass.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const BASE = process.env.WS10B1_BASE_URL ?? "http://localhost:3003/demo"
const OUT = join(process.cwd(), "docs/audit")

async function snap(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: false })
}

async function measurePresence(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight
    const hero = document.querySelector('[data-testid="appointment-operational-hero"]')
    const placeHint = document.querySelector('[data-testid="appointment-arrival-place-hint"]')
    const arrivalCopy = document.querySelector('[data-testid="appointment-arrival-drawer"]')
    const mapsBtn = document.querySelector('[data-testid="appointment-arrival-maps-fallback"]')
    const composerShell = document.querySelector('[data-conversation-composer="true"]')?.closest(".fixed")
    const feedSection = document.querySelector('[data-section="agendar-horario"]')
    const rect = (el) => (el ? el.getBoundingClientRect() : null)
    const heroR = rect(hero)
    const feedR = rect(feedSection)
    const composerHidden = composerShell
      ? getComputedStyle(composerShell).display === "none"
      : true
    const composerR = composerHidden ? null : rect(composerShell)
    const mapsR = rect(mapsBtn)
    const copyR = rect(arrivalCopy)
    return {
      vh,
      heroPctVh: heroR ? +((heroR.height / vh) * 100).toFixed(1) : null,
      feedPeekPx: feedR ? Math.max(0, Math.round(vh - feedR.top)) : null,
      composerHidden,
      composerPctVh: composerR ? +((composerR.height / vh) * 100).toFixed(1) : 0,
      copyArea: copyR ? Math.round(copyR.width * copyR.height) : 0,
      mapsArea: mapsR ? Math.round(mapsR.width * mapsR.height) : 0,
      mapsFontWeight: mapsBtn ? getComputedStyle(mapsBtn).fontWeight : null,
    }
  })
}

async function openAppointment(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(800)
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(600)
}

async function run390Slow() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const log = { flow: "390-slow", steps: [] }

  await openAppointment(page)
  log.steps.push({ step: "hero", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-390-01-hero.png")
  await page.waitForTimeout(2000)

  await page.getByTestId("appointment-arrival-place-hint").click()
  await page.waitForTimeout(3500)
  log.steps.push({ step: "arrival-dwell", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-390-02-arrival-dwell.png")

  await page.keyboard.press("Escape")
  await page.waitForTimeout(1200)
  log.steps.push({ step: "feed-return", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-390-03-feed-return.png")

  await browser.close()
  return log
}

async function run320Slow() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } })
  const log = { flow: "320-slow", steps: [] }

  await openAppointment(page)
  log.steps.push({ step: "hero", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-320-01-hero.png")
  await page.waitForTimeout(2500)

  await page.getByTestId("appointment-arrival-place-hint").click()
  await page.waitForTimeout(3500)
  log.steps.push({ step: "arrival-dwell", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-320-02-arrival-dwell.png")

  const footer = page.locator('[data-testid="appointment-arrival-fallback-actions"]')
  await footer.scrollIntoViewIfNeeded().catch(() => {})
  await snap(page, "ws10b1-320-03-drawer-base.png")

  await page.keyboard.press("Escape")
  await page.waitForTimeout(1200)
  log.steps.push({ step: "feed-return", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-320-04-feed-return.png")

  await browser.close()
  return log
}

async function run320Rush() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } })
  const log = { flow: "320-rush", steps: [], startedAt: Date.now() }

  await openAppointment(page)
  await page.waitForTimeout(400)
  log.steps.push({ step: "hero-rush", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-320-rush-01-hero.png")

  await page.evaluate(() => window.scrollBy(0, 280))
  await page.waitForTimeout(300)
  log.steps.push({ step: "scroll-rush", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-320-rush-02-scroll.png")

  await page.getByTestId("appointment-arrival-place-hint").click({ timeout: 5000 }).catch(async () => {
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(200)
    await page.getByTestId("appointment-arrival-place-hint").click()
  })
  await page.waitForTimeout(500)
  log.steps.push({ step: "arrival-rush", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-320-rush-03-arrival.png")

  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)
  await page.getByRole("button", { name: /agendar horario/i }).first().click()
  await page.waitForTimeout(600)
  log.steps.push({ step: "booking-rush", metrics: await measurePresence(page) })
  await snap(page, "ws10b1-320-rush-04-booking.png")

  log.durationMs = Date.now() - log.startedAt
  await browser.close()
  return log
}

await mkdir(OUT, { recursive: true })
const results = {
  capturedAt: new Date().toISOString(),
  baseUrl: BASE,
  flows: [await run390Slow(), await run320Slow(), await run320Rush()],
}
await writeFile(join(OUT, "ws10b1-validation-metrics.json"), JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
console.log("WS-10B.1 captures saved to docs/audit/")
