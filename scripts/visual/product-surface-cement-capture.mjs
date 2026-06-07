/**
 * Surface cement captures — Medium default, OFF vs ON.
 *
 * Usage:
 *   pnpm dev
 *   node scripts/visual/product-surface-cement-capture.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const OUT = join(process.cwd(), "docs/audit/product-surface-cement")
const VIEWPORT = { width: 390, height: 844 }
const BASE_PATH = "/demo?composer-layout=v2"

function buildUrl(surfaceCement) {
  const params = new URLSearchParams({ "composer-layout": "v2" })
  params.set("surface-cement", surfaceCement ? "on" : "off")
  return `http://localhost:3000/demo?${params.toString()}`
}

async function dismissDebugChrome(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[aria-label="Toggle passive event debug panel"]').forEach((node) => {
      node.remove()
    })
  })
}

async function openAppointment(page, surfaceCement) {
  await page.goto(buildUrl(surfaceCement), { waitUntil: "domcontentloaded", timeout: 90000 })
  await page.waitForTimeout(2000)
  const agendamento = page.getByRole("button", { name: /agendamento/i })
  await agendamento.waitFor({ state: "visible", timeout: 45000 })
  await agendamento.click()
  await page.waitForTimeout(1600)
  await dismissDebugChrome(page)
}

async function captureIdle(page, path) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await page.screenshot({ path, fullPage: false })
}

async function captureEngaged(page, path) {
  const input = page.locator('[data-conversation-composer="true"] input[type="text"]')
  await input.click()
  await input.fill("Vocês abrem sábado?")
  await input.press("Enter")
  await page.waitForTimeout(2600)
  await page.screenshot({ path, fullPage: false })
}

async function captureDrawerOpen(page, path) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  const postCard = page
    .locator('[data-section="tutoriais-e-tendencias"] article, [data-section="videos"] article')
    .first()
  if (await postCard.count()) {
    await postCard.click()
  } else {
    await page.locator("article").first().click()
  }
  await page.waitForTimeout(1200)
  await page.screenshot({ path, fullPage: false })
}

async function captureComposerOverFeed(page, path) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await page.screenshot({ path, fullPage: false })
}

async function validateRuntime(page, label) {
  return page.evaluate((mode) => {
    const canvas = document.querySelector(".surface-cement-canvas")
    const composer = document.querySelector('[data-conversation-composer="true"]')
    const thread = document.querySelector('[data-conversation-thread-anchor="true"]')
    const junction = document.querySelector('[data-composer-feed-thread-junction="true"]')
    const canvasCs = canvas ? getComputedStyle(canvas) : null
    const composerCs = composer ? getComputedStyle(composer.closest("[class]") ?? composer) : null

    const hasCementClass = (el) =>
      el?.classList.contains("surface-cement-canvas") ||
      el?.classList.contains("surface-cement-drawer") ||
      false

    return {
      mode,
      canvasClass: canvas?.className ?? null,
      intensityAttr: canvas?.getAttribute("data-surface-cement-intensity"),
      bgImage: !canvas ? "none" : canvasCs?.backgroundImage === "none" ? "none" : "gradient",
      dataSurfaceCement: document.querySelector("[data-surface-cement]")?.getAttribute("data-surface-cement") ?? null,
      composerHasCementUtilityClass: hasCementClass(composer),
      threadHasCementUtilityClass: hasCementClass(thread),
      junctionHasCementUtilityClass: hasCementClass(junction),
    }
  }, label)
}

async function captureSet(page, label, surfaceCement) {
  const dir = join(OUT, label)
  await mkdir(dir, { recursive: true })

  await openAppointment(page, surfaceCement)
  await captureIdle(page, join(dir, "01-idle-390.png"))
  const idleValidation = await validateRuntime(page, label)
  await captureComposerOverFeed(page, join(dir, "04-composer-over-feed-390.png"))

  await openAppointment(page, surfaceCement)
  await captureEngaged(page, join(dir, "02-engaged-390.png"))
  const engagedValidation = await validateRuntime(page, `${label}-engaged`)

  await openAppointment(page, surfaceCement)
  await captureDrawerOpen(page, join(dir, "03-drawer-open-390.png"))
  const drawerValidation = await validateRuntime(page, `${label}-drawer`)

  return { idleValidation, engagedValidation, drawerValidation }
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: VIEWPORT })

console.log("Capturing OFF (flat baseline)…")
const offValidation = await captureSet(page, "before", false)

console.log("Capturing ON (Medium default)…")
const onValidation = await captureSet(page, "after", true)

await browser.close()

const validation = {
  intensity: "medium (CSS default, no query param)",
  flag: "surface-cement=on|off",
  off: offValidation,
  on: onValidation,
  checks: {
    offFlat: offValidation.idleValidation.dataSurfaceCement === null && offValidation.idleValidation.canvasClass === null,
    offNoCanvasClass: offValidation.idleValidation.canvasClass === null,
    offBgFlat: offValidation.idleValidation.bgImage === "none",
    onHasTexture: onValidation.idleValidation.bgImage === "gradient",
    onMediumDefault: onValidation.idleValidation.intensityAttr === null,
    composerNoCementClass: onValidation.idleValidation.composerHasCementUtilityClass === false,
    threadNoCementClass: onValidation.engagedValidation.threadHasCementUtilityClass === false,
    junctionNoCementClass: onValidation.engagedValidation.junctionHasCementUtilityClass === false,
  },
}

const compareHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Surface cement — Medium default</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #111; color: #eee; }
    h1 { font-size: 14px; font-weight: 600; padding: 16px 20px 8px; }
    p { font-size: 12px; opacity: 0.75; padding: 0 20px 12px; }
    .row { display: flex; gap: 12px; padding: 0 20px 24px; flex-wrap: wrap; }
    figure { margin: 0; }
    figcaption { font-size: 12px; opacity: 0.75; margin-bottom: 6px; }
    img { width: 390px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); }
  </style>
</head>
<body>
  <h1>Surface cement — Medium default (390×844)</h1>
  <p>OFF = flat · ON = Medium baked in CSS · canvas + drawer only</p>
  <div class="row">
    <figure><figcaption>OFF — idle</figcaption><img src="before/01-idle-390.png" alt="off idle" /></figure>
    <figure><figcaption>ON — idle</figcaption><img src="after/01-idle-390.png" alt="on idle" /></figure>
  </div>
  <div class="row">
    <figure><figcaption>OFF — engaged</figcaption><img src="before/02-engaged-390.png" alt="off engaged" /></figure>
    <figure><figcaption>ON — engaged</figcaption><img src="after/02-engaged-390.png" alt="on engaged" /></figure>
  </div>
  <div class="row">
    <figure><figcaption>OFF — drawer</figcaption><img src="before/03-drawer-open-390.png" alt="off drawer" /></figure>
    <figure><figcaption>ON — drawer</figcaption><img src="after/03-drawer-open-390.png" alt="on drawer" /></figure>
  </div>
  <div class="row">
    <figure><figcaption>OFF — composer over feed</figcaption><img src="before/04-composer-over-feed-390.png" alt="off composer" /></figure>
    <figure><figcaption>ON — composer over feed</figcaption><img src="after/04-composer-over-feed-390.png" alt="on composer" /></figure>
  </div>
</body>
</html>`

await writeFile(join(OUT, "compare.html"), compareHtml)
await writeFile(
  join(OUT, "manifest.json"),
  JSON.stringify(
    {
      viewport: VIEWPORT,
      flag: "surface-cement=on|off",
      intensity: "medium (default, no param)",
      url: BASE_PATH,
      captures: ["01-idle", "02-engaged", "03-drawer-open", "04-composer-over-feed"],
      validation,
    },
    null,
    2
  )
)

console.log(`\nCaptures saved to ${OUT}`)
console.log("Validation:", JSON.stringify(validation.checks, null, 2))
if (Object.values(validation.checks).some((v) => v === false)) {
  console.error("Some validation checks failed — review manifest.json")
  process.exit(1)
}
