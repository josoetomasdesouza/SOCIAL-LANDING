# REAL_USAGE Re-run Plan — `/demo`

**Data:** 2026-05-23  
**Baseline alvo:** `main` @ `e002921` (publicado)  
**Baseline anterior:** `REAL_USAGE_VALIDATION.md` (pré-P0-03, pré-bridges Stack B)  
**Modo:** observação — **não alterar código durante execução**

---

## Objetivo

Revalidar comportamento real da plataforma após:

- P0-03 (`composerMode: overlay` no feed drawer BSL)
- P0-02 Fase 1 (provider 12/12)
- CustomContentBridge
- InstrumentedDrawerBridge (7 drawers Stack B)
- RU-01 reclassificado P2

**Saída esperada:** `REAL_USAGE_RE_RUN_RESULTS.md` (preencher após execução — não criado nesta fase).

---

## Pré-requisitos

| Item | Requisito |
|------|-----------|
| Branch | `main` @ `e002921` — **sem** working tree contaminado |
| Ambiente | `NODE_ENV=development`, `/demo` |
| Ferramentas | Event Debug Panel, `window.__SURFACE_SHADOW__`, Playwright (opcional) |
| Viewports | Mobile 390×844, Desktop 1280×800 |
| Kill switches | Event bus ON, shadow ON (DEV) |

**Bloqueio:** não executar sobre ecommerce WIP local ou morph-layer local modificado.

---

## Metodologia

### Por teste registrar

| Campo | Descrição |
|-------|-----------|
| ID | RU-R-xx |
| Ação humana simulada | Passo a passo |
| Vertical(is) | Onde executar |
| Eventos esperados | Lista tipada |
| Eventos observados | Preencher na execução |
| Shadow esperado | predictedComposerMode, layers |
| Divergência esperada | SD-xx, RU-xx, ou none |
| Classificação inicial | bug / observacional / tolerância temporal / VERTICAL_SPECIFIC |
| Risco perceptivo | baixo / médio / alto |
| Risco arquitetural | baixo / médio / alto |
| Decisão | observar / bloquear / documentar / investigar |

### Classificação de decisão

- **observar** — registrar, não agir
- **documentar** — atualizar SURFACE_DIVERGENCES ou GLOBAL_CONTRACTS
- **investigar** — sessão humana adicional, timeline temporal
- **bloquear** — impede gate Truth Mapping (só se bug reproduzido)

---

## Checklist observacional (20 testes)

### RU-R-01 — Troca de vertical

| | |
|---|---|
| **Ação** | `/demo` → appointment → reload selector → ecommerce |
| **Vertical** | appointment, ecommerce |
| **Eventos esperados** | `feed.vertical.changed` (×2), context reset implícito |
| **Shadow esperado** | VERTICAL_SET, layers reset |
| **Divergência esperada** | none |
| **Classificação inicial** | observacional |
| **Risco perceptivo** | baixo |
| **Risco arquitetural** | baixo — traceId reset by design |
| **Decisão** | observar |

---

### RU-R-02 — Feed drawer open/close (Stack A)

| | |
|---|---|
| **Ação** | ecommerce → tap PostCard conteúdo → Fechar (exact) |
| **Vertical** | ecommerce |
| **Eventos esperados** | `drawer.opened`, `surface.opened`, `composer.mode.changed` to overlay, `drawer.closed`, `surface.closed`, composer restore |
| **Shadow esperado** | overlay while open; SD-01 **cleared** pós-P0-03 |
| **Divergência esperada** | SD-02 close id possível |
| **Classificação inicial** | observacional se SD-02 only |
| **Risco perceptivo** | médio — validar z-index composer |
| **Risco arquitetural** | baixo |
| **Decisão** | documentar SD-02 se persistir |

---

### RU-R-03 — Drawers Stack B (bridges)

| | |
|---|---|
| **Ação** | personal → abrir contact drawer → fechar; influencer links; institutional team |
| **Vertical** | personal, influencer, institutional |
| **Eventos esperados** | `drawer.opened/closed` via bridge, `surface.opened/closed` paired |
| **Shadow esperado** | layers registradas; composerMode policy local |
| **Divergência esperada** | none se bridge OK |
| **Classificação inicial** | observacional |
| **Risco perceptivo** | baixo |
| **Risco arquitetural** | médio — bridge ≠ ownership final |
| **Decisão** | observar — baseline pré-migração |

---

### RU-R-04 — Long-press / morph (PostCard)

| | |
|---|---|
| **Ação** | appointment Tutoriais PostCard long-press ≥420ms |
| **Vertical** | appointment, ecommerce, courses |
| **Eventos esperados** | `context.item.selected`, `morph.started`, RAF visible, `morph.completed` |
| **Shadow esperado** | morphActive true during animation |
| **Divergência esperada** | none |
| **Classificação inicial** | GLOBAL_REQUIRED MF-01–05 |
| **Risco perceptivo** | alto — Tier 1 |
| **Risco arquitetural** | alto |
| **Decisão** | bloquear mapping se morph quebrado |

---

### RU-R-05 — Composer context chips

| | |
|---|---|
| **Ação** | long-press 2 PostCards diferentes → verificar chips → remover um |
| **Vertical** | ecommerce |
| **Eventos esperados** | `context.item.selected`, `context.item.deselected` |
| **Shadow esperado** | n/a |
| **Divergência esperada** | none |
| **Classificação inicial** | CP-03 |
| **Risco perceptivo** | médio |
| **Decisão** | observar |

---

### RU-R-06 — Primeira mensagem composer

| | |
|---|---|
| **Ação** | digitar e enviar primeira mensagem |
| **Vertical** | qualquer com composer |
| **Eventos esperados** | `ai.surface.opened` (primeira msg) |
| **Shadow esperado** | aiSurfaceSessionOpen true |
| **Divergência esperada** | none |
| **Classificação inicial** | observacional |
| **Decisão** | observar |

---

### RU-R-07 — WhatsApp / agendamento

| | |
|---|---|
| **Ação** | appointment WhatsApp; realestate WhatsApp se presente |
| **Vertical** | appointment, realestate |
| **Eventos esperados** | appointment: `whatsapp.clicked`; realestate: **gap** EV-O1 |
| **Shadow esperado** | n/a |
| **Divergência esperada** | P2-01 realestate |
| **Classificação inicial** | observacional |
| **Risco perceptivo** | baixo |
| **Decisão** | documentar P2-01 |

---

### RU-R-08 — Scroll durante morph

| | |
|---|---|
| **Ação** | iniciar morph → scroll feed antes de complete |
| **Vertical** | ecommerce |
| **Eventos esperados** | `morph.started`, scroll cancel, `morph.completed` |
| **Shadow esperado** | morphActive false after complete |
| **Divergência esperada** | none |
| **Classificação inicial** | MF-03 |
| **Risco perceptivo** | alto |
| **Decisão** | bloquear se morph stuck |

---

### RU-R-09 — Close por botão Fechar

| | |
|---|---|
| **Ação** | feed drawer → `getByRole('button', { name: 'Fechar', exact: true })` |
| **Vertical** | realestate, ecommerce |
| **Eventos esperados** | `drawer.closed`, overflow `""` |
| **Shadow esperado** | layer closed; SD-02 possible |
| **Divergência esperada** | RU-01 refutado se overflow limpo |
| **Classificação inicial** | DR-02 |
| **Risco perceptivo** | alto (realestate histórico) |
| **Decisão** | documentar — confirma RU-01 P2 |

---

### RU-R-10 — Close por Escape

| | |
|---|---|
| **Ação** | abrir ActionDrawer produto → Escape |
| **Vertical** | ecommerce |
| **Eventos esperados** | `drawer.closed` |
| **Shadow esperado** | layer removed |
| **Divergência esperada** | none |
| **Classificação inicial** | DR-05 |
| **Decisão** | observar |

---

### RU-R-11 — Close por backdrop

| | |
|---|---|
| **Ação** | feed drawer mobile → tap backdrop |
| **Vertical** | ecommerce, realestate |
| **Eventos esperados** | `drawer.closed` **se** componente suporta |
| **Shadow esperado** | layer closed if closes |
| **Divergência esperada** | P0-01 doc: backdrop pode **não** fechar feed drawer mobile |
| **Classificação inicial** | VERTICAL_SPECIFIC / UX |
| **Risco perceptivo** | médio — overflow correto se drawer permanece |
| **Decisão** | documentar — não confundir com scroll bug |

---

### RU-R-12 — Troca vertical com drawer aberto

| | |
|---|---|
| **Ação** | abrir drawer → browser back ou reload selector (não há in-app back) |
| **Vertical** | appointment |
| **Eventos esperados** | unmount cleanup; overflow restore via effect cleanup |
| **Shadow esperado** | reset |
| **Divergência esperada** | none esperado |
| **Classificação inicial** | observacional |
| **Risco arquitetural** | médio — multi-drawer sem ref-count |
| **Decisão** | investigar se overflow stuck |

---

### RU-R-13 — Mobile viewport

| | |
|---|---|
| **Ação** | sessão completa 390×844 — scroll, drawer, morph, composer |
| **Vertical** | 3 amostra: appointment, personal, ecommerce |
| **Eventos esperados** | coerentes, sem storm |
| **Shadow esperado** | mobileViewport true |
| **Divergência esperada** | none |
| **Classificação inicial** | MB-01–05 |
| **Decisão** | observar |

---

### RU-R-14 — Keyboard open/close

| | |
|---|---|
| **Ação** | mobile emulated → focus composer input → blur |
| **Vertical** | appointment |
| **Eventos esperados** | visualViewport resize (probe) |
| **Shadow esperado** | keyboardVisible toggle |
| **Divergência esperada** | none |
| **Classificação inicial** | CP-04, MB-03 |
| **Risco perceptivo** | alto mobile |
| **Decisão** | investigar em device físico se jump |

---

### RU-R-15 — Appointment hero sem morph

| | |
|---|---|
| **Ação** | long-press hero serviço (topo) |
| **Vertical** | appointment |
| **Eventos esperados** | context possível; **sem** morph.started |
| **Shadow esperado** | morphActive false |
| **Divergência esperada** | P1-01 — VERTICAL_SPECIFIC / gap conhecido |
| **Classificação inicial** | observacional — não bug de plataforma |
| **Decisão** | documentar |

---

### RU-R-16 — Custom modules morph incompleto

| | |
|---|---|
| **Ação** | institutional custom section cards; influencer collab |
| **Vertical** | institutional, influencer |
| **Eventos esperados** | variável — auditar wiring |
| **Shadow esperado** | n/a |
| **Divergência esperada** | P1-03 parcial |
| **Classificação inicial** | observacional |
| **Decisão** | documentar por módulo |

---

### RU-R-17 — Ecommerce composer policy

| | |
|---|---|
| **Ação** | product drawer → overlay; cart; checkout → hidden |
| **Vertical** | ecommerce |
| **Eventos esperados** | `composer.mode.changed` sequence |
| **Shadow esperado** | align SD-04 |
| **Divergência esperada** | SD-04 observacional |
| **Classificação inicial** | priority rules |
| **Risco arquitetural** | médio |
| **Decisão** | investigar timeline |

---

### RU-R-18 — Booking overlay (appointment)

| | |
|---|---|
| **Ação** | Agendar agora → booking steps → close |
| **Vertical** | appointment |
| **Eventos esperados** | overlay/hidden transitions, drawer events |
| **Shadow esperado** | SD-03 aligned |
| **Divergência esperada** | low |
| **Classificação inicial** | DR-O2, CP-O2 |
| **Decisão** | observar |

---

### RU-R-19 — Realestate scroll lock

| | |
|---|---|
| **Ação** | paths A–F de P0-01_SCROLL_LOCK_DIAGNOSIS.md |
| **Vertical** | realestate |
| **Eventos esperados** | drawer events; overflow limpo pós-close OK |
| **Shadow esperado** | n/a |
| **Divergência esperada** | RU-01 false positive se close exact |
| **Classificação inicial** | P2 arquitetural ref-count |
| **Risco perceptivo** | baixo hoje; médio latente |
| **Decisão** | documentar — não P0 |

---

### RU-R-20 — Influencer media-kit trigger gap

| | |
|---|---|
| **Ação** | procurar UI que abre media-kit drawer |
| **Vertical** | influencer |
| **Eventos esperados** | **nenhum** se trigger ausente |
| **Shadow esperado** | n/a |
| **Divergência esperada** | P2-07 — bridge wired, UI gap |
| **Classificação inicial** | observacional |
| **Decisão** | documentar — não bloqueia bridge |

---

## Matriz de execução sugerida

| Sessão | Testes | Duração est. |
|--------|--------|--------------|
| A — Stack A core | RU-R-02,04,08,09,17,18 | 45min |
| B — Stack B bridges | RU-R-03,16,20 | 30min |
| C — Mobile/keyboard | RU-R-13,14,11 | 30min |
| D — Edge cases | RU-R-01,07,10,12,15,19 | 45min |
| E — Automatizado | Playwright subset RU-R-02,04,09 | 20min |

**Total estimado:** ~2.5h humano + 20min auto.

---

## Critérios GO pós re-run

| Critério | Threshold |
|----------|-----------|
| Morph RAF | ≥25 frames verticals com PostCard |
| SD-01 | Cleared ou waived documentado |
| RU-01 | Confirmado false positive |
| Stack B events | 7/7 drawers emitem open/close |
| Blockers novos | 0 Tier 1 |
| Event storm | 0 |

---

## Artefatos de saída

Após execução, criar:

1. `REAL_USAGE_RE_RUN_RESULTS.md` — tabela preenchida RU-R-01…20
2. Atualizar `SURFACE_DIVERGENCES.md` se SD-01 status mudou
3. Atualizar `BEHAVIOR_FIX_PRIORITY.md` se reclassificação
4. Input para `NEXT_EVOLUTION_DECISION.md` revisão

---

## Referências

- `REAL_USAGE_VALIDATION.md` (baseline anterior)
- `P0-01_SCROLL_LOCK_DIAGNOSIS.md`
- `SURFACE_DIVERGENCES.md`
- `GLOBAL_CONTRACTS.md`
