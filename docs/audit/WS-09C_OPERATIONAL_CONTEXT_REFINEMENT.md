# WS-09C — Operational Context Refinement

**Data:** 2026-05-31  
**Runtime:** branch `workstream/hero-operational-context-refinement`  
**Viewport:** 390×844  
**Escopo:** Appointment / Barba Negra — linha operacional contextual apenas

---

## Veredicto

A hero passou de **legenda apagada** para **estado vivo da casa** — uma linha humana com sinal de presença, sem dashboard, sem Google clone, sem aumentar densidade visual.

**Recomendação: GO** — manter refinamento no piloto; observar organicamente antes de tipologias cross-vertical.

---

## Problema (pré-WS-09C)

| Aspecto | Estado anterior |
|---------|-----------------|
| Copy | `ABERTO AGORA · ATENDEMOS ATÉ 20H` |
| Tipografia | `editorialContext` — uppercase, tracking largo, `text-white/75` |
| Leitura | Legenda institucional; pouco útil; pouco humana |
| Utilidade | Atmosfera sim; contexto operacional mínimo |

---

## Refinamento implementado (mínimo)

### Dados (mock)

```ts
{
  liveState: "Aberto agora",
  contextSignals: "Centro · encaixe leve hoje · cortes R$45–70",
}
```

### Hierarquia visual

| Elemento | Antes | Depois |
|----------|-------|--------|
| Tamanho | `text-xs` | **`text-sm`** |
| Case | UPPERCASE | **Sentence case** |
| Peso | uniforme muted | **`liveState` medium** + sinais `white/85` |
| Sinal vivo | nenhum | **dot emerald estático** (sem ping/animação) |
| Linhas | 1 | **1** (limite preservado) |

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `appointment-data.ts` | `AppointmentHeroOperationalContext` + mock Barba Negra |
| `appointment-operational-hero.tsx` | Render contextual; remove `editorialContext` no overlay |
| `appointment-feed.tsx` | Wire do mock |

---

## Screenshots comparativos

| Estado | Arquivo |
|--------|---------|
| Antes | `docs/audit/ws09c-before-operational-context.png` |
| Depois | `docs/audit/ws09c-after-operational-context.png` |

---

## O que melhorou

| Dimensão | Resultado |
|----------|-----------|
| **Viva** | Dot + “Aberto agora” leem como estado presente, não rótulo |
| **Real** | Centro, encaixe, faixa de preço — sinais de “lugar acontecendo agora” |
| **Decisão emocional** | Visitante entende onde está, se cabe hoje, ordem de grandeza — sem formulário |
| **Legibilidade** | Contraste e peso tipográfico superiores na mídia |
| **Atmosfera** | Cover cinematográfica intacta; linha integrada ao gradiente |

---

## O que piorou / riscos monitorados

| Item | Severidade | Nota |
|------|------------|------|
| Linha mais longa (~55 chars sinais) | Baixa | Ainda uma linha; `text-pretty` ajuda wrap em telas estreitas |
| Preço na overlay | Baixa | Risco GBP — mitigado por faixa editorial “R$45–70”, não tabela |
| Dot verde | Baixa | Único indicador; não virou badge grid |

**Nada degradou:** feed peek, composer, stories, CTA, altura hero — inalterados.

---

## O que foi evitado

- Múltiplas linhas operacionais
- Cards, widgets, mapas, ratings
- Badges, glass, analytics, lotação fake
- Backend / APIs / Google sync
- Animação ping no dot (autoplay chamativo)
- Generalização para outras verticais
- Redesign da hero ou shell

---

## Limites descobertos

### Densidade ideal (Appointment piloto)

| Regra | Valor |
|-------|-------|
| Linhas operacionais | **1** |
| Sinais contextuais (middot) | **2–3 máx.** |
| `liveState` | 2–4 palavras |
| `contextSignals` | ≤ ~60–70 chars |
| Indicadores visuais extras | **1** (dot vivo) |

Acima disso → leitura enciclopédica / dashboard.

### Princípio validado

> A hero não mostra “dados”; mostra **sinais úteis invisíveis para decisão emocional**.

---

## Vertical-awareness (investigação — não implementado)

| Vertical | Sinais naturais (futuro) | Evitar |
|----------|--------------------------|--------|
| **Appointment** | encaixe, faixa preço, bairro, clima da casa | fila numérica, grade horários |
| **Restaurant** | almoço/jantar, mesas, bairro, estacionamento | cardápio completo, mapa |
| **Clinic / Health** | calma, convênio, especialidade do dia | métricas, fila ER |
| **Ecommerce** | entrega hoje, novidades, faixa preço | catálogo, promo grid |
| **Institutional** | autoridade, presença, convite | KPIs, organograma |
| **Influencer** | disponibilidade, tema do momento | stats de follower |

**Conclusão:** tipologias de contexto operacional — não string universal.

---

## Critérios de aceite

| Critério | Status |
|----------|--------|
| Hero mais viva | ✅ |
| Marca mais real | ✅ |
| Contexto ajuda decisão emocional | ✅ |
| Visual limpo | ✅ |
| Não virou Google Business | ✅ |
| Feed respira | ✅ |
| Atmosfera premium/editorial | ✅ |

---

## Gates

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm ts:budget` | ✅ |
| `pnpm build` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |
| `pnpm qa:events` | ✅ 8/8 |

---

## Reversão

Restaurar prop `operationalStatus: string` + classes `editorialContext` anteriores; remover mock `barberShopHeroOperationalContext`.

---

## Referências

- `HERO_OPERATIONAL_AUDIT.md` §1.5 — slot status operacional (max 60 chars)
- `WS-09B1_LEADING_CONTENT_OBSERVATION.md` — ordem perceptiva pós-merge
- Screenshots: `ws09c-before-operational-context.png`, `ws09c-after-operational-context.png`
