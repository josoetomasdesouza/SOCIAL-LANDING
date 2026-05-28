# Ownership Contract — Social Landing

**Status:** SKELETON  
**Baseline:** `main` @ `e002921`

---

## Status atual

| Aspecto | Estado |
|---------|--------|
| Model | **Concurrent ownership** — not single source of truth |
| Pattern | Local-by-default, context for conversation |
| Duplication | composerMode set in 9+ places — **documented, not bug per se** |
| Migration | Moving Stack B drawer ownership to ActionDrawer — pending |

---

## Autoridade runtime atual

| Domain | Primary owner | Secondary influencers |
|--------|---------------|----------------------|
| composerMode | ConversationSelectionContext | Vertical feeds, BSL feedDrawer |
| conversationContext | ConversationSelectionProvider | Cards, morph, AI |
| feedDrawerOpen | BusinessSocialLanding | PostCard click |
| action drawer open | Vertical feed | CTAs, cards |
| morph pipeline | BusinessSocialLanding | ContextSelectable module |
| scroll lock | Each drawer instance | — |
| chat history | ConversationalAI localStorage | — |
| vertical selection | `/demo` BusinessSelector | remounts feed |

---

## Observadores passivos

Observadores **do not own** — they mirror:

- Event Bus → snapshots
- Shadow → predicted policy
- Rule Engine → evaluate proposals (no write)

---

## Eventos conhecidos

Ownership transfers often **implicit** — no dedicated event:

| Transfer | Signal |
|----------|--------|
| Vertical change | feed.vertical.changed + unmount |
| Context add | context.item.selected |
| Drawer open | drawer.opened |

---

## Estados canônicos

| Principle | Rule |
|-----------|------|
| Single writer per mode transition | **Aspirational** — not enforced today |
| Context max 6 items | Enforced silent slice |
| Provider scope | Per vertical feed tree |
| Module singleton morph source | Cross-render, 1.8s TTL |

---

## Estados derivados

| Derivado | Owner of derivation |
|----------|---------------------|
| selectedContextIds | Context (useMemo) |
| isConversationSelected | Context |
| effective composer z-index | BSL (combines multiple inputs) |
| shadow predictedComposerMode | Shadow reducer (parallel) |

---

## Transient states aceitos

| Situation | Acceptable? |
|-----------|-------------|
| Two owners call setComposerMode same frame | ✅ if priority resolves |
| feedDrawerOpen true + composerMode default | ❌ post-P0-03 — was SD-01 |
| Bridge owns events but shadcn owns UI | ✅ until migration |
| BSL + vertical both think they own overlay | investigate priority |

---

## Divergências conhecidas

| Issue | Ownership conflict |
|-------|-------------------|
| SD-01 | BSL vs vertical composerMode — **mitigated P0-03** |
| Stack A vs B | drawer implementation ownership |
| cloneElement vs CustomContentBridge | prop injection ownership |
| Shadow vs runtime | intentional parallel |

---

## Riscos

| Risco | Severity |
|-------|----------|
| Centralize ownership prematurely | critical |
| Global reducer without contract | critical |
| Remove duplicate setComposerMode without priority | high |
| Assume Provider = single owner of all UI state | high — false |

---

## Blockers

- Priority matrix composerMode not formalized
- Stack B drawer ownership still shadcn
- Temporal mapping of transfers incomplete

---

## Perguntas abertas

1. Should BSL be sole composerMode authority for feed drawer?
2. Post-migration — vertical or shared hook for action drawers?
3. Does shadow ever become co-owner? (decision: **no** for now)
4. scroll lock — shared service owner?

---

## O que NÃO pode ser alterado ainda

- ConversationSelectionProvider pattern (12/12)
- Module morph source singleton without morph contract review
- Reducer global unifying all ownership
- Remove vertical local state without migration plan

---

## Referências

- `STATE_GOVERNANCE.md`
- `RUNTIME_STATE_MAP.md`
- `RUNTIME_TEMPORAL_MAPPING_PLAN.md` § Ownership transfer timing
- `STACK_DECISION.md`
