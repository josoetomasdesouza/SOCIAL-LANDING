# Session Timelines — Runtime Chronology

**Data:** 2026-05-24 (CAPTURED batch)  
**Baseline:** `main` @ `e002921`  
**Modo:** CONTROLLED EXECUTION — capturas Playwright 2026-05-24

> Timestamps absolutos ISO nos blocos **CAPTURED**. ARCH-INF abaixo = inferência pré-captura (referência histórica).

---

## CAPTURED — Sessões prioritárias (2026-05-24)

### SESSION-C01 [CAPTURED] — Morph flow (appointment)

**viewport:** mobile 390×844  
**vertical:** appointment  
**source:** Playwright REAL_USAGE RU-R-04

```
t+0     user.longpress           #section-tutoriais-e-tendencias article
t+1474  morph.started            2026-05-24T12:59:38.180Z (incl. nav)
t+1981  morph.completed          2026-05-24T12:59:38.687Z (+507ms)
```

**Transient window:** 507ms morph RAF  
**Ownership transfer:** card → BSL morph → composer chip  
**Shadow divergence:** none  
**Perceptual result:** smooth  
**Classification:** TEMPORALLY_VALID, INTERRUPT_WINDOW

---

### SESSION-C02 [CAPTURED] — Feed drawer + composer overlay (ecommerce)

**viewport:** mobile 390×844  
**vertical:** ecommerce  
**source:** Playwright RU-R-02 + `__SURFACE_SHADOW__`

```
t+0     user.tap PostCard
t+0     composer.mode.changed    overlay @ 12:59:30.226Z
t+37    drawer.opened            @ 12:59:30.263Z
t+38    surface.opened           @ 12:59:30.264Z
t+997   composer.mode.changed    default @ 12:59:31.223Z
t+1032  drawer.closed            @ 12:59:31.258Z
t+1033  surface.closed           @ 12:59:31.259Z
```

**Transient window:** t+0 → t+37 — overlay before drawer event  
**Ownership transfer:** BSL → ConversationSelectionContext → BusinessFeedDrawer  
**Shadow divergence:** composer_mode_mismatch, orphan_composer_mode, drawer_registry_mismatch (SD-02)  
**Perceptual result:** smooth  
**Classification:** TEMPORALLY_VALID, TRANSIENT_OVERLAP, STALE_BUT_SAFE (shadow)

**Insight:** P0-03 confirmado — runtime overlay emite **antes** do drawer no bus.

---

### SESSION-C03 [CAPTURED] — ComposerMode priority lag (ecommerce product)

**viewport:** mobile 390×844  
**vertical:** ecommerce  
**source:** Playwright RU-R-17

```
t+0     user.tap product card
t+0     drawer.opened            @ 12:59:49.340Z
t+5     surface.opened           @ 12:59:49.345Z
t+5     composer.mode.changed    @ 12:59:49.345Z (same ms — runtime still default at shadow read)
```

**Shadow:** runtime default vs predicted overlay — SD-04 pattern  
**Classification:** TRANSIENT_OVERLAP, TEMPORALLY_TOLERATED  
**Perceptual result:** smooth (overflow hidden, drawer visible)

---

### SESSION-C04 [CAPTURED] — Scroll cancel morph

**viewport:** mobile 390×844  
**vertical:** appointment  
**source:** Playwright RU-R-08

```
t+0     morph.started            @ 12:59:42.216Z
t+289   morph.completed          @ 12:59:42.505Z (scroll cancel)
```

**Classification:** CANCELLED_FLOW, TEMPORALLY_VALID  
**Perceptual result:** interrupted graceful

---

### SESSION-C05 [CAPTURED] — Booking drawer (appointment)

**viewport:** mobile 390×844  
**vertical:** appointment  
**source:** Playwright RU-R-18 + checklist step 6

```
t+0     user.tap Agendar agora
t+0     drawer.opened            @ 12:59:52.305Z
t+4     composer.mode.changed    @ 12:59:52.309Z
```

**Shadow at drawer.opened:** runtime default vs shadow overlay (+4ms lag to composer event)  
**Classification:** TEMPORALLY_VALID, TRANSIENT_OVERLAP  
**Perceptual result:** smooth

---

### SESSION-C06 [PENDING] — Keyboard interaction

**viewport:** mobile device físico  
**status:** INVESTIGATE — headless não captura visualViewport keyboard

---

### SESSION-C07 [CAPTURED] — Realestate scroll lock

**viewport:** mobile 390×844  
**source:** Playwright RU-R-09

```
overflow during drawer: hidden
overflow after Fechar exact: (empty)
```

**Classification:** TEMPORALLY_VALID — RU-01 refutado  
**Perceptual result:** smooth

---

### SESSION-C08 [CAPTURED] — Stack B personal contact bridge

**viewport:** mobile 390×844  
**vertical:** Pessoal  
**source:** Playwright RU-R-03 retry @ 2026-05-24T13:04:00Z

```
t+0     user.click "Entrar em contato"
t+0     drawer.opened            personal:contact @ 13:04:00.171Z
t+3     surface.opened           @ 13:04:00.174Z
t+976   drawer.closed            @ 13:04:01.147Z (Escape)
t+977   surface.closed           @ 13:04:01.148Z
```

**Ownership transfer:** personal-feed state → shadcn drawer; bridge observes  
**Shadow divergence:** composer_mode_mismatch (runtime default, shadow overlay) — **TOLERATED**  
**Perceptual result:** smooth  
**Classification:** TEMPORALLY_VALID, TEMPORALLY_TOLERATED (shadow)

---

### SESSION-C09 [CAPTURED] — Stack B influencer links bridge

**viewport:** mobile 390×844  
**vertical:** Influencer  
**source:** Playwright RU-R-03 retry @ 2026-05-24T13:04:04Z

```
t+0     user.click "Ver todos os links"
t+0     drawer.opened            influencer:links @ 13:04:04.701Z
t+2     surface.opened           @ 13:04:04.703Z
t+977   drawer.closed            @ 13:04:05.678Z (Escape)
t+978   surface.closed           @ 13:04:05.679Z
```

**Shadow divergence:** composer_mode_mismatch — same Stack B pattern  
**Classification:** TEMPORALLY_VALID, TEMPORALLY_TOLERATED  
**Perceptual result:** smooth

---

## Como registrar uma sessão nova

```markdown
### SESSION-XX [PENDING|ARCH-INF|CAPTURED]
viewport: mobile|desktop (WxH)
vertical: <name>
traceId: <se disponível>
source: manual|playwright|__SURFACE_SHADOW__

t+000 <ação humana>
t+NNN <evento ou efeito>

Transient window: t+A → t+B (descrição)
Ownership transfer: A → B → C
Shadow divergence: <kind> @ t+NNN | none
Perceptual result: smooth | interrupted | overlap | stale | unknown
Classification: <TEMPORAL_CLASSIFICATION tags>
Notes: ...
```

**Ferramentas DEV:** Event Debug Panel · `window.__SURFACE_SHADOW__.getTimeline()` · Performance record.

---

## Constantes temporais conhecidas (código)

| Constante | Valor | Fonte |
|-----------|-------|-------|
| Long-press threshold | 420ms | `context-selectable.tsx` |
| Morph RAF duration | 480ms | `MORPH_DURATION_MS` |
| Morph source TTL | 1800ms | module singleton |
| Feed drawer scrollIntoView delay | 100ms | `business-feed-drawer.tsx` |
| Mock AI reply delay | 700ms | `conversational-ai.tsx` |
| Shadow dedupe window | 800ms | shadow debugger |
| Composer sheet transition | 300ms | CSS `duration-300` |

---

## SESSION-01 [ARCH-INF] — Long-press morph (Stack A, PostCard)

**viewport:** mobile 390×844  
**vertical:** ecommerce  
**source:** inferência `context-selectable` + BSL + morph-layer

```
t+000  user.pointerdown          PostCard [data-post-context-source]
t+000  ownership: feed/card      ContextSelectable local timer starts
t+420  user.longpress.fired      rememberMorphSource(module), vibrate(12)
t+421  context.item.selected     toggleConversationContextItemWithMorph
t+422  morph.queued              setQueuedMorph (React schedule)
t+423  hiddenContextIds+=id      chip suppressed CP-05
t+424  morph.started             useLayoutEffect — BEFORE first morph paint
t+425  RAF frame 0               applyFrame(0) — pixel visible ≥1 frame
t+441  RAF frame ~1              ~16ms
t+905  morph.completed           t+424 + 480ms RAF end
t+906  hiddenContextIds-=id      chip rail visible
t+907  ResizeObserver chain      measurement → sheet auto-grow (async)
```

**Transient window:** t+424 → t+905 — morph ghost visible, chip hidden  
**Ownership transfer:** feed/card → module morph source → BSL morph queue → MorphLayer (RAF) → composer chip rail  
**Shadow divergence:** morphActive true t+424–905  
**Perceptual result:** smooth (baseline REAL_USAGE: 25–26 frames)  
**Classification:** TEMPORALLY_VALID, INTERRUPT_WINDOW (scroll can cancel t+425–905)

---

## SESSION-02 [ARCH-INF] — Feed drawer open + composer overlay (pós-P0-03)

**viewport:** mobile 390×844  
**vertical:** appointment  
**source:** BSL `handlePostClick` + feed drawer + P0-03

```
t+000  user.tap                   PostCard content section
t+001  feedDrawerOpen=true         BSL setState
t+002  syncFeedDrawerComposerOpen  callback — saves prior mode to ref
t+003  composer.mode.changed       to: overlay (if not hidden)
t+004  React commit                BusinessFeedDrawer mounts open
t+004  body.overflow=hidden        feed drawer effect (same commit)
t+005  drawer.opened               feed:video:{postId}
t+005  surface.opened              paired layer id
t+105  scrollIntoView(initialPost) setTimeout 100ms
t+106  layout shift possible       feed drawer internal scroll
```

**Transient window:** t+003 → t+005 — composerMode overlay before/parallel drawer instrumentation  
**Ownership transfer:** BSL feed state → ConversationSelectionContext (composerMode) → BusinessFeedDrawer (scroll lock)  
**Shadow divergence:** SD-01 **cleared expected** post-P0-03; SD-02 on close  
**Perceptual result:** smooth — composer z-[70] if overlay, else z-[60] during feedDrawer  
**Classification:** TEMPORALLY_VALID, OWNERSHIP_TRANSFER

**Close sequence (expected):**

```
t+000  user.tap Fechar
t+001  feedDrawerOpen=false
t+002  syncFeedDrawerComposerClose   restore savedMode if not hidden
t+003  composer.mode.changed         to: default (typical)
t+004  body.overflow=""              cleanup effect
t+005  drawer.closed                 feed:video:none  ← SD-02
t+005  surface.closed
```

---

## SESSION-03 [ARCH-INF] — Ecommerce composer priority (hidden > overlay)

**viewport:** desktop 1280×800  
**vertical:** ecommerce  
**source:** `ecommerce-feed.tsx` useEffect

```
t+000  user.tap product             productDrawerOpen=true
t+001  vertical effect runs         nextMode=overlay
t+002  composer.mode.changed        to: overlay
t+003  drawer.opened                ActionDrawer (product)
t+003  body.overflow=hidden

--- user opens cart ---

t+500  cartDrawerOpen=true
t+501  vertical effect runs         checkout|cart → hidden wins
t+502  composer.mode.changed        to: hidden
t+503  composer.hidden.class        ConversationalAI hidden

--- user closes cart, product still open ---

t+900  cartDrawerOpen=false
t+901  vertical effect              product still open → overlay
t+902  composer.mode.changed        to: overlay
```

**Transient window:** t+501–502 — product drawer open + composer hidden (intentional)  
**Ownership transfer:** vertical feed effect **competes** with BSL feedDrawer effect — **priority implicit**  
**Shadow divergence:** SD-04 observational — layers vs boolean drawers  
**Perceptual result:** smooth if close order correct; **flicker risk** if effects fight  
**Classification:** TEMPORALLY_TOLERATED, RACE_CONDITION_RISK (multi-drawer close order)

---

## SESSION-04 [ARCH-INF] — Appointment booking hidden composer

**viewport:** mobile 390×844  
**vertical:** appointment  
**source:** appointment-feed useEffect pattern

```
t+000  user.tap Agendar agora
t+001  bookingDrawerOpen=true
t+002  setComposerMode("hidden")    vertical effect
t+003  composer.mode.changed        to: hidden
t+004  drawer.opened                ActionDrawer booking
t+005  body.overflow=hidden

t+800  user completes / closes
t+801  bookingDrawerOpen=false
t+802  effect cleanup               setComposerMode("default")
t+803  composer.mode.changed        to: default
```

**Ownership transfer:** vertical booking state → composerMode authority  
**Classification:** TEMPORALLY_VALID, INTERRUPT_WINDOW (user cannot compose during booking)

---

## SESSION-05 [ARCH-INF] — Stack B bridge drawer (personal contact)

**viewport:** mobile 390×844  
**vertical:** personal  
**source:** InstrumentedDrawerBridge

```
t+000  user.tap CTA contact
t+001  contactDrawerOpen=true       vertical local state
t+002  React commit                  shadcn Drawer + vaul
t+003  bridge effect                 wasOpen false→true
t+004  drawer.opened                 personal:contact (instrumented)
t+004  surface.opened                paired
t+005  vaul scroll lock              (vaul internal — not ActionDrawer effect)

t+400  user.close
t+401  contactDrawerOpen=false
t+402  drawer.closed
t+403  surface.closed
```

**Note:** composerMode may **not** change — Stack B bridge **observes only**  
**Ownership transfer:** vertical state → shadcn Drawer UI; bridge **observes**, does not own lifecycle  
**Classification:** TEMPORALLY_VALID, STALE_BUT_SAFE (events without composer sync)

---

## SESSION-06 [DOC-REF] — Morph scroll cancel

**viewport:** mobile  
**vertical:** ecommerce  
**source:** `morph-stability-v1`, REAL_USAGE, morph-layer

```
t+000  user.longpress               morph queued
t+015  morph.started
t+080  user.scroll                  wheel/touch scroll capture
t+081  scroll listener              cancelAnimation()
t+082  morph.completed              finish() on cancel — NOT Strict Mode cleanup
t+083  hiddenContextIds cleared     chip visible
```

**Classification:** TEMPORALLY_VALID, CANCELLED_FLOW — **must preserve**  
**Perceptual result:** interrupted but graceful — no stuck morph

---

## SESSION-07 [DOC-REF] — Realestate property → visit drawers

**viewport:** mobile 390×844  
**vertical:** realestate  
**source:** P0-01 diagnosis, REAL_USAGE

```
t+000  user.tap property card
t+001  propertyDrawerOpen=true
t+002  composer.mode.changed        overlay (vertical effect)
t+003  drawer.opened + overflow hidden

t+400  user.tap Agendar visita
t+401  visitDrawerOpen=true         second ActionDrawer
t+402  composer.mode.changed        hidden (typical booking path)
t+403  overflow still hidden        single body lock — no ref-count

t+900  user.close visit X
t+901  visitDrawerOpen=false
t+902  overflow=""                  if property also closed OR still open?

t+950  user.close property
t+951  overflow=""                  confirmed clean on close OK paths
```

**Classification:** RACE_CONDITION_RISK (latent), TEMPORALLY_TOLERATED today  
**Perceptual result:** smooth on manual close; QA false positive if Fechar not exact

---

## SESSION-08 [ARCH-INF] — Vertical switch (reload selector)

**viewport:** any  
**vertical:** appointment → ecommerce  
**source:** instrumentation resetSessionTraceId

```
t+000  user navigates               reload /demo selector
t+001  appointment unmount          feed cleanup effects
t+001  composer cleanup             feeds often setComposerMode default
t+002  drawer effects cleanup       body.overflow="" per drawer
t+010  ecommerce mount              new Provider instance
t+011  feed.vertical.changed        to: ecommerce
t+012  resetSessionTraceId()        prior trace invalidated
```

**Stale window:** t+001–010 — events from prior vertical **must not** attach to new trace  
**Classification:** OWNERSHIP_TRANSFER, STALE_BUT_SAFE (unmount cleans)

---

## SESSION-09 [ARCH-INF] — Keyboard open composer

**viewport:** mobile 390×844  
**vertical:** appointment  
**source:** conversational-ai visualViewport listeners

```
t+000  user.focus composer input
t+050  visualViewport.resize        keyboard anim ~50–300ms device-dependent
t+051  handleResize                 measureSheetLayout()
t+052  sheet height recalc          transition duration-300
t+350  layout stable                approximate

--- if morph active same window ---

t+100  morph RAF in flight          resolveToRect() may read stale chip position
```

**Classification:** PERCEPTUAL_RISK if morph+keyboard overlap; TEMPORALLY_TOLERATED if sequential  
**Requires:** physical device capture — ARCH-INF unreliable

---

## SESSION-10 [HYPOTHESIS] — Compound interrupt (drawer during morph queue)

**viewport:** mobile  
**vertical:** influencer  
**source:** hypothetical overlap — **NOT canonical single flow**

```
t+000  user.longpress               morph path starts
t+420  morph.queued
t+425  morph.started
t+430  user.tap (accidental)        opens feed drawer? unlikely same target
t+435  feedDrawerOpen=true
t+436  composer.overlay
t+450  z-index stack                morph z-65 vs drawer z-50 vs composer z-60/70
t+905  morph.completed
```

**Purpose:** document **overlap analysis** — long-press should set ignoreInteraction on click  
**Classification:** TRANSIENT_OVERLAP, PERCEPTUAL_RISK if reproduced  
**Status:** PENDING capture — ContextSelectable `ignoreInteractionRef` may prevent

---

## SESSION-11 [DOC-REF] — First AI message

**viewport:** any  
**vertical:** any with composer  
**source:** conversational-ai submit handler

```
t+000  user.submit first message
t+001  ai.surface.opened            only if !isConversationSessionActive
t+002  setIsConversationSessionActive(true)
t+003  messages state update
t+004  localStorage write           sync — main thread
t+005  scroll messages              scrollIntoView chain
t+705  mock AI reply                setTimeout 700ms
```

**Classification:** TEMPORALLY_VALID — ai.surface.opened **after** user intent, before reply  
**Ownership transfer:** user input → conversation session flag → AI mock pipeline

---

## Matriz de sessões

| ID | Flow | Status | Priority capture |
|----|------|--------|------------------|
| 01 | morph long-press | ARCH-INF | ✅ REAL_USAGE RU-R-04 |
| 02 | feed drawer overlay | ARCH-INF | ✅ RU-R-02 |
| 03 | ecommerce priority | ARCH-INF | ✅ RU-R-17 |
| 04 | booking hidden | ARCH-INF | ✅ RU-R-18 |
| 05 | Stack B bridge | ARCH-INF | ✅ RU-R-03 |
| 06 | morph scroll cancel | DOC-REF | validated tag |
| 07 | realestate multi-drawer | DOC-REF | RU-R-19 |
| 08 | vertical switch | ARCH-INF | RU-R-01, RU-R-12 |
| 09 | keyboard | ARCH-INF | RU-R-14 device |
| 10 | compound overlap | HYPOTHESIS | investigate |
| 11 | first AI message | DOC-REF | RU-R-06 |

---

## Próximo passo

Executar capturas **CAPTURED** substituindo ARCH-INF com timestamps reais do Event Debug Panel. Anexar JSON de `__SURFACE_SHADOW__.getTimeline()` por sessão.

---

## Referências

- `RUNTIME_TEMPORAL_MAPPING_PLAN.md`
- `REAL_USAGE_RE_RUN_PLAN.md`
- `TEMPORAL_CLASSIFICATION.md`
- `EVENT_ORDERING_ANALYSIS.md`
