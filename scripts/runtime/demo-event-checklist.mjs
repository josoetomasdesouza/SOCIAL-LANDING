/**
 * Global /demo event protocol — passive events (DEV).
 *
 * Prerequisites:
 *   pnpm dev
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:events
 *   DEMO_URL=http://127.0.0.1:3000/demo pnpm qa:events
 */
import { chromium } from "playwright"

const BASE = process.env.DEMO_URL ?? "http://127.0.0.1:3000/demo"
const LONG_PRESS_MS = 500
const TUTORIALS_POST = "#section-tutoriais-e-tendencias article"

function parsePassiveEvent(text) {
  const match = text.match(/\[passive-event\] (\S+)/)
  return match?.[1] ?? null
}

function has(events, type) {
  return events.includes(type)
}

function count(events, type) {
  return events.filter((event) => event === type).length
}

async function longPress(page, locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error("long-press target has no bounding box")
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.waitForTimeout(LONG_PRESS_MS)
  await page.mouse.up()
}

async function main() {
  const events = []
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.emulateMedia({ reducedMotion: "no-preference" })

  page.on("console", (msg) => {
    const type = parsePassiveEvent(msg.text())
    if (type) events.push(type)
  })

  const results = []

  function record(step, ok, detail) {
    results.push({ step, ok, detail })
    console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? ` — ${detail}` : ""}`)
  }

  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)

  // 1. Trocar vertical
  const beforeVertical = events.length
  await page.getByRole("button", { name: /Agendamento/i }).click()
  await page.waitForTimeout(800)
  const verticalEvents = events.slice(beforeVertical).filter((e) => e === "feed.vertical.changed")
  record("1. feed.vertical.changed", verticalEvents.length === 1, `count=${verticalEvents.length}`)

  // 2. Long-press morph (video post — PostCard path)
  const beforeMorph = events.length
  const morphPost = page.locator(TUTORIALS_POST).first()
  await morphPost.scrollIntoViewIfNeeded()
  await longPress(page, morphPost)
  await page.waitForTimeout(1200)
  const morphSlice = events.slice(beforeMorph)
  const morphStartedIdx = morphSlice.indexOf("morph.started")
  const morphCompletedIdx = morphSlice.indexOf("morph.completed")
  record(
    "2. morph.started → morph.completed",
    morphStartedIdx !== -1 && morphCompletedIdx !== -1 && morphStartedIdx < morphCompletedIdx,
    `started=${count(morphSlice, "morph.started")}, completed=${count(morphSlice, "morph.completed")}`
  )

  // 3. Abrir drawer (tap — not long-press)
  const beforeOpen = events.length
  const drawerPost = page.locator(TUTORIALS_POST).nth(1)
  await drawerPost.scrollIntoViewIfNeeded()
  await drawerPost.click()
  await page.waitForTimeout(800)
  const openSlice = events.slice(beforeOpen)
  record(
    "3. drawer.opened + surface.opened",
    has(openSlice, "drawer.opened") && has(openSlice, "surface.opened"),
    `drawer=${count(openSlice, "drawer.opened")}, surface=${count(openSlice, "surface.opened")}`
  )

  // 4. Fechar drawer
  const beforeClose = events.length
  const closeButton = page.getByRole("button", { name: "Fechar", exact: true })
  await closeButton.waitFor({ state: "visible", timeout: 5000 })
  await closeButton.click()
  await page.waitForTimeout(800)
  const closeSlice = events.slice(beforeClose)
  record(
    "4. drawer.closed + surface.closed",
    has(closeSlice, "drawer.closed") && has(closeSlice, "surface.closed"),
    `drawer=${count(closeSlice, "drawer.closed")}, surface=${count(closeSlice, "surface.closed")}`
  )

  // 5. Primeira mensagem composer
  const beforeAi = events.length
  const composerInput = page.locator("form input").last()
  await composerInput.scrollIntoViewIfNeeded()
  await composerInput.click({ force: true })
  await composerInput.fill("Quais serviços vocês oferecem?")
  await composerInput.press("Enter")
  await page.waitForTimeout(1200)
  const aiSlice = events.slice(beforeAi)
  record(
    "5. ai.surface.opened (once)",
    count(aiSlice, "ai.surface.opened") === 1,
    `count=${count(aiSlice, "ai.surface.opened")}`
  )

  const beforeSecond = events.length
  await composerInput.fill("E horários?")
  await composerInput.press("Enter")
  await page.waitForTimeout(800)
  const secondSlice = events.slice(beforeSecond)
  record(
    "5b. ai.surface.opened not repeated",
    count(secondSlice, "ai.surface.opened") === 0,
    `count=${count(secondSlice, "ai.surface.opened")}`
  )

  // 6. composer.mode.changed via booking drawer
  const beforeComposer = events.length
  await page.locator("#section-agendar-horario").scrollIntoViewIfNeeded()
  await page.locator("#section-agendar-horario").getByRole("button", { name: /Agendar agora/i }).first().click({ force: true })
  await page.waitForTimeout(800)
  const composerSlice = events.slice(beforeComposer)
  record(
    "6. composer.mode.changed",
    has(composerSlice, "composer.mode.changed"),
    `count=${count(composerSlice, "composer.mode.changed")}`
  )

  // 7. WhatsApp (close booking drawer so link is interactive)
  const beforeWa = events.length
  const bookingClose = page.getByRole("button", { name: "Fechar", exact: true })
  if (await bookingClose.isVisible().catch(() => false)) {
    await bookingClose.click()
    await page.waitForTimeout(400)
  }
  await page.locator("#section-fale-com-a-casa").scrollIntoViewIfNeeded()
  const whatsappLink = page.locator('#section-fale-com-a-casa a[href*="wa.me"]')
  await whatsappLink.evaluate((node) => node.click())
  await page.waitForTimeout(400)
  const waSlice = events.slice(beforeWa)
  const waIdx = waSlice.indexOf("whatsapp.clicked")
  const intentIdx = waSlice.indexOf("user.intent.signal")
  record(
    "7. whatsapp.clicked + user.intent.signal",
    waIdx !== -1 && intentIdx !== -1 && waIdx <= intentIdx,
    `whatsapp=${count(waSlice, "whatsapp.clicked")}, intent=${count(waSlice, "user.intent.signal")}`
  )

  await browser.close()

  const failed = results.filter((r) => !r.ok)
  console.log("\n--- Summary ---")
  console.log(`Total passive events captured: ${events.length}`)
  console.log(`Steps passed: ${results.length - failed.length}/${results.length}`)
  console.log(`Event counts: ${JSON.stringify(
    events.reduce((acc, e) => {
      acc[e] = (acc[e] ?? 0) + 1
      return acc
    }, {})
  )}`)

  if (failed.length > 0) {
    console.log("\nFailed:")
    for (const f of failed) console.log(`- ${f.step}: ${f.detail}`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
