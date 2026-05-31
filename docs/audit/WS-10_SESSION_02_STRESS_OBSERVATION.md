# WS-10 — Sessão 2 — Stress Observation Report

**Data:** 2026-05-31  
**Baseline:** `main` @ `d5a876f`  
**Tipo:** Stress observation — uso rápido, viewport estreito  
**Ambiente:** **320×568** · navegação agressiva · ~12.6s total · `/demo` → Agendamento  
**Contraste:** Sessão 1 (390×844, uso lento)  
**Regra:** zero código · zero PR · zero ajuste

---

## Veredicto da sessão

> **A presença contextual sobrevive — mas perde margem.**

A tese da Sessão 1 **não quebra** sob stress: hero ainda transmite lugar, `na Augusta` ainda abre chegada coerente, copy humano ainda prepara deslocamento.

Porém, em 320×568 com uso rápido:

- o hero **comprime** (≈52% vh — feed peek quase desaparece),
- o drawer vira **sheet operacional mais cedo**,
- o **Maps domina proporcionalmente mais**,
- o **composer + chrome inferior** criam **claustrofobia perceptiva** quando drawer aberto.

**Contenção:** ainda perceptível no copy e na integração `na Augusta`, mas **tensionada**.  
**Silêncio:** **enfraquece** na zona inferior da tela.  
**Produto vivo:** **sim**, no hero e no texto de chegada; **não**, no stack inferior sob pressão.

---

## Comportamentos executados

| # | Comportamento | Tempo ~ |
|---|---------------|---------|
| 1 | Entrada rápida hero | 0.9s |
| 2 | Scroll agressivo imediato | 1.3s |
| 3 | Tap `na Augusta` | 2.0s |
| 4 | Scroll interno drawer | 2.4s |
| 5 | Escape — fechar | 2.7s |
| 6 | Booking sem ler | 3.1s |
| 7 | Highlight `Cortes` + scroll profundo | 4.5s |
| 8 | Reabrir chegada | 5.5s |
| 9 | Retorno feed | 6.0s |

Fluxo total **~12.6s** — simula impaciência real.

---

## Métricas (320×568, fold)

| Métrica | S2 stress | S1 conforto | Δ |
|---------|-----------|-------------|---|
| Viewport | 320×568 | 390×844 | −22% largura, −33% altura |
| Hero height | ≈298px (**52% vh**) | ≈359px (42% vh relativo maior conforto) | Mais dominante proporcionalmente |
| Feed peek (1ª seção top) | **≈542px** (abaixo do fold) | ≈241px visível | **Peek perdido** |
| Linha operacional visível | ✅ sim | ✅ sim | Mantida |
| Composer top | ≈490px | ≈767px | Ocupa ~14% vh visível constante |

---

## Screenshots

| Momento | Arquivo |
|---------|---------|
| Hero rush entry | `ws10-s2-01-hero-rush.png` |
| Scroll agressivo | `ws10-s2-02-feed-aggressive-scroll.png` |
| Chegada fast open | `ws10-s2-03-arrival-fast-open.png` |
| Drawer stress | `ws10-s2-04-arrival-drawer-stress.png` |
| Booking rush | `ws10-s2-05-booking-rush.png` |
| Highlight tap | `ws10-s2-06-highlight-tap.png` |
| Feed deep scroll | `ws10-s2-07-feed-deep-scroll.png` |
| Chegada reopen | `ws10-s2-08-arrival-reopen-rush.png` |
| Return feed | `ws10-s2-09-return-feed.png` |

---

## Respostas às 7 perguntas

### 1. A presença ainda existe?

**Parcialmente — sim.**

Sob velocidade, usuário que **não colabora** ainda recebe:
- cover atmosférico,
- linha falada (dot + `na Augusta`),
- drawer título contextual.

Mas quem scrolla imediatamente **pula** presença e cai em **lista de serviços** — UI tradicional em <2s.

| Persona stress | Presença |
|----------------|----------|
| Olha fold ≥1s | ✅ mantida |
| Scroll instantâneo | ❌ perdida — vira app |

---

### 2. O hero continua respirando?

**Comprimido, não morto.**

- Cover ainda domina emocionalmente.
- Headline + CTA + chips + stories **empilham** — densidade alta em 320px.
- Linha operacional permanece legível (13px, wrap natural).
- **Feed peek** — principal vítima: promessa editorial quase invisível no fold.

**S1:** hero respira + peek ancora feed-first.  
**S2:** hero ocupa tela; feed vira **descoberta por scroll**, não promessa visual.

---

### 3. O drawer segura atmosfera?

**Copy sim · chrome não.**

| Drawer | S1 | S2 |
|--------|----|----|
| **Chegada** | Atmosfera editorial | Copy ok; **Maps + composer stack** quebram silêncio |
| **Booking** | Sheet utilitário | Idem, mais claustrofóbico — menos hero visível atrás |

Título `Chegar na Augusta` + parágrafos **sobrevivem**.  
Sheet deixa de parecer “camada de conversa” quando footer preto ocupa fração maior da viewport e composer compete na base.

---

### 4. O feed continua editorial?

**No scroll profundo — não imediatamente.**

Scroll agressivo revela:
- pills + stories + `Agendar Horario` uppercase + cards preço/chevron,
- sensação **marketplace/app** instantânea.

Editorialidade retorna **só** se usuário volta ao topo (hero). Under stress, feed **default = utilitário**.

---

### 5. O booking entra naturalmente?

**Não — parece troca de aplicativo mais rápido que em S1.**

Tap `Agendar horario` → sheet alto + catálogo — transição **binária** presença → transação.  
Em viewport pequeno, hero residual (~15% atrás) **não ancora** continuidade.

**S1:** mesma gramática, mais contexto visual residual.  
**S2:** ruptura mais abrupta por compressão.

---

### 6. O Maps domina mais no viewport pequeno?

**Sim — ruptura perceptiva intensificada.**

| Fator | Efeito |
|-------|--------|
| Drawer compacto | Footer ocupa **maior %** da área visível |
| Botão full-width preto | Proporcionalmente **maior** que em 390px |
| WhatsApp | Empurrado para baixo / competição com composer |
| Reabertura rápida | Olho vai direto ao contraste preto/branco |

**PDC-01 (Maps peso)** sobe de **alta** para **crítica-under-stress** — hipótese reforçada, não aprovada para fix.

---

### 7. Áreas claustrofóbicas?

| Zona | Sintoma |
|------|---------|
| **Base da tela** | Drawer footer + composer + `Events` debug — **3 camadas** |
| **Hero inferior** | CTA + 5 pills + 4 stories — scroll horizontal implícito |
| **Drawer chegada** | 4 linhas copy + 2 CTAs em 568px — respiro vertical reduzido |
| **Booking sheet** | Cards densos; descrição + preço + thumb — fadiga rápida |

**Overlap perceptivo:** composer visível **durante** drawer overlay — sensação de **dois produtos** empilhados (social landing + chat bar).

---

## Momento crítico (320px + uso rápido)

### Primário — stack inferior com drawer aberto

```txt
Tap rápido "na Augusta"
        ↓
Copy humano (1 scroll mental se houver tempo)
        ↓
"Abrir no Maps" + composer + Events pill — simultâneos
        ↓
Presença → UI tradicional
```

**Mais cedo que S1** (~mesmo mecanismo, **menor margem**).

### Secundário — scroll agressivo imediato (<1.5s)

```txt
Entrada Appointment
        ↓
Scroll antes de ler linha operacional
        ↓
Lista serviços / preços
        ↓
App de agendamento — hero nunca existiu perceptivamente
```

### Terciário — booking rush

```txt
Agendar horario (sem leitura)
        ↓
Escolha o servico — catálogo full
        ↓
Troca de app
```

---

## Comparação direta S1 vs S2

| Dimensão | S1 (contemplativa) | S2 (stress) | Tese |
|----------|-------------------|-------------|------|
| Presença hero | Forte | Comprimida mas viva | ✅ Sobrevive |
| Hero → drawer conversa | Sim | Sim (se tap antes scroll) | ✅ Confirmada |
| Feed-first peek | Parcial | **Fraco/ausente** | ⚠️ Enfraquecida |
| Silêncio | Leve ruptura Maps | Ruptura + claustrofobia base | ⚠️ Enfraquecido |
| Contenção | Intencional | Tensionada | ⚠️ Margem menor |
| Maps dominance | Alta | **Mais alta** | ⚠️ Reforço PDC-01 |
| Booking rupture | Aceitável | Mais abrupta | ⚠️ Monitorar |
| Produto vivo | Sim | Sim no topo; não na base | Parcial |

---

## Questionário perceptivo (Sessão 2)

| ID | S1 | S2 | Δ |
|----|----|----|---|
| Q1 Ferramenta | Leve | **Sim** (scroll/booking) | ↑ |
| Q2 Vivo | Sim | **Parcial** | ↓ |
| Q3 Explica demais | Não | Não (chegada) | = |
| Q4 Perdeu silêncio | Leve | **Sim** (base) | ↑ |
| Q5 UI vs presença | Leve | **Sim** | ↑ |
| Q6 Hero→drawer | Sim | **Sim** (path direto) | = |
| Q7 Feed protagonista | Parcial | **Não** (fold) | ↓ |
| Q8 Google clone | Não | Não | = |
| Q9 Dashboard | Não | Não | = |
| Q10 Contenção | Contenção | **Ambíguo** | ↓ |

---

## O que preservar (reforçado sob stress)

1. **Linha operacional** — ainda legível em 320px; não densificar  
2. **`na Augusta` tap target** — sobrevive navegação rápida  
3. **Copy de chegada** — tom humano intacto mesmo com pressa  
4. **Título drawer contextual** — continuidade semântica rápida  
5. **Sem mapa embed** — evitar piora claustrofobia  
6. **Hard cap hero** — sem crescer além de 55vh (já no limite perceptivo)

---

## O que parece frágil (novo ou intensificado)

| Item | S1 | S2 |
|------|----|----|
| Maps footer | Alta | **Crítica under stress** |
| Feed peek 320px | — | **Ausente** |
| Composer durante drawer | Notado | **Claustrofóbico** |
| Stack pills+stories+CTA | Baixa | **Média** |
| Booking = app switch | Média | **Alta under rush** |

---

## Perceptual debt candidates — atualização

| ID | Item | S1 | S2 |
|----|------|----|----|
| PDC-01 | Maps peso visual | Alta | **Crítica (320px)** |
| PDC-02 | Energia drawers | Média | Média |
| PDC-05 | **Composer overlap durante drawer** | — | **Nova — Alta** |
| PDC-06 | **Feed peek 320px** | — | **Nova — Média** |
| PDC-07 | **Densidade hero inferior (CTA+pills+stories)** | — | **Nova — Média** |

*Ainda hipóteses — Etapa 2 não autorizada.*

---

## Perguntas finais

| Pergunta | Resposta |
|----------|----------|
| **A presença sobrevive?** | **Sim**, se usuário passa pelo hero ou tap `na Augusta`. **Não**, se scroll/booking imediato. |
| **A contenção continua?** | **Tensionada** — copy contido, chrome inferior não. |
| **O silêncio permanece?** | **Parcial** — quebra na base (Maps + composer + debug). |
| **O produto ainda parece vivo?** | **Sim no hero/chegada** · **Não no feed sob rush** |

---

## Veredicto vs tese S1

| | S1 | S2 |
|-|----|----|
| Tese hero → chegada | ✅ Confirmada | ✅ **Confirmada** (path direto) |
| Presença contextual viva | Forte | **Sobrevive com margem reduzida** |
| GO Etapa 2 | Aguardar ≥3 sessões | Aguardar Sessão 3 |

**Sessão 2 não invalida Sessão 1.**  
**Sessão 2 delimita onde a tese é frágil:** viewport estreito, uso impaciente, zona inferior da tela.

---

## Próximo passo

**Sessão 3** — desktop ≥1280 ou uso lento 320px (isolating variable) · ou sessão humana real.  
Etapa 1: **2/3 sessões** documentadas.

---

*Stress observation — presença sobrevive; margem não.*
