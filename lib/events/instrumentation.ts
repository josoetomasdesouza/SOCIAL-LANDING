/**
 * Typed passive instrumentation helpers.
 * Fire-and-forget — never throws, never mutates app state.
 */

import { emitPassiveEvent } from "./event-bus"
import type { EventSource } from "./event-types"

let sessionTraceId: string | null = null

export function createInteractionTraceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getSessionTraceId(): string {
  if (!sessionTraceId) {
    sessionTraceId = createInteractionTraceId()
  }
  return sessionTraceId
}

export function resetSessionTraceId(): void {
  sessionTraceId = null
}

export function observeComposerModeChanged(input: {
  from: "default" | "overlay" | "hidden"
  to: "default" | "overlay" | "hidden"
  reason?: string
  vertical?: string
  source?: EventSource
  traceId?: string
}): void {
  if (input.from === input.to) {
    return
  }
  emitPassiveEvent({
    type: "composer.mode.changed",
    payload: {
      from: input.from,
      to: input.to,
      reason: input.reason,
      vertical: input.vertical,
    },
    source: input.source ?? "conversation-context",
    traceId: input.traceId,
  })
}

export function observeSurfaceOpened(input: {
  surfaceId: string
  surfaceKind: "drawer" | "feed-drawer" | "composer" | "story" | "checkout" | "other"
  vertical?: string
  meta?: Readonly<Record<string, string | number | boolean>>
  source?: EventSource
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "surface.opened",
    payload: {
      surfaceId: input.surfaceId,
      surfaceKind: input.surfaceKind,
      vertical: input.vertical,
      meta: input.meta,
    },
    source: input.source ?? "instrumentation",
    traceId: input.traceId,
  })
}

export function observeSurfaceClosed(input: {
  surfaceId: string
  surfaceKind: "drawer" | "feed-drawer" | "composer" | "story" | "checkout" | "other"
  vertical?: string
  source?: EventSource
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "surface.closed",
    payload: {
      surfaceId: input.surfaceId,
      surfaceKind: input.surfaceKind,
      vertical: input.vertical,
    },
    source: input.source ?? "instrumentation",
    traceId: input.traceId,
  })
}

export function observeDrawerOpened(input: {
  drawerId: string
  drawerKind: "action" | "feed" | "cart" | "checkout" | "product" | "other"
  title?: string
  vertical?: string
  source?: EventSource
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "drawer.opened",
    payload: {
      drawerId: input.drawerId,
      drawerKind: input.drawerKind,
      title: input.title,
      vertical: input.vertical,
    },
    source: input.source ?? "action-drawer",
    traceId: input.traceId,
  })
  observeSurfaceOpened({
    surfaceId: input.drawerId,
    surfaceKind: input.drawerKind === "feed" ? "feed-drawer" : "drawer",
    vertical: input.vertical,
    source: input.source,
    traceId: input.traceId,
  })
}

export function observeDrawerClosed(input: {
  drawerId: string
  drawerKind: "action" | "feed" | "cart" | "checkout" | "product" | "other"
  vertical?: string
  source?: EventSource
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "drawer.closed",
    payload: {
      drawerId: input.drawerId,
      drawerKind: input.drawerKind,
      vertical: input.vertical,
    },
    source: input.source ?? "action-drawer",
    traceId: input.traceId,
  })
  observeSurfaceClosed({
    surfaceId: input.drawerId,
    surfaceKind: input.drawerKind === "feed" ? "feed-drawer" : "drawer",
    vertical: input.vertical,
    source: input.source,
    traceId: input.traceId,
  })
}

export function observeFeedItemViewed(input: {
  itemId: string
  itemKind?: string
  sectionId?: string
  vertical?: string
  source?: EventSource
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "feed.item.viewed",
    payload: {
      itemId: input.itemId,
      itemKind: input.itemKind,
      sectionId: input.sectionId,
      vertical: input.vertical,
    },
    source: input.source ?? "vertical-feed",
    traceId: input.traceId,
  })
}

export function observeFeedVerticalChanged(input: {
  from: string | null
  to: string
  source?: EventSource
  traceId?: string
}): void {
  if (input.from === input.to) {
    return
  }
  resetSessionTraceId()
  emitPassiveEvent({
    type: "feed.vertical.changed",
    payload: { from: input.from, to: input.to },
    source: input.source ?? "demo",
    traceId: input.traceId ?? getSessionTraceId(),
  })
}

export function observeMorphStarted(input: {
  itemId: string
  source?: "long-press" | "programmatic"
  vertical?: string
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "morph.started",
    payload: {
      itemId: input.itemId,
      source: input.source,
      vertical: input.vertical,
    },
    source: "instrumentation",
    traceId: input.traceId ?? getSessionTraceId(),
  })
}

export function observeMorphCompleted(input: {
  itemId: string
  vertical?: string
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "morph.completed",
    payload: {
      itemId: input.itemId,
      vertical: input.vertical,
    },
    source: "instrumentation",
    traceId: input.traceId ?? getSessionTraceId(),
  })
}

export function observeWhatsAppClicked(input: {
  phone: string
  context?: string
  href?: string
  source?: EventSource
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "whatsapp.clicked",
    payload: {
      phone: input.phone,
      context: input.context,
      href: input.href,
    },
    source: input.source ?? "cta",
    traceId: input.traceId ?? getSessionTraceId(),
  })
  observeUserIntentSignal({
    intent: "contact",
    signal: "whatsapp.clicked",
    traceId: input.traceId,
  })
}

export function observeUserIntentSignal(input: {
  intent: "discover" | "deepen" | "execute" | "contact" | "purchase" | "other"
  signal: string
  vertical?: string
  itemId?: string
  source?: EventSource
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "user.intent.signal",
    payload: {
      intent: input.intent,
      signal: input.signal,
      vertical: input.vertical,
      itemId: input.itemId,
    },
    source: input.source ?? "instrumentation",
    traceId: input.traceId ?? getSessionTraceId(),
  })
}

export function observeAiSurfaceOpened(input: {
  action: "opened" | "collapsed" | "expanded"
  sheetSnap?: "compact" | "medium" | "expanded"
  vertical?: string
  traceId?: string
}): void {
  emitPassiveEvent({
    type: "ai.surface.opened",
    payload: {
      action: input.action,
      sheetSnap: input.sheetSnap,
      vertical: input.vertical,
    },
    source: "instrumentation",
    traceId: input.traceId ?? getSessionTraceId(),
  })
}

/**
 * Observes drawer open/close transitions from boolean isOpen + stable drawerId.
 * Safe for useEffect in drawer components — Tier 2 only.
 */
export function observeDrawerOpenStateEffect(input: {
  isOpen: boolean
  drawerId: string
  drawerKind: "action" | "feed" | "cart" | "checkout" | "product" | "other"
  title?: string
  vertical?: string
  source?: EventSource
}): void {
  if (input.isOpen) {
    observeDrawerOpened({
      drawerId: input.drawerId,
      drawerKind: input.drawerKind,
      title: input.title,
      vertical: input.vertical,
      source: input.source,
    })
  } else {
    observeDrawerClosed({
      drawerId: input.drawerId,
      drawerKind: input.drawerKind,
      vertical: input.vertical,
      source: input.source,
    })
  }
}
