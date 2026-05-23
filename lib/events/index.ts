/**
 * Passive event system — observational foundation only.
 */

export type {
  AiSurfacePayload,
  ComposerModeChangedPayload,
  DrawerPayload,
  EmitEventInput,
  EventEnvelopeBase,
  EventPayloadFor,
  EventSource,
  FeedItemViewedPayload,
  FeedVerticalChangedPayload,
  MorphPayload,
  SocialLandingEvent,
  SocialLandingEventType,
  SurfacePayload,
  UserIntentSignalPayload,
  WhatsAppClickedPayload,
} from "./event-types"

export {
  clearPassiveEventListeners,
  emitPassiveEvent,
  getPassiveEventEmitCount,
  isPassiveEventBusEnabled,
  observeEvent,
  subscribeToEvents,
  type EventListener,
} from "./event-bus"

export {
  appendToEventReplayBuffer,
  clearEventReplayBuffer,
  configureEventReplayBuffer,
  getEventReplayByTraceId,
  getEventReplayByType,
  getEventReplayTimeline,
  replayEventsToListener,
} from "./event-replay"

export {
  ensureDevEventLoggerRegistered,
  isDevEventLoggingEnabled,
  registerDevEventLogger,
  unregisterDevEventLogger,
} from "./event-listeners"

export {
  clearEventDebuggerTimeline,
  getEventDebuggerSnapshot,
  getEventDebuggerStats,
  isEventDebuggerAvailable,
  replayEventDebuggerTimeline,
  subscribeToEventDebugger,
  type EventDebuggerStats,
  type EventTimelineSnapshot,
} from "./event-debugger"

export {
  createInteractionTraceId,
  getSessionTraceId,
  observeAiSurfaceOpened,
  observeComposerModeChanged,
  observeDrawerClosed,
  observeDrawerOpened,
  observeDrawerOpenStateEffect,
  observeFeedItemViewed,
  observeFeedVerticalChanged,
  observeMorphCompleted,
  observeMorphStarted,
  observeSurfaceClosed,
  observeSurfaceOpened,
  observeUserIntentSignal,
  observeWhatsAppClicked,
  resetSessionTraceId,
} from "./instrumentation"
