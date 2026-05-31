# WS-13 — Morph Card → Composer: Entry Point Audit

**Data:** 2026-05-31  
**Baseline:** `main` @ `b88172c`  
**Status:** ✅ **M-01 corrigido** — revalidação perceptiva pendente (Sessão B §4B)  
**Fix:** `b88172c` — morph elevado ao `ConversationSelectionProvider` via prop `vertical`

---

## Resumo executivo

O morph vive no **`ConversationSelectionProvider`** (prop `vertical`) via `useConversationContextMorph` → `PostToChatMorphLayer` (480ms, z-75). `BusinessSocialLanding` consome o mesmo pipeline quando dentro do provider.

**Long-press + morph:** feed, feed drawer, custom modules **e action drawers** (desde fix M-01).

| Categoria | Qtd. estimada | Morph |
|-----------|---------------|-------|
| Feed posts (`PostCard`) | Todos os tipos editoriais | ✅ |
| Feed drawer posts | `BusinessFeedDrawer` | ✅ |
| Custom modules (seções `customContent`) | Injetados via `cloneElement` | ✅ |
| **Action drawers** (booking, product, etc.) | Todos os verticals | ✅ **M-01 fix** |
| Stories | — | ❌ N/A (sem long-press) |
| Hero highlights | — | ❌ N/A (click only) |
| Influencer / Personal / Institutional | — | ❌ N/A (sem `ContextSelectable`) |

**Veredicto global:** mesma gesture → mesma continuidade perceptiva nos contextos transacionais corrigidos.

**Gate fix M-01:**

```txt
Isso restaura continuidade espacial
ou está tentando deixar a animação mais impressionante?
```

→ **Restaura continuidade espacial.** Mesmo pipeline 480ms, sem timing/easing/spawn redesign.

---

## Pipeline técnico (referência)

```txt
ContextSelectable (420ms long-press)
  → rememberMorphSourceElement(dataMorphSourceId)
  → onLongPress callback
  → toggleConversationContextItemWithMorph (provider ou BusinessSocialLanding fallback)
      → queueConversationContextMorph
          → hiddenContextIds (chip opacity-0 no composer)
          → PostToChatMorphLayer 480ms ease-out-cubic
      → toggleConversationContextItem (estado imediato)
  → onComplete → chip visível
```

**Arquivos centrais:**

| Peça | Arquivo |
|------|---------|
| Long-press | `components/business/context-selectable.tsx` |
| Morph queue | `components/business/conversation-context-morph.tsx` |
| Provider wiring | `components/business/conversation-selection-context.tsx` (`vertical` prop) |
| Morph layer | `components/business/post-to-chat-morph-layer.tsx` |
| Chip hide | `components/business/conversational-ai.tsx` (`hiddenContextIds`) |
| Estado contexto | `components/business/conversation-selection-context.tsx` |

---

## 1. Mapa completo de entry points

### Legenda

| Morph | Significado |
|-------|-------------|
| ✅ | `toggleConversationContextItemWithMorph` — viagem 480ms |
| ❌ → ✅ | `toggleConversationContextItemWithMorph` via provider — viagem 480ms |
| N/A | Sem long-press nesta superfície |

| Comportamento esperado (PERCEPTUAL_INVARIANTS §4) | Item viaja ao composer; chip após morph; sem teleport |

---

### A. `BusinessSocialLanding` — morph ✅

| Superfície | Componente | Contexto | Morph | Notas |
|------------|------------|----------|-------|-------|
| Feed posts — video | `PostCard` | Seções `posts` | ✅ | `dataMorphSourceId={post.id}` |
| Feed posts — review | `PostCard` | Seções `posts` | ✅ | |
| Feed posts — news | `PostCard` | Seções `posts` | ✅ | |
| Feed posts — social | `PostCard` | Seções `posts` | ✅ | |
| Feed posts — product | `PostCard` | Seções produto | ✅ | |
| Feed drawer | `BusinessFeedDrawer` → `ContextSelectable` | Drawer aberto | ✅ | `onPostLongPress={toggleConversationContext}` |
| Custom sections | Módulos via `renderSectionCustomContent` | Injeção `onToggleConversationContext` | ✅ | `cloneElement` **sobrescreve** props do feed — morph ativo mesmo quando feed passa `toggleConversationContextItem` no JSX |

**Appointment — custom modules com morph ✅ (via injeção):**

| Módulo | Arquivo | Cards long-press |
|--------|---------|------------------|
| ScheduleModule | `appointment-feed.tsx` | serviços populares, profissionais |
| StylesModule | `appointment-feed.tsx` | estilos |
| Demais verticais | `*-feed.tsx` custom sections | mesmo padrão |

---

### B. Action drawers — long-press ✅ morph (M-01 resolvido)

Todos passam `conversationSelection.toggleConversationContextItemWithMorph` — morph layer no provider (irmão de `BusinessSocialLanding` + drawers).

| Vertical | Drawer / painel | Arquivo |
|----------|-----------------|---------|
| **Appointment** | ServicesDrawer, ProfessionalsDrawer, BarberDetailsDrawer | `appointment-feed.tsx` |
| Restaurant | ItemDetailDrawer, cart | `restaurant-feed.tsx` |
| E-commerce | ProductDetailPanel, cards in drawer | `ecommerce-feed.tsx` |
| Health / Gym / Real estate / Events / Courses / Professionals | drawers | `*-feed.tsx` |

**Antes:** vibração 420ms → chip no composer **sem** `PostToChatMorphLayer`.  
**Depois:** mesmo pipeline do feed — proxy chip 480ms → composer.

**Risco perceptivo:** baixo — zero alteração em timing/easing/spawn; só unificação de entry point.

---

### C. Sem long-press — N/A

| Superfície | Motivo |
|------------|--------|
| **Stories** | Tap abre viewer — sem `ContextSelectable` |
| **Hero highlights** | `Button` onClick — `appointment-operational-hero.tsx` |
| **`na Augusta` / chegada** | Tap abre drawer — não long-press |
| **Influencer / Personal / Institutional** | Sem `ContextSelectable` nos feeds |
| **AI visual blocks** (Appointment) | Seleção via click nos blocos — sem long-press morph |
| **Composer input / chips** | Remoção via botão — não morph inverso |

---

### D. E-commerce — feed vs drawer split

| Superfície | Morph |
|------------|-------|
| `EcommerceProductFeedCard` no feed | ✅ (via `BusinessSocialLanding`) |
| `EcommerceProductFeedCard` / panel **in drawer** | ❌ |
| `ecommerce-conversation-products-block` | ❌ (toggle direto no bloco AI) |

---

## 2. Validação continuidade perceptiva (análise estática)

### Onde morph **deve** parecer correto

| Check | Feed posts | Feed drawer | Custom modules |
|-------|------------|-------------|----------------|
| Origem física (`data-post-context-source`) | ✅ | ✅ | ✅ |
| Chip oculto até `onComplete` | ✅ | ✅ | ✅ |
| Target live (`resolveToRect` + chip measurement) | ✅ | ✅ | ✅ |
| z-index morph (75) > composer overlay (70) | ✅ | ✅ | ✅ |
| Cancel scroll/resize | ✅ | ✅ | ✅ |

### Mecanismo `createMorphSpawnRect`

O morph **não** deforma o card inteiro. Spawna layer **chip-sized** centrada no centro do card:

```txt
source card (permanece visível, selected)
  → ghost chip 188×44 @ centro do card
  → voa ao composer chip
```

**Avaliação gate:** continuidade espacial **aceitável** — viagem visível, não teleport do estado. Não é morph de pixels do card; é **proxy chip**. Imperfeição técnica menor se viagem é legível.

**Ruptura perceptível?** ☐ Pendente Sessão B — provável **GO** no feed; não polish.

---

## 3. Bugs e rupturas identificadas

| ID | Contexto | Sintoma | Causa provável | Ruptura perceptível? | Gravidade | GO fix |
|----|----------|---------|----------------|----------------------|-----------|--------|
| **M-01** | Todos action drawers | ~~Chip aparece sem viagem~~ | ~~`toggleConversationContextItem` sem morph~~ | **Resolvido** — provider morph | — | ✅ Fix mínimo aplicado |
| **M-02** | `getMorphSourceRect` null | Só chip pop | Elemento off-screen / sem `dataMorphSourceId` / unmounted | **Sim** quando ocorre | Média | ☐ Só se reproduzível |
| **M-03** | Scroll durante morph | Morph corta | `cancelAnimation` em scroll capture → `onComplete` imediato | **Leve** — edge case | Baixa | **NO-GO** (comportamento defensivo) |
| **M-04** | `prefers-reduced-motion` | Sem animação | Skip intencional em `queueConversationContextMorph` | **Não** — a11y | — | **NO-GO** |
| **M-05** | Composer `hidden` (chegada) | Target = fallback rect | `getComposerFallbackRect()` estimado | **Possível** — landing imprecisa | Média | ☐ Observar @ chegada |
| **M-06** | Feed drawer + composer overlay | Morph atravessa drawer | z-75 sobre drawer z-50 | **Não** — correto | — | **NO-GO** |
| **M-07** | Spawn centro vs bounds card | Card não “encolhe” | Design `createMorphSpawnRect` | Imperfeição, não ruptura | Baixa | **NO-GO** |
| **M-08** | Estado antes do morph | Chip hidden, context já added | By design — sync imediato | **Não** — evita flash | — | **NO-GO** |
| **M-09** | qa:events @ morph | Não validado runtime | Dev server indisponível @ `:3000` | — | — | Revalidar local |

---

## 4. GO / NO-GO por contexto

| Contexto | Morph status | Veredicto | Ação |
|----------|--------------|-----------|------|
| Feed posts (Appointment piloto) | ✅ Ativo | **GO** — manter | Nenhuma |
| Feed drawer | ✅ Ativo | **GO** — manter | Nenhuma |
| Custom modules (Schedule, Styles…) | ✅ Ativo | **GO** — manter | Nenhuma |
| Booking / service drawers | ✅ Morph ativo | **GO** — M-01 corrigido | Nenhuma |
| Outros vertical drawers | ✅ Morph ativo | **GO** | Nenhuma |
| Stories / highlights | N/A | **GO** — fora escopo | Nenhuma |
| Motion layer internals | Congelado | **NO-GO** refactor | WS-12 pausado |
| `createMorphSpawnRect` polish | — | **NO-GO** | Imperfeição técnica |
| Scroll-cancel morph | — | **NO-GO** | Defensivo |

---

## 5. Validação runtime pendente

Executar localmente (dev server @ `:3003` ou `:3000`):

```bash
pnpm dev
pnpm qa:events   # morph.started → morph.completed
```

**Casos manuais Sessão B / facilitador:**

1. Long-press post review no feed → viagem visível ao composer  
2. Long-press serviço popular (ScheduleModule) → morph  
3. Abrir feed drawer → long-press post → morph com drawer aberto  
4. Abrir booking drawer → long-press serviço → **morph igual ao feed (M-01)**  
5. Long-press + scroll leve → morph cancela (M-03)  
6. @ 320 viewport — repetir 1 e 4  

---

## 6. Regra crítica (WS-13)

```txt
Isso gera ruptura perceptível real
ou apenas imperfeição técnica?
```

| Finding | Classificação |
|---------|---------------|
| M-01 drawers sem morph | **Resolvido** — continuidade restaurada |
| M-07 spawn centro | Imperfeição técnica — **NO-GO fix** |
| M-03 scroll cancel | Imperfeição / edge — **NO-GO fix** |
| Feed morph pipeline | **Continuidade OK** — preservar |

**Não implementar** refactor amplo. M-01: fix mínimo = morph no `ConversationSelectionProvider` — **aplicado**.

---

## 8. Fix M-01 — causa técnica e diff

**Causa:** morph state + `PostToChatMorphLayer` viviam **dentro** de `BusinessSocialLanding`. Drawers são **irmãos** do landing no feed e recebiam `toggleConversationContextItem` direto → chip teleportado.

**Correção mínima:**
1. Extrair pipeline para `conversation-context-morph.tsx` (`useConversationContextMorph`)
2. `ConversationSelectionProvider` aceita `vertical` → expõe `toggleConversationContextItemWithMorph` + renderiza morph layer
3. Feeds: `vertical={config.model}` + drawers usam `toggleConversationContextItemWithMorph`
4. `BusinessSocialLanding`: consome morph do provider; fallback local só sem provider

**Arquivos tocados:** `conversation-context-morph.tsx` (novo), `conversation-selection-context.tsx`, `business-social-landing.tsx`, 12× `*-feed.tsx`.

**Validação:** `pnpm typecheck` ✅ · `pnpm qa:appointment` / `qa:events` — requer dev server local.

---

## 7. Pergunta gate (morph)

```txt
A viagem parece inevitável
ou o chip parece ter sido colocado por um sistema inteligente?
```

No feed **e drawers:** viagem física proxy chip → **inevitável**.

---

## Referências

- `PERCEPTUAL_INVARIANTS.md` §4 — morph preserves spatial continuity  
- `docs/ai-handoffs/composer-continuity-contract.md` — morph congelado  
- `WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md` — Etapa 1 ativa  

---

*M-01 corrigido — ruptura perceptível confirmada operacionalmente. Revalidação humana Sessão B recomendada para fechar WS-13 Etapa 1.*
