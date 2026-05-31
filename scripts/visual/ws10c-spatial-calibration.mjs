/**
 * WS-10C — hero/feed spatial calibration validation.
 *
 * Usage:
 *   pnpm dev (port 3003)
 *   node scripts/visual/ws10c-spatial-calibration.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const BASE = process.env.WS10C_BASE_URL ?? "http://localhost:3003/demo"
const OUT = join(process.cwd(), "docs/audit")

async function snap(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: false })
}

async function measure(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight
    const hero = document.querySelector('[data-testid="appointment-operational-hero"]')
    const opLine = document.querySelector('[data-testid="appointment-operational-context-line"]')
    const placeHint = document.querySelector('[data-testid="appointment-arrival-place-hint"]')
    const feedSection = document.querySelector('[data-section="agendar-horario"]')
    const stories = document.querySelector('[data-testid="appointment-operational-hero"]')?.nextElementSibling
    const rect = (el) => (el ? el.getBoundingClientRect() : null)
    const heroR = rect(hero)
    const feedR = rect(feedSection)
    const storiesR = rect(stories)
    return {
      vh,
      heroPctVh: heroR ? +((heroR.height / vh) * 100).toFixed(1) : null,
      heroBottom: heroR ? Math.round(heroR.bottom) : null,
      storiesHeight: storiesR ? Math.round(storiesR.height) : null,
      feedPeekPx: feedR ? Math.max(0, Math.round(vh - feedR.top)) : null,
      feedSectionTop: feedR ? Math.round(feedR.top) : null,
      opLineVisible: opLine ? rect(opLine).height > 0 : false,
      placeHintVisible: placeHint ? rect(placeHint).height > 0 : false,
    }
  })
}

async function openAppointment(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(800)
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(600)
}

async function run320Slow() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } })
  const log = { flow: "320-slow", steps: [] }

  await openAppointment(page)
  log.steps.push({ step: "hero-fold", metrics: await measure(page) })
  await snap(page, "ws10c-after-320-01-hero-fold.png")
  await page.waitForTimeout(2000)

  await page.evaluate(() => window.scrollBy(0, 120))
  await page.waitForTimeout(400)
  log.steps.push({ step: "scroll-light", metrics: await measure(page) })
  await snap(page, "ws10c-after-320-02-scroll-light.png")

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByTestId("appointment-arrival-place-hint").click()
  await page.waitForTimeout(800)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(600)
  log.steps.push({ step: "arrival-return", metrics: await measure(page) })
  await snap(page, "ws10c-after-320-03-feed-return.png")

  await browser.close()
  return log
}

async function run320Rush() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } })
  const log = { flow: "320-rush", steps: [], startedAt: Date.now() }

  await openAppointment(page)
  await page.waitForTimeout(300)
  log.steps.push({ step: "hero-rush", metrics: await measure(page) })
  await snap(page, "ws10c-after-320-rush-01-hero.png")

  await page.evaluate(() => window.scrollBy(0, 320))
  await page.waitForTimeout(250)
  log.steps.push({ step: "scroll-rush", metrics: await measure(page) })
  await snap(page, "ws10c-after-320-rush-02-scroll.png")

  log.durationMs = Date.now() - log.startedAt
  await browser.close()
  return log
}

async function run390Slow() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const log = { flow: "390-slow", steps: [] }

  await openAppointment(page)
  log.steps.push({ step: "hero-fold", metrics: await measure(page) })
  await snap(page, "ws10c-after-390-01-hero-fold.png")
  await page.waitForTimeout(1500)

  await browser.close()
  return log
}

await mkdir(OUT, { recursive: true })
const results = {
  capturedAt: new Date().toISOString(),
  baseUrl: BASE,
  beforeReference: {
    feedPeek320: 26,
    heroPct320: 52.5,
    source: "ws10b1-validation-metrics.json",
  },
  flows: [await run320Slow(), await run320Rush(), await run390Slow()],
}
await writeFile(join(OUT, "ws10c-spatial-metrics.json"), JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
