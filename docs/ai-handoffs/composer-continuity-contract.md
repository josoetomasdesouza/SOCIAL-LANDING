# CONTRATO DE CONTINUIDADE TÉCNICA
## Projeto: Social/Business Landing — Fluxo Interativo

**Versão**: 1.0 — baseada em auditoria de 19/05/2026  
**Escopo**: `/workspace` — Next.js App Router + React 19 + Tailwind CSS

---

## SEÇÃO 1 — ARQUITETURA ATUAL RESUMIDA

### Três superfícies independentes (NÃO se misturam)

```
/                    → SocialLanding (Natura mock, layout estático premium)
/demo                → BusinessSocialLanding (12 verticais, IA conversacional)
/[slug]              → Profile Landing (cartão de contato simples)
/criar               → Landing Builder (usa framer-motion — ISOLADO)
```

### Camadas do Business Landing (ordem de composição)

```
ConversationSelectionProvider          ← contexto global da vertical
  └── *Feed (ecommerce, restaurant…)   ← lógica de composerMode por vertical
        └── BusinessSocialLanding      ← orquestrador central (1219 linhas)
              ├── BusinessHeader        fixed, z-50
              ├── StoryViewer          z-100 quando aberto
              ├── BusinessSearchBar
              ├── BusinessSection[]    data-section em cada seção
              ├── ContextSelectable    wrapper de long-press em cards
              ├── PostToChatMorphLayer z-65, pointer-events-none
              ├── ConversationalAI     z-30/60/70 dinâmico (1006 linhas)
              ├── BusinessFeedDrawer   z-50
              └── ActionDrawer(s)      z-50, por vertical
```

### Motor de estado central

| Sistema | Localização | Escopo |
|---|---|---|
| Contexto de conversa | `conversation-selection-context.tsx` | Cross-component (Provider) |
| Estado do compositor | `conversational-ai.tsx` — 15+ state vars | Local ao componente |
| Morph source cache | `context-selectable.tsx` — module-level `let` | Cross-render singleton |
| Histórico de chat | `localStorage` key `business-conversation-history:{brand}` | Persistido |

---

## SEÇÃO 2 — ÁREAS CONGELADAS

As seguintes áreas **não devem ser tocadas** sem uma justificativa técnica absolutamente crítica documentada:

### CONGELADO — Sistema de Morph (post → chip)

- `post-to-chat-morph-layer.tsx` inteiro
- Função `rememberMorphSourceElement` em `context-selectable.tsx`
- Variável module-level `rememberedMorphSource` (singleton cross-render)
- Timing de 480ms + easing `easeOutCubic`
- TTL de 1800ms do cache de morph source
- Lógica de cancelamento em scroll/resize (capture phase listener)
- Check `prefers-reduced-motion`

### CONGELADO — Sistema de Drag do Sheet

- Toda a lógica de `pointerdown/pointermove/pointerup` em `conversational-ai.tsx`
- `dragStateRef` e sua estrutura `{ pointerId, startY, startHeight, startedCollapsed }`
- Sistema de pointer capture (`setPointerCapture`)
- Lógica de snap para `[compact, medium, expanded]`
- Constantes de ratio (ver Seção 6)

### CONGELADO — Z-Index Hierarchy

(ver Seção 5 — valores absolutos, não relativos)

### CONGELADO — Scroll Lock

```typescript
// ESTE PADRÃO NÃO DEVE SER SUBSTITUÍDO
useEffect(() => {
  if (isOpen) document.body.style.overflow = "hidden"
  else document.body.style.overflow = ""
  return () => { document.body.style.overflow = "" }
}, [isOpen])
```

Presente em: `feed-drawer.tsx`, `business-feed-drawer.tsx`, `action-drawer.tsx`. Os três devem permanecer idênticos entre si.

### CONGELADO — Long-press Threshold

```typescript
const LONG_PRESS_MS = 420 // NÃO ALTERAR
```

### CONGELADO — Data Attributes (ver Seção 4)

### CONGELADO — `composerMode` API

Os três valores exatos: `"default"` | `"overlay"` | `"hidden"` — consumidos diretamente pelo `ConversationalAI`. Renomear quebra o sistema.

### CONGELADO — `COMPOSER_SURFACE_COLOR`

```typescript
const COMPOSER_SURFACE_COLOR = "rgba(45,50,58,0.96)"
```

Base de todo o sistema visual do dark glass panel.

---

## SEÇÃO 3 — ARQUIVOS CRÍTICOS

### Tier 1 — Não editar sem revisão completa do sistema

| Arquivo | Linhas | Por quê é crítico |
|---|---|---|
| `components/business/conversational-ai.tsx` | ~1006 | 15+ estados, 10+ refs, ResizeObserver, drag system, localStorage, z-index dinâmico |
| `components/business/business-social-landing.tsx` | ~1219 | Orquestrador central, roteamento de drawers, morph orchestration, story navigation |
| `components/business/conversation-selection-context.tsx` | — | Contexto compartilhado entre todos os componentes de cards e o composer |
| `components/business/context-selectable.tsx` | — | Long-press, morph source, estados visuais de seleção |
| `components/business/post-to-chat-morph-layer.tsx` | — | RAF morph animation, único sistema não-CSS de animação nas landings |

### Tier 2 — Editar com cuidado, testar drawers inteiros

| Arquivo | Risco |
|---|---|
| `components/business/action-drawer.tsx` | Scroll lock, matchFeedWidth, composerMode interaction |
| `components/business/business-feed-drawer.tsx` | Scroll lock, ContextSelectable, pb-36 para compositor |
| `components/social-landing/feed-drawer.tsx` | Scroll lock, scroll-to-post timing |
| `app/globals.css` | Tokens OKLCH, scrollbar-hide, pb-safe, slide-up keyframe |

### Tier 3 — Cada vertical de negócio

```
components/business/ecommerce-feed.tsx
components/business/restaurant-feed.tsx
components/business/appointment-feed.tsx
components/business/courses-feed.tsx
components/business/events-feed.tsx
components/business/gym-feed.tsx
components/business/health-feed.tsx
components/business/professionals-feed.tsx
components/business/realestate-feed.tsx
```

Cada uma tem sua própria lógica de `composerMode` — não unificar sem testar todas individualmente.

---

## SEÇÃO 4 — CONTRATOS QUE NÃO PODEM QUEBRAR

### 4.1 Data Attributes (protocolo de comunicação entre componentes)

| Atributo | Quem aplica | Quem consome | Quebra se removido |
|---|---|---|---|
| `data-post-context-source` | `ContextSelectable` (via `ref`) | `getMorphSourceRect()` no morph layer | Morph não encontra origem, anima do (0,0) |
| `data-conversation-composer` | `ConversationalAI` shell | `getComposerFallbackRect()` | Morph usa coordenada errada como destino |
| `data-conversation-context-chip` | Chip rail em `ConversationalAI` | `getComposerChipRect()` | Target chip não é encontrado |
| `data-conversation-context-chip-target` | Hidden measurement chips | `getComposerChipRect()` fallback | Fallback de medição quebra |
| `data-conversation-context-rail` | Rail do contexto | Medição de layout | Altura do rail calculada incorretamente |
| `data-section` | `BusinessSectionComponent` | `story.onViewSection` scroll navigation | Navegação de story não encontra seção |

**Regra**: Esses atributos são o protocolo de comunicação entre componentes. Tratá-los como strings arbitrárias é fatal.

### 4.2 API do `ConversationSelectionContext`

```typescript
// CONTRATO — estes campos não podem ser renomeados ou removidos
interface ConversationSelectionContextValue {
  conversationContext: ConversationContextItem[]
  selectedContextIds: Set<string>
  toggleConversationContextItem: (item) => void
  composerMode: "default" | "overlay" | "hidden"   // ← valores exatos
  composerOffsetClassName: string
  // + funções de morph internas
}
```

### 4.3 Estrutura de mensagem do chat

```typescript
// CONTRATO — role values são literais, não enum
type Message = {
  role: "user" | "ai" | "context_event"  // ← três valores exatos
  content: string
  visualBlock?: VisualBlock
  contextItems?: ConversationContextItem[]
}
```

`context_event` é filtrado em `messages.filter()` ao remover chips — alterar o valor quebra a limpeza de histórico.

### 4.4 `sheetMetrics` shape

```typescript
// CONTRATO — estas propriedades são desestruturadas em múltiplos lugares
interface SheetMetrics {
  compact: number
  auto: number
  medium: number
  expanded: number
  closeThreshold: number
}
```

### 4.5 `composerMode` por vertical (não unificar)

Cada vertical calcula `composerMode` independentemente. O padrão do ecommerce:

```typescript
composerMode={
  checkoutDrawerOpen || cartDrawerOpen ? "hidden"
    : productDrawerOpen ? "overlay"
    : "default"
}
```

Restaurant adiciona `composerOffsetClassName="bottom-[88px]"` quando cart bar visível. Esses valores são intencionais.

---

## SEÇÃO 5 — Z-INDEX HIERARCHY

**Esta hierarquia é absoluta. Não inserir novos elementos sem mapeamento explícito.**

| z-index | Componente | Condição |
|---|---|---|
| z-0 | Doodle pattern background (ConversationalAI) | sempre |
| z-1 | ContextSelectable selected state | quando selecionado |
| z-10 | Story viewer internals, feed drawer sticky header, mini-carousel arrows | sempre |
| z-20 | Story desktop nav arrows | desktop |
| z-29 | ConversationalAI gradient mask | sempre |
| z-30 | ConversationalAI shell | modo `default`, feed drawer fechado |
| z-40 | Restaurant cart bar | quando carrinho tem itens |
| z-50 | Headers, feed drawer backdrop+panel, ActionDrawer, demo link | sempre |
| z-60 | ConversationalAI shell | quando `feedDrawerOpen === true` |
| z-65 | PostToChatMorphLayer | durante animação de morph |
| z-70 | ConversationalAI shell | modo `overlay` |
| z-100 | StoryViewer fullscreen, Toast container | quando aberto |

**Conflito documentado**: Feed drawer (z-50) e ConversationalAI (z-60 quando drawer aberto). O compositor deve estar acima do drawer quando o drawer está aberto — isso é intencional.

---

## SEÇÃO 6 — TIMINGS CRÍTICOS

**Nenhum destes valores deve ser alterado sem testes em mobile real.**

| Timing | Valor | Localização | Por quê é calibrado |
|---|---|---|---|
| Long-press threshold | 420ms | `context-selectable.tsx` | Abaixo → ativa acidentalmente no scroll; acima → parece lento |
| Morph animation | 480ms | `post-to-chat-morph-layer.tsx` | Sincronizado com hidden chip state |
| Morph source memory TTL | 1800ms | `context-selectable.tsx` | Permite re-render sem perder source rect |
| Story auto-advance | 5000ms | `stories.tsx` | Com progress bar de 50ms ticks |
| Story → drawer delay | 500ms | `stories.tsx` | Após `scrollIntoView` completar |
| Drawer scroll-to-post | 100ms | `feed-drawer.tsx` | Após drawer montar no DOM |
| AI reply simulation | 700ms | `conversational-ai.tsx` | Typing indicator mínimo aceitável |
| Sheet height transition | 300ms ease-out | `conversational-ai.tsx` | Desabilitado durante drag |
| ContextSelectable press visual | 200ms cubic-bezier(0.22,1,0.36,1) | `context-selectable.tsx` | Spring feel do press state |
| ActionDrawer slide | 300ms ease-out | `action-drawer.tsx` | Consistência com feed drawers |
| Feed drawer entrance | 300ms slide-in-from-bottom | `feed-drawer.tsx` | `animate-in` Tailwind utility |

### Constantes de snap height (NÃO ALTERAR)

```typescript
const SHEET_MAX_VIEWPORT_RATIO = 0.9      // expanded
const SHEET_MID_VIEWPORT_RATIO = 0.55     // medium
const COMPACT_BODY_MIN_RATIO = 0.22       // compact body (min 136px, max 196px)
const CLOSE_THRESHOLD_OFFSET_PX = 72     // limiar de fechamento por drag
```

---

## SEÇÃO 7 — REGRAS ANTI-REFACTOR

As regras a seguir existem porque o sistema tem acoplamentos não-óbvios que parecem "código feio" mas são funcionalmente necessários.

1. **NÃO extrair o RAF do morph para um hook** — o singleton `rememberedMorphSource` é module-level por razão: sobrevive a unmounts e re-renders.

2. **NÃO converter `body.style.overflow` para uma solução centralizada** — três componentes fazem scroll lock independentemente. A independência é feature: cada drawer gerencia seu próprio cleanup no `useEffect` return.

3. **NÃO unificar a lógica de `composerMode` das verticais** — cada vertical tem cenários diferentes de quando o compositor deve ficar oculto.

4. **NÃO substituir os `data-*` attributes por refs passadas via props** — os attributes cruzam fronteiras de componentes sem prop drilling. São o protocolo correto para esse padrão.

5. **NÃO transformar `rememberedMorphSource` em estado React ou context** — como singleton de módulo, não causa re-renders. Mover para context causaria re-renders em todos os consumidores a cada long-press.

6. **NÃO simplificar o `measureSheetLayout`** — o cálculo considera `visualViewport` (iOS Safari), fallback para `window.innerHeight`, e deduplicação de snap points. Tudo isso é necessário.

7. **NÃO remover os `useLayoutEffect` de medição** — a sequência de medição (`composerShellRef`, `topAreaRef`, `contextRailRef`, `composerFormRef`) garante que o sheet sabe seu próprio tamanho antes de qualquer transição visual.

8. **NÃO converter animações CSS para framer-motion nas landings** — aumentaria o bundle sem ganho de funcionalidade. As duas superfícies (landings vs /criar) usam sistemas diferentes intencionalmente.

9. **NÃO alterar a estrutura do `context_event` message** — é filtrado por `.role === "context_event"` em múltiplos lugares para reconstruir estado de contexto.

10. **NÃO substituir `activeContextIdsRef` e `pendingContextIdsRef` por `useState`** — são refs propositalmente para evitar re-renders e stale closures na lógica de diff de contexto.

---

## SEÇÃO 8 — REGRAS ANTI-CLEANUP

As seguintes coisas parecem "código para limpar" mas **não são**:

| O que parece cleanup | Por que não é |
|---|---|
| `styles/globals.css` não importado | É o tema shadcn padrão — pode ser necessário para shadcn updates futuras |
| Componentes em `social-landing/` não usados na home (`Hero`, `FeedGrid`, etc.) | São a arquitetura anterior, podem ser reativados sem reescrita |
| `reserveComposerSpace` em `ActionDrawer` interface mas não implementado | Interface pública planejada, não bug |
| `useIsMobile` não usado nas landings | Usado em `sidebar.tsx`, permanece no hook |
| `containerRef` em `feed-drawer.tsx` declarado mas não usado no scroll | Pode ter sido removido da lógica mas mantido para acesso externo futuro |
| Múltiplas condições de `composerMode` por vertical | Parecem duplicação mas cada vertical tem lógica diferente |
| `auto` dentro de `sheetMetrics` | Calculado mas pode não ser usado como snap point — mantém flexibilidade |

---

## SEÇÃO 9 — RISCOS DE REGRESSÃO

### Matriz de risco por área de mudança

| Área alterada | Componentes afetados | Risco |
|---|---|---|
| Z-index de qualquer componente | Compositor, morph layer, drawers, story viewer | **CRÍTICO** — hierarquia cuidadosamente calibrada |
| Altura do header | Story scrollIntoView, category filter sticky | **ALTO** — scroll position de-alinha |
| `bottom-[88px]` do restaurant | Compositor sobrepõe cart bar | **ALTO** |
| `pb-36` no business feed drawer | Conteúdo fica sob o compositor | **ALTO** |
| Qualquer `data-*` attribute | Morph layer, story navigation | **CRÍTICO** — quebra sem erro visível |
| `body.style.overflow` | Todos os drawers aninhados | **ALTO** — lock pode ficar preso |
| Viewport height calculation | Sheet snap, close threshold | **ALTO** — iOS Safari tem quirks |
| Long-press timing | Context selection UX, falsos positivos | **MÉDIO** |
| Morph timing | Visual de chip aparecer/desaparecer fora de sincronia | **MÉDIO** |
| `composerMode` values | ConversationalAI rendering, z-index | **CRÍTICO** |
| localStorage key format | Histórico não carrega, hydration issues | **MÉDIO** |
| Ordem dos `useLayoutEffect` | Sheet mede errado na primeira montagem | **ALTO** |

### Cenários de regressão silenciosa (sem erro no console)

1. Morph anima de/para coordenada errada → acontece quando `data-*` attribute ausente
2. Sheet fica preso em altura errada → `measureSheetLayout` chamado antes do DOM estar pronto
3. Scroll lock permanente após fechar drawer → cleanup do `useEffect` não executou
4. Chip fica `opacity-0` permanentemente → morph cancelado antes de `onComplete`
5. Histórico de conversa não persiste → key do localStorage mudou
6. Context chip duplica no chip rail → `selectedContextIds` Set corrompido

---

## SEÇÃO 10 — CHECKLIST OBRIGATÓRIO PRÉ-ALTERAÇÃO

Antes de modificar qualquer arquivo crítico (Tier 1 ou Tier 2):

- [ ] **Ler o arquivo inteiro** — nunca editar de trecho isolado
- [ ] **Mapear todos os consumers** do que será alterado (grep por nome de função, prop, data attribute)
- [ ] **Verificar se o elemento a alterar existe em múltiplos lugares** (ex: scroll lock em 3 arquivos)
- [ ] **Confirmar que nenhum `data-*` attribute será renomeado ou removido**
- [ ] **Confirmar que `composerMode` values permanecem exatamente `"default" | "overlay" | "hidden"`**
- [ ] **Confirmar que nenhum timing será alterado**
- [ ] **Confirmar que nenhum z-index será inserido sem mapear toda a hierarquia**
- [ ] **Verificar se a mudança afeta mobile diferentemente de desktop**
- [ ] **Verificar se a mudança pode conflitar com `body.style.overflow`**
- [ ] **Verificar se existe `useLayoutEffect` que depende do elemento a ser alterado**
- [ ] **Descrever o diff mínimo possível** — se precisar de mais de 20 linhas, reavaliar a abordagem
- [ ] **Identificar qual comportamento atual será preservado explicitamente**

---

## SEÇÃO 11 — CHECKLIST OBRIGATÓRIO PÓS-ALTERAÇÃO

Após qualquer modificação, validar cada item:

### Mobile (viewport ≤ 768px)
- [ ] Feed drawer abre fullscreen (`top-0 bottom-0`)
- [ ] Feed drawer fecha com X e com tap no backdrop
- [ ] Body scroll trava ao abrir drawer e destrava ao fechar
- [ ] Compositor visível e não sobrepõe conteúdo
- [ ] Long-press (420ms) adiciona item ao contexto
- [ ] Vibração haptica ocorre no long-press
- [ ] Morph animado 480ms post→chip
- [ ] Sheet do compositor arrasta e snapa em 3 posições
- [ ] Sheet fecha quando arrastado abaixo do `closeThreshold`
- [ ] Story viewer abre em fullscreen e avança por tap zone

### Desktop (viewport ≥ 768px)
- [ ] Feed drawer abre como bottom sheet (`max-h-[92vh]`)
- [ ] Story viewer mostra chevrons de navegação
- [ ] Layout centralizado na coluna `max-w-lg → lg:max-w-[600px]`
- [ ] Compositor não quebra layout wide

### Overlays e Z-index
- [ ] Compositor fica acima do feed drawer quando feed drawer está aberto
- [ ] Morph layer (z-65) não fica sob o compositor (z-30/60/70)
- [ ] Story viewer (z-100) fica acima de tudo
- [ ] ActionDrawer (z-50) fica acima do header

### Motion
- [ ] Morph post→chip anima visualmente (não pula)
- [ ] Chip aparece no rail após morph completar
- [ ] Sheet transição 300ms ao expandir/colapsar (não durante drag)
- [ ] Typing dots animam durante AI reply pending
- [ ] Feed drawer entrance 300ms slide-from-bottom

### Blur / Gradientes
- [ ] Header com `backdrop-blur-xl`
- [ ] Feed drawer backdrop com `backdrop-blur-sm`
- [ ] Compositor com `backdrop-blur-[18px]`
- [ ] Gradiente de máscara do compositor (white fade)

### Scroll
- [ ] Scroll do feed não afeta scroll do drawer quando drawer aberto
- [ ] Scroll no drawer de feed rola o conteúdo interno
- [ ] `scrollIntoView` na abertura do drawer posiciona post correto
- [ ] Messages do chat fazem scroll automático ao nova mensagem

### Conversational AI
- [ ] Histórico persiste após reload (`localStorage`)
- [ ] Context chips aparecem no rail após long-press
- [ ] Remover chip remove a context_event correspondente do histórico
- [ ] AI reply chega após 700ms typing indicator
- [ ] `composerMode` muda conforme drawers abrem/fecham na vertical

### Drag
- [ ] Drag do sheet não afeta scroll da página
- [ ] Drag inicia apenas no handle (`cursor-row-resize`)
- [ ] Pointer capture previne movimento fora do handle

---

## APÊNDICE — Dependências visuais que não são óbvias

### `pb-36` no BusinessFeedDrawer
**O que parece**: padding arbitrário  
**O que é**: garante que o último post não fique escondido atrás do compositor fixo

### `bottom-[88px]` no compositor do Restaurant
**O que parece**: offset arbitrário  
**O que é**: compensa a altura da cart bar fixa do restaurant (88px)

### `opacity-0 pointer-events-none` nos chips durante morph
**O que parece**: bug de display  
**O que é**: o chip real fica invisível enquanto o clone animado ocupa seu lugar; volta ao visível no `onComplete` do morph

### `z-29` na gradient mask do compositor
**O que parece**: z-index estranho  
**O que é**: precisa ficar abaixo do shell do compositor (z-30) mas acima do conteúdo do feed

### Module-level `rememberedMorphSource` em `context-selectable.tsx`
**O que parece**: variável global suja  
**O que é**: sobrevive a unmounts e re-renders; um hook ou context re-renderizaria todos os cards a cada long-press

### `activeContextIdsRef` em `conversational-ai.tsx` (paralelo ao estado)
**O que parece**: duplicação do estado `conversationContext`  
**O que é**: ref síncrona para uso em event handlers sem stale closures; o estado real dispara re-renders, a ref é para leitura imediata

---

*Fim do Contrato de Continuidade Técnica v1.0*  
*Gerado em: 19/05/2026*
