# WS-10 — Sessão 3 — Variable Isolation Report

**Data:** 2026-05-31  
**Baseline:** `main` @ `b8b2adc`  
**Tipo:** Isolamento de variável — viewport fixo, velocidade invertida  
**Ambiente:** **320×568** · uso **lento/contemplativo** · ~32.7s · `/demo` → Agendamento  
**Contraste:** S1 (390 lento) · S2 (320 rush)  
**Regra:** zero código · zero PR · zero cleanup

---

## Veredicto — isolamento de variável

> **Combinação de ritmo + densidade estrutural.**

| Variável | Dominância | Evidência |
|----------|------------|-----------|
| **Velocidade** | Dominante para *path collapse* | Scroll/booking rush (S2) faz hero “nunca existir” |
| **Viewport / densidade** | Estrutural para *feed peek* e *base claustrofóbica* | S3 lento mantém ~26px peek e composer↔Maps overlap — **idêntico a S2 estrutura** |
| **Maps footer** | Estrutural — **não curado por lentidão** | Ruptura persiste após 3.5s dwell no copy |

**Resposta direta:**

- *O problema é o viewport?* **Parcialmente sim** — feed peek, hero 52% vh, stack inferior.
- *Ou a velocidade?* **Parcialmente sim** — skip hero, fadiga, sensação app.
- *Qual fragiliza mais?* **Velocidade** decide se presença é *experimentada*; **viewport** decide se presença *cabe* confortavelmente quando experimentada.

---

## Matriz S1 / S2 / S3

| Dimensão | S1 · 390 · lento | S2 · 320 · rush | S3 · 320 · lento |
|----------|------------------|-----------------|------------------|
| **Presença (path hero→chegada)** | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| **Hero vivo** | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| **Drawer atmosfera** | ★★★★☆ | ★★★☆☆ | ★★★★☆ |
| **Feed peek perceptível** | ★★★☆☆ | ★☆☆☆☆ | ★☆☆☆☆ |
| **Silêncio (base)** | ★★★★☆ | ★★☆☆☆ | ★★★☆☆ |
| **Maps ruptura** | ★★☆☆☆ | ★☆☆☆☆ | ★★☆☆☆ |
| **Contenção** | Contenção | Ambíguo | **Contenção tensionada** |
| **Path skip → catálogo** | Evitável | **Imediato** | Evitável |

---

## Métricas comparáveis

| Métrica | S1 | S2 | S3 |
|---------|----|----|-----|
| Viewport | 390×844 | 320×568 | 320×568 |
| Duração sessão | ~60s+ | ~12.6s | ~32.7s |
| Hero % vh | ~42% | ~52% | **52.5%** |
| Feed peek visível | ~241px | ~0–27px | **~26px** |
| Maps % vh (drawer) | — | alto | **7.7% height** |
| Composer overlap Maps | notado | sim | **sim (estrutural)** |

**Leitura:** métricas físicas de S2 e S3 **coincidem**; diferença perceptiva vem do **tempo de permanência** no copy e do **path** (scroll rush vs leitura).

---

## Screenshots

| Momento | Arquivo |
|---------|---------|
| Hero fold lento | `ws10-s3-01-hero-slow.png` |
| Pausa respiração | `ws10-s3-02-hero-respiration.png` |
| Feed peek scroll suave | `ws10-s3-03-feed-peek-slow.png` |
| Chegada open | `ws10-s3-04-arrival-slow-open.png` |
| Dwell copy (3.5s) | `ws10-s3-05-arrival-copy-dwell.png` |
| Footer stack | `ws10-s3-06-arrival-footer-stack.png` |
| Drawer dwell | `ws10-s3-07-drawer-dwell.png` |
| Pós-chegada | `ws10-s3-08-after-arrival-close.png` |
| Feed cadence | `ws10-s3-09-feed-cadence-slow.png` |
| Booking lento | `ws10-s3-10-booking-slow-open.png` |
| Repetição hero | `ws10-s3-11-return-hero-repeat.png` |

---

## Respostas às 6 perguntas centrais

### 1. A presença volta sob ritmo lento? Mesmo em 320px?

**Sim — no path intencional.**

Com 2.5s no hero + tap `na Augusta` + 3.5s no copy:
- título `Chegar na Augusta` reancora lugar,
- parágrafos lidos como **orientação humana**, não specs,
- hero→drawer volta a ser **conversa** (como S1).

**Não** se usuário scrolla antes de ler — velocidade domina (S2).

---

### 2. O hero continua vivo?

**Sim, comprimido.**

Cover + linha operacional + headline mantêm calor em 320px lento.  
Hero **não** respira como 390px — CTA + pills + stories comprimem fold — mas **não vira banner morto**.

**Viewport** limita respiro; **lentidão** permite apreciar o que cabe.

---

### 3. O drawer sustenta atmosfera?

**Copy sim · chrome parcial.**

| Elemento | S3 lento |
|----------|----------|
| Copy + título | ★★★★☆ — atmosfera sustentada com dwell |
| Whitespace corpo | Adequado — contenção no texto |
| Footer Maps | Ainda ruptura |
| Composer + Events | Ainda claustrofóbico |

Lentidão **recupera** o meio do drawer; **não recupera** a base.

---

### 4. O feed peek reaparece perceptivamente?

**Não — estruturalmente ausente em 320px.**

`feedPeekVisiblePx ≈ 26px` — mesmo scroll suave e pausa de 2s.  
Usuário contemplativo **sabe** que feed existe (scroll revela), mas **fold não promete** feed-first como S1.

**Conclusão:** feed peek fraco é **viewport**, não velocidade.

---

### 5. O Maps continua rompendo silêncio? Mesmo sem pressa?

**Sim.**

Após 3.5s lendo copy, olhar natural desce → **botão preto full-width** ainda quebra tom.  
Intensidade **ligeiramente menor** que S2 rush (usuário teve contexto emocional antes), mas ruptura **não desaparece**.

**PDC-01 confirmado como estrutural**, não artefato de pressa.

---

### 6. A base ainda parece claustrofóbica? Mesmo contemplativamente?

**Sim.**

`composerOverlapsMaps: true` — composer @ 490px, Maps @ 460px em 568px vh.  
Três camadas na base: **Maps + composer + Events** — perceptível mesmo em ritmo lento.

**PDC-05 confirmado estrutural em 320px.**

---

## Momento crítico (320px lento)

### Permanece o mesmo mecanismo de S1/S2 — timing diferente

```txt
Copy humano (dwell permitido em S3)
        ↓
Descida visual natural
        ↓
Maps + composer simultâneos
        ↓
UI tradicional
```

**Diferença S3 vs S2:** usuário **carrega** presença antes da ruptura.  
**Semelhança:** ruptura **ainda ocorre**.

### Secundário (viewport, não speed)

```txt
Fold 320px
        ↓
~26px feed peek
        ↓
Feed-first enfraquecido estruturalmente
```

---

## Mapa de estabilidade perceptiva (Etapa 1)

### Zona estável — preservar

| Elemento | S1 | S2 | S3 | Nota |
|----------|----|----|-----|------|
| Linha operacional falada | ✅ | ✅ | ✅ | Viewport-agnostic |
| `na Augusta` linguagem | ✅ | ✅ | ✅ | |
| Título drawer contextual | ✅ | ✅ | ✅ | |
| Copy chegada humano | ✅ | ⚠️ | ✅ | S2 só se não skip |
| Hero→drawer conversa | ✅ | ⚠️ | ✅ | Speed-dependent |
| Sem mapa embed | ✅ | ✅ | ✅ | |

### Zona frágil — monitorar

| Elemento | Driver |
|----------|--------|
| Maps footer | Estrutural + perceptual |
| Feed peek 320px | **Viewport estrutural** |
| Composer overlap drawer | **Viewport estrutural** |
| Booking = app switch | Speed + gramática dual |
| Densidade CTA+pills+stories @ 320 | Viewport |

### Zona colapso — path-dependent

| Path | Driver |
|------|--------|
| Scroll rush <1.5s | **Velocidade** |
| Booking imediato | **Velocidade + gramática** |
| Ignorar `na Augusta` | Comportamento usuário |

---

## Conclusão Etapa 1 — Observational Hardening

### A tese sobrevive em viewport pequeno?

**Sim, se o usuário colabora** (lê, tap contextual, dwell).  
**Não**, se viewport pequeno encontra uso impaciente — colapso mais rápido que S1.

### Qual variável mais fragiliza?

| Rank | Variável | Efeito |
|------|----------|--------|
| 1 | **Velocidade / impaciência** | Presença não experimentada |
| 2 | **Densidade 320px (base + peek)** | Presença experimentada mas apertada |
| 3 | **Maps footer** | Silêncio — independente de velocidade |

### Onde presença permanece forte?

- Hero cover + linha operacional (320 e 390)
- Path `na Augusta` → copy chegada (com tempo)
- Headline editorial abaixo do cover

### Onde colapsa?

- Base da tela (drawer + composer) @ 320px
- Scroll rush → catálogo
- Booking drawer (gramática transação)

---

## Tabela de decisão — variável crítica

| Resultado observado | Significado | **Veredicto** |
|-------------------|-------------|---------------|
| Problema reduz drasticamente | Velocidade dominante | Parcial — path hero→chegada |
| Problema continua forte | Viewport estrutural | **Sim — peek, base, overlap** |
| Problema parcialmente reduz | Combinação | **✅ Confirmado** |

---

## Perceptual debt — estado pós-Etapa 1

| ID | Item | Status pós-3 sessões |
|----|------|----------------------|
| PDC-01 | Maps peso | **Confirmado** — estrutural, não speed |
| PDC-05 | Composer overlap drawer | **Confirmado** @ 320px |
| PDC-06 | Feed peek 320px | **Confirmado** — viewport |
| PDC-07 | Densidade hero inferior | **Confirmado** @ 320px |
| PDC-02 | Energia booking vs chegada | Confirmado — gramática dual |

*Hipóteses para Etapa 2 — GO humano ainda necessário.*

---

## Critérios de saída Etapa 1

| Critério | Status |
|----------|--------|
| ≥3 sessões documentadas | ✅ **3/3** |
| Appointment mobile multi-viewport | ✅ 390 + 320 |
| Contraste vertical | ✅ S1 |
| Síntese o que funciona | ✅ |
| Lista dívida perceptiva | ✅ |
| Nenhum item exige feature nova | ✅ |
| Isolamento variável | ✅ S3 |
| **GO humano Etapa 2** | ☐ **Aguardar decisão** |

---

## Veredicto final Etapa 1

A Social Landing **mantém linguagem de presença contextual viva** quando:

1. usuário **tem tempo** para colaborar, e  
2. path passa por **hero → lugar → chegada**.

A fragilidade **não é uma variável só**:

- **Velocidade** decide *se* a presença é vivida.  
- **Viewport 320px** decide *quanto espaço* a presença tem para respirar.  
- **Maps + composer** decidem *quando* silêncio vira UI — **independente de pressa**.

**Missão Etapa 1 cumprida:** sabemos **o que não perder** e **onde a linguagem colapsa** — sem prescrever fix.

---

*Variable isolation — combinação ritmo + densidade. Etapa 1 encerrada observacionalmente.*
