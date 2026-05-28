# Event Ordering Analysis — Social Landing

**Data:** 2026-05-23  
**Baseline:** `main` @ `e002921`  
**Modo:** TEMPORAL OBSERVATION — análise estática + auditorias; **sem alteração runtime**

> Classifica eventos por **papel causal** na cronologia, não por presença no bus.

---

## Legenda de papéis

| Papel | Significado |
|-------|-------------|
| **CAUSAL-REQUIRED** | Ordem necessária para UX correto; violação = PERCEPTUAL_RISK ou TEMPORAL_INCONSISTENCY |
| **CAUSAL-SOFT** | Ordem esperada; inversão curta tolerada se snapshot final OK |
| **OBSERVATIONAL** | Espelha mutação; não dirige comportamento |
| **DERIVED-ECHO** | Consequência de outro evento; redundant by design |
| **OWNERSHIP-MARKER** | Marca transferência de autoridade — timing define quem manda |
| **STALE-TOLERANT** | Pode chegar desalinhado ou duplicado sem dano |

---

## Análise por evento

### `composer.mode.changed`

| Aspecto | Conclusão |
|---------|-----------|
| Papel | **OWNERSHIP-MARKER** + OBSERVATIONAL |
| Emissor | `setComposerMode` — sync após React state write |
| Dedupe | from===to suppressed — **STALE-TOLERANT** |

**Ordem esperada (CAUSAL-SOFT):**

```
drawer/surface mutation intent → setComposerMode → composer.mode.changed
```

**Competidores (same tick):**
- BSL `feedDrawerOpen` effect
- Vertical feed useEffect (ecommerce, appointment, …)
- BSL `syncFeedDrawerComposerOpen` callback

**Fora de ordem tolerado:**
- overlay **persistent** while user sees default composer above drawer → TEMPORAL_INCONSISTENCY
- hidden during checkout **after** drawer open — OK if same frame

**Depende de timing:** sim — priority implicit (hidden > overlay > default)

**Define ownership:** **sim** — marca quem ganhou disputa composerMode **naquele instante**; não impede próximo writer

---

### `drawer.opened` / `drawer.closed`

| Aspecto | Conclusão |
|---------|-----------|
| Papel | **OWNERSHIP-MARKER** + OBSERVATIONAL |
| Emissor | ActionDrawer, BusinessFeedDrawer, InstrumentedDrawerBridge effects |
| Timing | After `isOpen` transition, same React commit cycle |

**Ordem CAUSAL-REQUIRED (paired):**

```
drawer.opened → surface.opened     (instrumentation pair — same tick)
drawer.closed → surface.closed
```

**CAUSAL-SOFT vs body.overflow:**

```
isOpen true → body.overflow=hidden   (effect order: typically same commit, overflow may precede observe*)
```

**Fora de ordem tolerado:**
- drawer.closed before user sees close animation end — OK (React immediate)
- open event without mount — DEV Strict Mode duplicate — STALE-TOLERANT

**Define ownership:** **sim** — drawer component owns `isOpen`; event marks surface layer authority

---

### `surface.opened` / `surface.closed`

| Aspecto | Conclusão |
|---------|-----------|
| Papel | **DERIVED-ECHO** of drawer events (Stack A + bridge) |
| Shadow | Reducer **ignores** surface.opened — uses drawer.opened — **by design** |

**Ordem:** always paired with drawer — **CAUSAL-REQUIRED** pair integrity

**Fora de ordem:** surface without drawer — should not happen in wired paths

**Define ownership:** observational mirror — shadow layer registry

---

### `morph.started`

| Aspecto | Conclusão |
|---------|-----------|
| Papel | **OWNERSHIP-MARKER** — morph pipeline active |
| Emissor | BSL `useLayoutEffect` on queuedMorph |
| Timing | **Before first morph paint** — CAUSAL-REQUIRED for MF-02 |

**Ordem CAUSAL-REQUIRED:**

```
long-press 420ms → context upsert → queuedMorph → useLayoutEffect → morph.started → RAF frame 0
```

**CAUSAL-SOFT vs pixels:**
- morph.started may precede visible frame by 0–16ms — TEMPORALLY_TOLERATED

**Fora de ordem:**
- morph.started without prior context/long-press — should not happen
- morph.started after morph.completed — impossible single chain

**Define ownership:** BSL + MorphLayer assume authority until complete/cancel

---

### `morph.completed`

| Aspecto | Conclusão |
|---------|-----------|
| Papel | **OWNERSHIP-MARKER** release + OBSERVATIONAL |
| Emissor | RAF end, scroll cancel, resize cancel — **not** Strict Mode cleanup |

**Ordem CAUSAL-REQUIRED:**

```
morph.started → [≥1 RAF frame] → morph.completed
```

**CANCELLED_FLOW:**
- scroll mid-flight → morph.completed immediate — **required** MF-03

**Define ownership:** returns chip visibility to composer rail

---

### `ai.surface.opened`

| Aspecto | Conclusão |
|---------|-----------|
| Papel | **OBSERVATIONAL** session flag marker |
| Emissor | First message submit only |
| Timing | After user intent, before mock reply (700ms) |

**Ordem CAUSAL-SOFT:**

```
user submit → ai.surface.opened → session active → messages update
```

**Não causal para:** layout, composerMode, drawers

**Define ownership:** ConversationalAI session — **not** surface layer stack

---

### Scroll lock (`body.overflow` — não evento bus)

| Aspecto | Conclusão |
|---------|-----------|
| Papel | **OWNERSHIP-MARKER** (DOM side effect) |
| Writers | ActionDrawer, BusinessFeedDrawer, vaul (Stack B) |
| Event bus | **not emitted** — gap observational |

**Ordem CAUSAL-REQUIRED:**

```
drawer isOpen true → overflow hidden (before user scrolls behind)
drawer isOpen false → overflow "" (if last drawer)
```

**RACE_CONDITION_RISK:**
- drawer A close clears overflow while drawer B still open — **latent**

**Define ownership:** whichever drawer's effect ran last — **ambiguous** without ref-count

---

### Keyboard open/close (`visualViewport`)

| Aspecto | Conclusão |
|---------|-----------|
| Papel | **CAUSAL-REQUIRED** for CP-04 measurement |
| Event bus | probe only in shadow DEV |
| Timing | 50–300ms device-dependent after focus |

**Ordem:**

```
focus input → visualViewport resize → measureSheetLayout → height transition 300ms
```

**PERCEPTUAL_RISK overlap:** concurrent morph RAF reading chip rect

---

### Vertical switch (`feed.vertical.changed`)

| Aspecto | Conclusão |
|---------|-----------|
| Papel | **OWNERSHIP-MARKER** — session boundary |
| Side effects | resetSessionTraceId, unmount cleanups |

**Ordem CAUSAL-REQUIRED:**

```
feed.vertical.changed → unmount prior vertical → mount new
```

**STALE-TOLERANT:** events with old traceId after reset

**Define ownership:** BusinessSelector / page routing — resets Provider scope

---

### `context.item.selected` / `deselected`

| Aspecto | Conclusão |
|---------|-----------|
| Papel | OBSERVATIONAL + **CAUSAL-SOFT** precursor to morph |
| Timing | Same pointer sequence as long-press |

**Ordem típica:**

```
context.item.selected → queuedMorph (same interaction)
```

---

## Matriz: ordem vs risco perceptivo

| Sequência A → B | Reorder safe? | Notas |
|-----------------|---------------|-------|
| morph.started → morph.completed | ❌ | CAUSAL-REQUIRED |
| drawer.opened → surface.opened | ❌ pair | same tick |
| composer.mode.changed → drawer.opened | ✅ soft | either order if same frame |
| drawer.opened → composer.mode.changed | ✅ soft | post-P0-03 often overlay after open intent |
| hidden checkout → overlay product | ❌ if inverted | hidden must win |
| scroll → morph.completed | ✅ | cancel by design |
| overflow clear → drawer still open | ❌ | RACE if multi-drawer |
| ai.surface.opened → composer.mode.changed | ✅ | independent domains |

---

## Eventos observacionais puros (não definem ownership)

| Evento | Notas |
|--------|-------|
| `whatsapp.clicked` | CTA analytics |
| `user.intent.signal` | cascade from whatsapp — by design |
| `feed.vertical.changed` | boundary marker, not drawer owner |
| Shadow `surface.shadow.divergence` | DEV compare only |

---

## Eventos que **definem ownership real** (writers)

| Evento / efeito | Writer real | Bus event |
|-----------------|-------------|-----------|
| composerMode | ConversationSelectionContext.setComposerMode | composer.mode.changed |
| Drawer open | Vertical/BSL isOpen state | drawer.opened |
| Morph pipeline | BSL activeMorph/queuedMorph | morph.started/completed |
| Scroll lock | Drawer effects DOM | *(none)* |
| AI session | ConversationalAI flags | ai.surface.opened |
| Context items | Provider setState | context.item.* |

**Conclusão:** bus observa **writes** — ownership vive no React/DOM layer. Ordem de eventos ≈ ordem de commits/effects, não ordem de intenção humana pura.

---

## Dependências de timing específico

| Mecanismo | Timing | Consequência se violado |
|-----------|--------|-------------------------|
| Long-press 420ms | calibrated | No morph — MF-01 |
| Morph 480ms RAF | calibrated | Wrong easing perception |
| scrollIntoView 100ms delay | feed drawer | Wrong scroll position |
| Mock AI 700ms | demo | Reply feels late — not Tier 1 |
| Morph source TTL 1800ms | module | Fallback DOM query |
| Shadow dedupe 800ms | DEV | Duplicate logs suppressed |

---

## Recomendações observacionais (não implementação)

1. Capturar **same-tick batches** — events sharing timestamp in debug panel
2. Log `body.overflow` alongside drawer events in SESSION captures (manual script OK, not committed)
3. Marcar CAUSAL-REQUIRED chains in REAL_USAGE re-run results
4. **Não** impor ordering middleware on bus — would alter temporal semantics

---

## Referências

- `EVENT_ORDERING_CONTRACT.md` (skeleton)
- `SESSION_TIMELINES.md`
- `lib/events/instrumentation.ts`
- `EVENT_VALIDATION.md`
