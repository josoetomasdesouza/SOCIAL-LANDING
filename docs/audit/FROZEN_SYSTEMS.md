# FROZEN SYSTEMS — Social Landing

**Data:** 23/05/2026  
**Fase:** 3 — Sistemas que devem virar FROZEN SYSTEMS  
**Relacionado:** `docs/ai-handoffs/FROZEN_SYSTEMS.md` (detalhe operacional histórico)

> Este documento consolida a auditoria estratégica. Para contratos linha-a-linha e hacks proibidos, consulte também `docs/ai-handoffs/FROZEN_SYSTEMS.md` e `composer-continuity-contract.md`.

---

## Definição

**FROZEN SYSTEM** = sistema cujo comportamento atual carrega contratos invisíveis perceptivos e estruturais. Alteração exige **protocolo especial** (ver `EVOLUTION_RULES.md`).

---

## Matriz resumo

| Sistema | Risco | Dependências | Protocolo |
|---------|-------|--------------|-----------|
| Feed column layout | Vermelho | globals.css, sections, composer pb | Visual QA mobile+desktop |
| Drawer stack | Vermelho | scroll lock, z-50, composer inset | Testar todos os drawers |
| Composer | Vermelho | measurement, drag, data-*, z-index | Tier 1 review |
| Navegação stories | Amarelo-Vermelho | data-section, scrollIntoView | Story flow E2E |
| Sessão (futuro) | Vermelho | Supabase SSR, RLS | Smoke auth + RLS |
| Renderização morph | Vermelho | RAF, data-*, scroll cancel | Morph replay manual |
| Mobile experience | Vermelho | visualViewport, 16px input, vibrate | Device matrix |
| Overlays / z-index | Vermelho | Toda a hierarquia | Z-index map obrigatório |
| Scroll | Vermelho | body overflow, drawer internal | Multi-drawer test |
| Animações calibradas | Vermelho | Timings documentados | Timing diff review |
| Estados globais composer | Vermelho | composerMode API | Literal freeze |

---

## 1. FEED

### Por que é crítico
O feed não é uma lista — é **superfície contínua** que ancora identidade da marca. Topo, stories, ritmo de seções e padding inferior (`pb-48`) existem para coexistir com composer fixo.

### Riscos
- Conteúdo escondido atrás do composer
- Feed parecer dashboard modular
- Quebra de ritmo entre seções
- Remoção de `data-section` quebra stories

### Dependências
- `BusinessSocialLanding`, `BusinessSectionComponent`
- `ContextSelectable`, `PostCard`
- `app/globals.css` tokens
- `ConversationSelectionProvider`

### Proteção
- Não alterar padding bottom do feed sem medir último post visível
- Não adicionar headers institucionais acima do feed social
- Preservar `max-w-lg → lg:max-w-[600px]` column constraint

### Protocolo especial
- [ ] Validar último item do feed visível com composer em compact/medium/expanded
- [ ] Validar story → section scroll
- [ ] Screenshot diff mobile 375px + desktop

---

## 2. DRAWER

### Por que é crítico
Três implementações (`ActionDrawer`, `BusinessFeedDrawer`, `FeedDrawer`) competem com composer por viewport inferior. Insets (`visibleBottomInsetPx`, `pb-36`) são calibrados.

### Riscos
- Scroll lock preso (body overflow)
- Drawer cobre composer ou vice-versa
- Duplicação diverge silenciosamente

### Dependências
- `composerMode` (hidden/overlay)
- `document.body.style.overflow`
- z-50 hierarchy
- Vertical-specific cart bars (restaurant z-40)

### Proteção
- Não unificar drawers sem matriz de regressão por vertical
- Não remover `pb-36` / insets sem replay mobile
- Manter padrão scroll lock idêntico entre os três

### Protocolo especial
- [ ] Abrir/fechar cada drawer type
- [ ] Verificar body scroll restaurado
- [ ] Testar drawer + composer overlay mode (ecommerce product)

---

## 3. COMPOSER (`ConversationalAI`)

### Por que é crítico
~1000 linhas, 15+ estados, measurement system, drag physics, chips, localStorage, z-index dinâmico. **Coração conversacional do produto.**

### Riscos
- Auto-grow measurement regression (histórico PR #30)
- Sheet height jump on keyboard (iOS)
- Composer parecer modal separado
- Hidden chips quebram morph destino

### Dependências
- `conversation-selection-context.tsx`
- `data-conversation-composer`, chip data attrs
- `visualViewport`, ResizeObserver
- `COMPOSER_SURFACE_COLOR`

### Proteção
- Não substituir measurement por constantes
- Não remover `useLayoutEffect` de medição
- Preservar snap ratios e drag pointer capture
- Preservar `text-[16px]` no input (anti-iOS-zoom)

### Protocolo especial
- [ ] Drag compact → medium → expanded
- [ ] Enviar mensagem + auto-scroll
- [ ] Adicionar/remover chips
- [ ] Teclado mobile aberto/fechado
- [ ] Reduced motion

---

## 4. NAVEGAÇÃO

### Por que é crítico
Não há router de superfície — navegação é **scroll + estado local**. Stories usam fallback chain frágil.

### Riscos
- Story clica → seção errada
- Demo selector troca vertical sem cleanup de estado
- `[slug]` isolado pode divergir de published landing

### Dependências
- `data-section`, `#section-{slug}`
- `StoryViewer` timing 500ms
- `BusinessSelector` state

### Proteção
- Não remover fallbacks sem substituir routing declarativo
- Ao trocar vertical no demo, resetar conversation context

### Protocolo especial
- [ ] Cada story link → seção correta
- [ ] Troca de vertical limpa composer state

---

## 5. SISTEMA DE SESSÃO (futuro — congelar antes de ativar)

### Por que será crítico
Auth Supabase SSR existe mas está **desligado**. Quando ativado, permeia media API, RLS, brand members.

### Riscos
- Session leak entre brands
- Missing middleware refresh
- Client-side auth UI acoplada ao composer

### Dependências
- `lib/db/auth/supabase-auth.adapter.ts`
- Cookies SSR, RLS policies (0001 migration)
- `ENABLE_AUTH` flag

### Proteção
- Fail-closed quando flag off (`NotConfiguredAuthAdapter`)
- Nunca expor service role ao client
- Auth UI separada do composer surface

### Protocolo especial
- [ ] `scripts/auth-health-check.mjs` PASS
- [ ] RLS smoke PASS
- [ ] Media API E2E checklist PR7

---

## 6. RENDERIZAÇÃO (Morph + measurement)

### Por que é crítico
Único sistema não-CSS de animação runtime. Prova perceptiva feed ↔ composer.

### Riscos
- Clone em (0,0)
- Chip invisível permanentemente
- Scroll "rasga" clone
- Strict Mode double-fire

### Dependências
- `rememberedMorphSource` (1800ms TTL)
- `post-to-chat-morph-layer.tsx` RAF 480ms
- `context-selectable.tsx` long-press 420ms

### Proteção
- Não mover morph source para React state/context
- Não alterar z-[65] sem remap completo
- Preservar cancel on scroll/resize capture phase

### Protocolo especial
- [ ] Long-press → morph → chip visible
- [ ] Scroll during morph → cancel clean
- [ ] prefers-reduced-motion → instant complete

---

## 7. EXPERIÊNCIA MOBILE

### Por que é crítico
Produto é mobile-first social. Competing fixed elements (composer z-30/70, cart z-40, drawer z-50).

### Riscos
- Safe area não tratada uniformemente
- Offsets hardcoded por vertical divergem
- Touch callout / zoom iOS

### Dependências
- `visualViewport` listeners
- `-webkit-touch-callout: none`
- `composerOffsetClassName`

### Proteção
- Testar restaurant cart bar + composer
- Testar ecommerce product drawer + inset 104px+cart

### Protocolo especial
- [ ] iPhone SE + iPhone Pro Max
- [ ] Android Chrome
- [ ] Landscape (composer collapse)

---

## 8. OVERLAYS

### Hierarquia congelada (absoluta)

| z-index | Sistema |
|---------|---------|
| z-28–29 | Feed dim / gradient mask |
| z-30 | Composer default |
| z-40 | Restaurant cart bar |
| z-50 | Drawers, headers |
| z-60 | Composer + feed drawer open |
| z-65 | Morph layer |
| z-70 | Composer overlay mode |
| z-100 | Story viewer, toast |

**Inserir camada nova = protocolo de arquitetura.**

---

## 9. SCROLL

### Congelado
- Body lock pattern em drawers
- Morph cancel on scroll
- Composer message auto-scroll smooth
- Drawer scroll-to-post setTimeout 100ms (substituir só com IntersectionObserver plan)

### Risco
Múltiplos drawers abertos → overflow hidden nunca restaurado.

---

## 10. ANIMAÇÕES

| Timing | Valor | Sistema |
|--------|-------|---------|
| Long-press | 420ms | ContextSelectable |
| Morph | 480ms easeOutCubic | PostToChatMorphLayer |
| Morph source TTL | 1800ms | Module singleton |
| Sheet transition | 300ms | Composer (off during drag) |
| Drawer slide | 300ms | Action/Feed drawer |
| Story advance | 5000ms | StoryViewer |

framer-motion **congelado fora de `/criar`** — não introduzir em runtime feeds sem revisão.

---

## 11. ESTADOS GLOBAIS (composer domain)

### API congelada

```typescript
type ConversationComposerMode = "default" | "overlay" | "hidden"
```

### Regras
- Max 6 context items
- `selectedContextIds` derivado de `conversationContext`
- Não renomear setters sem codemod em 9+ verticais

---

## Checklist de protocolo especial (qualquer FROZEN SYSTEM)

1. Ler `SYSTEM_ARCHITECTURE.md` + `composer-continuity-contract.md`
2. Grep consumers do que será alterado
3. Diff mínimo — uma variável por PR quando possível
4. Validar mobile + desktop + reduced motion
5. Registrar em `EVOLUTION_LOG.md` se merged
6. Não usar hacks proibidos (timeouts, z-index arbitrário, blur para mascarar)

---

## O que NÃO congelar (permitir evolução)

- Mock data e copy
- `/criar` builder UX
- `landing-schema` entidades (com versionamento)
- Scripts smoke e migrations
- Verticais lite sem composer stack
- Integrações externas (via adapter layer — ver `INTEGRATION_STRATEGY.md`)

---

## Atualização — Fase evolutiva estrutural (23/05/2026)

### Fundação adicionada (não altera Tier 1)

| Módulo | Caminho | Impacto Tier 1 |
|--------|---------|----------------|
| Event bus passivo | `lib/events/` | Nenhum — observa apenas |
| Surface reducer | `lib/surfaces/` | Nenhum — `SURFACE_MACHINE_APPLY_TO_TIER1 = false` |
| Brand DNA | `lib/brand-dna/` | Nenhum — declarative only |
| Rule engine | `lib/rules/` | Nenhum — evaluate-only |
| Integration ports | `lib/integrations/` | Nenhum — stubs |

### Instrumentação permitida (observacional)

| Arquivo | Tipo | O que faz |
|---------|------|-----------|
| `conversation-selection-context.tsx` | Tier 1 adjacent | Emite `composer.mode.changed` — **não altera API** |
| `action-drawer.tsx` | Tier 2 | Emite drawer/surface events |
| `business-feed-drawer.tsx` | Tier 2 | Emite drawer/surface events |
| `app/demo/page.tsx` | Entry | Vertical changed + debug panel DEV |

### Ainda congelado — sem wiring observacional

- ~~`post-to-chat-morph-layer.tsx` — morph events pending protocol~~ → morph observado via orchestrator callbacks (ver abaixo)
- Timings, z-index, scroll lock, drag, measurement — **inalterados**
- `feed.item.viewed` — pending

### Wiring Tier 1 observacional-only (23/05/2026)

| Arquivo | Alteração | Comportamento runtime |
|---------|-----------|----------------------|
| `business-social-landing.tsx` | `observeMorphStarted` no `useLayoutEffect` queued→active | **Idêntico** — só emit |
| `business-social-landing.tsx` | `observeMorphCompleted` no `onComplete` existente | **Idêntico** — só emit |
| `conversational-ai.tsx` | `observeAiSurfaceOpened` após session active | **Idêntico** — só emit |

**Não editado:** `post-to-chat-morph-layer.tsx` — animação RAF, 480ms, cancel listeners intactos.

Ver `docs/audit/EVENT_CONTRACTS.md` para semântica dos eventos.
