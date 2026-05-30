/**
 * WS-08B — Health AI resolver validation.
 *
 * Prerequisites:
 *   pnpm dev  (http://localhost:3000/demo)
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:health
 */
import { chromium } from "playwright"

const BASE = process.env.DEMO_URL ?? "http://localhost:3000/demo"
const LONG_PRESS_MS = 450

function record(results, step, ok, detail) {
  results.push({ step, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? ` — ${detail}` : ""}`)
}

async function openHealth(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(1200)

  const health = page.getByRole("heading", { name: "Saude", exact: true }).locator("xpath=ancestor::button[1]")
  await health.scrollIntoViewIfNeeded()
  await health.click()
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

async function longPressContextItem(page, sourceId) {
  await page.getByRole("heading", { name: "Profissionais" }).scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)

  const target = page.locator(`[data-post-context-source="${sourceId}"]`).first()
  await longPress(page, target)
  await page.waitForTimeout(400)

  await page
    .locator(`[data-conversation-context-chip="${sourceId}"]`)
    .first()
    .waitFor({ state: "visible", timeout: 3000 })
}

async function main() {
  const consoleErrors = []
  const results = []

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })

  await openHealth(page)

  await sendComposerMessage(page, "dermatologista")
  const specialtyBlock = page.getByTestId("health-conversation-results-block")
  await specialtyBlock.waitFor({ state: "visible", timeout: 5000 })
  const specialtyText = await specialtyBlock.textContent()
  record(
    results,
    "1. specialty prompt shows professional block",
    /Ana Oliveira|Dermatologia/i.test(specialtyText ?? ""),
    specialtyText?.slice(0, 80)
  )

  await sendComposerMessage(page, "limpeza de pele")
  const serviceBlock = page.getByTestId("health-conversation-results-block").last()
  await serviceBlock.waitFor({ state: "visible", timeout: 5000 })
  const serviceText = await serviceBlock.textContent()
  record(
    results,
    "2. service prompt resolves procedure",
    /Limpeza de Pele/i.test(serviceText ?? ""),
    serviceText?.slice(0, 80)
  )

  await sendComposerMessage(page, "quero melhorar minha pele")
  const recommendBlock = page.getByTestId("health-conversation-results-block").last()
  await recommendBlock.waitFor({ state: "visible", timeout: 5000 })
  const recommendCount = await recommendBlock.locator("button").count()
  record(
    results,
    "3. guided recommendation shows options",
    recommendCount >= 2,
    `interactive=${recommendCount}`
  )

  await longPressContextItem(page, "health-professional-doc-3")
  await sendComposerMessage(page, "esse profissional atende o que?")
  const contextBlock = page.getByTestId("health-conversation-results-block").last()
  await contextBlock.waitFor({ state: "visible", timeout: 5000 })
  const contextText = await contextBlock.textContent()
  record(
    results,
    "4. professional context follow-up shows services",
    /Limpeza de Pele|Consulta Dermatologica|Avaliacao Estetica/i.test(contextText ?? ""),
    contextText?.slice(0, 120)
  )

  await sendComposerMessage(page, "quero agendar consulta")
  const scheduleBlock = page.getByTestId("health-schedule-prompt-block").last()
  const scheduleResultsBlock = page.getByTestId("health-conversation-results-block").last()
  const scheduleVisible = (await scheduleBlock.isVisible()) || (await scheduleResultsBlock.isVisible())
  record(
    results,
    "5. schedule prompt shows scheduling CTA",
    scheduleVisible,
    scheduleVisible ? "schedule block visible" : "schedule block missing"
  )

  if (await scheduleBlock.isVisible()) {
    await scheduleBlock.getByRole("button").click()
  } else {
    await scheduleResultsBlock.getByRole("button", { name: /Agendar/i }).first().click()
  }
  await page.waitForTimeout(600)
  const drawerOpen = await page.getByText("Escolha data e horario").isVisible()
  record(
    results,
    "6. schedule CTA opens appointment drawer",
    drawerOpen,
    drawerOpen ? "professional drawer open" : "drawer missing"
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
