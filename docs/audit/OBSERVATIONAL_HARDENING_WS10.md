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
| **3** | Language Consolidation | Consolidar idioma do produto | `docs/os/PERCEPTUAL_LANGUAGE_SYSTEM.md` |

**Sequência rígida:** 1 → 2 → 3 → **só então** novo WS de feature.

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
| Chegada contextual lê como continuidade, não feature | WS-09D.1 | ☐ |
| Maps CTA ainda pesado vs copy editorial | Review pós-polish | ☐ |
| Stories competem levemente com hero em primeiro gesto | WS-09B.1 | ☐ |
| Assimetria Appointment vs outras verticais é perceptível no demo | Strategic audit | ☐ |
| Drawer chegada compacto elimina sensação de folha em branco | WS-09D.1 polish | ☐ |
| Linha operacional legível em 320px | QA perceptivo pré-commit | ☐ |

**Veredicto:** aguardando sessões reais.

---

### Sessão 1 — _[a preencher]_

---

### Sessão 2 — _[a preencher]_

---

### Sessão 3 — _[a preencher]_

---

## Síntese (preencher após ≥3 sessões)

### O que funciona (não tocar)

| Elemento | Evidência (sessões) | Confiança |
|----------|---------------------|-----------|
| | | |

### Sinais de risco (monitorar, não corrigir ainda)

| Sinal | Onde | Severidade |
|-------|------|------------|
| | | |

### Candidatos Etapa 2 — Perceptual Debt Cleanup

| Item | Tipo | Prioridade |
|------|------|------------|
| Maps CTA peso visual | Utilitarização involuntária | Alta (hipótese) |
| Paddings “SaaS” | Ruído visual | A validar |
| Drawers energia diferente | Inconsistência | A validar |
| Labels excessivos | Explica demais | A validar |
| Affordances clicáveis demais | UI > presença | A validar |

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
| ≥3 sessões reais documentadas | ☐ |
| Appointment coberto em mobile + desktop | ☐ |
| ≥1 vertical contraste observada | ☐ |
| Síntese “o que funciona” preenchida | ☐ |
| Lista priorizada de dívida perceptiva | ☐ |
| Nenhum item de síntese exige feature nova | ☐ |
| GO humano para Etapa 2 | ☐ |

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
