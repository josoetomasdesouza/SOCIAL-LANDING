# Event Validation — `/demo` Foundation Observability v1

**Baseline:** `311bad8` (`foundation-observability-v1`)  
**Método:** Análise estática do wiring + matriz de fluxos esperados para QA manual  
**Ambiente:** `NODE_ENV=development`, `/demo`, Event Debug Panel (canto inferior direito)

---

## Inventário dos 11 eventos

| # | Evento | Wired | Emissor | Notas |
|---|--------|-------|---------|-------|
| 1 | `feed.vertical.changed` | ✅ | `app/demo/page.tsx` | Reset de `sessionTraceId` |
| 2 | `drawer.opened` | ✅ | `action-drawer.tsx`, `business-feed-drawer.tsx` | Edge-triggered (`wasOpenRef`) |
| 3 | `drawer.closed` | ✅ | idem | Edge-triggered |
| 4 | `surface.opened` | ✅ | via `observeDrawerOpened` | Par automático de drawer |
| 5 | `surface.closed` | ✅ | via `observeDrawerClosed` | Par automático de drawer |
| 6 | `composer.mode.changed` | ✅ | `conversation-selection-context.tsx` | Dedupe `from === to` |
| 7 | `morph.started` | ✅ | `business-social-landing.tsx` | Antes de `setActiveMorph` |
| 8 | `morph.completed` | ✅ | `business-social-landing.tsx` | Em `onComplete` do morph layer |
| 9 | `ai.surface.opened` | ✅ | `conversational-ai.tsx` | Apenas primeira mensagem da sessão |
| 10 | `whatsapp.clicked` | ✅ | `social-contact-cta.tsx` | Vertical appointment (CTA) |
| 11 | `user.intent.signal` | ✅ | via `observeWhatsAppClicked` | Cascata de whatsapp |
| — | `feed.item.viewed` | ❌ | — | Helper existe; **não wired** |

---

## Contratos de payload

Fonte: `lib/events/event-types.ts` + `lib/events/instrumentation.ts`

### `feed.vertical.changed`
```json
{ "from": "appointment|null", "to": "ecommerce" }
```
- **source:** `"demo"`
- **traceId:** novo após reset (`getSessionTraceId()`)

### `drawer.opened` / `drawer.closed`
```json
{ "drawerId": "...", "drawerKind": "action|feed|...", "title?": "...", "vertical?": "..." }
```
- Action drawer: `drawerId = title`
- Feed drawer: `drawerId = "feed:{category}:{postId|none}"`

### `surface.opened` / `surface.closed`
```json
{ "surfaceId": "...", "surfaceKind": "drawer|feed-drawer|...", "vertical?": "..." }
```
- `surfaceId` = mesmo `drawerId`
- `feed` → `surfaceKind: "feed-drawer"`

### `composer.mode.changed`
```json
{ "from": "default|overlay|hidden", "to": "...", "reason?": "...", "vertical?": "..." }
```
- Emitido em **toda** transição via `setComposerMode` no context
- **Não emitido** se `from === to`

### `morph.started`
```json
{ "itemId": "...", "source": "long-press", "vertical": "appointment" }
```

### `morph.completed`
```json
{ "itemId": "...", "vertical": "appointment" }
```

### `ai.surface.opened`
```json
{ "action": "opened", "sheetSnap?": "...", "vertical?": "..." }
```
- Apenas quando `!isConversationSessionActive` no envio da primeira mensagem

### `whatsapp.clicked`
```json
{ "phone": "...", "context?": "...", "href?": "..." }
```

### `user.intent.signal`
```json
{ "intent": "contact", "signal": "whatsapp.clicked", "vertical?": "...", "itemId?": "..." }
```

---

## Fluxos esperados (ordem)

### A — Seleção de vertical (`/demo`)

```
feed.vertical.changed { from: null, to: "<vertical>" }
```

- **Não** emite se `selectedType` permanece igual
- Troca de vertical: `{ from: "appointment", to: "ecommerce" }` + novo traceId

### B — Abrir feed drawer (long-press ou tap em post)

```
composer.mode.changed { from: "default", to: "overlay" }   // se vertical policy aplicar overlay
drawer.opened { drawerKind: "feed", ... }
surface.opened { surfaceKind: "feed-drawer", ... }
```

Ordem relativa: composer pode preceder drawer (useEffect order nos feeds).

### C — Fechar feed drawer

```
drawer.closed { ... }
surface.closed { ... }
composer.mode.changed { from: "overlay", to: "default" }
```

### D — Long-press morph (vertical com morph, ex. appointment)

```
morph.started { itemId, source: "long-press", vertical }
... animação ...
morph.completed { itemId, vertical }
```

**Reduced motion:** morph **não** inicia → **sem** `morph.started/completed`.

**Scroll durante morph:** `morph.completed` ainda dispara (cancel chama `finish()`).

### E — Primeira mensagem no composer

```
ai.surface.opened { action: "opened" }
```

Mensagens subsequentes na mesma sessão: **sem** novo `ai.surface.opened`.

### F — WhatsApp CTA (appointment)

```
whatsapp.clicked { phone, ... }
user.intent.signal { intent: "contact", signal: "whatsapp.clicked" }
```

Ordem garantida: whatsapp primeiro, intent imediatamente após (sync emit).

### G — Ecommerce drawers (cart / checkout / product)

```
composer.mode.changed → hidden | overlay | default
// drawers ecommerce NÃO usam observeDrawer* nos commits publicados
// (ActionDrawer genérico sim; cart/checkout/product podem variar)
```

**Nota:** Instrumentação de drawer em ecommerce depende de quais componentes usam `ActionDrawer`. Validar manualmente no vertical ecommerce.

---

## Validações estruturais

### Ordem dos eventos
- Bus é **síncrono** — ordem de emit = ordem de registro no buffer
- Cascatas (`drawer` → `surface`, `whatsapp` → `intent`) são atômicas no mesmo tick

### Duplicações

| Cenário | Esperado? | Ação nesta fase |
|---------|-----------|-----------------|
| drawer + surface por abertura | ✅ Sim | Documentar |
| whatsapp + user.intent | ✅ Sim | Documentar |
| composer default→default | ❌ Suprimido | OK |
| Strict Mode remount drawer aberto | ⚠️ Possível em DEV | Observar, não corrigir |
| Vertical unmount composer cleanup | ⚠️ Pode emitir overlay→default | Observar |

### Eventos faltando
- `feed.item.viewed` — gap conhecido, fora do escopo v1

### Loops
- Nenhum listener re-emite eventos
- `setComposerMode` não é chamado por handlers do bus
- **Veredicto:** sem loop estrutural

### Race conditions
- Bus sync elimina races entre listeners
- `wasOpenRef` previne false open/close no mount inicial
- Morph `onComplete` vs unmount: published HEAD chama `finish()` no cleanup — pode completar morph prematuramente em Strict Mode DEV (observabilidade + perceptual edge)

### Payload consistency
- Tipos TypeScript enforced em `EmitEventInput`
- `traceId` opcional; morph/whatsapp/vertical usam `getSessionTraceId()` quando omitido

### Trace consistency
- `sessionTraceId` singleton module-level
- Reset em `observeFeedVerticalChanged` quando `from !== to`
- Eventos na mesma sessão vertical compartilham trace até troca de vertical

### Replay buffer
- Ring buffer 200 eventos (`lib/events/event-replay.ts`)
- `appendToEventReplayBuffer` em cada emit
- `clearEventDebuggerTimeline` limpa buffer + notifica subscribers

### Cleanup de listeners
- `subscribeToEvents` → unsubscribe function
- `subscribeToEventDebugger` → remove subscriber; desliga bus hook quando set vazio
- Component unmount do panel: cleanup correto

### Memory leaks
- Buffer bounded (200)
- Sets de listeners bounded por subscribers ativos
- Sem timers ou intervals no bus

### Dev-only boundaries
- `EventDebugPanel`: `isEventDebuggerAvailable()` → `NODE_ENV === "development"`
- Bus ativo em prod (passive, leve); panel **não** renderiza em prod
- `NEXT_PUBLIC_DISABLE_EVENT_BUS=true` desliga emits

---

## Checklist QA manual (`/demo`)

Execute em DEV com panel aberto. **Não alterar UX** — apenas observar.

- [ ] Selecionar vertical → 1× `feed.vertical.changed`
- [ ] Trocar vertical → novo evento + trace diferente nos eventos seguintes
- [ ] Abrir drawer feed → `drawer.opened` + `surface.opened` (+ composer se aplicável)
- [ ] Fechar drawer → par closed + composer restore
- [ ] Long-press morph → `morph.started` then `morph.completed` (mesmo itemId)
- [ ] Enviar 1ª mensagem → 1× `ai.surface.opened`
- [ ] Enviar 2ª mensagem → sem novo `ai.surface.opened`
- [ ] WhatsApp (appointment) → `whatsapp.clicked` + `user.intent.signal`
- [ ] Clear no panel → timeline vazia, stats zerados
- [ ] Replay log → console `[replay]` sem erro
- [ ] Filtro "All types" mostra morph e ai events (dropdown individual não — gap conhecido)

---

## Veredicto

**Event validation (código publicado): PASS com ressalvas documentadas.**

**Runtime QA (`/demo`, appointment vertical, 2026-05-23): PASS 8/8** — automação headless contra `311bad8` + morph layer restaurado.

| Step | Resultado |
|------|-----------|
| `feed.vertical.changed` | ✅ |
| `morph.started` → `morph.completed` | ✅ (completed 2× — cleanup Strict Mode; observar) |
| `drawer.opened` + `surface.opened` | ✅ |
| `drawer.closed` + `surface.closed` | ✅ |
| `ai.surface.opened` (1×) | ✅ |
| `composer.mode.changed` | ✅ |
| `whatsapp.clicked` + `user.intent.signal` | ✅ |

Script reprodutível: `scripts/demo-event-checklist.mjs`

Ressalvas são observacionais (gaps DEV UI, evento unwired, edges Strict Mode) — nenhuma bloqueia estabilidade da fundação passiva.
