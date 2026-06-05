import type { CSSProperties } from "react"
import type { ComposerSurfaceIntensity } from "./composer-surface-material"

function clampProgress(progress: number) {
  return Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0))
}

/** S2 — atmospheric thread envelope (light room air, not inserted card). */
export function resolveConversationRoomThreadEnvelopeStyle(progress: number): CSSProperties {
  const p = clampProgress(progress)

  return {
    background: `linear-gradient(180deg,
      rgba(252, 250, 246, ${(0.55 + p * 0.35).toFixed(3)}) 0%,
      rgba(244, 240, 234, ${(0.82 + p * 0.14).toFixed(3)}) 42%,
      rgba(238, 233, 226, ${(0.92 + p * 0.06).toFixed(3)}) 100%)`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,${(0.55 * p).toFixed(3)})`,
  }
}

/** S2 — composer floor continues thread atmosphere into readable input base. */
export function resolveConversationRoomComposerFloorStyle(
  intensity: ComposerSurfaceIntensity,
  progress: number
): CSSProperties {
  const p = clampProgress(progress)

  if (intensity === "off") {
    return {
      background: `linear-gradient(180deg,
        rgba(244, 240, 234, ${(0.94 * p).toFixed(3)}) 0%,
        rgba(45, 50, 58, 0.94) 38%,
        rgba(32, 36, 42, 0.97) 100%)`,
      backdropFilter: `blur(${Math.round(16 + p * 4)}px) saturate(1.08)`,
      WebkitBackdropFilter: `blur(${Math.round(16 + p * 4)}px) saturate(1.08)`,
    }
  }

  return {
    background: `linear-gradient(180deg,
      rgba(244, 240, 234, ${(0.96 * p).toFixed(3)}) 0%,
      rgba(228, 223, 216, ${(0.88 * p).toFixed(3)}) 8%,
      rgba(52, 58, 66, ${(0.86 + p * 0.08).toFixed(3)}) 34%,
      rgba(14, 18, 24, ${(0.94 + p * 0.04).toFixed(3)}) 100%)`,
    backdropFilter: `blur(${Math.round(18 + p * 6)}px) saturate(${1.04 + p * 0.04})`,
    WebkitBackdropFilter: `blur(${Math.round(18 + p * 6)}px) saturate(${1.04 + p * 0.04})`,
  }
}

/** S2 — soft horizon (depth), not page boundary. */
export function resolveConversationRoomOrbitHorizonStyle(
  intensity: ComposerSurfaceIntensity,
  progress: number
): CSSProperties {
  const p = clampProgress(progress)
  const heightPx = Math.round(72 * p)

  if (heightPx <= 0) {
    return { height: 0, opacity: 0, overflow: "hidden" }
  }

  if (intensity === "off") {
    return {
      height: `${heightPx}px`,
      marginTop: `-${Math.round(heightPx * 0.25)}px`,
      marginBottom: `${Math.round(4 * p)}px`,
      opacity: p,
      background: `linear-gradient(to bottom,
        rgba(250, 248, 244, 0) 0%,
        rgba(250, 248, 244, ${(0.65 * p).toFixed(3)}) 55%,
        rgba(244, 240, 234, ${(0.92 * p).toFixed(3)}) 100%)`,
    }
  }

  return {
    height: `${heightPx}px`,
    marginTop: `-${Math.round(heightPx * 0.22)}px`,
    marginBottom: `${Math.round(6 * p)}px`,
    opacity: p,
    background: `linear-gradient(to bottom,
      rgba(252, 250, 246, 0) 0%,
      rgba(252, 250, 246, ${(0.45 * p).toFixed(3)}) 40%,
      rgba(244, 240, 234, ${(0.88 * p).toFixed(3)}) 100%)`,
    backdropFilter: p > 0.2 ? `blur(${Math.round(3 * p)}px)` : undefined,
    WebkitBackdropFilter: p > 0.2 ? `blur(${Math.round(3 * p)}px)` : undefined,
  }
}

/** Tailwind classes — orbital depth instead of disabled opacity. */
export const CONVERSATION_ROOM_ORBIT_SECTION_CLASS =
  "origin-top scale-[0.985] blur-[0.25px] brightness-[0.99] opacity-[0.9] saturate-[0.94] contrast-[0.97]"

export const CONVERSATION_ROOM_ORBIT_STORIES_CLASS =
  "origin-top scale-[0.99] blur-[0.2px] opacity-[0.88] saturate-[0.92]"

export const CONVERSATION_ROOM_ORBIT_LEADING_CLASS =
  "origin-top scale-[0.99] blur-[0.15px] opacity-[0.92]"
