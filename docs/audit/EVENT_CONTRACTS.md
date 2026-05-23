# EVENT CONTRACTS — Social Landing

**Versão:** 1.0 — Fase evolutiva estrutural  
**Implementação:** `lib/events/`

---

## Envelope padrão

Todo evento passivo segue:

```typescript
interface EventEnvelopeBase {
  timestamp: string      // ISO 8601
  source: EventSource
  traceId?: string       // correlaciona cadeia de interação
}

type SocialLandingEvent = EventEnvelopeBase & {
  type: SocialLandingEventType
  payload: EventPayloadFor<type>
}
```

---

## Eventos definidos

| Type | Payload | Wired |
|------|---------|-------|
| `composer.mode.changed` | `{ from, to, reason?, vertical? }` | ✅ `conversation-selection-context` |
| `surface.opened` | `{ surfaceId, surfaceKind, vertical?, meta? }` | ✅ via drawer helpers |
| `surface.closed` | `{ surfaceId, surfaceKind, vertical? }` | ✅ via drawer helpers |
| `drawer.opened` | `{ drawerId, drawerKind, title?, vertical? }` | ✅ Tier 2 drawers |
| `drawer.closed` | `{ drawerId, drawerKind, vertical? }` | ✅ Tier 2 drawers |
| `feed.item.viewed` | `{ itemId, itemKind?, sectionId?, vertical? }` | ⏳ tipo only |
| `feed.vertical.changed` | `{ from, to }` | ✅ `/demo` |
| `morph.started` | `{ itemId, source?, vertical? }` | ✅ `business-social-landing` useLayoutEffect |
| `morph.completed` | `{ itemId, vertical? }` | ✅ `PostToChatMorphLayer` `onComplete` |
| `whatsapp.clicked` | `{ phone, context?, href? }` | ✅ `social-contact-cta` |
| `user.intent.signal` | `{ intent, signal, vertical?, itemId? }` | ✅ via whatsapp helper |
| `ai.surface.opened` | `{ action, sheetSnap?, vertical? }` | ✅ `conversational-ai` handleSendMessage |

---

## Sources

```typescript
type EventSource =
  | "demo"
  | "vertical-feed"
  | "conversation-context"
  | "action-drawer"
  | "feed-drawer"
  | "cta"
  | "surface-engine"
  | "instrumentation"
  | "unknown"
```

---

## Regras do bus passivo

1. **`emitPassiveEvent` nunca lança** — listeners com erro são swallowed em DEV
2. **Síncrono** — sem Promise, sem setTimeout
3. **Não muta estado React** — apenas observa
4. **Disable global:** `NEXT_PUBLIC_DISABLE_EVENT_BUS=true`
5. **Buffer:** ring 200 eventos (`event-replay.ts`)

---

## Helpers de instrumentação

Importar de `@/lib/events/instrumentation` ou `@/lib/events`:

| Helper | Uso |
|--------|-----|
| `observeComposerModeChanged` | Transição composerMode |
| `observeDrawerOpened/Closed` | Drawers Tier 2 |
| `observeFeedVerticalChanged` | Demo selector |
| `observeWhatsAppClicked` | CTAs |
| `observeMorphStarted/Completed` | Futuro Tier 1 |
| `observeAiSurfaceOpened` | Futuro Tier 1 |
| `createInteractionTraceId` | Nova cadeia |

---

## Wiring Tier 1 (protocolo frozen)

Antes de adicionar `observeMorph*` ou `observeAiSurface*` em Tier 1:

1. Ler `docs/ai-handoffs/FROZEN_SYSTEMS.md`
2. Diff de uma linha por PR
3. Validar morph + composer manual mobile
4. Registrar em `EVOLUTION_LOG.md`

**Status (23/05/2026):** morph e ai.surface wired observacional-only — ver tabela acima. `post-to-chat-morph-layer.tsx` não foi editado.

---

## DEV observability

- `ensureDevEventLoggerRegistered()` — console.debug
- `EventDebugPanel` — `/demo` only, `NODE_ENV=development`
- `replayEventDebuggerTimeline()` — replay to console

---

## Evolução futura (não implementada)

- Event bus → Goal Engine ingress
- Webhook bridge server-side
- Persistência opcional (audit table)
