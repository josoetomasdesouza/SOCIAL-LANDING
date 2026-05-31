/**
 * Shared Playwright helpers for AI regression harness.
 */
export const LONG_PRESS_MS = 450

export function record(results, step, ok, detail) {
  results.push({ step, ok, detail, vertical: results._vertical, scenario: results._scenario })
  console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? ` — ${detail}` : ""}`)
}

export async function clearConversationHistory(page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("business-conversation-history:")) {
        localStorage.removeItem(key)
      }
    }
  })
}

export async function openVertical(page, heading) {
  await page.goto(process.env.DEMO_URL ?? "http://localhost:3000/demo", { waitUntil: "domcontentloaded" })
  await clearConversationHistory(page)
  await page.waitForTimeout(1200)

  const tile = page.getByRole("heading", { name: heading, exact: true }).locator("xpath=ancestor::button[1]")
  await tile.scrollIntoViewIfNeeded()
  await tile.click()
  await page.waitForTimeout(800)
}

export async function sendComposerMessage(page, message) {
  let input = page.getByPlaceholder(/Pergunte sobre/i)
  if (!(await input.isVisible().catch(() => false))) {
    input = page.locator("input").filter({ has: page.locator("xpath=..") }).last()
  }

  await input.click({ force: true })
  await input.fill(message, { force: true })
  await page.keyboard.press("Enter")
  await page.waitForTimeout(1500)
}

export async function longPress(page, locator) {
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
  await page.waitForTimeout(400)
}

export async function ensureComposerInputReady(page) {
  const input = page.getByPlaceholder(/Pergunte sobre/i)
  if (await input.isVisible()) return

  const chip = page.locator("[data-conversation-context-chip]").first()
  if (await chip.isVisible()) {
    await chip.click({ force: true })
    await page.waitForTimeout(500)
  }

  if (!(await input.isVisible())) {
    await page.locator("form").last().click({ force: true })
    await page.waitForTimeout(500)
  }

  await input.waitFor({ state: "visible", timeout: 10000 })
}

export async function addContextItem(page, { sourceId, heading, scope = "feed" }) {
  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)

  if (heading && scope === "feed") {
    await page.getByRole("heading", { name: heading }).scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
  }

  const target =
    scope === "composer"
      ? page.locator(`[data-post-context-source="${sourceId}"]`).last()
      : page.locator(`[data-post-context-source="${sourceId}"]`).first()

  await longPress(page, target)

  await page
    .locator(`[data-conversation-context-chip="${sourceId}"]`)
    .first()
    .waitFor({ state: "visible", timeout: 5000 })

  for (let i = 0; i < 3; i += 1) {
    await page.keyboard.press("Escape")
    await page.waitForTimeout(350)
  }
}

export function patternRegex(pattern) {
  return new RegExp(pattern, "i")
}

export async function getComposerSection(page) {
  return page.locator('[data-conversation-composer="true"]')
}

export async function getLastAiTurn(page) {
  const composer = await getComposerSection(page)
  return composer.locator("div.flex.justify-start").last()
}

export async function getLastAiTurnText(page) {
  const turn = await getLastAiTurn(page)
  return (await turn.textContent().catch(() => "")) ?? ""
}

export async function getComposerThreadText(page) {
  const composer = await getComposerSection(page)
  const messages = composer.locator('[class*="overflow-y-auto"]').first()
  const text = await messages.textContent().catch(() => "")
  return text ?? ""
}

export function isCriticalConsoleError(message) {
  return (
    !message.includes("favicon") &&
    !message.includes("404") &&
    !message.includes("Failed to load resource") &&
    !message.includes("same key")
  )
}
