/**
 * WS-12.1 — drawer physics perceptual validation (proxy observation).
 * Not a substitute for device-real human session.
 *
 * Run: node scripts/visual/ws12-1-drawer-perceptual-validation.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const BASE = process.env.WS121_BASE_URL ?? "http://localhost:3003/demo"
const OUT = join(process.cwd(), "docs/audit")

async function snap(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: false })
}

async function openAppointment(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(900)
  const tile = page.getByRole("heading", { name: "Agendamento", exact: true }).locator("xpath=ancestor::button[1]")
  if (await tile.isVisible().catch(() => false)) {
    await tile.click()
    await page.waitForTimeout(700)
  }
}

async function getHandleBox(page) {
  const handle = page.locator("[data-drawer-drag-zone]").first()
  await handle.waitFor({ state: "visible", timeout: 8000 })
  const box = await handle.boundingBox()
  if (!box) throw new Error("drag handle missing")
  return { handle, box }
}

async function readDrawerMetrics(page) {
  return page.evaluate(() => {
    const sheet = document.querySelector(".fixed.bottom-0.z-50.rounded-t-3xl")
    const backdrop = Array.from(document.querySelectorAll(".fixed.inset-x-0.top-0.z-50")).find((el) => {
      const style = getComputedStyle(el)
      return style.pointerEvents !== "none" && style.opacity !== "0" && el !== sheet
    })
    const parseTranslateY = (transform) => {
      if (!transform || transform === "none") return 0
      const match = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)\)/)
      return match ? Number.parseFloat(match[1]) : 0
    }
    return {
      sheetVisible: Boolean(sheet),
      translateY: sheet ? parseTranslateY(getComputedStyle(sheet).transform) : null,
      backdropOpacity: backdrop ? Number.parseFloat(getComputedStyle(backdrop).opacity) : null,
    }
  })
}

async function flickClose(page, { label, isStillOpen, snapPrefix }) {
  const { box } = await getHandleBox(page)
  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX, startY + 40, { steps: 2 })
  await page.mouse.move(startX, startY + 200, { steps: 4 })
  const releaseAt = Date.now()
  await page.mouse.up()

  let visibleMs = 0
  let midSettle = null
  for (let i = 0; i < 14; i += 1) {
    await page.waitForTimeout(35)
    if (await isStillOpen()) {
      visibleMs = Date.now() - releaseAt
    }
    if (!midSettle && Date.now() - releaseAt >= 60) {
      midSettle = await readDrawerMetrics(page)
      if (snapPrefix) await snap(page, `${snapPrefix}-flick-midsettle.png`)
    }
  }

  const closed = !(await isStillOpen())
  return {
    id: `${label}-flick`,
    visibleMsAfterRelease: visibleMs,
    midSettle,
    closed,
    pass: visibleMs >= 70 && closed,
  }
}

async function partialSettle(page, { label, isStillOpen, snapPrefix }) {
  const { box } = await getHandleBox(page)
  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX, startY + 32, { steps: 6 })
  await page.mouse.up()
  await page.waitForTimeout(120)
  const mid = await readDrawerMetrics(page)
  if (snapPrefix) await snap(page, `${snapPrefix}-partial-midsettle.png`)
  await page.waitForTimeout(180)

  const stillOpen = await isStillOpen()
  const end = await readDrawerMetrics(page)
  return {
    id: `${label}-partial`,
    stillOpenAfterSettle: stillOpen,
    midSettle: mid,
    endSettle: end,
    pass: stillOpen && Math.abs(end.translateY ?? 0) < 4,
  }
}

async function indecisivePull(page, { label, isStillOpen }) {
  const { box } = await getHandleBox(page)
  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2

  for (const delta of [28, 22]) {
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX, startY + delta, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(delta > 25 ? 240 : 180)
  }

  const stillOpen = await isStillOpen()
  const end = await readDrawerMetrics(page)
  return {
    id: `${label}-indecisive`,
    stillOpen,
    endSettle: end,
    pass: stillOpen && Math.abs(end.translateY ?? 0) < 6,
  }
}

async function scrollTopPullClose(page, { label, isStillOpen, snapPrefix }) {
  const scrollBody = page.locator("[data-drawer-scroll-body]").first()
  await scrollBody.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await page.waitForTimeout(200)
  await scrollBody.evaluate((el) => {
    el.scrollTop = 0
  })
  await page.waitForTimeout(150)

  const box = await scrollBody.boundingBox()
  if (!box) throw new Error("scroll body missing")

  const startX = box.x + box.width / 2
  const startY = box.y + 24

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX, startY + 50, { steps: 4 })
  await page.mouse.move(startX, startY + 190, { steps: 4 })
  const releaseAt = Date.now()
  await page.mouse.up()

  let visibleMs = 0
  for (let i = 0; i < 12; i += 1) {
    await page.waitForTimeout(40)
    if (await isStillOpen()) visibleMs = Date.now() - releaseAt
  }

  if (snapPrefix) await snap(page, `${snapPrefix}-scrolltop-flick-end.png`)

  return {
    id: `${label}-scroll-top-flick`,
    visibleMsAfterRelease: visibleMs,
    closed: !(await isStillOpen()),
    pass: visibleMs >= 70,
  }
}

async function openArrival(page) {
  await page.getByTestId("appointment-arrival-place-hint").click()
  await page.waitForTimeout(550)
  return {
    label: "arrival",
    isStillOpen: () => page.getByTestId("appointment-arrival-drawer").isVisible().catch(() => false),
  }
}

async function openBooking(page) {
  await page.getByRole("button", { name: /agendar horario/i }).first().click()
  await page.waitForTimeout(550)
  return {
    label: "booking",
    isStillOpen: () =>
      page
        .getByRole("heading", { name: "Escolha o servico", exact: true })
        .isVisible()
        .catch(() => false),
  }
}

async function openFeed(page) {
  const section = page.locator('[data-section="o-que-dizem"]')
  await section.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const reviewCard = section.locator("article").first()
  await reviewCard.click()
  await page.waitForTimeout(600)
  return {
    label: "feed",
    isStillOpen: () => page.locator("[data-drawer-scroll-body]").first().isVisible().catch(() => false),
  }
}

async function runDrawerSuite(page, viewport, openFn, snapPrefix) {
  const ctx = await openFn(page)
  if (snapPrefix) await snap(page, `${snapPrefix}-open.png`)

  const flick = await flickClose(page, { ...ctx, snapPrefix })
  await page.waitForTimeout(350)

  await openFn(page)
  const partial = await partialSettle(page, { ...ctx, snapPrefix })
  await page.keyboard.press("Escape")
  await page.waitForTimeout(400)

  await openFn(page)
  const indecisive = await indecisivePull(page, ctx)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(400)

  let scrollTop = null
  if (ctx.label !== "arrival") {
    await openFn(page)
    scrollTop = await scrollTopPullClose(page, { ...ctx, snapPrefix })
    await page.waitForTimeout(350)
  }

  return {
    drawer: ctx.label,
    viewport,
    flick,
    partial,
    indecisive,
    scrollTop,
    pass: [flick, partial, indecisive, scrollTop].filter(Boolean).every((c) => c.pass),
  }
}

async function runViewport(page, viewport) {
  const tag = `ws121-${viewport.width}x${viewport.height}`
  await openAppointment(page)

  const arrival = await runDrawerSuite(page, `${viewport.width}x${viewport.height}`, openArrival, `${tag}-arrival`)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(400)

  const booking = await runDrawerSuite(page, `${viewport.width}x${viewport.height}`, openBooking, `${tag}-booking`)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(400)

  const feed = await runDrawerSuite(page, `${viewport.width}x${viewport.height}`, openFeed, `${tag}-feed`)

  return {
    viewport: `${viewport.width}x${viewport.height}`,
    drawers: [arrival, booking, feed],
    pass: [arrival, booking, feed].every((d) => d.pass),
  }
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const results = []

for (const viewport of [
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  const page = await browser.newPage({ viewport })
  results.push(await runViewport(page, viewport))
  await page.close()
}

await browser.close()

const payload = {
  capturedAt: new Date().toISOString(),
  baseUrl: BASE,
  note: "Automated proxy perceptual validation — complements human/device-real session",
  results,
  pass: results.every((r) => r.pass),
}

await writeFile(join(OUT, "ws121-perceptual-metrics.json"), JSON.stringify(payload, null, 2))
console.log(JSON.stringify(payload, null, 2))
process.exit(payload.pass ? 0 : 1)
