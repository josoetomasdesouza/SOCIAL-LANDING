/**
 * Composer surface material — vidro fumê escuro (produção).
 *
 * Regras:
 * - Compact shell (pill / colapsado / chips): vidro escuro plano, mais transparente
 * - Expanded sheet (chat aberto): gradiente fumê + blur
 * - Inner surfaces: transparentes — material só na shell externa
 * - Page mask: fade aberto para feed aparecer atrás do vidro
 * - Expansion: blur + máscara intensificam com altura do sheet (expansionProgress)
 *
 * Rollback opt-out:
 *   localStorage.setItem("sl-composer-smoke-experiment", "off"); location.reload()
 *   NEXT_PUBLIC_COMPOSER_SMOKE_EXPERIMENT=off
 */

import type { CSSProperties } from "react"

export type ComposerSurfaceIntensity = "off" | "smoke-subtle" | "smoke-fume"

/** Production default — validated WS-13 perceptual experiment. */
export const DEFAULT_COMPOSER_SURFACE_INTENSITY: ComposerSurfaceIntensity = "smoke-fume"

/** Legacy baseline — opt-out only. */
export const COMPOSER_SURFACE_BASELINE = "rgba(45,50,58,0.95)" as const

export interface ComposerSurfaceMaterialTokens {
  sectionClassName: string
  sectionStyle: CSSProperties
  innerSurfaceStyle: CSSProperties
}

const BASELINE_INNER: CSSProperties = { backgroundColor: COMPOSER_SURFACE_BASELINE }

const BASELINE: ComposerSurfaceMaterialTokens = {
  sectionClassName:
    "border border-white/[0.07] shadow-[0_24px_60px_-36px_rgba(2,6,23,0.62),0_10px_24px_-22px_rgba(15,23,42,0.34)] backdrop-blur-[18px]",
  sectionStyle: BASELINE_INNER,
  innerSurfaceStyle: BASELINE_INNER,
}

const SMOKE_SUBTLE: ComposerSurfaceMaterialTokens = {
  sectionClassName:
    "border border-white/[0.055] shadow-[0_20px_46px_-24px_rgba(0,0,0,0.5),0_8px_20px_-14px_rgba(0,0,0,0.3)]",
  sectionStyle: {
    backgroundColor: "rgba(40,44,50,0.72)",
    backdropFilter: "blur(14px) saturate(1.06)",
    WebkitBackdropFilter: "blur(14px) saturate(1.06)",
  },
  innerSurfaceStyle: { backgroundColor: "transparent" },
}

/** Compact: flat dark glass, slightly more transparent than expanded base. */
export const COMPOSER_SMOKE_FUME_COMPACT_SURFACE = "rgba(10,14,20,0.82)" as const

const SMOKE_FUME: ComposerSurfaceMaterialTokens = {
  sectionClassName:
    "border border-white/[0.06] shadow-[0_24px_56px_-16px_rgba(0,0,0,0.62),0_12px_32px_-14px_rgba(0,0,0,0.42)]",
  sectionStyle: {
    background:
      "linear-gradient(180deg, rgba(30,34,40,0.78) 0%, rgba(8,12,18,0.92) 100%)",
    backdropFilter: "blur(22px) saturate(1.06)",
    WebkitBackdropFilter: "blur(22px) saturate(1.06)",
  },
  innerSurfaceStyle: { backgroundColor: "transparent" },
}

const SMOKE_FUME_COMPACT: CSSProperties = {
  backgroundColor: COMPOSER_SMOKE_FUME_COMPACT_SURFACE,
  backdropFilter: "blur(22px) saturate(1.06)",
  WebkitBackdropFilter: "blur(22px) saturate(1.06)",
}

const OVERRIDE_STORAGE_KEY = "sl-composer-smoke-experiment"
const OVERRIDE_QUERY_KEY = "composer-smoke"

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}

function withBackdropBlur(style: CSSProperties, blurPx: number, saturation: number): CSSProperties {
  const filter = `blur(${blurPx}px) saturate(${saturation.toFixed(2)})`

  return {
    ...style,
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
  }
}

export function resolveComposerExpansionProgress(
  compactHeightPx: number,
  expandedHeightPx: number,
  currentHeightPx: number
): number {
  if (expandedHeightPx <= compactHeightPx || currentHeightPx <= 0) {
    return 0
  }

  return clampNumber(
    (currentHeightPx - compactHeightPx) / (expandedHeightPx - compactHeightPx),
    0,
    1
  )
}

export function resolveComposerHandleVisuals(
  expansionProgress: number,
  hasEngagedConversation: boolean,
  isHandleActive: boolean
) {
  const progress = clampNumber(expansionProgress, 0, 1)

  return {
    opacity: clampNumber(
      (hasEngagedConversation ? 0.36 : 0.3) - progress * 0.14 + (isHandleActive ? 0.22 : 0),
      0.18,
      0.56
    ),
    widthPx: Math.round(40 - progress * 14),
  }
}

function normalizeIntensity(value: string | null | undefined): ComposerSurfaceIntensity | null {
  if (!value || value === "false" || value === "0") {
    return null
  }

  if (value === "off") {
    return "off"
  }

  if (value === "smoke-subtle") {
    return "smoke-subtle"
  }

  if (value === "smoke-fume" || value === "true" || value === "1") {
    return "smoke-fume"
  }

  return null
}

function readOverrideFromEnv(): ComposerSurfaceIntensity | null {
  const value = process.env.NEXT_PUBLIC_COMPOSER_SMOKE_EXPERIMENT
  if (!value) {
    return null
  }

  return normalizeIntensity(value) ?? DEFAULT_COMPOSER_SURFACE_INTENSITY
}

function readOverrideFromQuery(): ComposerSurfaceIntensity | null {
  if (typeof window === "undefined") {
    return null
  }

  const value = new URLSearchParams(window.location.search).get(OVERRIDE_QUERY_KEY)
  if (value === null) {
    return null
  }

  return normalizeIntensity(value)
}

function readOverrideFromStorage(): ComposerSurfaceIntensity | null {
  if (typeof window === "undefined") {
    return null
  }

  return normalizeIntensity(window.localStorage.getItem(OVERRIDE_STORAGE_KEY))
}

export function resolveComposerSurfaceIntensity(): ComposerSurfaceIntensity {
  const envOverride = readOverrideFromEnv()
  if (envOverride !== null) {
    return envOverride
  }

  const queryOverride = readOverrideFromQuery()
  if (queryOverride !== null) {
    return queryOverride
  }

  const storageOverride = readOverrideFromStorage()
  if (storageOverride !== null) {
    return storageOverride
  }

  return DEFAULT_COMPOSER_SURFACE_INTENSITY
}

export function resolveComposerSurfaceMaterial(intensity: ComposerSurfaceIntensity): ComposerSurfaceMaterialTokens {
  switch (intensity) {
    case "smoke-subtle":
      return SMOKE_SUBTLE
    case "smoke-fume":
      return SMOKE_FUME
    case "off":
      return BASELINE
    default:
      return SMOKE_FUME
  }
}

/** Layered expansion — blur and material deepen with sheet height. */
export function resolveComposerExpansionSectionStyle(
  intensity: ComposerSurfaceIntensity,
  expansionProgress: number,
  forceCompact = false
): CSSProperties {
  const progress = forceCompact ? 0 : clampNumber(expansionProgress, 0, 1)

  if (intensity === "off") {
    const blurPx = Math.round(12 + progress * 8)
    const saturation = 1.18 + progress * 0.08
    const alpha = 0.9 - progress * 0.06

    return withBackdropBlur(
      {
        backgroundColor: `rgba(45, 50, 58, ${alpha.toFixed(3)})`,
      },
      blurPx,
      saturation
    )
  }

  if (intensity === "smoke-subtle") {
    const blurPx = Math.round(12 + progress * 6)
    const saturation = 1.04 + progress * 0.06
    const alpha = 0.78 - progress * 0.06

    return withBackdropBlur(
      {
        backgroundColor: `rgba(40, 44, 50, ${alpha.toFixed(3)})`,
      },
      blurPx,
      saturation
    )
  }

  const blurPx = Math.round(18 + progress * 8)
  const saturation = 1.06 + progress * 0.08

  if (progress <= 0.001) {
    return withBackdropBlur({ backgroundColor: COMPOSER_SMOKE_FUME_COMPACT_SURFACE }, blurPx, saturation)
  }

  if (progress >= 0.999) {
    return withBackdropBlur(
      {
        background: "linear-gradient(180deg, rgba(30,34,40,0.78) 0%, rgba(8,12,18,0.92) 100%)",
      },
      blurPx,
      saturation
    )
  }

  return withBackdropBlur(
    {
      background: `linear-gradient(180deg, rgba(${Math.round(lerp(10, 30, progress))},${Math.round(
        lerp(14, 34, progress)
      )},${Math.round(lerp(20, 40, progress))},${lerp(0.82, 0.78, progress).toFixed(3)}) 0%, rgba(8,12,18,${lerp(
        0.82,
        0.92,
        progress
      ).toFixed(3)}) 100%)`,
    },
    blurPx,
    saturation
  )
}

/** Compact shell → flat dark glass. Expanded → gradient (fume). */
export function resolveComposerSurfaceSectionStyle(
  intensity: ComposerSurfaceIntensity,
  compactShell: boolean,
  expansionProgress = compactShell ? 0 : 1
): CSSProperties {
  return resolveComposerExpansionSectionStyle(intensity, expansionProgress, compactShell)
}

export function isComposerSmokeSurfaceActive(intensity: ComposerSurfaceIntensity) {
  return intensity !== "off"
}

export function resolveComposerPageMaskBackground(
  intensity: ComposerSurfaceIntensity,
  expansionProgress = 0,
  hasEngagedConversation = false
): string {
  const progress = clampNumber(expansionProgress, 0, 1)

  switch (intensity) {
    case "off":
      if (hasEngagedConversation) {
        return `linear-gradient(to top, rgba(15, 23, 42, ${(0.18 + progress * 0.08).toFixed(3)}) 0%, rgba(15, 23, 42, ${(
          0.12 +
          progress * 0.06
        ).toFixed(3)}) 24%, rgba(15, 23, 42, 0.05) 58%, rgba(15, 23, 42, 0.015) 82%, rgba(15, 23, 42, 0) 100%)`
      }

      return "linear-gradient(to top, rgba(15, 23, 42, 0.16) 0%, rgba(15, 23, 42, 0.1) 22%, rgba(15, 23, 42, 0.035) 54%, rgba(15, 23, 42, 0.01) 80%, rgba(15, 23, 42, 0) 100%)"
    case "smoke-subtle": {
      const scale = 0.35 + progress * 0.65

      return `linear-gradient(to top, rgba(255, 255, 255, ${(0.52 * scale).toFixed(3)}) 0%, rgba(255, 255, 255, ${(
        0.22 * scale
      ).toFixed(3)}) 22%, rgba(255, 255, 255, ${(0.06 * scale).toFixed(3)}) 52%, rgba(255, 255, 255, 0) 78%, rgba(255, 255, 255, 0) 100%)`
    }
    case "smoke-fume":
    default: {
      const scale = 0.22 + progress * 0.78

      if (hasEngagedConversation) {
        return `linear-gradient(to top, rgba(15, 23, 42, ${(0.06 + progress * 0.12).toFixed(3)}) 0%, rgba(255, 255, 255, ${(
          0.28 * scale
        ).toFixed(3)}) 14%, rgba(255, 255, 255, ${(0.1 * scale).toFixed(3)}) 38%, rgba(255, 255, 255, ${(
          0.02 * scale
        ).toFixed(3)}) 62%, rgba(255, 255, 255, 0) 82%, rgba(255, 255, 255, 0) 100%)`
      }

      return `linear-gradient(to top, rgba(255, 255, 255, ${(0.28 * scale).toFixed(3)}) 0%, rgba(255, 255, 255, ${(
        0.1 * scale
      ).toFixed(3)}) 18%, rgba(255, 255, 255, ${(0.02 * scale).toFixed(3)}) 48%, rgba(255, 255, 255, 0) 72%, rgba(255, 255, 255, 0) 100%)`
    }
  }
}

/** WS-21 R2 — local feed↔thread junction band height (smoke-fume v2). */
export const COMPOSER_FEED_THREAD_JUNCTION_HEIGHT_PX = 96

export interface ThreadEngagedProgressInput {
  isLayoutV2: boolean
  composerMode: "default" | "overlay" | "hidden"
  hasEngagedConversation: boolean
  /** User + AI turns in session — excludes context_event (morph chips). */
  conversationTurnCount: number
}

/**
 * v2 engaged signal — replaces sheet-height expansionProgress for material drama.
 * Morph-only (chip, no turns) and hidden/overlay modes stay at 0.
 */
export function resolveThreadEngagedProgress({
  isLayoutV2,
  composerMode,
  hasEngagedConversation,
  conversationTurnCount,
}: ThreadEngagedProgressInput): number {
  if (!isLayoutV2) {
    return 0
  }

  if (composerMode !== "default") {
    return 0
  }

  if (!hasEngagedConversation || conversationTurnCount < 1) {
    return 0
  }

  return 1
}

/** Local junction gradient at feed↔thread boundary (P-06a WS-21 R2). */
export function resolveComposerFeedThreadJunctionStyle(
  intensity: ComposerSurfaceIntensity,
  progress: number
): CSSProperties {
  const normalizedProgress = clampNumber(progress, 0, 1)

  if (normalizedProgress <= 0.001) {
    return {
      height: 0,
      opacity: 0,
      overflow: "hidden",
    }
  }

  const heightPx = Math.round(COMPOSER_FEED_THREAD_JUNCTION_HEIGHT_PX * normalizedProgress)
  const bleedPx = Math.round(heightPx * 0.35)

  if (intensity === "off") {
    return {
      height: `${heightPx}px`,
      marginTop: `-${bleedPx}px`,
      marginBottom: `${Math.round(6 * normalizedProgress)}px`,
      opacity: normalizedProgress,
      background: `linear-gradient(to bottom, rgba(245,243,238,0) 0%, rgba(45,50,58,${(0.08 * normalizedProgress).toFixed(3)}) 100%)`,
    }
  }

  if (intensity === "smoke-subtle") {
    return {
      height: `${heightPx}px`,
      marginTop: `-${bleedPx}px`,
      marginBottom: `${Math.round(6 * normalizedProgress)}px`,
      opacity: normalizedProgress,
      background: `linear-gradient(to bottom, rgba(250,248,244,0) 0%, rgba(255,255,255,${(0.28 * normalizedProgress).toFixed(3)}) 18%, rgba(40,44,50,${(0.1 * normalizedProgress).toFixed(3)}) 100%)`,
      backdropFilter: normalizedProgress > 0.2 ? `blur(${Math.round(4 * normalizedProgress)}px)` : undefined,
      WebkitBackdropFilter: normalizedProgress > 0.2 ? `blur(${Math.round(4 * normalizedProgress)}px)` : undefined,
    }
  }

  return {
    height: `${heightPx}px`,
    marginTop: `-${bleedPx}px`,
    marginBottom: `${Math.round(10 * normalizedProgress)}px`,
    opacity: Math.min(1, normalizedProgress * 1.08),
    background: `linear-gradient(to bottom, rgba(250,248,244,0) 0%, rgba(255,255,255,${(0.38 * normalizedProgress).toFixed(3)}) 12%, rgba(250,248,244,${(0.55 * normalizedProgress).toFixed(3)}) 52%, rgba(250,248,244,${(0.88 * normalizedProgress).toFixed(3)}) 82%, rgba(250,248,244,${(0.96 * normalizedProgress).toFixed(3)}) 100%)`,
    backdropFilter: normalizedProgress > 0.15 ? `blur(${Math.round(8 * normalizedProgress)}px)` : undefined,
    WebkitBackdropFilter: normalizedProgress > 0.15 ? `blur(${Math.round(8 * normalizedProgress)}px)` : undefined,
    maskImage: "linear-gradient(to bottom, black 0%, black 88%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 88%, transparent 100%)",
  }
}

/** S2 — engaged v2: light footer plate + dark input capsule (structure only; idle pill unchanged). */
export interface ComposerEngagedPresenceMaterial {
  plateClassName: string
  plateStyle: CSSProperties
  plateInnerSurfaceStyle: CSSProperties
  capsuleClassName: string
  capsuleStyle: CSSProperties
}

export function resolveComposerEngagedPresenceMaterial(
  intensity: ComposerSurfaceIntensity
): ComposerEngagedPresenceMaterial {
  const capsuleStyle =
    intensity === "off"
      ? { backgroundColor: COMPOSER_SURFACE_BASELINE }
      : withBackdropBlur(
          { backgroundColor: COMPOSER_SMOKE_FUME_COMPACT_SURFACE },
          22,
          1.06
        )

  const capsuleClassName =
    intensity === "off"
      ? "rounded-full border border-white/[0.08]"
      : "rounded-full border border-white/[0.06] shadow-[0_14px_32px_-20px_rgba(0,0,0,0.48)]"

  return {
    plateClassName:
      "border-t border-border/45 bg-background/90 shadow-[0_-10px_36px_-22px_rgba(15,23,42,0.14)] backdrop-blur-md",
    plateStyle: {
      backgroundColor: "rgba(250, 248, 244, 0.92)",
      backdropFilter: "blur(16px) saturate(1.02)",
      WebkitBackdropFilter: "blur(16px) saturate(1.02)",
    },
    plateInnerSurfaceStyle: { backgroundColor: "transparent" },
    capsuleClassName,
    capsuleStyle,
  }
}

export const COMPOSER_SURFACE_OVERRIDE_STORAGE_KEY = OVERRIDE_STORAGE_KEY
