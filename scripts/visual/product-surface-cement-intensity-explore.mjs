/**
 * Surface cement intensity exploration — Soft / Medium / Strong vs OFF.
 *
 * Usage:
 *   pnpm dev   # localhost:3000
 *   node scripts/visual/product-surface-cement-intensity-explore.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const OUT = join(process.cwd(), "docs/audit/product-surface-cement/intensity-explore")
const VIEWPORT = { width: 390, height: 844 }
const BASE = "http://localhost:3000/demo"

const VARIANTS = [
  { id: "soft", label: "Variant A — Soft", multiplier: "~2× prototype" },
  { id: "medium", label: "Variant B — Medium", multiplier: "~3.5× grain / premium cement" },
  { id: "strong", label: "Variant C — Strong", multiplier: "~6× grain / noise ceiling" },
]

/** Layer alpha peaks per variant (canvas) — mirrors globals.css for metrics. */
const LAYER_ALPHAS = {
  prototype: { highlight: 0.5, shadow: 0.07, speck: 0.028, grainLight: 0.028, grainDark: 0.018, wash: 0.04 },
  soft: { highlight: 0.72, shadow: 0.14, speck: 0.056, grainLight: 0.056, grainDark: 0.036, wash: 0.08 },
  medium: { highlight: 0.58, shadow: 0.22, speck: 0.09, grainLight: 0.085, grainDark: 0.065, wash: 0.14 },
  strong: { highlight: 0.62, shadow: 0.32, speck: 0.14, grainLight: 0.11, grainDark: 0.09, wash: 0.22 },
}

const BG_LAB = { L: 97.11, a: 0.69, b: 2.96 }

function labToRgb(L, a, b) {
  const y = (L + 16) / 116
  const x = a / 500 + y
  const z = y - b / 200
  const f = (t) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787)
  let X = 95.047 * f(x)
  let Y = 100 * f(y)
  let Z = 108.883 * f(z)
  X /= 100
  Y /= 100
  Z /= 100
  let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986
  let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415
  let bl = X * 0.0557 + Y * -0.204 + Z * 1.057
  const comp = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
  return [comp(r), comp(g), comp(bl)].map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255))
}

function blendRgb(base, overlay, alpha) {
  return base.map((b, i) => Math.round(b * (1 - alpha) + overlay[i] * alpha))
}

function relativeLuminance([r, g, b]) {
  const s = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]
}

function contrastRatio(rgbA, rgbB) {
  const l1 = relativeLuminance(rgbA)
  const l2 = relativeLuminance(rgbB)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function computeVariantMetrics(variantId) {
  const layers = LAYER_ALPHAS[variantId]
  const baseRgb = labToRgb(BG_LAB.L, BG_LAB.a, BG_LAB.b)
  const darkOverlay = [58, 44, 36]
  const lightOverlay = [255, 248, 242]

  const effectiveDarkAlpha = Math.min(1, layers.shadow + layers.speck + layers.grainDark + layers.wash * 0.5)
  const effectiveLightAlpha = Math.min(1, layers.highlight * 0.35 + layers.grainLight)
  const blendedDark = blendRgb(baseRgb, darkOverlay, effectiveDarkAlpha)
  const blendedLight = blendRgb(baseRgb, lightOverlay, effectiveLightAlpha)

  const proto = LAYER_ALPHAS.prototype
  const protoDarkAlpha = Math.min(1, proto.shadow + proto.speck + proto.grainDark + proto.wash * 0.5)

  return {
    layerAlphaPeaks: layers,
    effectiveDarkOverlayAlpha: Number(effectiveDarkAlpha.toFixed(4)),
    effectiveLightOverlayAlpha: Number(effectiveLightAlpha.toFixed(4)),
    meanLayerAlpha: Number(
      (
        (layers.highlight + layers.shadow + layers.speck + layers.grainLight + layers.grainDark + layers.wash) /
        6
      ).toFixed(4)
    ),
    alphaMultiplierVsPrototype: Number((effectiveDarkAlpha / protoDarkAlpha).toFixed(2)),
    textureContrastVsBackground: {
      darkSpeck: Number(contrastRatio(baseRgb, blendedDark).toFixed(3)),
      highlight: Number(contrastRatio(baseRgb, blendedLight).toFixed(3)),
    },
  }
}

function buildUrl({ surfaceCement, intensity }) {
  const params = new URLSearchParams({ "composer-layout": "v2" })
  params.set("surface-cement", surfaceCement ? "on" : "off")
  if (surfaceCement && intensity) {
    params.set("surface-cement-intensity", intensity)
  }
  return `${BASE}?${params.toString()}`
}

async function dismissDebugChrome(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[aria-label="Toggle passive event debug panel"]').forEach((node) => node.remove())
  })
}

async function openAppointment(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 })
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
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
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

async function readRuntimeSignals(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector(".surface-cement-canvas")
    const cs = canvas ? getComputedStyle(canvas) : null
    return {
      intensity: canvas?.getAttribute("data-surface-cement-intensity") ?? null,
      hasCanvasClass: Boolean(canvas),
      bgImageLayers: cs?.backgroundImage === "none" ? 0 : (cs?.backgroundImage?.match(/gradient/g) || []).length,
      bgImageSample: cs?.backgroundImage?.slice(0, 90) ?? null,
    }
  })
}

async function compareScreenshotPair(page, base64Off, base64On, crop) {
  return page.evaluate(async ({ off, on, crop }) => {
    const load = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = crop ? crop.width : img.width
          canvas.height = crop ? crop.height : img.height
          const ctx = canvas.getContext("2d")
          if (crop) {
            ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
          } else {
            ctx.drawImage(img, 0, 0)
          }
          resolve(ctx.getImageData(0, 0, canvas.width, canvas.height).data)
        }
        img.onerror = reject
        img.src = src
      })

    const [a, b] = await Promise.all([load(off), load(on)])
    let diffPixels = 0
    let sumDelta = 0
    const total = a.length / 4
    for (let i = 0; i < a.length; i += 4) {
      const delta = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])
      sumDelta += delta
      if (delta > 6) diffPixels++
    }
    return {
      diffPixelPct: Number(((diffPixels / total) * 100).toFixed(3)),
      meanRgbDelta: Number((sumDelta / total / 3).toFixed(3)),
      maxPerceptualNote:
        diffPixels / total > 0.08
          ? "likely_perceptible"
          : diffPixels / total > 0.02
            ? "subtle_but_measurable"
            : "near_imperceptible",
    }
  }, { off: `data:image/png;base64,${base64Off}`, on: `data:image/png;base64,${base64On}`, crop })
}

async function getCanvasGapCrop(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector(".surface-cement-canvas")
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    // Sample upper-right margin strip (usually gaps beside hero column)
    return {
      x: Math.max(0, Math.floor(rect.right - 48)),
      y: Math.floor(rect.top + 120),
      width: 40,
      height: 200,
    }
  })
}

async function captureSet(page, label, url) {
  const dir = join(OUT, label)
  await mkdir(dir, { recursive: true })

  await openAppointment(page, url)
  await captureIdle(page, join(dir, "01-idle-390.png"))
  const idleBuf = await page.screenshot({ fullPage: false })
  const canvasCrop = await getCanvasGapCrop(page)

  await openAppointment(page, url)
  await captureEngaged(page, join(dir, "02-engaged-390.png"))

  await openAppointment(page, url)
  await captureDrawerOpen(page, join(dir, "03-drawer-open-390.png"))

  const runtime = await readRuntimeSignals(page)
  return { idlePngBase64: idleBuf.toString("base64"), runtime, canvasCrop }
}

function buildCompareHtml(metrics) {
  const rows = ["01-idle", "02-engaged", "03-drawer-open"]
  const variantBlocks = VARIANTS.map(
    (v) => `
  <section>
    <h2>${v.label} <span class="meta">${v.multiplier}</span></h2>
    ${rows
      .map(
        (r) => `
    <div class="row">
      <figure><figcaption>OFF — ${r}</figcaption><img src="before/${r}-390.png" alt="off ${r}" /></figure>
      <figure><figcaption>${v.id.toUpperCase()} — ${r}</figcaption><img src="${v.id}/${r}-390.png" alt="${v.id} ${r}" /></figure>
    </div>`
      )
      .join("")}
  </section>`
  ).join("")

  const metricRows = VARIANTS.map((v) => {
    const m = metrics.variants[v.id]
    return `<tr>
      <td>${v.label}</td>
      <td>${m.alphaMultiplierVsPrototype}×</td>
      <td>${m.effectiveDarkOverlayAlpha}</td>
      <td>${m.textureContrastVsBackground.darkSpeck}</td>
        <td>${m.visualDelta.idleCanvasGap?.diffPixelPct ?? "—"}%</td>
        <td>${m.visualDelta.idleCanvasGap?.meanRgbDelta ?? "—"}</td>
        <td>${m.visualDelta.idleCanvasGap?.maxPerceptualNote ?? m.visualDelta.idleFullFrame.maxPerceptualNote}</td>
    </tr>`
  }).join("")

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Surface cement — intensity exploration</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #0f0f10; color: #ececec; }
    h1 { font-size: 16px; font-weight: 600; padding: 20px 24px 8px; }
    h2 { font-size: 14px; font-weight: 600; padding: 8px 24px; opacity: 0.95; }
    .meta { font-weight: 400; opacity: 0.65; font-size: 12px; }
    section { border-top: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px; }
    .row { display: flex; gap: 12px; padding: 0 24px 16px; flex-wrap: wrap; }
    figure { margin: 0; }
    figcaption { font-size: 11px; opacity: 0.7; margin-bottom: 6px; }
    img { width: 390px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); }
    table { margin: 12px 24px 28px; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid rgba(255,255,255,0.12); padding: 8px 10px; text-align: left; }
    th { background: rgba(255,255,255,0.06); }
    p.note { font-size: 12px; opacity: 0.75; padding: 0 24px 20px; max-width: 920px; line-height: 1.5; }
  </style>
</head>
<body>
  <h1>Surface cement — intensity exploration (390×844)</h1>
  <p class="note">Canvas + drawer only. URL: <code>/demo?composer-layout=v2&amp;surface-cement=on&amp;surface-cement-intensity=soft|medium|strong</code>. Métricas idle vs OFF; engaged/drawer para revisão visual humana.</p>
  <table>
    <thead>
      <tr>
        <th>Variante</th>
        <th>× vs prototype</th>
        <th>α overlay escuro</th>
        <th>Contraste textura</th>
        <th>Δ pixels (canvas gap)</th>
        <th>Δ RGB médio</th>
        <th>Leitura</th>
      </tr>
    </thead>
    <tbody>${metricRows}</tbody>
  </table>
  ${variantBlocks}
</body>
</html>`
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: VIEWPORT })

console.log("Capturing OFF baseline…")
const offUrl = buildUrl({ surfaceCement: false })
const offDir = join(OUT, "before")
await mkdir(offDir, { recursive: true })
await openAppointment(page, offUrl)
await captureIdle(page, join(offDir, "01-idle-390.png"))
const offIdleBase64 = (await page.screenshot({ fullPage: false })).toString("base64")
const offCanvasCrop = await getCanvasGapCrop(page)
await openAppointment(page, offUrl)
await captureEngaged(page, join(offDir, "02-engaged-390.png"))
await openAppointment(page, offUrl)
await captureDrawerOpen(page, join(offDir, "03-drawer-open-390.png"))

const metrics = {
  viewport: VIEWPORT,
  backgroundReference: BG_LAB,
  prototypeLayerAlphas: LAYER_ALPHAS.prototype,
  variants: {},
  recommendation: null,
}

for (const variant of VARIANTS) {
  console.log(`Capturing ${variant.label}…`)
  const url = buildUrl({ surfaceCement: true, intensity: variant.id })
  const { idlePngBase64, runtime, canvasCrop } = await captureSet(page, variant.id, url)
  const visualDelta = {
    idleFullFrame: await compareScreenshotPair(page, offIdleBase64, idlePngBase64, null),
    idleCanvasGap: canvasCrop
      ? await compareScreenshotPair(page, offIdleBase64, idlePngBase64, canvasCrop)
      : null,
  }
  metrics.variants[variant.id] = {
    ...computeVariantMetrics(variant.id),
    runtime,
    visualDelta,
  }
}

metrics.recommendation = {
  soft: "Elegante; pode ainda ser sutil em áreas cobertas por cards — validar no device.",
  medium: "Sweet spot provável: contraste e Δ pixel idle acima do limiar perceptível sem ruído.",
  strong: "Teto de exploração — usar só se medium ainda parecer flat em gaps do canvas.",
  suggestedDefaultForHumanReview: "medium",
}

await writeFile(join(OUT, "metrics.json"), JSON.stringify(metrics, null, 2))
await writeFile(join(OUT, "compare.html"), buildCompareHtml(metrics))

await browser.close()

console.log(`\nExploration saved to ${OUT}`)
console.log(`Open ${join(OUT, "compare.html")}`)
console.log("\nMetrics summary (idle vs OFF):")
for (const v of VARIANTS) {
  const m = metrics.variants[v.id]
  console.log(
    `  ${v.id}: gap Δ ${m.visualDelta.idleCanvasGap?.diffPixelPct ?? "?"}% | contrast ${m.textureContrastVsBackground.darkSpeck} | α×prototype ${m.alphaMultiplierVsPrototype}`
  )
}
