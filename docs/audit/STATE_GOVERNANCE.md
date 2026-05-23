# STATE GOVERNANCE — Social Landing

**Data:** 23/05/2026  
**Fase:** 5 — State Governance

---

## Princípio rector

> Estado deve ser **local por default**, **derivado quando possível**, **global apenas quando prova social/conversacional exige**.

Hoje o projeto segue isso **parcialmente** — mas composerMode duplication e DOM-derived layout state criam **dependências invisíveis**.

---

## Inventário de estados

### 1. Estados globais (client)

| Estado | Mecanismo | Arquivo | Escopo | Mutabilidade |
|--------|-----------|---------|--------|--------------|
| Toast queue | Module reducer + listeners | `hooks/use-toast.ts` | App-wide | dispatch() |
| Morph source memory | Module `let` singleton | `context-selectable.tsx` | Cross-render 1.8s | write on long-press |
| Sidebar open | Context + cookie | `ui/sidebar.tsx` | Admin only | setOpen |
| Chat history | localStorage | `conversational-ai.tsx` | Per brand name | read/write on message |
| Theme | next-themes | `theme-provider.tsx` | **Não wired** | N/A |

**Não há Zustand/Redux/Jotai.**

### 2. Estados compartilhados (domain)

| Estado | Mecanismo | Provider scope | Consumidores |
|--------|-----------|----------------|--------------|
| `conversationContext[]` | React Context | Per vertical feed | Cards, composer, morph |
| `composerMode` | React Context | Per vertical feed | Composer, BusinessSocialLanding |
| `composerOffsetClassName` | React Context | Per vertical feed | Composer positioning |
| `selectedContextIds` | **Derivado** (useMemo) | Context | isConversationSelected |

Provider criado em cada `*Feed.tsx`, passado via `ConversationSelectionProvider`.

### 3. Estados locais críticos

#### `BusinessSocialLanding`

| State | Propósito | Risco re-render |
|-------|-----------|-----------------|
| `drawerOpen` | Action drawer via renderPostDrawer | Médio |
| `feedDrawerOpen` | Content feed drawer | Alto — afeta composer z-index |
| `selectedPost` | Drawer content | Baixo |
| `storyViewerOpen` | Fullscreen z-100 | Médio |
| `morphRequest` | Morph orchestration | Alto durante animation |
| `hiddenContextIds` | UI hide during morph | Médio |

#### `ConversationalAI` (~15+ useState)

| Categoria | Exemplos | Notas |
|-----------|----------|-------|
| Sheet layout | sheetHeight, isDragging, snap | Refs + state mix |
| Messages | messages[], isTyping | localStorage sync |
| UI chrome | isCollapsed, showContextRail | Measurement dependent |
| Refs | shellRef, messagesContentRef, etc. | Synchronous reads |

#### Vertical feeds (ex: `ecommerce-feed.tsx`)

| State | Propósito |
|-------|-----------|
| cart[], favorites | Transactional |
| selectedProduct | Drawer content |
| checkoutStep | Multi-step flow |
| drawerOpen variants | Multiple concurrent drawers |

**Cada vertical replica padrão similar — sem shared reducer.**

### 4. Estados server

| Estado | Mecanismo | Gated |
|--------|-----------|-------|
| Auth session | Supabase cookies SSR | ENABLE_AUTH |
| DB entities | Drizzle/postgres | ENABLE_DB |
| Publish sandbox | InMemoryPublishStore | Tests only |
| Mock storage | MockStorageAdapter | Tests |

---

## Mutações perigosas

| Mutação | Onde | Risco |
|---------|------|-------|
| `document.body.style.overflow = "hidden"` | All drawers | Lock stuck |
| Direct DOM class manipulation | Rare | Bypass React |
| `conversationContext` slice(0,6) silent drop | Context | User loses item without feedback |
| localStorage write sync | Every message | Main thread jank |
| `cloneElement` injection | BusinessSectionComponent | Prop override surprises |
| `setComposerMode` in useEffect deps incomplete | Vertical feeds | Stale mode on fast toggle |

---

## Risco de re-render

### Hot paths

1. **BusinessSocialLanding** — re-render propaga para sections, morph, composer
2. **conversationContext change** — todos os ContextSelectable re-render
3. **composerMode change** — ConversationalAI + className on wrapper
4. **sheetHeight during drag** — intentional high frequency

### Mitigações existentes

- `rememberedMorphSource` **fora** do React (evita card re-render)
- `useCallback` nos context actions
- `selectedContextIds` memoizado
- Refs para measurement (partial)

### Mitigações ausentes

- React.memo em PostCard / section rows
- Composer isolation boundary (memo wrapper)
- Vertical state machines (XState ou reducer compartilhado)

---

## Dependências invisíveis

```
composerMode (context)
    ↑ set by vertical useEffect watching [drawerOpen, cartOpen, checkoutOpen, ...]
    ↓ read by BusinessSocialLanding for z-index + hidden class
    ↓ read by ConversationalAI for overlay behavior

feedDrawerOpen (local BSL)
    ↑ independent from action drawerOpen
    ↓ elevates composer to z-60

conversationContext (context)
    ↑ toggle from long-press OR tap handlers
    ↓ drives chip rail measurement → sheet auto-grow
    ↓ passed to mock AI resolver as context

rememberedMorphSource (module)
    ↑ long-press
    ↓ read by morph layer BEFORE React commit may complete
```

---

## Governança recomendada

### Estados que DEVEM ser isolados

| Estado | Isolamento | Razão |
|--------|------------|-------|
| Morph pipeline | Module singleton + dedicated reducer | Performance + Strict Mode |
| Composer measurement | Refs only, no React state for px values | Evita layout thrashing |
| Transactional (cart/checkout) | Per-vertical local state | Não poluir conversation context |
| Auth session | Server-only adapter | Security |
| Brand DNA / published snapshot | landing-schema read-only at runtime | Immutability |

### Estados que DEVEM ser derivados

| Derivado | Fonte única |
|----------|-------------|
| `selectedContextIds` | conversationContext ✅ já feito |
| Composer visibility | `composerMode` + drawer flags → **deveria** ser selector único |
| Scroll lock needed | Set of open surface IDs → refcount |
| Effective z-index | Surface stack reducer |
| Published feed content | Publication snapshot (future) — never from editor draft |

### Estados que PRECISAM de proteção

| Estado | Proteção |
|--------|----------|
| `composerMode` literals | Type freeze + lint rule |
| conversationContext max 6 | User-visible toast when truncated |
| Chat localStorage | Schema version + migration |
| Brand colors/identity | Brand DNA layer read-only for AI |
| Publication version | Immutable after publish |

---

## State layers (modelo alvo)

```
┌─────────────────────────────────────────┐
│ L4 — Evolution / AI proposals (mutable) │  ← sandbox only
├─────────────────────────────────────────┤
│ L3 — Runtime UI (ephemeral)             │  ← drawer open, sheet height
├─────────────────────────────────────────┤
│ L2 — Session conversation (semi-persist)│  ← context chips, chat history
├─────────────────────────────────────────┤
│ L1 — Published brand snapshot (immutable)│  ← landing-schema snapshot
└─────────────────────────────────────────┘
```

**Regra:** IA e automações só escrevem L4. Publish promote L4 → L1 após validação.

---

## Anti-patterns detectados

1. **Estado duplicado:** drawer open em vertical E inferido no BSL
2. **Estado espalhado:** composerMode em 9 useEffects idênticos
3. **Estado DOM como truth:** querySelector para morph destino
4. **Dois type systems:** UI Brand vs schema Brand
5. **Persistência ad hoc:** localStorage sem schema

---

## Ações recomendadas (sem refatorar agora)

| Prioridade | Ação | Esforço |
|------------|------|---------|
| P0 | Documentar composerMode matrix por vertical | Baixo |
| P0 | Adicionar schemaVersion ao localStorage chat | Baixo |
| P1 | Criar `lib/surface-state/` reducer para composerMode + surfaces | Médio |
| P1 | Scroll lock refcount helper | Médio |
| P2 | Adapter mock Brand → landing-schema Brand | Alto |
| P3 | Zustand/context split — só se reducer insufficient | Alto |

---

## Conclusão

Governança de estado é **ad hoc mas contida** — aceitável para demo, **insuficiente** para Goal Engine e IA contextual. O caminho é **reducers explícitos para superfícies** (composer/drawer/overlay), mantendo transactional state local por vertical, e **snapshots imutáveis** para identidade de marca.
