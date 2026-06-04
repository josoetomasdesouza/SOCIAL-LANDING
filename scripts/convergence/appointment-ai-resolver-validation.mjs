/**
 * WS-08C + WS-08D V1 — Appointment AI resolver validation.
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

async function getLastAiTurnText(page) {
  const composer = page.locator('[data-conversation-composer="true"]')
  const turn = composer.locator("div.flex.justify-start").last()
  return (await turn.textContent()) ?? ""
}

/** Wait until the latest AI bubble leaves the loading state (bounded LLM can take ~3s). */
async function waitForLastAiTurnReady(page, timeoutMs = 10000) {
  const composer = page.locator('[data-conversation-composer="true"]')
  const turn = composer.locator("div.flex.justify-start").last()
  await turn.waitFor({ state: "attached", timeout: timeoutMs })
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const loadingDots = await turn.locator(".animate-bounce").count()
    const text = ((await turn.textContent()) ?? "").trim()
    if (loadingDots === 0 && text.length >= 5) return text
    await page.waitForTimeout(150)
  }
  return (await turn.textContent()) ?? ""
}

async function assertTextDialogue(page, results, step, message, contentPattern, forbiddenPattern) {
  await sendComposerMessage(page, message)
  const resultsBlock = page.getByTestId("appointment-conversation-results-block").last()
  const scheduleBlock = page.getByTestId("appointment-schedule-prompt-block").last()
  const text = await getLastAiTurnText(page)
  const noBlock =
    !(await resultsBlock.isVisible().catch(() => false)) &&
    !(await scheduleBlock.isVisible().catch(() => false))
  const textOk = contentPattern.test(text)
  const forbiddenOk = forbiddenPattern ? !forbiddenPattern.test(text) : true
  record(results, step, noBlock && textOk && forbiddenOk, text.slice(0, 100))
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
    /Augusta|estacionamento|conveniado|Barba Negra|barbearia/i.test(fallbackText ?? "") &&
    !/Como posso ajudar|rapidinho/i.test(fallbackText ?? "")
  record(
    results,
    "5. parking dialogue without booking block",
    fallbackOk,
    fallbackOk ? "situated dialogue" : "unexpected booking block"
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
    !/Carlos Silva/i.test(resetText ?? "") &&
    /Augusta|estacionamento|conveniado|Barba Negra/i.test(resetText ?? "")
  record(
    results,
    "7. context reset after vertical reload",
    resetOk,
    resetOk ? "no stale appointment context" : "stale context detected"
  )

  const blockForbidden = /Ver horarios|Degrade|Carlos Silva/i
  await openAppointment(page)
  await assertTextDialogue(page, results, "9. AP-D01 greeting Ola", "Olá", /Augusta|bem-vindo|Barba Negra|vontade/i, blockForbidden)
  await assertTextDialogue(page, results, "10. AP-D02 greeting Bom dia", "Bom dia", /Bom dia|Augusta/i, blockForbidden)
  await assertTextDialogue(page, results, "11. AP-D03 hours open today", "Estão atendendo hoje?", /Aberto|Augusta|20h/i, blockForbidden)
  await assertTextDialogue(page, results, "12. AP-D04 hours close", "Que horas fecham?", /20h|Seg|Augusta/i, blockForbidden)
  await assertTextDialogue(
    page,
    results,
    "13. AP-D05 parking",
    "vocês tem estacionamento",
    /estacionamento|conveniado|Augusta/i,
    blockForbidden
  )
  await assertTextDialogue(
    page,
    results,
    "14. AP-D06 out of domain",
    "Qual produto para limpeza do rosto",
    /nao|hidrat|rosto|fazemos/i,
    blockForbidden
  )
  await assertTextDialogue(
    page,
    results,
    "15. AP-D07 first visit",
    "Nunca fui aí",
    /primeira|servico|barbeiro|Bem-vindo/i,
    blockForbidden
  )
  await assertTextDialogue(
    page,
    results,
    "16. AP-D08 arrival text",
    "Como eu chego aí?",
    /Augusta|chegar|Paulista|Ver como/i,
    blockForbidden
  )

  const situatedFallbackForbidden = /veja servicos e profissionais no feed quando quiser/i

  await openAppointment(page)
  await assertTextDialogue(
    page,
    results,
    "18. AP-D09 insecurity beauty",
    "Será que vou ficar bonito?",
    /milagre|corte|barba|cabelo|dois/i,
    situatedFallbackForbidden
  )
  await openAppointment(page)
  await assertTextDialogue(
    page,
    results,
    "19. AP-D10 opinion request",
    "Quero uma opinião",
    /opiniao|cabelo|barba|visual/i,
    situatedFallbackForbidden
  )
  await openAppointment(page)
  await assertTextDialogue(
    page,
    results,
    "20. AP-D11 meta repetition",
    "Você só fala isso?",
    /razao|resolver|orientar|conta/i,
    situatedFallbackForbidden
  )
  await openAppointment(page)
  await assertTextDialogue(
    page,
    results,
    "21. AP-D12 change visual",
    "Quero mudar meu visual",
    /discreto|moderno|marcante/i,
    situatedFallbackForbidden
  )
  await openAppointment(page)
  await assertTextDialogue(
    page,
    results,
    "22. AP-D13 unsure haircut",
    "Não sei qual corte fazer",
    /social|degrad|comprimento|caminho|estilo/i,
    situatedFallbackForbidden
  )
  await openAppointment(page)
  await assertTextDialogue(
    page,
    results,
    "23. AP-D14 modern style",
    "Quero algo mais moderno",
    /moderno|Degrade|feed|referencia/i,
    situatedFallbackForbidden
  )

  const robotForbidden =
    /veja servi[cç]os e profissionais no feed|pode te ajudar com isso rapidinho|me conta em uma linha|não captei o foco|nao captei o foco|melhor opcao/i

  async function assertChipChat(page, step, sourceId, message, contentPattern) {
    await openAppointment(page)
    const target = page.locator(`[data-post-context-source="${sourceId}"]`).first()
    await longPress(page, target)
    await page
      .locator(`[data-conversation-context-chip="${sourceId}"]`)
      .first()
      .waitFor({ state: "visible", timeout: 8000 })
    for (let i = 0; i < 2; i += 1) {
      await page.keyboard.press("Escape")
      await page.waitForTimeout(200)
    }
    await sendComposerMessage(page, message)
    const text = await waitForLastAiTurnReady(page)
    const resultsBlock = page.getByTestId("appointment-conversation-results-block").last()
    const noBookingBlock = !(await resultsBlock.isVisible().catch(() => false))
    const textOk = contentPattern.test(text)
    const forbiddenOk = !robotForbidden.test(text)
    record(results, step, noBookingBlock && textOk && forbiddenOk, text.slice(0, 100))
  }

  await assertChipChat(
    page,
    "AP-CHAT-01 video fede typo",
    "apt-vid-1",
    "o que é fede?",
    /fade|vídeo|video|tutorial|técnica|tecnica/i
  )
  await assertChipChat(
    page,
    "AP-CHAT-02 video carecas",
    "apt-vid-2",
    "carecas",
    /careca|calvo|masculino|tendencia|tendência/i
  )
  await assertChipChat(
    page,
    "AP-CHAT-03 post fale mais",
    "apt-soc-1",
    "fale mais",
    /post|sabado|confianca|feed/i
  )
  await assertChipChat(
    page,
    "AP-CHAT-04 service estacionamento",
    "appointment-service-service-1",
    "tem estacionamento?",
    /estacionamento|mapa|vaga|rua/i
  )
  await assertChipChat(
    page,
    "AP-CHAT-05 post curitiba",
    "apt-soc-1",
    "tem em Curitiba?",
    /curitiba|augusta|unidade|não temos|nao temos/i
  )
  await openAppointment(page)
  await assertTextDialogue(
    page,
    results,
    "AP-CHAT-06 sem chip me fala ai",
    "me fala aí",
    /horário|horario|preço|preco|agendar|quer saber/i,
    robotForbidden
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
    "24. no critical console errors",
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
