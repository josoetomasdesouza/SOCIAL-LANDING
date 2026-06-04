# WS-21 — Plano P0/P1 Protótipo Reversível

**Data:** 2026-06-04  
**Baseline:** `origin/main` @ `fc799d2`  
**ADR:** [`WS-21_COMPOSER_HYBRID_ARCHITECTURE_ADR.md`](WS-21_COMPOSER_HYBRID_ARCHITECTURE_ADR.md)  
**Challenge review:** [`WS-21_ADR_CHALLENGE_REVIEW.md`](WS-21_ADR_CHALLENGE_REVIEW.md)  
**Status:** Plano técnico — **sem implementação autorizada**

---

## Objetivo da POC

Estado reversível onde:

```txt
Feed editorial
    ↓
Thread in-flow (após engajamento)
    ↓
Composer sticky (compacto, viewport bottom)
```

Sem sheet expansivo (~90vh), sem scroll interno da thread, feed continua origem da conversa.

---

## Respostas às 10 perguntas

### 1. Qual deve ser o menor experimento possível?

**P0 (zero código):** paper prototype @ 320/390 — capturas anotadas do layout alvo (feed → thread → sticky), validando hierarquia antes de tocar Tier 1.

**P1 (menor spike de código):** um único fluxo Appointment, uma única variável:

```txt
Enviar 1ª mensagem de texto
→ thread aparece in-flow (após sections, antes do footer)
→ composer permanece compact (~62–124px)
→ sheet NÃO expande
```

**Explicitamente fora do P1 mínimo:**

- Remover drag/handle/collapsed (congelar em noop ou manter morto atrás da flag)
- Smoke-fume v2 completo (forçar `expansionProgress = 0` basta)
- Rollout das 11 verticais restantes
- Refactor de `conversational-ai.tsx` inteiro
- Mudanças de kernel/resolver/copy

**Superfície de ativação:**

```txt
/demo + Appointment + ?composer-layout=v2
```

Default permanece **v1** em todo o resto.

---

### 2. Como mover apenas a thread para in-flow sem quebrar o composer?

**Problema estrutural atual:** mensagens, typing, scroll e sheet height vivem dentro do mesmo `<section data-conversation-composer>` fixed em `conversational-ai.tsx` (~L1294–L1346).

**Estratégia P1 — portal + shell compacto (diff mínimo, reversível):**

| Camada | v1 (intacto) | v2 (P1) |
|--------|--------------|---------|
| **Shell sticky** | Handle + body scroll + rail + form | **Rail + form apenas** — altura fixa compact |
| **Thread** | Dentro do shell | **Portal** para anchor in-flow |
| **Estado** | `messages`, `isTyping` permanecem em `ConversationalAI` | Mesmo — sem lift para context ainda |

**Passos conceituais (ordem):**

1. `BusinessSocialLanding` insere anchor in-flow **dentro de `<main>`**, após sections, **antes** do fechamento de `main`:

   ```txt
   sections editoriais
   → [data-conversation-thread-anchor]  ← novo
   ```

2. `ConversationalAI` com layout v2:
   - Não renderiza `messagesContentRef` / scroll interno no shell
   - Portaliza `renderConversationMessage` + typing para o anchor
   - Desliga `shouldApplySheetHeight`, `manualSnapHeight`, auto-grow quando v2
   - Shell mantém `data-conversation-composer`, chip rail, form, métricas compact

3. **Engajamento:** `isConversationSessionActive` continua gate — thread in-flow só aparece após 1º send (mesma semântica atual).

4. **Scroll:** após resposta AI, `scrollIntoView` no último turno **no documento** (substituto de `messagesEndRef` interno) — page scroll, não caixa.

5. **Clearance:** `publishComposerScrollMetrics` mede **só o shell compact** — thread in-flow **não** entra no footprint (ADR §7.5).

**Por que portal e não lift de estado?**

- Lift para `ConversationSelectionContext` = refactor transversal — proibido no P1
- Novo componente monolítico = duplicação
- Portal = reversível com flag; v1 path byte-identical quando flag off

**Risco controlado:** portal quebra se anchor não montado — guard: só portalizar quando anchor exists + v2 active.

---

### 3. Como preservar o morph target atual?

Morph **não depende** do sheet 90vh — depende de:

- `[data-conversation-composer="true"]` visível no viewport bottom
- `[data-conversation-context-chip]` / `[data-conversation-context-chip-target]` no shell

**Regras P1:**

| Regra | Ação |
|-------|------|
| Shell sticky permanece fixed bottom | ✅ Inalterado |
| `data-conversation-composer` no shell compact | ✅ Nunca mover para thread in-flow |
| Altura shell **estável** pós-morph (~124px chip+chrome) | ✅ Proibir expand-on-engage em v2 |
| Chip rail | Permanece no shell (compact ou pós-engage — **não** na thread) |
| `getComposerChipRect()` | Continua query no DOM do shell — validar pós-portal |
| Timings 480ms / 420ms | **Não tocar** |

**Gate obrigatório P1:** fluxo 2 da matriz Appointment — long-press post → morph → chip @ 320/390 side-by-side v1 vs v2.

**Anti-padrão:** colocar chip target na thread in-flow — morph terminaria longe do composer e quebraria M-01.

---

### 4. Como preservar hidden/overlay modes?

Modes são **literais congelados** aplicados em `business-social-landing.tsx` (~L787–L944) — **nenhuma mudança de policy no P1**.

| Mode | v2 comportamento P1 |
|------|---------------------|
| `default` | Sticky visible + thread in-flow quando engajado |
| `overlay` | Sticky z-[70]; thread **oculta ou atrás** do feed drawer (decisão P1: **ocultar thread** — menos risco que scroll atrás; ADR §7.4 permite ambos — P2+ pode reavaliar) |
| `hidden` | Sticky `hidden` + thread anchor **`hidden`** + footprint **0** |

**Implementação conceitual:**

- `BusinessSocialLanding` passa `composerMode` para anchor wrapper
- Anchor recebe `hidden` quando `composerMode === "hidden"` OU `(drawerOpen && !feedDrawerOpen)`
- `trackCompactFootprint={shouldTrackComposerFootprint}` — **já existe**, manter

**Appointment matrix (já codificada em `appointment-feed.tsx`):**

```txt
arrival / datetime / confirmation → hidden
service / professional → overlay
idle → default
```

**Gates P1:** fluxos 5–6 da matriz — chegada drawer + feed drawer coexistence (WS-10B checklist).

---

### 5. Como preservar smoke-fume?

**P1 — preservação mínima (suficiente para spike):**

| Elemento | P1 |
|----------|-----|
| Compact shell `smoke-fume` | Forçar `expansionProgress = 0` + `forceCompactShell = true` em v2 |
| `data-composer-surface="smoke-fume"` | Mantido no shell sticky |
| Page mask z-29 full viewport | **Desligar ou reduzir a zero** em v2 engaged — full dim conflita feed-first |
| Gradiente expanded | **Fora do P1** — Fase smoke-fume v2 (P2 do protótipo) |

**P2 smoke-fume v2 (pós-P1 GO):**

- Novo sinal: `threadEngagedProgress` (0→1 na 1ª expansão in-flow) substitui `expansionProgress` sheet-based
- Gradiente **local** na junção thread↔composer (~80–120px), não máscara full-page
- Emendar P-06a em `PERCEPTUAL_INVARIANTS` antes de merge smoke v2

**Rollback smoke:** padrão existente `?composer-smoke=off` + localStorage — independente da flag layout.

---

### 6. Como evitar regressão nas 12 verticais?

| Mecanismo | Detalhe |
|-----------|---------|
| **Flag default v1** | Zero mudança perceptiva fora do piloto |
| **Ativação explícita** | Só Appointment passa `composerLayout="v2"` ou lê query |
| **`composerMode` intacto** | Writers em 9+ feeds **não** editados no P1 |
| **BusinessSocialLanding** | Branch v2 só quando prop/flag — demais verticais usam path v1 |
| **QA por vertical** | P1: **não** rodar matrix 12 — smoke `pnpm qa:events` global basta |
| **Rollout Fase 8** | 1 vertical por PR **após** Appointment P3 GO |

**Matriz de isolamento:**

```txt
/demo?composer-layout=v2  +  selector Appointment  →  v2
/demo                     +  qualquer vertical       →  v1
/[slug], /, /criar        →  v1 (sem expor flag)
```

---

### 7. Como fazer Appointment-only primeiro?

**Wiring mínimo:**

1. `app/demo/page.tsx` — sync query `composer-layout` → localStorage (espelhar padrão `composer-smoke` existente)
2. `appointment-feed.tsx` — ler override; passar prop para `BusinessSocialLanding`
3. **Não** alterar `ecommerce-feed.tsx`, `gym-feed.tsx`, etc.

**Por que Appointment:**

- Resolver real (`createAppointmentConversationResolverWithDialogue`) — não mock
- `pnpm qa:appointment` 28/28 — gate automatizado
- WS-10B deferência chegada já calibrada
- Morph + feed drawer + booking overlay — matrix Tier 1 completa numa vertical

**Barba Negra flows P1 obrigatórios:**

1. Idle @ fold
2. Long-press → morph → chip
3. 1ª pergunta editorial
4. Multi-turn 3+ msgs — monoscroll
5. Chegada drawer — hidden
6. Feed drawer — overlay
7. Reload — histórico localStorage (comportamento documentado, não otimizar)

---

### 8. Como medir sucesso perceptivo?

**Camada A — observação humana @ device (bloqueante)**

| ID | Critério | Método | Pass |
|----|----------|--------|------|
| S-01 | Morph indistinguível v1 | Side-by-side 320/390 video | Visual match |
| S-02 | Idle: feed respira | WS-13 fluxo 1 | Sem sensação app |
| S-03 | Pós-1ª msg: “conversa no fim do feed” | Escala 1–5 piloto interno | ≥ 4/5 |
| S-04 | Chegada deferida | WS-10B checklist | Composer hidden + restore |
| S-05 | Feed drawer coexistence | WS-10B | Sem dual-interface |
| S-06 | Monoscroll | Scroll 390px — dedo no feed atravessa thread | Zero scroll-in-scroll |
| S-07 | Smoke-fume reconhecível | Capturas vs baseline WS-13 | Identidade preservada (compact) |

**Camada B — automatizado (bloqueante merge P2+)**

| Gate | Comando |
|------|---------|
| Events | `pnpm qa:events` 8/8 |
| Appointment | `pnpm qa:appointment` 28/28 |
| TS budget | `pnpm ts:budget` PASS |

**Camada C — artefatos**

- Capturas 320 + 390 (idle, pós-1º turno, multi-turn, chegada)
- Notas WS-13: hesitação · naturalidade · quebra
- Vídeo side-by-side v1 vs v2 (30–60s)

**Anti-métrica (fail imediato):**

```txt
“Parece app de chat / assistente” pior que baseline fc799d2
```

---

### 9. Quais arquivos provavelmente serão impactados?

**Tier 1 — P1 spike (toque provável)**

| Arquivo | Natureza do impacto |
|---------|---------------------|
| `components/business/conversational-ai.tsx` | Branch v2: portal thread, shell compact-only, desligar sheet height |
| `components/business/business-social-landing.tsx` | Anchor in-flow, prop layout, sync hide thread c/ modes |
| `components/business/appointment/appointment-feed.tsx` | Pass prop / ler flag piloto |
| `app/demo/page.tsx` | Sync query `composer-layout` |

**Tier 2 — P2 piloto (pós-P1 GO)**

| Arquivo | Natureza |
|---------|----------|
| `lib/ui/composer-surface-material.ts` | `threadEngagedProgress`, mask v2 |
| `lib/ui/composer-scroll-clearance.ts` | Confirmar footprint só compact |
| `components/business/conversation-selection-context.tsx` | Opcional: `threadVisible` — só se portal insuficiente |

**Tier 3 — verificação, mínimo ou zero diff P1**

| Arquivo | Nota |
|---------|------|
| `components/business/conversation-context-morph.tsx` | Verificar rects — esperado zero diff |
| `components/business/post-to-chat-morph-layer.tsx` | Idem |
| `components/business/action-drawer.tsx` | Idem — drawer sheet ≠ composer |
| `lib/ui/drawer-layout.ts` | Idem |
| Outros `*-feed.tsx` (11 verticais) | **Zero diff** até Fase 8 |

**QA / scripts**

| Arquivo | Natureza |
|---------|----------|
| `scripts/convergence/appointment-ai-resolver-validation.mjs` | Validar selectors `[data-conversation-composer]` ainda válidos |
| `scripts/visual/ws13-session-b-observation.mjs` | Rebaseline fluxo 5 (sem `expanded-chat` literal) |

**Docs (PRs separados doc-only)**

| Arquivo | Quando |
|---------|--------|
| `docs/ai-handoffs/COMPOSER_BEHAVIOR_SPEC.md` | Fase 0 — v2 draft |
| `docs/ai-handoffs/composer-continuity-contract.md` | Delta v2 |
| `PERCEPTUAL_INVARIANTS` P-06a | Antes smoke-fume v2 |
| `docs/ai-handoffs/EVOLUTION_LOG.md` | GO humano pós-P3 |

**Não tocar no WS-21 P0/P1:**

- `lib/conversation-kernel/**`
- `app/api/appointment/**`
- WS-20 / LLM bounded
- Morph timings / z-index stack

---

### 10. Qual sequência de PRs minimiza risco?

```txt
Doc → infra flag → thread portal → modes → smoke v2 → hygiene → vertical rollout
```

Cada PR: branch isolada, revertível, CI verde, **uma intenção**.

| PR | Branch sugerida | Escopo | Gate merge |
|----|-----------------|--------|------------|
| **D1** | `docs/ws-21-composer-hybrid-adr` | ADR + Challenge Review + **este plano** | Review humano |
| **D2** | `docs/composer-behavior-spec-v2-draft` | `COMPOSER_BEHAVIOR_SPEC` v2 draft + delta continuity | Frozen zone review |
| **R0** | `workstream/ws-21-composer-layout-flag` | Query/localStorage `composer-layout`, prop plumbing, **zero mudança visual** default v1 | CI green |
| **R1** | `workstream/ws-21-p1-thread-portal` | Portal thread + shell compact; Appointment + flag v2 only | S-06 manual + morph smoke |
| **R2** | `workstream/ws-21-p1-modes` | Thread hide on `hidden`/`overlay`; WS-10B matrix | S-04, S-05 |
| **R3** | `workstream/ws-21-p2-smoke-v2` | Mask local, P-06a, capturas | S-07 |
| **R4** | `workstream/ws-21-p2-appointment-pilot` | Hardening + `qa:appointment` + observação P3 | S-01…S-07 + 28/28 |
| **R5** | `workstream/ws-21-hygiene` | Remover sheet dead code, collapsed, auto-grow — **só pós-GO P3** | qa:events |
| **R6…** | `workstream/ws-21-vertical-*` | 1 vertical por PR | Matrix vertical |

**Paralelo proibido:** WS-20, kernel, copy P0/P1 Appointment no mesmo branch.

**Ordem interna P1 (dentro de R1):**

1. Anchor in `BusinessSocialLanding`
2. Flag branch em `ConversationalAI`
3. Portal messages + desligar sheet expand
4. Page scroll-to-turn
5. Footprint compact-only
6. Device check morph
7. `qa:appointment`

---

## Estratégia de prototipação

### Princípios

```txt
Observação antes de código Tier 1
Diff mínimo — flag reversível — Appointment only
v1 path intocado quando flag off
Não confundir container (WS-21) com comportamento (WS separado)
```

### Fases

| Fase | Entrega | Duração indicativa | GO para próxima |
|------|---------|-------------------|-----------------|
| **P0 Paper** | Capturas anotadas 320/390 — hierarquia feed→thread→sticky | 0.5–1 sessão | Humano valida layout |
| **P1 DOM spike** | R0 + R1 + R2 — flag + portal + modes | 1–2 sessões eng | S-01, S-04, S-06 PASS |
| **P2 Appointment piloto** | R3 + R4 — smoke v2 + QA + observação | 1–2 sessões | S-01…S-07 + qa:appointment |
| **P3 Side-by-side** | Vídeo v1 vs v2 — decisão GO/NO-GO humano | 0.5 sessão | GO → hygiene + rollout |

### Fallback (ADR §Decisão)

Se P2 falhar S-03 ou S-06:

```txt
Sheet teto ~40vh (fallback ADR 🟡)
```

Antes de abandonar híbrido — spike isolado 40vh, não revert total.

---

## Gates de validação

### Gate G0 — Início P1 código

- [ ] ADR merged (D1)
- [ ] Plano P0/P1 reviewed (este doc)
- [ ] P0 paper capturas aprovadas
- [ ] Branch **não** `main`
- [ ] Working tree limpo de WS-20 / LLM local

### Gate G1 — Merge R1 (thread portal)

- [ ] Flag default v1 — `/demo` Ecommerce unchanged
- [ ] Appointment `?composer-layout=v2`: 1ª msg → thread in-flow, composer compact
- [ ] Morph fluxo 2 @ 320 — target não (0,0)
- [ ] Monoscroll manual S-06

### Gate G2 — Merge R2 (modes)

- [ ] Chegada: composer + thread hidden
- [ ] Close arrival: restore default
- [ ] Feed drawer: overlay, sem competição visual
- [ ] Footprint 0 @ hidden

### Gate G3 — GO implementação estrutural (pós-P3)

- [ ] S-01…S-07 PASS
- [ ] `pnpm qa:appointment` 28/28
- [ ] Side-by-side video aprovado
- [ ] EVOLUTION_LOG + GO humano frozen zone

---

## Critérios de rollback

### Rollback imediato (revert PR)

| ID | Condição |
|----|----------|
| RB-01 | Morph target (0,0) ou fluidez degradada |
| RB-02 | Composer não restaura após `hidden` → drawer close |
| RB-03 | Feed drawer + composer ilegíveis |
| RB-04 | Scroll lock preso |
| RB-05 | Regressão z-index morph/drawer/story |
| RB-06 | `qa:appointment` ou `qa:events` fail sem fix 1 ciclo |
| RB-07 | Observação: “app de chat” **pior** que baseline |

### Rollback operacional (sem revert)

```txt
?composer-layout=v1  ou remover query/localStorage
→ runtime v1 instantâneo
```

Flag **nunca** default v2 em produção até G3.

### Rollback planejado pós-GO

Remover path v1 + flag — **só após** Fase 9 ADR (vertical rollout completo ou decisão explícita).

---

## Riscos técnicos e perceptivos

| ID | Risco | Sev | Mitigação |
|----|-------|-----|-----------|
| RT-01 | Portal timing — anchor unmounted on first paint | Média | Render anchor always; portal conditional |
| RT-02 | `conversational-ai.tsx` combinatorial explosion | **Alta** | Flag branch clara; extrair **só** após GO — não no P1 |
| RT-03 | Thread empurra footer/seções Appointment | Média | Anchor após sections, antes footer; scroll anchor |
| RT-04 | Perda collapsed UX sem substituto | Média | Aceitar no P1; spec v2 define scroll-away |
| RT-05 | `qa:appointment` timing — AI turn visibility | Média | Selectors no shell; `waitForLastAiTurnReady` adaptado se thread muda DOM |
| RT-06 | Dual scroll residual (overflow hidden no shell) | Média | Remover `overflow-y-auto` do body v2; test S-06 |
| RT-07 | Page mask z-29 ghost dim | Baixa | Zero mask v2 P1 |
| RT-08 | Confundir sheet drawer vs composer em review | Baixa | Glossário no PR description |
| RP-01 | Thread parece “bloco ChatGPT” no feed | **Alta** | Largura coluna main; tipografia existente; sem card 90vh |
| RP-02 | Perda identidade smoke-fume | Média | Compact intact P1; smoke v2 P2 |
| RP-03 | Morph feels disconnected se chip sobe | Média | Chip permanece shell; altura estável |
| RP-04 | “Conversa no fim” vira “conversa no meio” se anchor errado | Média | Anchor **após** última section editorial |

---

## Diagrama alvo (POC)

```txt
┌────────────────────────────────────── main (page scroll) ──┐
│  BusinessFeedIntro · Hero · Stories                          │
│  Sections editoriais (Appointment)                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  THREAD IN-FLOW (portal target)                        │  │
│  │  user / ai turns · typing · visual blocks              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
┌──────────────── FIXED / STICKY ──────────────────────────────┐
│  z-30  [data-conversation-composer] — COMPACT ONLY           │
│  chip rail (idle) · input · send                             │
│  smoke-fume compact · NO sheet body · NO internal scroll     │
└──────────────────────────────────────────────────────────────┘
         morph z-65 → chip in shell (unchanged)
```

---

## Decisão operacional desta sessão

| Item | Status |
|------|--------|
| Implementar código | **NÃO** |
| PR doc-only (ADR + Challenge + Plano) | Pronto para humano |
| Iniciar P0 paper | Próximo passo humano |
| P1 código | Após P0 GO + G0 |

---

*WS-21 P0/P1 · Baseline `fc799d2` · Plano only — não autoriza merge Tier 1.*
