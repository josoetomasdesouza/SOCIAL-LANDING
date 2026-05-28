# Global Behavior Audit — Social Landing

**Baseline:** `foundation-observability-v1` · `morph-stability-v1` · shadow mode DEV  
**Data:** 2026-05-23  
**Escopo:** Auditoria read-only — **sem correções, sem refactor**

---

## Resumo executivo

A Social Landing **não é uma plataforma uniforme hoje** — é um **núcleo Tier 1 compartilhado** (`BusinessSocialLanding` + `ConversationalAI` + morph) com **12 demos de vertical** que divergem em:

- provider de contexto conversacional
- tipo de drawer (instrumentado vs shadcn)
- política de `composerMode` em drawers
- CTAs de contato (WhatsApp, email, window.open)
- presença de PostCards morpháveis

**Conclusão:** Runtime Truth Mapping **só deve avançar** após resolver **P0/P1 de inconsistência global** documentados em `BEHAVIOR_FIX_PRIORITY.md`.

---

## Fase 1 — Comportamentos auditados

### Núcleo compartilhado (todas as verticals via `BusinessSocialLanding`)

| Comportamento | Implementação | Notas |
|---------------|---------------|-------|
| Composer fixo | `ConversationalAI` default em BSL | ✅ universal |
| Feed scroll | `<main>` nativo | ✅ universal |
| Stories strip | `BusinessStories` | ✅ universal |
| PostCard click → feed drawer | `handlePostClick` content types | ✅ onde há `type: "content"` + posts |
| PostCard long-press → morph | `onPostLongPress` → `toggleConversationContextItemWithMorph` | ✅ onde há PostCards |
| Context chips | `conversation-selection-context` | ⚠️ provider vs local state |
| Passive events | `lib/events/instrumentation` | ⚠️ só onde componentes emitem |
| Shadow mode | `PassiveEventProvider` no `/demo` | ✅ DEV `/demo` only |

### Stack A — “Business vertical” (10 feeds)

`ConversationSelectionProvider` + `ActionDrawer` + `setComposerMode` effects:

appointment, ecommerce, courses, restaurant, realestate, professionals, events, gym, health, courses

### Stack B — “Legacy/custom vertical” (3 feeds)

Sem provider; `Drawer` shadcn; CTAs custom:

personal, influencer, institutional

---

## Fase 2 — Classificação por comportamento

| Comportamento | Classificação | Evidência |
|---------------|---------------|-----------|
| Composer presente | **GLOBAL_REQUIRED** | BSL default |
| Long-press → contexto (PostCard) | **GLOBAL_REQUIRED** | `ContextSelectable` 420ms |
| Long-press → morph (PostCard) | **GLOBAL_REQUIRED** | `toggleConversationContextItemWithMorph` |
| Long-press → morph (custom hero) | **BROKEN_INCONSISTENT** | appointment hero usa `toggleConversationContextItem` sem morph |
| Seleção contexto no composer | **GLOBAL_REQUIRED** | chips + hidden during morph |
| Abrir feed drawer (PostCard tap) | **GLOBAL_OPTIONAL** | requer seção content |
| Abrir ActionDrawer | **GLOBAL_OPTIONAL** | fluxos de negócio |
| Fechar drawer + scroll unlock | **GLOBAL_REQUIRED** | ActionDrawer body overflow |
| Fechar drawer shadcn | **BROKEN_INCONSISTENT** | personal/influencer/institutional — sem padrão ActionDrawer |
| `composerMode` overlay em feed drawer | **BROKEN_INCONSISTENT** | ecommerce/restaurant sim; appointment não |
| WhatsApp instrumentado | **GLOBAL_OPTIONAL** | `SocialContactCTA` + `observeWhatsAppClicked` |
| WhatsApp direto | **BROKEN_INCONSISTENT** | realestate `window.open` sem evento |
| Eventos passivos drawer | **GLOBAL_REQUIRED** (demo) | ActionDrawer + BusinessFeedDrawer |
| Eventos passivos shadcn drawer | **NOT_APPLICABLE** | não instrumentado — **gap observacional** |
| Surface shadow | **GLOBAL_OPTIONAL** | DEV `/demo` |
| Troca vertical | **GLOBAL_REQUIRED** (demo) | `feed.vertical.changed` — sem UI “voltar” |
| Empty states | **NOT_APPLICABLE** | mock estático; sem loading/empty UX |
| Loading states | **NOT_APPLICABLE** | não implementado nos feeds |
| Mobile viewport / keyboard | **GLOBAL_REQUIRED** | composer + visualViewport (Tier 1) |
| Voltar ao selector | **BROKEN_INCONSISTENT** | `/demo` sem navegação in-app |
| CTA principal por vertical | **VERTICAL_SPECIFIC** | booking, cart, links, etc. |
| Cards clicáveis custom | **VERTICAL_SPECIFIC** | módulos por vertical |
| Imagens quebradas | **BROKEN_INCONSISTENT** | institutional console warnings |
| Console duplicate key | **BROKEN_INCONSISTENT** | multi vertical DEV |
| Fragment prop leak | **BROKEN_INCONSISTENT** | influencer, personal, institutional customContent |

---

## Fase 3 — Padrões de inconsistência (root causes)

### IC-01 · Duas stacks de drawer

| Stack | Drawer | Eventos | Scroll lock |
|-------|--------|---------|-------------|
| A | `ActionDrawer` | ✅ `drawer.*` | ✅ |
| B | shadcn `Drawer` | ❌ | ⚠️ inconsistente |

**Impacto:** shadow mode, event checklist e Runtime Truth parcialmente cegos em 3 verticals.

### IC-02 · Duas stacks de contexto

| Stack | Provider | Morph + chips |
|-------|----------|---------------|
| A | `ConversationSelectionProvider` | compartilhado feed + drawers |
| B | BSL `useConversationSelectionState` local | isolado por mount |

**Impacto:** drawers externos em Stack B não sincronizam contexto com composer da mesma forma.

### IC-03 · Política `composerMode` não universal

Verticals com `useEffect` → `setComposerMode` em drawers: ecommerce, restaurant, realestate, gym, events, courses, appointment (booking only), health, professionals.

**Gap:** appointment **feed drawer** não altera composerMode → shadow SD-01.

### IC-04 · Instrumentação de contato fragmentada

| Vertical | Mecanismo | Evento `whatsapp.clicked` |
|----------|-----------|----------------------------|
| appointment | `SocialContactCTA` | ✅ |
| realestate | `window.open(wa.me)` | ❌ |
| institutional | email `SocialContactCTA` | N/A |
| influencer/personal | mailto / external links | ❌ |

### IC-05 · customContent + `cloneElement`

`BusinessSectionComponent` injeta `onToggleConversationContext` em `customContent` via `cloneElement`.

**Falha:** Fragment `<>` / div estático não recebe props → React warnings; long-press em módulos custom pode não wired morph path.

---

## Fase 4 — Validação automatizada (referência)

Sessão `REAL_USAGE_VALIDATION.md` (mobile 390×844):

| Vertical | Morph RAF | Drawer instrumentado | WhatsApp event |
|----------|-----------|---------------------|----------------|
| appointment | ✅ Tutoriais | ✅ | ✅ |
| ecommerce | ✅ 26 frames | ✅ | N/A |
| courses–health | ✅ 25–26 | ✅ | N/A |
| realestate | ✅ | ✅ | ❌ (direct open) |
| influencer | ✅ | ❌ shadcn | N/A |
| personal | N/A (sem PostCard) | ❌ shadcn | N/A |
| institutional | ✅ | ❌ shadcn | N/A |

---

## Antes do Runtime Truth Mapping

### Deve ser universal (decisão de produto)

1. PostCard: tap → drawer, long-press → morph + context
2. ActionDrawer pattern para drawers de negócio (ou instrumentação equivalente)
3. Scroll unlock após fechar drawer
4. Composer sempre acessível salvo política explícita `hidden`
5. Eventos passivos coerentes em `/demo` para ações instrumentadas

### Pode variar por vertical

1. CTA principal (booking, cart, links, doação)
2. Módulos custom (agenda, cardápio, imóveis)
3. WhatsApp vs email vs form
4. Política checkout/cart composer hidden

### Bloqueia Runtime Truth Mapping

Ver `BEHAVIOR_FIX_PRIORITY.md` — **P0/P1** antes de mapear runtime como “verdade”.

---

## Referências

- `docs/audit/VERTICAL_BEHAVIOR_MATRIX.md`
- `docs/audit/GLOBAL_CONTRACTS.md`
- `docs/audit/BEHAVIOR_FIX_PRIORITY.md`
- `docs/audit/SURFACE_DIVERGENCES.md` (SD-01, SD-02)
- `docs/audit/REAL_USAGE_VALIDATION.md`
