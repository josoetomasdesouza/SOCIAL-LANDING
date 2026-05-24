# Runtime State Map — Surface Shadow Inputs

**Objetivo:** Mapa de onde cada campo do snapshot runtime é inferido — **sem ler React state diretamente**.

Shadow mode observa **sinais passivos** (event bus), preservando Tier 1.

---

## Fluxo de autoridade

```
Tier 1 React state (autoritativo, invisível ao shadow)
        ↓ mutações reais
Passive instrumentation (observe*)
        ↓
Event bus (sync)
        ↓
Runtime snapshot builder ← shadow comparison
        ↓
Shadow reducer (parallel policy)
```

---

## Mapa por campo

### `composerMode`

| | |
|---|---|
| **Autoridade runtime** | `ConversationSelectionContext.setComposerMode` |
| **Sinal shadow** | `composer.mode.changed` payload `.to` |
| **Setores** | Vertical feeds (`useEffect`), ecommerce drawers, booking flows |
| **Shadow predicted** | `deriveComposerModeFromLayers()` — **não** escuta `composer.mode.changed` para prever |

**Divergência típica:** runtime `default` + feed drawer aberto → shadow `overlay`.

---

### `openDrawers[]`

| | |
|---|---|
| **Autoridade runtime** | `ActionDrawer`, `BusinessFeedDrawer` `isOpen` |
| **Sinal shadow** | `drawer.opened` / `drawer.closed` |
| **Payload** | `drawerId`, `drawerKind`, `title?` |

**Quirk SD-02:** close id `feed:video:none` vs open `feed:video:{postId}`.

---

### `activeSurfaceIds[]`

| | |
|---|---|
| **Autoridade runtime** | Drawer/surface components |
| **Sinal shadow** | `surface.opened` / `surface.closed` |
| **Nota** | Emitted paired with drawer events via `observeDrawerOpened/Closed` |

Shadow reducer **não** aplica `surface.opened` (evita double count). Usa `surface.closed` + drawer events.

---

### `vertical`

| | |
|---|---|
| **Autoridade runtime** | `/demo` `selectedType` |
| **Sinal shadow** | `feed.vertical.changed` payload `.to` |
| **Shadow action** | `VERTICAL_SET` + reset layers |

---

### `morphActive`

| | |
|---|---|
| **Autoridade runtime** | `activeMorph` / `queuedMorph` in `business-social-landing` |
| **Sinal shadow** | `morph.started` → true, `morph.completed` → false |
| **Shadow control** | ❌ nunca — observação apenas |

---

### `aiSurfaceSessionOpen` / `conversationSessionActive`

| | |
|---|---|
| **Autoridade runtime** | `ConversationalAI` session flags |
| **Sinal shadow** | `ai.surface.opened` |
| **Nota** | Não comparado ao reducer nesta fase |

---

### `selectedPostId`

| | |
|---|---|
| **Autoridade runtime** | Feed selection / drawer |
| **Sinal shadow** | `feed.item.viewed` (**unwired** hoje) |
| **Estado** | Sempre `null` no snapshot até wiring |

---

### `keyboardVisible`

| | |
|---|---|
| **Autoridade runtime** | Mobile keyboard / `visualViewport` |
| **Sinal shadow** | `probeSurfaceEnvironment()` — DOM probe DEV only |
| **Heurística** | `visualViewport.height < innerHeight * 0.82` |

---

### `mobileViewport`

| | |
|---|---|
| **Probe** | `window.innerWidth < 768` |
| **Uso** | Contexto em divergences; não afeta reducer |

---

## Mapa de eventos → shadow actions

| Evento | Runtime builder | Shadow action |
|--------|-----------------|---------------|
| `feed.vertical.changed` | reset vertical, drawers | `VERTICAL_SET` |
| `drawer.opened` | add drawer | `SURFACE_OPEN` |
| `drawer.closed` | remove drawer | `SURFACE_CLOSE` (+ id normalize) |
| `surface.closed` | remove surface id | `SURFACE_CLOSE` (+ id normalize) |
| `composer.mode.changed` | update composerMode | **none** (comparison only) |
| `morph.*` | morph flag | none |
| `ai.surface.opened` | session flag | none |

---

## Componentes Tier 1 (referência — não importados pelo shadow)

| Componente | Estados relevantes |
|------------|-------------------|
| `conversation-selection-context.tsx` | `composerMode`, context items |
| `business-social-landing.tsx` | drawers, morph, feed |
| `action-drawer.tsx` | `isOpen`, body scroll lock |
| `business-feed-drawer.tsx` | feed drawer, drawerId quirk |
| `conversational-ai.tsx` | session, sheet, composer DOM |
| Vertical `*-feed.tsx` | booking/ecommerce composer effects |

---

## Z-index / scroll (frozen — não no snapshot)

Shadow **não** modela z-index ou scroll lock hoje. Divergências perceptivas (ex.: RU-01 realestate scroll) ficam fora do shadow comparator v1.

---

## DEV entry points

| Local | Shadow ativo |
|-------|--------------|
| `/demo` | ✅ via `PassiveEventProvider` |
| Production | ❌ disabled |
| Outras rotas | ❌ unless provider added |

---

## Extensões futuras (não implementadas)

- Snapshot de z-index policy (read-only DOM)
- `feed.item.viewed` wiring
- Ecommerce boolean drawer state mirror
- Shadow panel UI minimal (opt-in)
