# WS-10B.1 — Pós-cleanup Validation Pass

**Data:** 2026-05-31  
**Baseline:** `main` @ `23199a6` (WS-10A + WS-10B)  
**Tipo:** Checagem curta · **zero código · zero ajuste · zero novo debt**  
**Ambiente:** `/demo` → Agendamento · Barba Negra  
**Métricas:** `ws10b1-validation-metrics.json`

---

## Pergunta central

```txt
A presença contextual agora permanece contínua
ou apenas removemos tensões localmente?
```

**Resposta:** **Mais contínua no arco intencional** — não é patch local. Tensões de base (Maps + composer) estabilizaram; discontinuidade residual isolada em **path rush + densidade estrutural @ 320**.

---

## Veredicto

| Dimensão | Resultado |
|----------|-----------|
| Continuidade hero → chegada → retorno (slow) | ★★★★★ |
| Drawer sustenta atmosfera (não só “limpo”) | ★★★★☆ |
| Composer deferido parece natural | ★★★★★ |
| Maps coexistem sem sequestrar | ★★★★☆ |
| Feed continuity @ 320 | ★★☆☆☆ (estrutural, inalterado) |
| Path rush scroll @ 320 | ★★★☆☆ (alternância app persiste) |

**Decisão WS-10C:** **GO condicionado** — abrir cleanup estrutural (PDC-06/07) **somente** com escopo sistêmico explícito. Não reabrir Maps/composer.

---

## Fluxos executados

### 390×844 · lento (~8s path)

| Momento | Screenshot | Observação |
|---------|------------|------------|
| Hero dwell | `ws10b1-390-01-hero.png` | Presença forte · feed peek ~241px |
| Chegada dwell 3.5s | `ws10b1-390-02-arrival-dwell.png` | Copy protagonista · composer ausente · Maps outline |
| Retorno feed | `ws10b1-390-03-feed-return.png` | Composer retorna · mesma conversa |

### 320×568 · lento (~10s path)

| Momento | Screenshot | Observação |
|---------|------------|------------|
| Hero | `ws10b1-320-01-hero.png` | Vivo comprimido · feed peek ~26px |
| Chegada dwell | `ws10b1-320-02-arrival-dwell.png` | Base respira · sem stack composer |
| Base drawer | `ws10b1-320-03-drawer-base.png` | Maps + WhatsApp legíveis · sem competição |
| Retorno feed | `ws10b1-320-04-feed-return.png` | Composer de volta · transição natural |

### 320×568 · rush (~5.2s)

| Momento | Screenshot | Observação |
|---------|------------|------------|
| Hero flash | `ws10b1-320-rush-01-hero.png` | Hero existe mas não dwell |
| Scroll rush | `ws10b1-320-rush-02-scroll.png` | **Alternância app** — catálogo + composer |
| Chegada rápida | `ws10b1-320-rush-03-arrival.png` | Drawer recupera atmosfera mesmo em rush |
| Booking rush | `ws10b1-320-rush-04-booking.png` | Coexistência overlay aceitável (operacional) |

---

## 5 eixos observados

### 1. Continuidade emocional

**Slow (390 + 320):** hero → `na Augusta` → drawer → retorno = **uma conversa**. Sem salto presença ↔ app ↔ presença no arco de chegada.

**Rush scroll:** alternância **persiste** quando usuário pula hero e entra no feed catálogo — mesma assinatura S2/S3. **Não causada por 10A/10B**; exposta agora que base do drawer estabilizou.

### 2. Composer deferido

| Estado | Composer |
|--------|----------|
| Feed default | visível (~9–14% vh) |
| Chegada dwell | **hidden** (0% vh) |
| Pós-close | visível de novo |

Parece **momento de foco**, não UI escondida. Gramática alinhada a datetime/confirmation.

### 3. Drawer respiration

Sustenta **atmosfera** — copy editorial ocupa gestalt; whitespace no corpo; base sem dual-interface. Não é esterilização: Maps/WhatsApp presentes como fallback.

@ 320 slow: sensação espacial **menos claustrofóbica** que S3 (composer stack removido).

### 4. Maps hierarchy (WS-10A)

| Viewport | copyArea | mapsArea | Ratio |
|----------|----------|----------|-------|
| 390 | 55 132 | 14 320 | **3.8×** |
| 320 | 44 352 | 11 520 | **3.8×** |

font-weight 400 · outline — **coexistem**, não puxam energia operacional dominante.

### 5. Feed continuity (PDC-06 preview)

| Viewport | feedPeekPx | Mudança pós 10A/10B |
|----------|------------|---------------------|
| 390 | ~241 | — |
| 320 fold | ~26 | **inalterado** |
| 320 rush scroll | ~306 | feed visível mas **desconectado emocionalmente** |

10A/10B **não** resolveram feed peek — confirmado. Próxima camada legítima para WS-10C.

---

## Comparativo Etapa 1 → pós 10A/10B

| Momento | S1/S3 (antes) | WS-10B.1 (depois) |
|---------|---------------|-------------------|
| Maps ruptura silêncio | ★★☆☆☆ | ★★★★☆ |
| Composer ↔ drawer @ 320 | ★★☆☆☆ | ★★★★☆ |
| Drawer atmosfera (slow) | ★★★★☆ | ★★★★★ |
| Path hero→chegada (slow) | ★★★★☆ | ★★★★★ |
| Feed peek @ 320 | ★☆☆☆☆ | ★☆☆☆☆ |
| Rush scroll collapse | ★★★☆☆ | ★★★☆☆ |

---

## Critério GO WS-10C

```txt
A presença contextual estiver perceptivamente mais contínua
após WS-10A + WS-10B juntos.
```

**Atendido no arco intencional de chegada.**  
**Não atendido no path rush + scroll @ 320** — debt estrutural pré-existente.

**Leitura:** 10A+10B **estabilizaram o núcleo perceptivo do Appointment** (hero contextual · transição arrival · Maps operacionalizado · coexistência). O que falta é **calibragem sistêmica** — não mais cleanup local.

---

## Recomendação

| Ação | Decisão |
|------|---------|
| Commit WS-10B | ✅ feito @ `23199a6` |
| Abrir WS-10C imediato | **GO condicionado** — escopo PDC-06 + PDC-07 only |
| Reabrir Maps/composer | ❌ fechado |
| Nova sessão Etapa 1 completa | ❌ desnecessário |

**Gate humano:** confirmar se rush-path discontinuity é aceitável como próximo alvo estrutural antes de codar WS-10C.

---

## Screenshots índice

`ws10b1-390-*.png` · `ws10b1-320-*.png` · `ws10b1-320-rush-*.png`

---

*Núcleo perceptivo estabilizado — próxima camada é espacial, não local.*
