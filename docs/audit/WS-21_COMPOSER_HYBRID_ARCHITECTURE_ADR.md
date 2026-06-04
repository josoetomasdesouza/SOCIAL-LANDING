# ADR — WS-21 Composer Hybrid Architecture

**Status:** Proposed (aguardando GO humano perceptivo)  
**Data:** 2026-06-04  
**Baseline:** `origin/main` @ `fc799d2`  
**Precedentes:** PR #84 (Appointment anti-robô) · PR #85 (Operational Handoff)  
**Origem:** Auditoria Sheet vs Inline Conversation (sessão 2026-06-04)  
**Autoridade:** Decisão arquitetural Tier 1 — exige protocolo frozen + observação WS-13 antes de merge estrutural

---

## Metadados

| Campo | Valor |
|-------|-------|
| **Iniciativa** | **WS-21 — Composer Hybrid (Sticky + Thread In-Flow)** |
| **Tipo** | Architecture Decision Record (ADR) |
| **Escopo** | Container espacial e contrato perceptivo do composer |
| **Fora de escopo** | Kernel, classifier, LLM, WS-20, copy de respostas, runtime Appointment server |
| **Supersedes** | Parcialmente a semântica “sheet expansivo” de `COMPOSER_BEHAVIOR_SPEC.md` (v1) — ver §7 |
| **Documentos relacionados** | [`WS-21_ADR_CHALLENGE_REVIEW.md`](WS-21_ADR_CHALLENGE_REVIEW.md) · [`WS-21_P0_P1_PROTOTYPE_PLAN.md`](WS-21_P0_P1_PROTOTYPE_PLAN.md) · `COMPOSER_BEHAVIOR_SPEC.md` · `composer-continuity-contract.md` · `PERCEPTUAL_LANGUAGE_SYSTEM.md` · `CONTINUITY_HANDOFF_AUDIT.md` · `OPERATIONAL_HANDOFF_BASELINE.md` |

---

## 1. Nome oficial da iniciativa

**WS-21 — Composer Hybrid Architecture**

Subtítulo operacional:

```txt
Sticky composer + thread in-flow
(remoção do sheet expansivo; preservação do patrimônio feed-first)
```

Identificador curto em PRs/branches: `workstream/ws-21-composer-hybrid`

---

## 2. Problema que estamos resolvendo

### Problema principal (confirmado pela auditoria)

A experiência conversacional transmite, em momentos-chave, sensação de **fluxo guiado / painel de assistente** — não porque o composer seja fixo, mas porque o **sheet expansivo** cria uma segunda superfície sobre o feed:

- corpo de conversa com scroll interno e teto ~90vh;
- máscara full-page que escurece o feed;
- metáfora de widget (handle, snap compact/medium/expanded, collapsed/preview);
- thread isolada do fluxo editorial da coluna.

### Problema secundário (fora do escopo WS-21, mas acoplado perceptivamente)

Comportamentos dentro do container (typing performático, blocos transacionais inline, placeholders pedagógicos) amplificam sensação de script. **WS-21 não substitui** trabalho de comportamento — mas remove o container que **maximiza** essa sensação.

### Problema que explicitamente **não** estamos resolvendo neste WS

- Qualidade semântica das respostas (WS-19A/B, P0/P1 fechados @ `fc799d2`).
- LLM bounded rewrite (WS-20 — frente separada).
- Redesign visual global (glass, radius, tipografia).

### Pergunta gate (PERCEPTUAL_LANGUAGE_SYSTEM)

```txt
Esta mudança aprofunda presença contextual
ou transforma a experiência em utilitário?
```

**Resposta pretendida:** aprofunda presença — conversa como continuação do feed, não app de chat sobreposto.

---

## 3. Estado atual

### Modelo arquitetural (v1 — pós `fc799d2`)

```txt
┌─────────────────────────────────────┐
│  Feed editorial (main scroll)        │
│  hero · stories · sections · footer  │
│  padding via --composer-scroll-clearance
└─────────────────────────────────────┘
         ↑ máscara z-29 (smoke-fume)
┌─────────────────────────────────────┐
│  ConversationalAI — FIXED bottom     │
│  · idle: compact + chip rail         │
│  · engaged: sheet expande até ~90vh  │
│  · scroll INTERNO da thread          │
│  · snap + drag + collapsed states    │
└─────────────────────────────────────┘
```

### Contratos vigentes

| Contrato | Estado |
|----------|--------|
| `composerMode`: `default` \| `overlay` \| `hidden` | ✅ Maduro · 9+ writers por vertical |
| Morph post → chip (480ms / 420ms) | ✅ Patrimônio Tier 1 |
| `--composer-scroll-clearance-px` | ✅ Publicado via footprint metrics |
| Smoke-fume surface material | ✅ Identidade perceptiva |
| Deferência chegada (`hidden` @ arrival) | ✅ WS-10B |
| Coexistência feed drawer (`overlay` z-70) | ✅ Calibrado |
| z-index stack 29→30/60/70→65→50→100 | ✅ Frozen |

### Diagnóstico resumido

| Elemento | Avaliação |
|----------|-----------|
| Composer **fixo compact** idle | ✅ Alinhado feed-first |
| Sheet **expansivo** + scroll interno | ❌ Causa raiz perceptiva |
| Migração **inline pura** ChatGPT | ❌ Rejeitada — conflita feed-first |
| **Híbrido** sticky + in-flow | ✅ Candidata superior |

---

## 4. Estado desejado

### Modelo arquitetural alvo (v2 — WS-21)

```txt
┌─────────────────────────────────────┐
│  Feed editorial                     │
│  (hero, stories, sections)          │
├─────────────────────────────────────┤
│  Thread in-flow (nasce após engaj.) │
│  · turnos na coluna central         │
│  · scroll da PÁGINA, não caixa     │
│  · cresce para cima, empurra footer │
├─────────────────────────────────────┤
│  Composer STICKY (viewport bottom)  │
│  · compacto · chip rail · input     │
│  · smoke-fume local (não full dim)│
│  · SEM sheet 90vh · SEM scroll int. │
└─────────────────────────────────────┘
```

### Contrato perceptivo alvo

| Princípio | Enunciado |
|-----------|-----------|
| **Feed-first** | Primeiro paint = presença editorial; conversa não ocupa fold |
| **Continuidade gestual** | Morph post → chip → input permanece cadeia sagrada |
| **Monoscroll** | Um eixo de scroll principal na coluna; sem caixa dentro de caixa |
| **Observacional → conversacional** | Idle = barra mínima; engajamento = thread aparece **abaixo** do feed, **acima** do composer |
| **Deferência operacional** | Drawers e chegada continuam mandando; composer cede (`hidden`) |
| **Separar falar de agir** | Thread = turnos de texto; ações transacionais pesadas fora do fio (política de produto complementar) |

### O que o usuário deve sentir (critério emocional)

```txt
“Continuei no mesmo lugar social — só começou uma conversa no fim.”
```

Não:

```txt
“Abri o assistente da barbearia.”
```

---

## 5. O que permanece congelado

**Não negociável sem GO humano + EVOLUTION_LOG + revisão estratégica frozen zone.**

| Patrimônio | Notas WS-21 |
|------------|-------------|
| **Morph post → chip** | 480ms · 420ms long-press · `data-post-context-source` → `data-conversation-context-chip` |
| **Smoke-fume** | Material de superfície; gradiente **local** composer↔conteúdo (adaptação permitida se identidade preservada) |
| **`composerMode` literals** | `default` \| `overlay` \| `hidden` — sem quarto modo |
| **Deferência chegada** | Composer `hidden` @ arrival drawer |
| **Drawers operacionais** | ActionDrawer · BusinessFeedDrawer · scroll lock · pinned footer quando `hidden` |
| **Filosofia feed-first** | Hero · stories · peek · cadence WS-09→WS-13 |
| **Continuidade observacional** | Gates G1–G8 · anti-patterns PERCEPTUAL_LANGUAGE_SYSTEM |
| **Hierarquia z-index relativa** | morph z-65 · composer vs drawer · story z-100 — ordem relativa mantida |
| **Protocolo `data-*`** | `data-conversation-composer` · chip attributes · morph measurement |
| **Timings morph/long-press** | 480ms / 420ms — não alterar neste WS |
| **12 verticais `composerMode`** | Sem unificação prematura; adaptar consumo, não política |

---

## 6. O que deixa de existir

| Elemento v1 | Motivo remoção |
|-------------|----------------|
| Sheet body expansível até ~90vh | Causa painel/assistente |
| Scroll **interno** da thread no composer | Duplo scroll · caixa isolada |
| Snap **medium / expanded** como modos de conversa | Metáfora de painel |
| Drag handle como controle principal de altura | Widget técnico |
| Máscara full-page dim sobre feed (comportamento default engaged) | Quebra feed-first durante conversa |
| Estados **collapsed / compact-resume-preview** como substituto de histórico | Discontinuidade narrativa |
| `ResizeObserver` + auto-grow **dentro** do shell para simular chat app | Substituído por crescimento in-flow |
| Semântica “composer = sala de conversa fechada” | Substituída por “composer = input sticky + thread na coluna” |

### Explicitamente **não** deixa de existir

- Composer fixo/sticky no viewport bottom (idle).
- Chip rail e context selection.
- Persistência de histórico (política pode evoluir em WS separado).
- `overlay` / `hidden` modes.
- Footprint metrics (recalibrados, não eliminados).

---

## 7. O que muda na arquitetura

### 7.1 Composição espacial

| Camada | v1 (atual) | v2 (WS-21) |
|--------|------------|------------|
| Feed | Scroll independente + clearance | Scroll unificado; clearance só para sticky composer |
| Thread | Dentro do fixed shell | **In-flow** na coluna `main`, após última section editorial |
| Composer | Fixed shell expandível | **Sticky footer** compacto — altura estável |
| Máscara | Full viewport z-29 | Gradiente **local** na junção thread/composer |

### 7.2 Ownership de scroll

- **v1:** página scrolla feed; sheet scrolla mensagens.
- **v2:** página scrolla feed + thread; composer sticky não scrolla.

### 7.3 Morph target

- Chip continua ancorado ao **composer sticky** (rect estável no viewport bottom).
- Thread in-flow **não** recebe morph target — morph termina no composer.
- `getComposerChipRect()` permanece válido se `data-conversation-composer` no sticky shell.

### 7.4 `composerMode` (sem mudança de literals)

| Mode | v2 comportamento esperado |
|------|---------------------------|
| `default` | Sticky visible; thread in-flow quando engajado |
| `overlay` | Sticky acima feed drawer; thread pausada ou scrollável atrás |
| `hidden` | Sticky + thread ocultos; drawers respiram |

### 7.5 Clearance metrics

- `composerCompactFootprintPx` continua publicado a partir do sticky shell.
- `--composer-scroll-clearance-px` passa a reservar espaço para **input sticky**, não para sheet 90vh.
- Thread in-flow **não** entra no footprint — é conteúdo da página.

### 7.6 Supersession de spec

`COMPOSER_BEHAVIOR_SPEC.md` v1 descreve sheet com três snap heights. WS-21 propõe **v2** do spec após GO — este ADR é a decisão; spec detalhada é entrega de Fase 0 pós-GO.

### 7.7 Instrumentação (add-only)

Eventos existentes mantidos; considerar add-only:

- `composer.thread.inflow.opened` — primeira expansão da zona in-flow
- `composer.sheet.expansion.deprecated` — métrica de transição (temporária)

---

## 8. Riscos

| ID | Risco | Severidade | Mitigação |
|----|-------|------------|-----------|
| R-01 | Regressão morph (target rect instável) | **Crítica** | Protótipo device; checklist morph frozen |
| R-02 | Quebra z-index drawer/composer/morph | **Crítica** | Mapa z-index v2 antes de código; QA overlay matrix |
| R-03 | Thread in-flow empurra seções Appointment críticas | Alta | Zona conversa após sections editoriais; scroll-to-section preservado |
| R-04 | Perda smoke-fume identitário | Média | Review perceptivo side-by-side @ 320/390 |
| R-05 | `composerMode` race (9+ writers) | Alta | Nenhuma mudança de policy neste WS — só container |
| R-06 | Regressão deferência chegada | Alta | Gate WS-10B checklist obrigatório |
| R-07 | Footer/padding duplicado (clearance + in-flow) | Média | Recalcular clearance; remover pb redundante |
| R-08 | 12 verticais divergentes | Alta | Piloto **Appointment only** primeiro; demais verticais Fase 3+ |
| R-09 | Scope creep → refactor ConversationalAI inteiro | **Crítica** | Diff mínimo; ADR proíbe “rewrite” |
| R-10 | Confundir WS-21 com fix de comportamento/script | Média | WS complementar de comportamento (fases composer audit) separado |

---

## 9. Critérios de sucesso

### Gates perceptivos (obrigatórios — humano @ device)

| # | Critério | Método |
|---|----------|--------|
| S-01 | Morph post → chip **indistinguível** de v1 em fluidez | Side-by-side 320/390 |
| S-02 | Idle: feed respira; composer **não** parece app separado | Observação WS-13 |
| S-03 | Pós-1ª mensagem: sensação “conversa no fim do feed”, não “painel aberto” | Escala 1–5 ≥ 4/5 (piloto interno) |
| S-04 | Chegada: composer deferido; restore ao fechar drawer | WS-10B checklist |
| S-05 | Feed drawer + composer coexistem sem dual-interface | WS-10B |
| S-06 | Scroll: **um** gesto principal; sem scroll-in-scroll | Teste 390px |
| S-07 | Smoke-fume reconhecível como identidade | Review vs baseline captures |

### Gates técnicos (automáticos / QA)

| # | Critério |
|---|----------|
| S-08 | `pnpm qa:events` 8/8 |
| S-09 | `pnpm ts:budget` PASS |
| S-10 | `pnpm qa:appointment` 28/28 (Appointment piloto) |
| S-11 | Checklist `composer-continuity-contract.md` §11 (adaptado v2) |
| S-12 | Nenhuma regressão z-index story viewer / morph / drawer |

### Gates culturais

| # | Critério |
|---|----------|
| S-13 | PERCEPTUAL_LANGUAGE_SYSTEM gate G1–G8 PASS para WS-21 |
| S-14 | EVOLUTION_LOG entrada + GO humano documentado |

---

## 10. Critérios de rollback

Rollback **imediato** (revert branch) se qualquer:

| # | Condição |
|---|----------|
| RB-01 | Morph quebrado ou target (0,0) em qualquer viewport piloto |
| RB-02 | Composer não restaura após `hidden` → drawer close |
| RB-03 | Feed drawer + composer competem (conteúdo ilegível) |
| RB-04 | Scroll lock preso após fechar drawer |
| RB-05 | Regressão z-index: morph sob composer ou story sob drawer |
| RB-06 | `qa:events` ou `qa:appointment` falha sem fix em 1 ciclo |
| RB-07 | Observação WS-13: “parece app de chat” **pior** que baseline @ `fc799d2` |

Rollback **planejado** (feature flag / composer v1 path):

- Manter capability de render v1 sheet atrás de flag **`composer-layout=v1|v2`** (query/localStorage; ver Plano P0/P1) apenas durante Fase 2 piloto — removida após S-01…S-07 PASS.
- Flag **não** default v2 em produção; dev/pilot only.

---

## 11. Estratégia de prototipação

### Princípio

**Observação antes de código Tier 1.** Protótipo perceptivo ≠ implementação em `conversational-ai.tsx`.

### Fases de protótipo

| Fase | Entrega | Objetivo |
|------|---------|----------|
| **P0 — Paper prototype** | Fluxo estático 320/390 (Figma ou capturas anotadas) | Validar hierarquia feed → thread → sticky |
| **P1 — DOM spike isolado** | `/demo` branch descartável ou route `?composer-layout=v2` | Validar monoscroll + morph target **sem** 12 verticais |
| **P2 — Appointment piloto** | Barba Negra only | Fluxos morph, chegada, agendar, feed drawer |
| **P3 — Side-by-side** | v1 vs v2 same device video | Decisão GO/NO-GO humana |

### Matriz de observação (Appointment)

1. Idle @ fold — composer compact
2. Long-press post → morph → chip
3. Primeira pergunta editorial (sem bloco transacional)
4. Multi-turn (3+ mensagens) — scroll behavior
5. Chegada drawer — composer hidden
6. Feed drawer open — overlay coexistence
7. Reload — histórico (comportamento atual documentado)

### Artefatos obrigatórios pós-P2

- Capturas @ 320 e 390
- Notas WS-13 (hesitação · naturalidade · quebra)
- Checklist S-01…S-07 preenchido

### NO-GO protótipo

- Implementar v2 direto em `conversational-ai.tsx` sem spike isolado
- Prototipar 12 verticais simultaneamente
- Misturar WS-21 com mudanças de copy/kernel/comportamento

---

## 12. Sequência de implementação

**Somente após GO humano pós-P3.** Sequência em PRs pequenos — um WS por branch.

| Fase | Escopo | Gate |
|------|--------|------|
| **0 — Decisão** | Este ADR · GO humano · `COMPOSER_BEHAVIOR_SPEC` v2 draft | ADR merged |
| **1 — Spec v2** | Atualizar `COMPOSER_BEHAVIOR_SPEC.md` + delta em `composer-continuity-contract.md` | Review frozen zone |
| **2 — Spike piloto** | Appointment `/demo` only · flag proto | P1/P2 observação PASS |
| **3 — Thread in-flow** | Zona conversa na coluna; composer sticky; **remover** sheet 90vh | S-06, S-10 |
| **4 — Morph + clearance** | Recalibrar metrics; morph regression | S-01, S-08 |
| **5 — Modes + drawers** | overlay/hidden/chegada/feed drawer | S-04, S-05, S-12 |
| **6 — Smoke-fume v2** | Gradiente local; capturas comparativas | S-07 |
| **7 — Hygiene** | Remover estados mortos (collapsed, snap expanded) | Lint + qa:events |
| **8 — Vertical rollout** | Demais feeds (1 vertical por PR) | Matriz vertical |
| **9 — Closure** | EVOLUTION_LOG · OPERATIONAL_HANDOFF update · remover flag proto | S-01…S-14 |

### Paralelo permitido (fora WS-21)

- Comportamento composer (ritmo, placeholders, blocos) — WS separado ou sub-fases pós-Fase 3
- Corpus escape P1 — WS-19B
- WS-20 LLM — **proibido** misturar neste branch

### Estimativa de criticidade Tier 1

```txt
🔴 Reestruturação frozen zone — não “patch pontual”
GO humano explícito obrigatório antes da Fase 2
```

---

## Decisão

| Alternativa | Veredito |
|-------------|----------|
| Manter sheet expansivo v1 | ❌ Rejeitada como estado terminal |
| Inline puro estilo ChatGPT | ❌ Rejeitada — conflita feed-first |
| Sheet com teto baixo (~40vh) | 🟡 Fallback se híbrido falhar P2 |
| **Híbrido sticky + thread in-flow** | ✅ **Aceita como arquitetura alvo WS-21** |

### Consequências

- Investimento em protótipo perceptivo **antes** de editar Tier 1 em `main`.
- `COMPOSER_BEHAVIOR_SPEC.md` requer versão 2 alinhada a este ADR.
- Appointment (Barba Negra) é piloto exclusivo até Fase 6 PASS.

---

## Aprovações

| Papel | Nome | Data | Status |
|-------|------|------|--------|
| Produto / perceptivo | — | — | Pendente |
| Engenharia Tier 1 | — | — | Pendente |
| GO frozen zone | — | — | Pendente |

---

*ADR WS-21 · Composer Hybrid Architecture · Baseline `fc799d2` · Não contém código · Não autoriza implementação sem GO pós-protótipo.*
