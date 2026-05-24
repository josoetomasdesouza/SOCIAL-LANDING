# Morph Contract — Social Landing

**Status:** SKELETON  
**Baseline:** `main` @ `e002921` · tag `morph-stability-v1`

---

## Status atual

| Aspecto | Estado |
|---------|--------|
| Tier 1 | Estável — Strict Mode fix publicado |
| RAF duration | ~480ms, 25–26 frames observados |
| Eligibility | PostCard + morph path wired |
| Gaps | appointment hero, partial custom modules |
| Shadow | read-only morphActive flag |

---

## Autoridade runtime atual

| Responsabilidade | Owner |
|------------------|-------|
| Morph queue | `BusinessSocialLanding` (morphRequest, activeMorph) |
| RAF animation | `PostToChatMorphLayer` |
| Source rect cache | `context-selectable.tsx` module `rememberMorphSource` |
| Context upsert | `toggleConversationContextItemWithMorph` |
| Chip hide during morph | BSL + ConversationalAI (CP-05) |
| Cancel on scroll | scroll listener → finish() |

---

## Observadores passivos

| Observer | Sinal |
|----------|-------|
| Event Bus | `morph.started`, `morph.completed` |
| Shadow | morphActive boolean — **never controls** |
| Rule Engine | blocks morph timing mutation |

---

## Eventos conhecidos

| Evento | Quando |
|--------|--------|
| `morph.started` | useLayoutEffect on morph begin |
| `morph.completed` | RAF end, scroll cancel, reduced motion skip |
| `context.item.selected` | often precedes morph |

---

## Estados canônicos

| Estado | Semântica |
|--------|-----------|
| idle | no morphRequest |
| queued | morphRequest pending |
| active | RAF in progress, morphActive true |
| completed | chips visible, dest settled |

---

## Estados derivados

| Derivado | Fonte |
|----------|-------|
| hiddenContextIds | BSL during morph |
| chip rail suppressed | morphActive |
| transform on ghost layer | RAF interpolation |

---

## Transient states aceitos

| Transient | Aceito? |
|-----------|---------|
| morph.started before first pixel | ✅ by design (layout effect) |
| morph.completed on scroll cancel | ✅ MF-03 |
| 0 frames reduced motion | ✅ MF-04 |
| Strict Mode remount DEV | ✅ if pixels still visible |

---

## Divergências conhecidas

| Gap | Descrição |
|-----|-----------|
| P1-01 | appointment hero — context without morph |
| P1-03 | custom modules partial wiring |
| personal | no PostCards — morph N/A by design |

---

## Riscos

| Risco | Severidade |
|-------|------------|
| Alterar RAF timing | alto — TIER1_RISK |
| Remove module morph source | alto |
| Assume all long-press → morph | médio — eligibility |
| local WIP morph-layer changes | alto — discard or isolated PR |

---

## Blockers

- Eligibility matrix incomplete for custom modules
- Temporal mapping TC-01 not fully documented

---

## Perguntas abertas

1. morph + drawer open simultaneously — allowed?
2. TTL 1800ms morph source — still correct?
3. Should hero blocks use morph path or stay VERTICAL_SPECIFIC?

---

## O que NÃO pode ser alterado ainda

- Long-press threshold 420ms
- Easing/duration calibrated RAF
- `data-post-context-source` / chip `data-*` protocol
- capture scroll listener behavior (published HEAD)
- Shadow control of morph

---

## Referências

- `GLOBAL_CONTRACTS.md` § Morph, PostCard
- `PERCEPTUAL_VALIDATION.md`
- Tag `morph-stability-v1`
