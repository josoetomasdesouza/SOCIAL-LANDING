# WS-10 — Etapa 1: Observational Hardening

**Data de abertura:** 2026-05-31  
**Baseline:** `main` @ `6167cb8` (pós `STRATEGIC_PRODUCT_AUDIT_POST_WS09.md`)  
**Tipo:** Observação perceptiva — **zero código, zero feature**  
**Piloto primário:** Appointment / Barba Negra  
**Contraste:** Restaurante, E-commerce (Stack A sem camada WS-09)

---

## Propósito

Descobrir **o que já funciona sem intervenção**.

A Social Landing saiu da fase “inventar coisas” e entrou na fase **“aprender o que NÃO tocar”**. Esta etapa existe para endurecer percepção antes de qualquer refinamento ou expansão.

**Não é:** bug hunt, QA técnico, checklist de regressão, roadmap de features.

**É:** sessões reais de uso com perguntas perceptivas documentadas.

---

## Critério de decisão (herdado)

```txt
Isso aprofunda presença contextual
ou transforma a experiência em utilitário?
```

Referência: [`STRATEGIC_PRODUCT_AUDIT_POST_WS09.md`](STRATEGIC_PRODUCT_AUDIT_POST_WS09.md)

---

## Gate obrigatório (antes de qualquer WS de código)

Cada futuro workstream deve provar:

| # | Pergunta |
|---|----------|
| 1 | O que aprofunda presença contextual? |
| 2 | O que evita utilitarização? |
| 3 | O que mantém feed-first? |
| 4 | O que **NÃO** será construído? |

**WS-10 Etapa 1 não responde com código.** Responde com observação.

---

## Três movimentos da fase WS-10

| Etapa | Nome | Objetivo | Entregável |
|-------|------|----------|------------|
| **1** | Observational Hardening | Descobrir o que funciona sem tocar | **Este documento** (sessões preenchidas) |
| **2** | Perceptual Debt Cleanup | Remover ruído, fricção, utilitarização involuntária | PRs mínimos + `WS-10B_PERCEPTUAL_DEBT.md` |
| **3** | Language Consolidation | Consolidar idioma do produto | [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md) ✅ |

**Sequência rígida:** 1 → 2 → 3 → **só então** novo WS de feature. **Etapa 3 concluída 2026-05-31** — ver [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md).

---

## Protocolo de sessão

### Ambientes

| Variável | Valores a cobrir |
|----------|------------------|
| Viewport | 320×568, 390×844, 768×1024, desktop ≥1280 |
| Velocidade | Uso rápido (≤2 min) · uso lento (≥8 min) |
| Entrada | Feed-first · entrada direta no drawer (deep link futuro / refresh com estado) |
| Vertical | Appointment (primário) · Restaurante · E-commerce (contraste) |
| Modo | Mobile touch · desktop click |

### URL base

```txt
/demo → Agendamento (Appointment)
/demo → Restaurante
/demo → E-commerce
```

Dev server: `pnpm dev` → `http://localhost:3000/demo` (ou porta ativa).

### Fluxos obrigatórios (Appointment)

1. **Fold zero** — primeira impressão (hero, linha operacional, stories, feed peek)
2. **Hero → chegada** — tap em `na Augusta` → drawer → fechar → retorno ao feed
3. **Hero → booking** — `Agendar horário` → drawer booking → fechar → composer restaurado
4. **Feed-first** — scroll feed → long-press post → morph → composer
5. **Stories** — abrir story → fechar → relação com hero
6. **Highlights** — chips abaixo do CTA primário
7. **Troca vertical** — Appointment → Restaurante → Appointment (assimetria)

### Fluxos de contraste (Restaurante / E-commerce)

1. Fold zero sem hero viva
2. Abertura de drawer de negócio
3. Composer + morph (sanity — spine intacto)

---

## Questionário perceptivo (por sessão)

**Não documentar bugs técnicos.** Documentar sensação.

| ID | Pergunta | Escala sugerida |
|----|----------|-----------------|
| Q1 | Isso parece **ferramenta**? | Não · Leve · Sim |
| Q2 | Isso parece **vivo**? | Não · Parcial · Sim |
| Q3 | Isso **explica demais**? | Não · Leve · Sim |
| Q4 | Isso **perdeu silêncio**? | Não · Leve · Sim |
| Q5 | Isso virou **UI** em vez de **presença**? | Não · Leve · Sim |
| Q6 | Hero → drawer = **mesma conversa**? | Não · Parcial · Sim |
| Q7 | Feed continua **protagonista**? | Não · Parcial · Sim |
| Q8 | Algo parece **Google clone**? | Não · Leve · Sim |
| Q9 | Algo parece **dashboard**? | Não · Leve · Sim |
| Q10 | **Contenção** intencional ou vazio acidental? | Contenção · Ambíguo · Vazio |

### Perguntas por superfície

| Superfície | Foco |
|------------|------|
| Hero viva | Atmosfera, linha operacional, CTA único, peek do feed |
| `na Augusta` | Natural vs botão; descoberta vs feature |
| Drawer chegada | Compacto vs modal; copy vs CTA Maps |
| Stories | Ritmo social vs competição com hero |
| Feed | Editorial vs catálogo |
| Composer | Continuidade vs popup |
| Booking drawer | Operacional aceitável vs utilitário excessivo |

---

## Template de registro de sessão

```markdown
### Sessão [N] — [DATA] — [OBSERVADOR]

**Ambiente:** [viewport] · [velocidade] · [vertical]

**Fluxos percorridos:**
- [ ] ...

**Notas livres (sensação, não bug):**
- ...

**Questionário:**
| Q | Resposta | Nota |
|---|----------|------|
| Q1 | | |
| ... | | |

**Screenshots (opcional):** `docs/audit/ws10-[slug].png`

**Veredicto da sessão:** [ ] Reforça tese · [ ] Neutro · [ ] Sinal de risco

**Itens para Etapa 2 (dívida perceptiva):**
- ...
```

---

## Sessões

> Preencher abaixo conforme observações reais. **Não inventar dados.**

### Sessão 0 — Baseline documental (pré-sessão)

**Data:** 2026-05-31  
**Tipo:** Síntese de audits WS-09 + auditoria estratégica (não substitui sessão real)

**Hipóteses a validar em sessão:**

| Hipótese | Origem | Validar? |
|----------|--------|----------|
| Chegada contextual lê como continuidade, não feature | WS-09D.1 | ✅ S1,S3 |
| Maps CTA ainda pesado vs copy editorial | Review pós-polish | ✅ S1,S2,S3 |
| Stories competem levemente com hero em primeiro gesto | WS-09B.1 | ✅ S1,S3 |
| Assimetria Appointment vs outras verticais é perceptível no demo | Strategic audit | ✅ S1 |
| Drawer chegada compacto elimina sensação de folha em branco | WS-09D.1 polish | ✅ S1,S3 |
| Linha operacional legível em 320px | QA perceptivo pré-commit | ✅ S2,S3 |

**Veredicto:** validado nas Sessões 1–3.

---

### Sessão 1 — 2026-05-31 — Observação assistida (390×844, uso lento)

**Ambiente:** 390×844 · uso lento · Appointment primário · contraste Restaurante/E-commerce  
**Relatório completo:** [`WS-10_SESSION_01_OBSERVATION_REPORT.md`](WS-10_SESSION_01_OBSERVATION_REPORT.md)

**Fluxos percorridos:**
- [x] Fold zero
- [x] Scroll feed lento
- [x] Hero → chegada (`na Augusta`)
- [x] Leitura drawer + footer
- [x] Booking drawer + fechamento
- [x] Contraste vertical

**Veredicto:** ✅ **Reforça tese** — hero → chegada = mesma conversa. ⚠️ Momento crítico: footer Maps.

**Questionário resumido:**

| Q | Resposta |
|---|----------|
| Q1 Ferramenta | Leve |
| Q2 Vivo | Sim |
| Q3 Explica demais | Não (chegada) |
| Q6 Hero→drawer | Sim |
| Q7 Feed protagonista | Parcial |
| Q10 Contenção | Contenção |

**Preservar:** linha falada, `na Augusta` integrado, drawer compacto, copy humano, sem mapa, feed peek.

**Fragilidade:** Maps CTA peso visual; dois registros presença vs booking na mesma vertical.

**PDC (hipóteses Etapa 2, não aprovadas):** PDC-01 Maps peso · PDC-02 energia drawers · PDC-03 headers feed · PDC-04 stories/highlights overlap

**Screenshots:** `ws10-s1-01` … `ws10-s1-10` em `docs/audit/`

---

### Sessão 2 — 2026-05-31 — Stress (320×568, uso rápido ~12.6s)

**Ambiente:** 320×568 · scroll/taps agressivos · Appointment  
**Relatório completo:** [`WS-10_SESSION_02_STRESS_OBSERVATION.md`](WS-10_SESSION_02_STRESS_OBSERVATION.md)

**Fluxos percorridos:**
- [x] Entrada rush + scroll imediato
- [x] Chegada fast open/close/reopen
- [x] Booking rush
- [x] Highlight + deep scroll
- [x] Retorno feed

**Veredicto:** ⚠️ **Tese sobrevive com margem reduzida** — presença ok no path hero→chegada; fragiliza com scroll/booking imediato e stack inferior claustrofóbico.

**vs Sessão 1:**

| | S1 | S2 |
|-|----|----|
| Presença | Forte | Comprimida, viva no topo |
| Maps rupture | Alta | **Crítica (320px)** |
| Feed peek | Parcial | **Ausente no fold** |
| Q10 Contenção | Contenção | **Ambíguo** |

**Momento crítico S2:** drawer aberto + Maps + composer + Events — ou scroll <1.5s → catálogo.

**PDC reforçados/novos:** PDC-01 ↑ · PDC-05 composer overlap · PDC-06 feed peek 320 · PDC-07 densidade hero inferior

**Screenshots:** `ws10-s2-01` … `ws10-s2-09`

---

### Sessão 3 — 2026-05-31 — Variable isolation (320×568, uso lento ~32.7s)

**Ambiente:** 320×568 · contemplativo · isola viewport vs velocidade  
**Relatório completo:** [`WS-10_SESSION_03_VARIABLE_ISOLATION.md`](WS-10_SESSION_03_VARIABLE_ISOLATION.md)

**Fluxos percorridos:**
- [x] Hero lento + pausa respiração
- [x] Scroll suave feed
- [x] Chegada + dwell copy 3.5s
- [x] Observação footer stack
- [x] Booking lento + retorno

**Veredicto:** ✅ **Combinação ritmo + densidade** — presença volta no path lento; peek/base/Maps **estruturais @ 320px**.

**Isolamento variável:**

| Driver | Efeito |
|--------|--------|
| **Velocidade** | Hero “nunca existiu” · path collapse |
| **Viewport 320** | Feed peek ~26px · hero 52% · composer overlap |
| **Maps footer** | Ruptura silêncio — **independente de pressa** |

**Screenshots:** `ws10-s3-01` … `ws10-s3-11`

---

## Síntese — Etapa 1 encerrada (3/3 sessões)

### O que funciona (não tocar)

| Elemento | Evidência | Confiança |
|----------|-----------|-----------|
| Linha operacional falada | S1,S2,S3 | Alta |
| `na Augusta` como linguagem | S1,S2,S3 | Alta |
| Drawer chegada compacto + copy humano | S1,S3 | Alta |
| Hero → chegada mesma conversa | S1,S3 (path) | Alta |
| Feed peek no fold | S1 only (~390) | Média — **não @ 320** |
| Sem mapa embed | S1,S2,S3 | Alta |

### Mapa estabilidade perceptiva

| Zona | Elementos |
|------|-----------|
| **Estável** | Linha falada · `na Augusta` · copy chegada · título contextual |
| **Frágil** | Maps footer · feed peek 320 · composer overlap · densidade hero inferior |
| **Colapso (path)** | Scroll rush · booking imediato |

### Sinais de risco (monitorar)

| Sinal | Onde | Severidade |
|-------|------|------------|
| Maps footer protagonista | Drawer chegada | **Alta — estrutural** |
| Composer overlap drawer | Base 320px | Alta |
| Feed peek @ 320 | Fold | Média — estrutural |
| Dois registros presença/booking | Mesma vertical | Média |
| Assimetria demo | Troca vertical | Baixa-média |

### Candidatos Etapa 2 — Perceptual Debt (confirmados observacionalmente)

| Item | Tipo | Prioridade | Sessões |
|------|------|------------|---------|
| PDC-01 Maps peso | Utilitarização | **Alta — estrutural** | S1,S2,S3 |
| PDC-05 Composer overlap | Claustrofobia | Alta @ 320 | S2,S3 |
| PDC-06 Feed peek 320 | Feed-first | Média — viewport | S2,S3 |
| PDC-07 Densidade hero inferior | Respiro | Média @ 320 | S2,S3 |
| PDC-02 Booking vs chegada | Gramática dual | Média | S1,S2,S3 |

### O que explicitamente NÃO entra na Etapa 2

- Mapas embed / ETA / trânsito
- Novas features operacionais
- Universalização hero/chegada
- IA contextual de chegada
- Expansão para novas verticais

---

## Critérios de saída (Etapa 1 → Etapa 2)

| Critério | Status |
|----------|--------|
| ≥3 sessões reais documentadas | ✅ **3/3** |
| Appointment mobile multi-viewport | ✅ 390 S1 · 320 S2,S3 |
| ≥1 vertical contraste observada | ✅ S1 |
| Síntese “o que funciona” preenchida | ✅ |
| Lista priorizada de dívida perceptiva | ✅ |
| Isolamento variável (S3) | ✅ |
| Nenhum item exige feature nova | ✅ |
| **GO humano para Etapa 2** | ☐ **Aguardar decisão** |

### Conclusão Etapa 1

**Tese preservada:** presença contextual viva sobrevive quando usuário colabora — hero → `na Augusta` → chegada.

**Fragilidade dual:** velocidade decide *experiência*; viewport 320 decide *espaço*; Maps+composer decide *silêncio*.

**Próximo:** decisão humana para Etapa 2 (Perceptual Debt Cleanup) — ver [`WS-10_SESSION_03_VARIABLE_ISOLATION.md`](WS-10_SESSION_03_VARIABLE_ISOLATION.md).

---

## Referências

| Documento | Papel |
|-----------|-------|
| [`STRATEGIC_PRODUCT_AUDIT_POST_WS09.md`](STRATEGIC_PRODUCT_AUDIT_POST_WS09.md) | Tese + contratos + gate WS |
| [`HERO_OPERATIONAL_AUDIT.md`](HERO_OPERATIONAL_AUDIT.md) | Gramática hero viva |
| [`WS-09D1_CONTEXTUAL_ARRIVAL_INTEGRATION.md`](WS-09D1_CONTEXTUAL_ARRIVAL_INTEGRATION.md) | Chegada contextual |
| [`EXPERIENCE_PRINCIPLES.md`](EXPERIENCE_PRINCIPLES.md) | Princípios premium |
| [`PERCEPTUAL_INVARIANTS.md`](../runtime/PERCEPTUAL_INVARIANTS.md) | Invariantes Tier 1 |

---

*WS-10 Etapa 1 — Observational Hardening. Construir nada; observar tudo.*
