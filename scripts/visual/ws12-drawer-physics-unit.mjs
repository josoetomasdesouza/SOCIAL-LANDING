/**
 * WS-12 — drawer physics unit checks (inline pure logic).
 */
import assert from "node:assert/strict"

const DRAWER_FLICK_CLOSE_VELOCITY_PX_MS = 0.65

function easeOutCubic(progress) {
  const t = Math.min(1, Math.max(0, progress))
  return 1 - Math.pow(1 - t, 3)
}

function shouldCloseDrawerFromRelease({ deltaY, velocityY, closeThresholdPx, pulling }) {
  if (!pulling || deltaY <= 0) return false
  return deltaY >= closeThresholdPx || velocityY >= DRAWER_FLICK_CLOSE_VELOCITY_PX_MS
}

assert.equal(easeOutCubic(0), 0)
assert.equal(easeOutCubic(1), 1)
assert.ok(easeOutCubic(0.5) > 0.5)
assert.equal(shouldCloseDrawerFromRelease({ deltaY: 30, velocityY: 0.2, closeThresholdPx: 60, pulling: true }), false)
assert.equal(shouldCloseDrawerFromRelease({ deltaY: 80, velocityY: 0.1, closeThresholdPx: 60, pulling: true }), true)
assert.equal(shouldCloseDrawerFromRelease({ deltaY: 20, velocityY: 0.9, closeThresholdPx: 60, pulling: true }), true)

console.log("WS-12 drawer physics unit checks passed")
