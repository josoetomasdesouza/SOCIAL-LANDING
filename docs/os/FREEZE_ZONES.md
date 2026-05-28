# Freeze Zones — Runtime Convergence

**Autoridade:** Este documento  
**Versão:** 1.0  
**Data:** 2026-05-24  
**Complemento estratégico:** [`FROZEN_ZONES.md`](FROZEN_ZONES.md) (zonas de alma do produto)

---

## Propósito

Lista **operacional e técnica** de superfícies congeladas durante a fase **Runtime Convergence**. Mudanças aqui exigem GO humano, diff mínimo e registro em [`VALIDATION_PROTOCOL.md`](VALIDATION_PROTOCOL.md).

Este documento é mais específico que `FROZEN_ZONES.md`: aponta **paths e comportamentos**, não apenas categorias estratégicas.

---

## Status de congelamento

| Símbolo | Significado |
|---------|-------------|
| 🔴 **Frozen** | Não alterar salvo bug comprovado + protocolo completo |
| 🟡 **Frozen interface** | Comportamento público congelado; implementação interna patch-only |
| 🟢 **Open for wiring** | Feeds e integração periférica podem conectar sem alterar core |

---

## Zonas congeladas

### 1. ActionDrawer core 🔴

**Paths:**

- `components/business/action-drawer.tsx`
- `components/ui/drawer-drag-chrome.tsx`
- `lib/ui/use-drawer-sheet-drag.ts`
- `lib/ui/drawer-layout.ts`

**Congelado:**

- Pin footer quando `composerMode === "hidden"`
- Clearance via `useComposerOverlayClearance` quando overlay
- Altura sheet (`95dvh`), drag-to-close, backdrop opacity
- `data-action-drawer-pinned-footer` contract

**Permitido sem GO:**

- Wiring de `footer` / `children` nos feeds (periferia)
- Bugfix pontual com test plan

---

### 2. Morph runtime 🔴

**Paths:**

- `components/business/post-to-chat-morph-layer.tsx`
- Lógica `WithMorph` / `resolveMorphTargetRect` em `business-social-landing.tsx`

**Congelado:**

- Duração 480ms / 420ms
- RAF scheduling e target rect resolution
- z-index morph layer

**Permitido:**

- Novos `dataMorphSourceId` em feeds (wiring)
- Copy e conteúdo mock

---

### 3. Composer core 🔴

**Paths:**

- `components/business/conversational-ai.tsx`
- `lib/ui/composer-scroll-clearance.ts`
- `components/ui/composer-overlay-clearance.tsx`
- Métricas em `conversation-selection-context.tsx` (`setComposerScrollMetrics`)

**Congelado:**

- `composerMode` literals: `default` | `overlay` | `hidden`
- Publicação de footprint / bottomInset / clearance
- Superfície visual compacta (pb-4 shell, z-index overlay)
- Skip publish quando composer hidden (rect zero)

**Permitido:**

- `placeholder`, `contextItems` wiring por feed
- Novos resolvers **injetados via props** (não alterar core de render)

---

### 4. Instrumentation core 🟡

**Paths:**

- `lib/events/event-bus.ts`
- `lib/events/instrumentation.ts`
- `lib/events/event-replay.ts`
- `components/business/instrumented-drawer-bridge.tsx` (até deprecação WS-06/07)

**Congelado:**

- Contratos de eventos Tier 1 existentes
- Semântica `observeDrawerOpened` / `observeDrawerClosed` / `observeComposerModeChanged`

**Permitido:**

- Novos eventos Tier 2/3 add-only
- Bridge Stack B até migração completa

---

### 5. E-commerce resolver atual 🔴

**Paths:**

- `lib/mock-data/conversational-search.ts` (`ecommerceMockConversationResolver`)
- `components/business/ecommerce/ecommerce-conversation-products-block.tsx`
- Wiring em `ecommerce/ecommerce-feed.tsx`

**Congelado:**

- Comportamento do resolver facial/skincare existente
- Visual block de produtos na conversa

**Permitido:**

- Novos resolvers **em arquivos separados** para outras verticais (WS-08)
- Exploration memory e-commerce (`ecommerce-exploration-memory.ts`)

---

### 6. Feed baseline Tier 1 🟡

**Paths:**

- `components/business/business-social-landing.tsx` (core layout, intro, story viewer, morph orchestration)
- `components/business/context-selectable.tsx`
- `components/business/conversation-selection-context.tsx` (API pública)

**Congelado:**

- Cadência feed, intro layout, story viewer behavior
- Provider API de selection context
- Restore composer mode após feed drawer

**Permitido:**

- Novas sections por vertical feed
- `onHeaderCartClick`, `headerCartCount`, resolver props

---

## Matriz: quem pode tocar o quê

| Agente / WS | ActionDrawer | Morph | Composer | Instrumentation | E-com resolver | Feed baseline |
|-------------|-------------|-------|----------|-----------------|----------------|---------------|
| WS-03 Parity | 🟢 wiring | 🟢 wiring | 🟢 mode effects | 🟢 events | ❌ | 🟢 feeds |
| WS-06 Influencer | 🟢 consume | 🟢 wiring | 🟢 mode effects | 🟢 | ❌ | 🟢 feed |
| WS-08 AI | ❌ | ❌ | 🟢 inject props | 🟢 | ❌ criar novo | 🟢 wire resolver |
| WS-02 PR52 | 🔴 já merged path | ❌ | 🟡 métricas | 🟢 | ❌ | 🟡 |

---

## Protocolo para descongelar

1. Abrir issue ou WS dedicado — nunca “fix oportunista”
2. Ler [`VALIDATION_PROTOCOL.md`](VALIDATION_PROTOCOL.md) + [`FROZEN_ZONES.md`](FROZEN_ZONES.md)
3. Descrever diff mínimo + rollback
4. **GO humano explícito** no PR
5. Re-run perceptual documentado
6. Atualizar este documento se a zona mudar de estado

---

## Exceções temporárias

Nenhuma exceção ativa registrada em 2026-05-24.

PR #52 (`fix/drawer-perceptual-hygiene`) tocou ActionDrawer/composer **com GO implícito de convergência** — após merge, volta a status 🔴 frozen.

---

## Relação com outros documentos

| Documento | Papel |
|-----------|-------|
| `FROZEN_ZONES.md` | Estratégico — alma do produto |
| `FREEZE_ZONES.md` | Operacional — paths e fase convergência |
| `docs/ai-handoffs/FROZEN_SYSTEMS.md` | Contratos linha-a-linha Tier 1 |
| `ARCHITECTURE_RULES.md` | Regras gerais de camadas |
