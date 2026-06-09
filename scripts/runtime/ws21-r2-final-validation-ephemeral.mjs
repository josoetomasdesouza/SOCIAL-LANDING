/**
 * WS-21 R2 final validation — PR #92 preview
 */
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "fs"

const PREVIEW =
  process.env.PREVIEW_URL ??
  "https://social-landing-git-workstream-w-a1a990-jtsouza30-7083s-projects.vercel.app/demo"
const OUT = process.env.OUT_DIR ?? ".review/ws21-r2-final-preview"
const LONG_PRESS_MS = 600
const VIEWPORTS = [
  { label: "320", width: 320, height: 720 },
  { label: "390", width: 390, height: 844 },
]

mkdirSync(OUT, { recursive: true })
const results = []

function record(id, viewport, ok, detail) {
  results.push({ id, viewport, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"} ${id} @ ${viewport}px — ${detail}`)
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

async function shellMetrics(page) {
  return page.evaluate(() => {
    const shell = document.querySelector('[data-conversation-composer="true"]')
    const style = shell ? getComputedStyle(shell) : null
    return {
      progress: shell?.getAttribute("data-composer-thread-engaged-progress") ?? null,
      bg: style?.backgroundColor ?? null,
      shellH: shell ? Math.round(shell.getBoundingClientRect().height) : 0,
      junction: Boolean(document.querySelector('[data-composer-feed-thread-junction="true"]')),
      heroVisible: Boolean(
        document.querySelector('[data-testid="appointment-operational-hero"]')?.getBoundingClientRect().top <
          window.innerHeight
      ),
    }
  })
}

async function openAppointment(page, layout) {
  const url = `${PREVIEW.split("?")[0]}${PREVIEW.includes("?") ? "&" : "?"}composer-layout=${layout}`
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 })
  await page.evaluate(
    (layoutVersion) => {
      localStorage.setItem("sl-composer-layout", layoutVersion)
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("business-conversation-history:")) {
          localStorage.removeItem(key)
        }
      }
    },
    layout
  )
  await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 })
  await page.waitForTimeout(1500)
  await page.getByRole("heading", { name: "Agendamento", exact: true }).locator("xpath=ancestor::button[1]").click()
  await page.waitForTimeout(900)
}

async function runViewport(browser, viewport) {
  const dir = `${OUT}/${viewport.label}`
  mkdirSync(dir, { recursive: true })

  // Flow A — idle v1
  const v1Page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } })
  await v1Page.goto(`${PREVIEW.split("?")[0]}?composer-layout=v1`, { waitUntil: "domcontentloaded", timeout: 90000 })
  await v1Page.evaluate(() => {
    localStorage.setItem("sl-composer-layout", "v1")
    for (const k of Object.keys(localStorage)) if (k.startsWith("business-conversation-history:")) localStorage.removeItem(k)
  })
  await v1Page.reload({ waitUntil: "domcontentloaded" })
  await v1Page.getByRole("heading", { name: "Agendamento", exact: true }).locator("xpath=ancestor::button[1]").click()
  await v1Page.waitForTimeout(800)
  const v1Idle = await shellMetrics(v1Page)
  await v1Page.screenshot({ path: `${dir}/A-idle-v1.png` })

  // Flow A — idle v2
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } })
  await openAppointment(page, "v2")
  const v2Idle = await shellMetrics(page)
  await page.screenshot({ path: `${dir}/A-idle-v2.png` })
  record(
    "A-idle",
    viewport.label,
    v2Idle.progress === "0.00" && !v2Idle.junction && v2Idle.heroVisible && v2Idle.bg === v1Idle.bg,
    `v1bg=${v1Idle.bg} v2bg=${v2Idle.bg} progress=${v2Idle.progress} junction=${v2Idle.junction} hero=${v2Idle.heroVisible}`
  )

  // Flow B — morph
  await longPress(page, page.locator("#section-bastidores article").first())
  await page.waitForTimeout(900)
  const morph = await page.evaluate(() => ({
    progress: document.querySelector('[data-conversation-composer="true"]')?.getAttribute("data-composer-thread-engaged-progress"),
    junction: Boolean(document.querySelector('[data-composer-feed-thread-junction="true"]')),
    chip: Boolean(document.querySelector("[data-conversation-context-chip]")),
    anchorKids: document.querySelector('[data-conversation-thread-anchor="true"]')?.childElementCount ?? 0,
  }))
  await page.screenshot({ path: `${dir}/B-morph.png` })
  record(
    "B-morph",
    viewport.label,
    morph.progress === "0.00" && !morph.junction && morph.chip && morph.anchorKids === 0,
    JSON.stringify(morph)
  )

  // Flow C — engaged
  await page.getByPlaceholder(/Pergunte sobre/i).fill("Qual o horario de funcionamento?")
  await page.keyboard.press("Enter")
  await page.waitForTimeout(7000)
  const engaged = await page.evaluate(() => {
    const shell = document.querySelector('[data-conversation-composer="true"]')
    const junction = document.querySelector('[data-composer-feed-thread-junction="true"]')
    const anchor = document.querySelector('[data-conversation-thread-anchor="true"]')
    const turns = anchor ? [...anchor.querySelectorAll(".flex.justify-start, .flex.justify-end")] : []
    const last = turns[turns.length - 1]
    const lr = last?.getBoundingClientRect()
    const st = shell?.getBoundingClientRect().top ?? 0
    const hero = document.querySelector('[data-testid="appointment-operational-hero"]')
    return {
      progress: shell?.getAttribute("data-composer-thread-engaged-progress"),
      junction: Boolean(junction),
      junctionH: junction ? Math.round(junction.getBoundingClientRect().height) : 0,
      shellH: shell ? Math.round(shell.getBoundingClientRect().height) : 0,
      shellBg: shell ? getComputedStyle(shell).backgroundColor : "",
      turns: turns.length,
      clearance: lr ? Math.round(st - lr.bottom) : null,
      heroAbove: hero ? Math.round(hero.getBoundingClientRect().top) < 0 : false,
      vScroll: anchor
        ? [...anchor.querySelectorAll("*")].filter((el) => {
            const oy = getComputedStyle(el).overflowY
            return oy === "auto" || oy === "scroll"
          }).length
        : 0,
    }
  })
  await page.screenshot({ path: `${dir}/C-engaged.png` })
  record(
    "C-engaged",
    viewport.label,
    engaged.progress === "1.00" &&
      engaged.junction &&
      engaged.junctionH >= 60 &&
      engaged.shellH <= 140 &&
      engaged.shellBg === "rgba(10, 14, 20, 0.82)" &&
      engaged.clearance >= 8 &&
      engaged.turns >= 2,
    JSON.stringify(engaged)
  )

  // S-07
  record(
    "S-07",
    viewport.label,
    v2Idle.bg === v1Idle.bg && engaged.junction && engaged.shellBg === "rgba(10, 14, 20, 0.82)",
    `idleMatch=${v2Idle.bg === v1Idle.bg} engagedJunction=${engaged.junction}`
  )

  // Flow D — overlay
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
  await page.waitForTimeout(300)
  await page.getByTestId("appointment-operational-hero").getByRole("button", { name: /Agendar/i }).first().click({ force: true })
  await page.waitForTimeout(1000)
  const overlay = await page.evaluate(() => ({
    progress: document.querySelector('[data-conversation-composer="true"]')?.getAttribute("data-composer-thread-engaged-progress"),
    junction: Boolean(document.querySelector('[data-composer-feed-thread-junction="true"]')),
    anchorHidden: document.querySelector('[data-conversation-thread-anchor="true"]')?.classList.contains("hidden"),
    shellVisible: (document.querySelector('[data-conversation-composer="true"]')?.getBoundingClientRect().height ?? 0) > 0,
  }))
  await page.screenshot({ path: `${dir}/D-overlay.png` })
  record(
    "D-overlay",
    viewport.label,
    overlay.progress === "0.00" && !overlay.junction && overlay.anchorHidden && overlay.shellVisible,
    JSON.stringify(overlay)
  )
  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)

  // hidden
  const hint = page.getByText(/Como chegar|estacionamento|Augusta/i).first()
  if ((await hint.count()) > 0) await hint.click({ force: true })
  await page.waitForTimeout(900)
  const hidden = await page.evaluate(() => {
    const shell = document.querySelector('[data-conversation-composer="true"]')
    return {
      shellHidden: !shell || shell.closest(".hidden") || shell.getBoundingClientRect().height === 0,
      junction: Boolean(document.querySelector('[data-composer-feed-thread-junction="true"]')),
      anchorHidden: document.querySelector('[data-conversation-thread-anchor="true"]')?.classList.contains("hidden") ?? true,
    }
  })
  await page.screenshot({ path: `${dir}/D-hidden.png` })
  record(
    "D-hidden",
    viewport.label,
    hidden.shellHidden && !hidden.junction && hidden.anchorHidden,
    JSON.stringify(hidden)
  )
  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)
  const restore = await page.evaluate(() => ({
    progress: document.querySelector('[data-conversation-composer="true"]')?.getAttribute("data-composer-thread-engaged-progress"),
    junction: Boolean(document.querySelector('[data-composer-feed-thread-junction="true"]')),
    turns: document.querySelector('[data-conversation-thread-anchor="true"]')?.querySelectorAll(".flex.justify-start, .flex.justify-end").length ?? 0,
  }))
  record(
    "D-restore",
    viewport.label,
    restore.progress === "1.00" && restore.junction && restore.turns >= 2,
    JSON.stringify(restore)
  )

  await v1Page.close()
  await page.close()
}

console.log(`\n=== WS-21 R2 Final Validation ===`)
console.log(`Preview: ${PREVIEW}?composer-layout=v2\n`)

const browser = await chromium.launch({ headless: true })
for (const vp of VIEWPORTS) {
  console.log(`\n--- ${vp.label}px ---`)
  await runViewport(browser, vp)
}
await browser.close()

writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\n--- Summary ---`)
console.log(`Total: ${results.length} | PASS: ${results.length - failed.length} | FAIL: ${failed.length}`)
if (failed.length) {
  for (const f of failed) console.log(`  FAIL ${f.id} @ ${f.viewport}: ${f.detail}`)
  process.exit(1)
}
