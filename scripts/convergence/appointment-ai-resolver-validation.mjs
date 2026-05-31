/**
 * WS-08C — Appointment AI resolver validation.
 *
 * Prerequisites:
 *   pnpm dev  (http://localhost:3000/demo)
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:appointment
 */
import { chromium } from "playwright"

const BASE = process.env.DEMO_URL ?? "http://localhost:3000/demo"
const LONG_PRESS_MS = 450

function record(results, step, ok, detail) {
  results.push({ step, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? ` — ${detail}` : ""}`)
}

async function openAppointment(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("business-conversation-history:")) {
        localStorage.removeItem(key)
      }
    }
  })
  await page.waitForTimeout(1200)

  const tile = page.getByRole("heading", { name: "Agendamento", exact: true }).locator("xpath=ancestor::button[1]")
  await tile.scrollIntoViewIfNeeded()
  await tile.click()
  await page.waitForTimeout(800)
}

async function sendComposerMessage(page, message) {
  const input = page.getByPlaceholder(/Pergunte sobre/i)
  await input.scrollIntoViewIfNeeded()
  await input.click({ force: true })
  await input.fill(message)
  await page.keyboard.press("Enter")
  await page.waitForTimeout(1500)
}

async function longPress(page, locator) {
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  await locator.evaluate(
    (el, holdMs) =>
      new Promise((resolve) => {
        el.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            pointerType: "touch",
            isPrimary: true,
          })
        )
        window.setTimeout(() => {
          el.dispatchEvent(
            new PointerEvent("pointerup", {
              bubbles: true,
              cancelable: true,
              pointerId: 1,
              pointerType: "touch",
              isPrimary: true,
            })
          )
          resolve(undefined)
        }, holdMs)
      }),
    LONG_PRESS_MS
  )
}

async function longPressContextItem(page, sourceId, heading = "Agendar Horario") {
  await page.getByRole("heading", { name: heading }).scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)

  const target = page.locator(`[data-post-context-source="${sourceId}"]`).first()
  await longPress(page, target)
  await page.waitForTimeout(400)

  await page
    .locator(`[data-conversation-context-chip="${sourceId}"]`)
    .first()
    .waitFor({ state: "visible", timeout: 5000 })

  for (let i = 0; i < 2; i += 1) {
    await page.keyboard.press("Escape")
    await page.waitForTimeout(300)
  }
}

async function main() {
  const consoleErrors = []
  const results = []

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })

  await openAppointment(page)

  await sendComposerMessage(page, "preciso cortar o cabelo")
  const recommendBlock = page.getByTestId("appointment-conversation-results-block")
  await recommendBlock.waitFor({ state: "visible", timeout: 5000 })
  const recommendCount = await recommendBlock.locator("button").count()
  record(
    results,
    "1. guided recommendation shows options",
    recommendCount >= 2,
    `interactive=${recommendCount}`
  )

  await sendComposerMessage(page, "degrade")
  const serviceBlock = page.getByTestId("appointment-conversation-results-block").last()
  await serviceBlock.waitFor({ state: "visible", timeout: 5000 })
  const serviceText = await serviceBlock.textContent()
  record(
    results,
    "2. service prompt resolves booking block",
    /Degrade|Carlos Silva/i.test(serviceText ?? ""),
    serviceText?.slice(0, 80)
  )

  await longPressContextItem(page, "appointment-barber-barber-1")
  await sendComposerMessage(page, "quais servicos?")
  const followUpBlock = page.getByTestId("appointment-conversation-results-block").last()
  await followUpBlock.waitFor({ state: "visible", timeout: 5000 })
  const followUpText = await followUpBlock.textContent()
  record(
    results,
    "3. barber context follow-up shows services",
    /Degrade|Barba|Corte/i.test(followUpText ?? ""),
    followUpText?.slice(0, 100)
  )

  await longPressContextItem(page, "appointment-barber-barber-1")
  await sendComposerMessage(page, "tem algo a tarde?")
  const periodBlock = page.getByTestId("appointment-schedule-prompt-block").last()
  const periodResultsBlock = page.getByTestId("appointment-conversation-results-block").last()
  const periodVisible = (await periodBlock.isVisible()) || (await periodResultsBlock.isVisible())
  record(
    results,
    "4. period refinement shows scheduling path",
    periodVisible,
    periodVisible ? "schedule/results visible" : "period path missing"
  )

  await openAppointment(page)
  await sendComposerMessage(page, "voces tem estacionamento")
  const fallbackMenu = page.getByTestId("appointment-conversation-results-block").last()
  const fallbackSchedule = page.getByTestId("appointment-schedule-prompt-block").last()
  const fallbackText = await page.locator('[data-conversation-composer="true"]').textContent()
  const fallbackOk =
    !(await fallbackMenu.isVisible().catch(() => false)) &&
    !(await fallbackSchedule.isVisible().catch(() => false)) &&
    /Barba Negra|ajudar|orientar/i.test(fallbackText ?? "")
  record(
    results,
    "5. fallback stays editorial without booking block",
    fallbackOk,
    fallbackOk ? "mock reply only" : "unexpected booking block"
  )

  await longPressContextItem(page, "appointment-barber-barber-1")
  await sendComposerMessage(page, "quero agendar")
  const scheduleBlock = page.getByTestId("appointment-schedule-prompt-block").last()
  await scheduleBlock.waitFor({ state: "visible", timeout: 5000 })
  await scheduleBlock.getByRole("button").click()
  await page.waitForTimeout(600)
  const drawerOpen = await page.getByText("Escolha data e horario").isVisible()
  record(
    results,
    "6. schedule CTA opens calendar drawer",
    drawerOpen,
    drawerOpen ? "calendar drawer open" : "drawer missing"
  )

  await openAppointment(page)
  await longPressContextItem(page, "appointment-barber-barber-1")
  await sendComposerMessage(page, "quero agendar")
  await openAppointment(page)
  await sendComposerMessage(page, "qual o estacionamento")
  const resetBlock = page.getByTestId("appointment-conversation-results-block").last()
  const resetSchedule = page.getByTestId("appointment-schedule-prompt-block").last()
  const resetText = await page.locator('[data-conversation-composer="true"]').textContent()
  const resetOk =
    !(await resetBlock.isVisible().catch(() => false)) &&
    !(await resetSchedule.isVisible().catch(() => false)) &&
    !/Carlos Silva/i.test(resetText ?? "")
  record(
    results,
    "7. context reset after vertical reload",
    resetOk,
    resetOk ? "no stale appointment context" : "stale context detected"
  )

  const criticalErrors = consoleErrors.filter(
    (e) =>
      !e.includes("favicon") &&
      !e.includes("404") &&
      !e.includes("Failed to load resource") &&
      !e.includes("same key")
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
