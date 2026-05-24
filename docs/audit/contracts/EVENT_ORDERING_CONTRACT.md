# Event Ordering Contract — Social Landing

**Status:** SKELETON  
**Baseline:** `main` @ `e002921`

---

## Status atual

| Aspecto | Estado |
|---------|--------|
| Event Bus | Sync emit — no microtask deferral |
| Pairing | drawer ↔ surface paired by instrumentation |
| Dedupe | composer.mode.changed from===to suppressed |
| Ordering guarantees | **Implicit** — not enforced |
| Temporal map | Planned — `RUNTIME_TEMPORAL_MAPPING_PLAN.md` |

---

## Autoridade runtime atual

| Mechanism | Role |
|-----------|------|
| `emitPassiveEvent` | Synchronous fan-out to listeners |
| Instrumentation helpers | observe* at mutation sites |
| React effect order | Determines pseudo-event sequence |
| Shadow pipeline | Processes events in emit order |

---

## Observadores passivos

| Observer | Behavior |
|----------|----------|
| Event Debug Panel | Ring buffer 200 |
| Shadow engine | mapEventToShadowAction sequential |
| Replay buffer | append-only |

---

## Eventos conhecidos — ordem esperada

### Feed drawer open

```
1. drawer.opened      { drawerId: feed:... }
2. surface.opened     { surfaceId: same layer }
3. composer.mode.changed { to: overlay }   // post-P0-03
```

**Tolerância:** same synchronous tick (<16ms).

### Feed drawer close

```
1. drawer.closed      { drawerId: feed:...:none | postId }  // SD-02
2. surface.closed
3. composer.mode.changed { to: default | restored }
```

### Morph chain

```
1. context.item.selected (optional)
2. morph.started
3. [RAF frames — not events]
4. morph.completed
```

### Vertical switch

```
1. feed.vertical.changed
2. (unmount cleanups — composer reset, drawer close effects)
```

---

## Estados canônicos

| Guarantee level | Meaning |
|-----------------|---------|
| STRICT | Order violation = bug |
| SOFT | Order may vary — document tolerance |
| DEV-ONLY | Strict Mode may duplicate |

---

## Estados derivados

| Derivado | Source |
|----------|--------|
| traceId | session trace — reset on vertical change |
| emitCount | bus metric |
| shadow revision | increments per shadow action |

---

## Transient states aceitos

| Pattern | Classification |
|---------|----------------|
| Duplicate drawer.opened DEV Strict Mode | DEV-ONLY |
| composer before surface | investigate if perceptible |
| Events after unmount | stale — ignore |

---

## Divergências conhecidas

| Issue | Type |
|-------|------|
| SD-02 close ordering with null postId | SOFT |
| whatsapp.clicked → user.intent.signal cascade | by design |
| drawer→surface double emit | by design |

---

## Riscos

| Risco | Severity |
|-------|----------|
| Async emit introduced | high — breaks shadow |
| Reorder instrumentation | medium |
| Assume strict order without measurement | high |

---

## Blockers

- TC-01…TC-06 chains not timestamped yet
- No formal STRICT vs SOFT classification complete

---

## Perguntas abertas

1. Should drawer.closed always precede composer restore?
2. Max events per user action before storm threshold?
3. Formal event schema versioning?

---

## O que NÃO pode ser alterado ainda

- Sync bus guarantee
- Swallow listener errors (isolation)
- Add async orchestration layer
- Rewrite emit order at Tier 1

---

## Referências

- `EVENT_MAP.md`
- `EVENT_VALIDATION.md`
- `RUNTIME_TEMPORAL_MAPPING_PLAN.md`
- `lib/events/event-bus.ts`
