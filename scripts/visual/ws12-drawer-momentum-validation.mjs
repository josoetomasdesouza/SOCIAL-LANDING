/**
 * WS-12 — drawer momentum continuity (playwright).
 */
import { chromium } from "playwright"

const BASE = process.env.WS12_BASE_URL ?? "http://localhost:3003/demo"

async function measureFlickClose(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(700)
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(500)
  await page.getByTestId("appointment-arrival-place-hint").click()
  await page.waitForTimeout(600)

  const handle = page.locator("[data-drawer-drag-zone]").first()
  const box = await handle.boundingBox()
  if (!box) throw new Error("drag handle missing")

  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX, startY + 40, { steps: 2 })
  await page.mouse.move(startX, startY + 180, { steps: 3 })
  const releaseAt = Date.now()
  await page.mouse.up()

  let visibleMs = 0
  for (let i = 0; i < 12; i += 1) {
    await page.waitForTimeout(40)
    const open = await page.locator('[data-testid="appointment-arrival-drawer"]').isVisible().catch(() => false)
    if (open) {
      visibleMs = Date.now() - releaseAt
    }
  }

  const transform = await page
    .locator('[data-testid="appointment-arrival-drawer"]')
    .locator("xpath=ancestor::div[contains(@class,'fixed')][1]")
    .evaluate((el) => getComputedStyle(el).transform)
    .catch(() => "gone")

  return { visibleMsAfterRelease: visibleMs, transformAtEnd: transform }
}

async function measurePartialSettle(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(700)
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(500)
  await page.getByRole("button", { name: /agendar horario/i }).first().click()
  await page.waitForTimeout(500)

  const handle = page.locator("[data-drawer-drag-zone]").first()
  const box = await handle.boundingBox()
  if (!box) throw new Error("drag handle missing")

  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX, startY + 35, { steps: 4 })
  await page.mouse.up()
  await page.waitForTimeout(280)

  const stillOpen = await page.getByRole("heading", { name: /escolha o servico|servico/i }).first().isVisible().catch(() => false)

  return { stillOpenAfterPartialRelease: stillOpen }
}

const browser = await chromium.launch()
const page390 = await browser.newPage({ viewport: { width: 390, height: 844 } })
const flick = await measureFlickClose(page390)
const partial = await measurePartialSettle(page390)
await browser.close()

const payload = {
  flick,
  partial,
  pass: flick.visibleMsAfterRelease >= 80 && partial.stillOpenAfterPartialRelease === true,
}

console.log(JSON.stringify(payload, null, 2))
process.exit(payload.pass ? 0 : 1)
