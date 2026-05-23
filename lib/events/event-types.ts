/**
 * Passive event contracts — observational only.
 * Does not drive runtime behavior; Tier 1 remains authoritative.
 */

export type EventSource =
  | "demo"
  | "vertical-feed"
  | "conversation-context"
  | "action-drawer"
  | "feed-drawer"
  | "cta"
  | "surface-engine"
  | "instrumentation"
  | "unknown"

export interface EventEnvelopeBase {
  /** ISO 8601 */
  readonly timestamp: string
  readonly source: EventSource
  /** Correlates related events in one interaction chain */
  readonly traceId?: string
}

export interface ComposerModeChangedPayload {
  readonly from: "default" | "overlay" | "hidden"
  readonly to: "default" | "overlay" | "hidden"
  readonly reason?: string
  readonly vertical?: string
}

export interface SurfacePayload {
  readonly surfaceId: string
  readonly surfaceKind: "drawer" | "feed-drawer" | "composer" | "story" | "checkout" | "other"
  readonly vertical?: string
  readonly meta?: Readonly<Record<string, string | number | boolean>>
}

export interface DrawerPayload {
  readonly drawerId: string
  readonly drawerKind: "action" | "feed" | "cart" | "checkout" | "product" | "other"
  readonly title?: string
  readonly vertical?: string
}

export interface FeedItemViewedPayload {
  readonly itemId: string
  readonly itemKind?: string
  readonly sectionId?: string
  readonly vertical?: string
}

export interface FeedVerticalChangedPayload {
  readonly from: string | null
  readonly to: string
}

export interface MorphPayload {
  readonly itemId: string
  readonly source?: "long-press" | "programmatic"
  readonly vertical?: string
}

export interface WhatsAppClickedPayload {
  readonly phone: string
  readonly context?: string
  readonly href?: string
}

export interface UserIntentSignalPayload {
  readonly intent: "discover" | "deepen" | "execute" | "contact" | "purchase" | "other"
  readonly signal: string
  readonly vertical?: string
  readonly itemId?: string
}

export interface AiSurfacePayload {
  readonly action: "opened" | "collapsed" | "expanded"
  readonly sheetSnap?: "compact" | "medium" | "expanded"
  readonly vertical?: string
}

export type SocialLandingEvent =
  | (EventEnvelopeBase & { readonly type: "composer.mode.changed"; readonly payload: ComposerModeChangedPayload })
  | (EventEnvelopeBase & { readonly type: "surface.opened"; readonly payload: SurfacePayload })
  | (EventEnvelopeBase & { readonly type: "surface.closed"; readonly payload: SurfacePayload })
  | (EventEnvelopeBase & { readonly type: "drawer.opened"; readonly payload: DrawerPayload })
  | (EventEnvelopeBase & { readonly type: "drawer.closed"; readonly payload: DrawerPayload })
  | (EventEnvelopeBase & { readonly type: "feed.item.viewed"; readonly payload: FeedItemViewedPayload })
  | (EventEnvelopeBase & { readonly type: "feed.vertical.changed"; readonly payload: FeedVerticalChangedPayload })
  | (EventEnvelopeBase & { readonly type: "morph.started"; readonly payload: MorphPayload })
  | (EventEnvelopeBase & { readonly type: "morph.completed"; readonly payload: MorphPayload })
  | (EventEnvelopeBase & { readonly type: "whatsapp.clicked"; readonly payload: WhatsAppClickedPayload })
  | (EventEnvelopeBase & { readonly type: "user.intent.signal"; readonly payload: UserIntentSignalPayload })
  | (EventEnvelopeBase & { readonly type: "ai.surface.opened"; readonly payload: AiSurfacePayload })

export type SocialLandingEventType = SocialLandingEvent["type"]

export type EventPayloadFor<T extends SocialLandingEventType> = Extract<
  SocialLandingEvent,
  { type: T }
>["payload"]

export interface EmitEventInput<T extends SocialLandingEventType> {
  readonly type: T
  readonly payload: EventPayloadFor<T>
  readonly source?: EventSource
  readonly traceId?: string
  readonly timestamp?: string
}
