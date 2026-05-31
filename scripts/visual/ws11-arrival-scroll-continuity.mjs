/**
 * WS-11 — arrival scroll continuity validation.
 */
import { chromium } from "playwright"

const BASE = process.env.WS11_BASE_URL ?? "http://localhost:3003/demo"

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } })
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(800)
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(600)

  await page.evaluate(() => window.scrollBy(0, 200))
  await page.waitForTimeout(200)
  const scrolledY = await page.evaluate(() => window.scrollY)

  await page.evaluate(() => {
    document.querySelector('[data-testid="appointment-arrival-place-hint"]')?.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    )
  })
  await page.waitForTimeout(500)
  const whileOpen = await page.evaluate(() => ({
    bodyTop: document.body.style.top,
    bodyPosition: document.body.style.position,
  }))
  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)
  const afterClose = await page.evaluate(() => window.scrollY)

  const lockedY = Math.abs(parseInt(String(whileOpen.bodyTop).replace("px", ""), 10) || 0)

  await browser.close()
  return {
    scrolledY,
    whileOpen,
    afterClose,
    lockedY,
    lockEngaged: whileOpen.bodyPosition === "fixed",
    restored: whileOpen.bodyPosition === "fixed" && Math.abs(afterClose - lockedY) <= 2,
  }
}

const result = await run()
console.log(JSON.stringify(result, null, 2))
process.exit(result.restored ? 0 : 1)
