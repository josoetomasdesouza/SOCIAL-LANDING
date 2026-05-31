/**
 * Global /demo event protocol — passive events (DEV).
 *
 * Prerequisites:
 *   pnpm dev
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:events
 *   DEMO_URL=http://localhost:3000/demo pnpm qa:events
 *
 * Drawer dismiss: uses Escape (supported by ActionDrawer + BusinessFeedDrawer).
 * No "Fechar" button — aligned with drag-dismiss UX (PR #52).
 */
import { chromium } from "playwright"

const BASE = process.env.DEMO_URL ?? "http://localhost:3000/demo"
const LONG_PRESS_MS = 600
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

/** Dismiss open drawer/sheet overlays — repeat for nested surfaces. */
async function dismissOverlays(page, times = 2) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press("Escape")
    await page.waitForTimeout(500)
  }
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

/** Dismiss open drawer via Escape — matches current drawer stack (no close X). */
async function dismissDrawer(page) {
  await page.keyboard.press("Escape")
  await page.waitForTimeout(700)
}

async function waitForDemoHydrated(page) {
  await page.waitForSelector("button", { timeout: 60000, state: "visible" })
  await page.waitForFunction(
    () =>
      Object.keys(document.querySelector("button") ?? {}).some((key) =>
        key.startsWith("__react")
      ),
    { timeout: 120000 }
  )
  await page.waitForTimeout(500)
}

async function main() {
  const events = []
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })

  await context.addInitScript(() => {
    const mirrorPassiveDebug = (...args) => {
      const message = args
        .map((value) => (typeof value === "string" ? value : JSON.stringify(value)))
        .join(" ")
      if (message.includes("[passive-event]")) {
        console.log(message)
      }
    }
    const originalDebug = console.debug.bind(console)
    console.debug = (...args) => {
      originalDebug(...args)
      mirrorPassiveDebug(...args)
    }
  })

  const page = await context.newPage()
  await page.emulateMedia({ reducedMotion: "no-preference" })

  page.on("console", (msg) => {
    const type = parsePassiveEvent(msg.text())
    if (!type) return
    // Dev logger mirrors console.debug → console.log; skip duplicate back-to-back.
    if (events[events.length - 1] === type) return
    events.push(type)
  })

  const results = []

  function record(step, ok, detail) {
    results.push({ step, ok, detail })
    console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? ` — ${detail}` : ""}`)
  }

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120000 })
  await waitForDemoHydrated(page)

  // 1. Trocar vertical
  const beforeVertical = events.length
  await page.getByRole("button", { name: /Agendamento/i }).first().click()
  await page.waitForSelector("#section-agendar-horario", { timeout: 15000 })
  await page.waitForTimeout(800)
  const verticalEvents = events.slice(beforeVertical).filter((e) => e === "feed.vertical.changed")
  record("1. feed.vertical.changed", verticalEvents.length >= 1, `count=${verticalEvents.length}`)

  // 2. Long-press morph (video post — PostCard path)
  const morphPost = page.locator(TUTORIALS_POST).first()
  let morphSlice = []
  for (let attempt = 0; attempt < 3; attempt++) {
    await dismissOverlays(page)
    await morphPost.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    const beforeMorph = events.length
    await longPress(page, morphPost)
    await page.waitForTimeout(300)
    // Headless Chromium may not advance morph RAF to completion; scroll cancel emits morph.completed.
    await page.evaluate(() => window.dispatchEvent(new Event("scroll")))
    for (let i = 0; i < 40; i++) {
      const slice = events.slice(beforeMorph)
      if (count(slice, "morph.started") >= 1 && count(slice, "morph.completed") >= 1) {
        break
      }
      await page.waitForTimeout(200)
    }
    morphSlice = events.slice(beforeMorph)
    if (count(morphSlice, "morph.started") >= 1 && count(morphSlice, "morph.completed") >= 1) {
      break
    }
    await dismissOverlays(page)
  }
  const morphStartedIdx = morphSlice.indexOf("morph.started")
  const morphCompletedIdx = morphSlice.indexOf("morph.completed")
  record(
    "2. morph.started → morph.completed",
    morphStartedIdx !== -1 &&
      morphCompletedIdx !== -1 &&
      morphStartedIdx < morphCompletedIdx &&
      count(morphSlice, "morph.started") >= 1 &&
      count(morphSlice, "morph.completed") >= 1,
    `started=${count(morphSlice, "morph.started")}, completed=${count(morphSlice, "morph.completed")}`
  )

  // 3. Abrir drawer (tap — not long-press)
  await dismissOverlays(page)
  const beforeOpen = events.length
  const drawerPost = page.locator(TUTORIALS_POST).nth(1)
  await drawerPost.scrollIntoViewIfNeeded()
  await drawerPost.click({ force: true })
  await page.waitForTimeout(800)
  const openSlice = events.slice(beforeOpen)
  record(
    "3. drawer.opened + surface.opened",
    has(openSlice, "drawer.opened") && has(openSlice, "surface.opened"),
    `drawer=${count(openSlice, "drawer.opened")}, surface=${count(openSlice, "surface.opened")}`
  )

  // 4. Fechar drawer (Escape — drag-dismiss stack; no Fechar button)
  const beforeClose = events.length
  await dismissDrawer(page)
  const closeSlice = events.slice(beforeClose)
  record(
    "4. drawer.closed + surface.closed",
    has(closeSlice, "drawer.closed") && has(closeSlice, "surface.closed"),
    `drawer=${count(closeSlice, "drawer.closed")}, surface=${count(closeSlice, "surface.closed")}`
  )

  // 5. composer.mode.changed via booking drawer (hero primary CTA — before AI pollutes composer state)
  const beforeComposer = events.length
  await dismissOverlays(page)
  await page.getByTestId("appointment-operational-hero").scrollIntoViewIfNeeded()
  await page.getByTestId("appointment-operational-hero").getByRole("button", { name: /Agendar hor/i }).first().click({ force: true })
  await page.waitForTimeout(800)
  const composerSlice = events.slice(beforeComposer)
  record(
    "5. composer.mode.changed",
    has(composerSlice, "composer.mode.changed"),
    `count=${count(composerSlice, "composer.mode.changed")}`
  )

  await dismissDrawer(page)
  await page.waitForTimeout(400)

  // 6. Primeira mensagem composer
  const beforeAi = events.length
  const composerInput = page.locator("form input").last()
  await composerInput.scrollIntoViewIfNeeded()
  await composerInput.click({ force: true })
  await composerInput.fill("Quais serviços vocês oferecem?")
  await composerInput.press("Enter")
  await page.waitForTimeout(1200)
  const aiSlice = events.slice(beforeAi)
  record(
    "6. ai.surface.opened (once)",
    count(aiSlice, "ai.surface.opened") >= 1,
    `count=${count(aiSlice, "ai.surface.opened")}`
  )

  const beforeSecond = events.length
  await composerInput.fill("E horários?")
  await composerInput.press("Enter")
  await page.waitForTimeout(800)
  const secondSlice = events.slice(beforeSecond)
  record(
    "6b. ai.surface.opened not repeated",
    count(secondSlice, "ai.surface.opened") === 0,
    `count=${count(secondSlice, "ai.surface.opened")}`
  )

  // 7. WhatsApp (close any overlay so link is interactive)
  const beforeWa = events.length
  await dismissDrawer(page)
  await page.waitForTimeout(400)
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
