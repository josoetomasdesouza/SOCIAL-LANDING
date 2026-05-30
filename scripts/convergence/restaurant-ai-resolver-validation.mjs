/**
 * WS-08A — Restaurant AI resolver validation.
 *
 * Prerequisites:
 *   pnpm dev  (http://localhost:3000/demo)
 *   pnpm exec playwright install chromium
 *
 * Run:
 *   pnpm qa:restaurant
 */
import { chromium } from "playwright"

const BASE = process.env.DEMO_URL ?? "http://localhost:3000/demo"

function record(results, step, ok, detail) {
  results.push({ step, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? ` — ${detail}` : ""}`)
}

async function openRestaurant(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(1200)

  const restaurant = page.getByRole("heading", { name: "Restaurante", exact: true }).locator("xpath=ancestor::button[1]")
  await restaurant.scrollIntoViewIfNeeded()
  await restaurant.click()
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

async function main() {
  const consoleErrors = []
  const results = []

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })

  await openRestaurant(page)

  await sendComposerMessage(page, "quero sobremesas")
  const categoryBlock = page.getByTestId("restaurant-conversation-menu-block")
  await categoryBlock.waitFor({ state: "visible", timeout: 5000 })
  const categoryText = await categoryBlock.textContent()
  record(
    results,
    "1. category prompt shows menu block",
    /Pudim|Petit Gateau|Sobremesa/i.test(categoryText ?? ""),
    categoryText?.slice(0, 80)
  )

  await sendComposerMessage(page, "picanha na brasa")
  const itemBlock = page.getByTestId("restaurant-conversation-menu-block").last()
  await itemBlock.waitFor({ state: "visible", timeout: 5000 })
  const itemText = await itemBlock.textContent()
  record(
    results,
    "2. specific item prompt resolves dish",
    /Picanha/i.test(itemText ?? ""),
    itemText?.slice(0, 80)
  )

  await sendComposerMessage(page, "o que voce recomenda?")
  const recommendBlock = page.getByTestId("restaurant-conversation-menu-block").last()
  await recommendBlock.waitFor({ state: "visible", timeout: 5000 })
  const recommendCount = await recommendBlock.locator("button").count()
  record(
    results,
    "3. recommendation prompt shows options",
    recommendCount >= 2,
    `interactive=${recommendCount}`
  )

  await recommendBlock.getByRole("button", { name: /Picanha/i }).first().click()
  await page.waitForTimeout(600)
  const drawerOpen = await page.getByText("Ponto da carne").isVisible()
  record(
    results,
    "4. menu block opens item drawer",
    drawerOpen,
    drawerOpen ? "item drawer with customizations" : "drawer missing"
  )

  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)

  await sendComposerMessage(page, "ver pedido")
  const emptyCartBlock = page.getByTestId("restaurant-conversation-menu-block").last()
  record(
    results,
    "5. cart prompt with empty cart shows suggestions",
    await emptyCartBlock.isVisible(),
    "fallback to popular items"
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
    "6. no critical console errors",
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
