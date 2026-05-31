# Perceptual Language System

**Status:** ✅ Official — WS-10 Etapa 3  
**Baseline:** `main` @ pós WS-10C (`b6d5670`)  
**Escopo:** constituição perceptiva da Social Landing  
**Piloto validado:** Appointment / Barba Negra  
**Relação:** complementa [`PERCEPTUAL_INVARIANTS.md`](../runtime/PERCEPTUAL_INVARIANTS.md) (runtime Tier 1) com **gramática de produto** e **gates culturais**

---

## Propósito

Este documento transforma percepção validada em **linguagem operacional oficial**.

Funciona como:

- **Constituição perceptiva** — o que o produto *é* emocionalmente
- **Sistema imunológico cultural** — proteção contra utilitarização gradual
- **Contrato para futuros WS** — avaliação antes de código
- **Anti-regressão** — novos colaboradores e PRs não dependem de “sensibilidade do momento”

**Não é:** spec de componente, checklist QA técnico, roadmap de features.

**É:** gramática de presença — comportamento, hierarquia emocional, cadence, silêncio.

---

## 1. Core Thesis

### Tese central

```txt
A Social Landing não informa presença.
Ela prepara chegada.
```

Corolário operacional:

```txt
A Social Landing não informa endereço.
Ela prepara chegada.
```

### Pergunta gate (obrigatória)

Antes de qualquer WS, feature ou ajuste perceptivo:

```txt
Isso aprofunda presença contextual
ou transforma a experiência em utilitário?
```

Variante para micro-ajustes (WS-10 Etapa 2):

```txt
Isso reduz ruído perceptivo
ou apenas deixa a UI mais bonita?
```

Variante para calibragem espacial (WS-10C):

```txt
Isso aumenta continuidade hero/feed
ou apenas comprime o hero?
```

Variante para coexistência (WS-10B):

```txt
Isso reduz competição perceptiva
ou apenas reorganiza elementos?
```

**Se a resposta favorecer utilidade, estética vazia, compressão ou reorganização:** rejeitar.

### Identidade emergente (pós WS-09 → WS-10)

A Social Landing é perceptivamente:

```txt
feed editorial social-native
+ presença operacional humana (piloto)
+ continuidade física da marca (piloto)
+ inteligência conversacional silenciosa
```

Não é: Google clone, dashboard, marketplace, app de mapas, CRM, rede social completa.

### Sequência perceptiva canônica (Appointment)

```txt
Intro (chrome social)
→ Hero (presença viva + linha operacional)
→ Stories (camada social)
→ Feed (descoberta editorial)
→ Drawer (aprofundamento contextual)
→ Maps/WhatsApp (fallback operacional)
```

Cada camada **respira** na anterior. Nenhuma camada deve sequestrar emocionalmente a anterior sem motivo contextual.

---

## 2. Hero Language

### O que torna um hero “vivo”

| Sinal | Descrição |
|-------|-----------|
| **Tempo presente** | Hero transmite *agora* — não banner estático de marketing |
| **Cover com atmosfera** | Imagem ambienta; gradiente; marca legível na cena |
| **Linha operacional falada** | Frase humana integrada — não metadado uppercase empilhado |
| **Lugar como linguagem** | `na Augusta` na frase — natural, tapável, não botão “Como chegar” |
| **CTA único primário** | Um gesto principal; highlights são secundários |
| **Feed como promessa** | Abaixo do hero, o feed **existe perceptivamente** — não desaparece |

### O que NÃO pode acontecer (hero)

| Proibição | Por quê |
|-----------|---------|
| Dashboard (grids, tabs, métricas, widgets) | Mata atmosfera |
| Clone Google (mapa + endereço + tel + estrelas empilhados) | Utilitarização imediata |
| Ficha técnica na overlay (grade horária, preços, lotação) | Explica demais |
| Hero substituir o feed | Quebra feed-first |
| Múltiplos CTAs primários competindo | Hub operacional |
| Remover linha operacional ou `na Augusta` para “limpar” | Perde gramática proprietária |

### Hard caps e cadence

| Regra | Valor / comportamento | Origem |
|-------|----------------------|--------|
| **HP-07** | Hard cap hero **55vh** (default) | WS-09B |
| **HP-07b** | Calibragem narrow **≤360px**: min 36vh · max 50vh | WS-10C — *não* universalizar |
| Cover | min ~19–22vh · max ~34–38vh — presença > utilidade | WS-09B / WS-10C |
| **390×844** | Baseline maduro — **resistir** a “aplicar geral” o que calibrou 320 | WS-10C disciplina |
| Cadence inferior | Densidade do painel abaixo do cover calibrável **sem** amputar copy | WS-10C PDC-07 |

### Linha operacional falada

- Nasce da **cena**, não de bloco utilitário
- Tom: frase que alguém falaria — “Aberto agora · na Augusta · encaixe leve hoje”
- `placeHint` integrado à frase com underline sutil — descoberta, não feature colada
- Legível em **320px** — validado WS-10 S2/S3

### Feed como promessa (não como protagonista no fold)

```txt
O feed não compete com o hero.
O feed não some.
O feed não vira lista no fold.
O feed continua a conversa.
```

- **Peek perceptivo** = promessa — usuário sente que há mais abaixo
- Sucesso **não** é “mostrar muito feed no fold”
- Sucesso **é** continuidade hero → feed @ viewport estreito
- Métrica de referência @ 320: peek ~26px → insuficiente; ~87px → promessa legível (WS-10C)

---

## 3. Arrival Grammar

### Drawer como continuação de conversa

```txt
Hero → tap `na Augusta` → drawer
= mesma conversa, não nova página
```

| Regra | ID | Detalhe |
|-------|-----|---------|
| Chegada nasce do contexto | AR-01 | Nunca link solto “Como chegar” abaixo do CTA |
| Lugar é linguagem | AR-02 | `placeHint` na linha operacional |
| Título do drawer | AR-03 | “Chegar na Augusta” — nasce do lugar |
| Content-fit | AR-04 | Drawer compacto (`size="sm"`) — sem folha em branco |
| Copy domina | AR-05 | referenceHint, routeHint, parkingHint, arrivalMood |
| Sem mapa embed | AR-06 | Até asset local confiável e intencional |
| Mesma atmosfera | AR-07 | `bg-card`, copy editorial — não modal utilitário |

### Contexto humano > operacional

- Copy prepara **deslocamento** — orientação humana, não specs
- Maps/WhatsApp no **footer** — fallback, não centro da experiência
- WS-10A: Maps **outline**, font-normal — fallback operacional, não CTA protagonista

### Deferência contextual — “quem respira primeiro”

| Momento | Quem respira primeiro | Composer |
|---------|----------------------|----------|
| Chegada / contexto | Drawer | **Deferido** (`hidden`) |
| Booking datetime / confirmation | Drawer transacional | **Deferido** |
| Booking service / professional | Coexistência | **Overlay** (perguntas ainda fazem sentido) |
| Feed default | Feed + composer | **Default** |

```txt
Momento de foco, não remoção permanente.
```

- Composer **retorna** ao fechar drawer — nunca desaparece silenciosamente sem restauração
- Deferência ≠ esconder artificialmente; é **hierarquia emocional** no instante certo

### Momentos de foco

Tratar chegada como **momento de foco** — paralelo a confirmation/datetime:

- Usuário está em **preparação**, não em multitarefa
- Drawer respira primeiro; composer não disputa protagonismo emocional
- WS-10B: fim da dual-interface (copy claro + composer glass) @ 320

---

## 4. Feed System

### Feed editorial vs feed utilitário

| Editorial (desejado) | Utilitário (rejeitar no fold) |
|----------------------|-------------------------------|
| Seções com tom de marca | Catálogo denso imediato |
| Descoberta, bastidores, reviews | Lista de SKUs/serviços como home |
| Long-press → morph → composer | Formulário como entrada |
| Peek como promessa | Fold = grid operacional |

Booking e catálogo **existem** — vivem em drawers e seções, não substituem presença no primeiro gesto.

### Peek como promessa perceptiva

- Usuário no hero deve **sentir** que o feed continua
- Peek insuficiente (@ 320 ~26px) → feed “fantasma” → scroll rush cai em catálogo sem transição emocional
- Calibragem: cadence vertical hero → stories → seção — **não** maximizar feed no fold

### Continuidade hero → feed

```txt
Não foi encolher hero.
Foi calibrar cadence vertical.
```

Ajustes permitidos @ narrow:

- Densidade inferior do hero (gap, py, CTA h-10)
- Cadence stories / sections wrapper (appointment-only props)
- Caps calibrados **≤360px** — 390 inalterado

### Anti-catálogo

Sinais de regressão:

- Primeiro gesto = lista de serviços sem passar pela presença
- Scroll rush @ 320 pula hero “como se nunca existisse”
- Seção “Agendar Horário” lê como app de booking, não continuação editorial

Mitigação validada: peek da primeira seção visível no fold @ 320.

### Cadence vertical

Ordem canônica após hero:

1. Headline + CTA + highlights (painel inferior)
2. Stories (camada social — competição leve monitorada)
3. Primeira seção feed (promessa)
4. Composer (continuidade conversacional)

---

## 5. Hierarchy Rules

### Competição emocional

Duas interfaces legíveis simultaneamente no mesmo instante = **ruptura**.

| Ruptura observada | Cleanup | WS |
|-------------------|---------|-----|
| Maps sólido preto vs copy humano | Outline fallback | 10A |
| Composer overlay z-70 vs drawer chegada | Deferência contextual | 10B |
| Hero domina + feed ausente | Cadence @ 320 | 10C |

**Pergunta:** quem deve respirar primeiro neste momento da experiência?

### Densidade perceptiva

- **Contenção intencional** ≠ vazio acidental
- Densidade inferior do hero @ 320 era PDC-07 — não resolver amputando cover
- Silêncio na base do drawer = copy + fallback leve — não stack operacional

### Coexistência contextual

- Overlay composer aceitável quando **coexistência conversacional** faz sentido (service/professional)
- Hidden composer aceitável em **momentos de foco** (chegada, confirmation)
- Proibido: composer insistente durante chegada; drawer virando hub operacional

### Respiro e silêncio

| Conceito | Significado |
|----------|-------------|
| **Respiro** | Whitespace emocional — cadence entre blocos |
| **Silêncio** | Ausência de ruído operacional — não minimalismo extremo |
| **Ruptura** | Quebra de atmosfera — Maps preto, composer competindo, feed fantasma |

### Tensão aceitável vs ruptura

| Aceitável | Ruptura |
|-----------|---------|
| Booking drawer operacional (fluxo transacional) | Chegada parecendo app de mapas |
| Stories competindo levemente com highlights | Hero virando dashboard |
| Rush path parcialmente utilitário | Presença ↔ app alternando no path intencional |
| Maps como escape hatch | Maps sequestrando emocionalmente |

---

## 6. Anti-Patterns

Documento explícito — **rejeitar em review**:

| Anti-pattern | Sintoma | Por quê mata |
|--------------|---------|--------------|
| **Dashboardização** | Grids, métricas, tabs na hero | Utilitário |
| **Google clone** | Endereço+mapa+tel empilhados | Commodity |
| **Excesso de CTA** | Múltiplos primários; footer pesado | Hub operacional |
| **Explicação excessiva** | ETA, trânsito, lotação, grade completa | App utilitário |
| **Overlays agressivos** | Composer z-70 sobre contexto humano | Multitool |
| **Multitool feeling** | Drawer + composer + Maps competindo | UI tradicional |
| **Feature consciente de si** | “Como chegar” botão; mapa embed quebrado | Quebra gramática |
| **Utilitarização progressiva** | Cada PR “só adiciona utilidade” | Morte lenta da tese |
| **Universalização precoce** | Replicar hero/chegada em todas verticais | Dilui identidade |
| **Layout hack** | Comprimir hero para “mostrar feed” | Mata atmosfera |
| **Design showcase** | Cleanup que só embeleza | Não reduz ruído perceptivo |
| **Esconder composer sem restauração** | Composer some e não volta | Quebra confiança |
| **Aplicar fix 320 no 390** | Regressão no viewport maduro | Disciplina perceptiva |

---

## 7. Vertical Philosophy

### Appointment como vertical especial

Appointment / Barba Negra é **laboratório de presença física** — não “vertical de booking”.

Camadas proprietárias validadas:

- Hero operacional viva
- Linha operacional falada
- Chegada contextual (`na Augusta` → drawer)
- Perceptual cleanups WS-10A/B/C

### Assimetria intencional

```txt
Dentro do piloto: linguagem coerente.
Entre verticais: assimetria esperada até contrato maduro.
```

- **Não universalizar** hero/chegada sem observação + gate humano
- Demo alterna “produto futuro” (Appointment) e “produto anterior” (outras) — consciente

### Fit vertical — chegada contextual

| Fit | Verticais | Nota |
|-----|-----------|------|
| **Forte** | Appointment, restaurant, health, gym/studio | Visita presencial = produto |
| **Moderado** | Events, realestate, courses, professionals | Chegada importa; não é gesto primário |
| **Fraco** | E-commerce | Logística ≠ presença |
| **Anti-fit** | Influencer, personal, institutional | Presença digital |

### Quando NÃO universalizar

- Padrões WS-10 calibrados @ **≤360px** — appointment-only
- `leadingContent` hero — single-vertical até Etapa 3 consolidada ✅
- Composer deferência na chegada — appointment pilot; replicar exige sessão observacional

### Anti-fit vertical

Replicar Appointment em e-commerce, influencer ou institutional **sem fit** = regressão cultural.

---

## 8. Operational Gates

### Gate obrigatório — todo WS futuro

Responder por escrito antes de código:

| # | Pergunta |
|---|----------|
| G1 | Isso **aprofunda presença** contextual? |
| G2 | Isso **preserva silêncio**? |
| G3 | Isso cria **competição emocional** indesejada? |
| G4 | Isso transforma **conversa em ferramenta**? |
| G5 | Isso **explica demais**? |
| G6 | Isso ameaça **feed-first editorial**? |
| G7 | Isso **universaliza** padrão de piloto sem observação? |
| G8 | O que **NÃO** será construído neste WS? |

**Falha em G1 ou G6:** stop. **Falha em G7 sem GO humano:** stop.

### Gate perceptivo — micro-ajustes (Etapa 2)

Aplicar variante da pergunta central conforme escopo (ruído / coexistência / cadence).

### Gate técnico mínimo (piloto Appointment)

| Gate | Quando |
|------|--------|
| `pnpm typecheck` | Sempre |
| `pnpm qa:appointment` | Mudanças Appointment |
| Sessão observacional | Mudanças hero/chegada/composer |
| Viewports 320 + 390 | Mudanças espaciais |

### Perceptual Debt — histórico consolidado

| ID | Item | Status pós WS-10 |
|----|------|------------------|
| PDC-01 | Maps footer dominance | ✅ WS-10A |
| PDC-05 | Composer ↔ drawer @ 320 | ✅ WS-10B |
| PDC-06 | Feed peek @ 320 | ✅ WS-10C |
| PDC-07 | Hero lower density @ 320 | ✅ WS-10C |
| — | Dois registros presença/booking | Observar — não feature |
| — | Stories vs highlights | Tensão leve aceitável |

### Estado perceptivo consolidado (Appointment @ 2026-05-31)

| Camada | Estado |
|--------|--------|
| Hero contextual | Estável |
| Arrival language | Muito forte |
| Maps hierarchy | Resolvido adequadamente |
| Composer coexistence | Muito melhor |
| Feed continuity @ 320 | Elegante |
| Atmosfera | Preservada |
| Rush collapse | Muito reduzido |
| Appointment identity | Forte |

---

## Contratos rápidos (referência cruzada)

### Hero (HP)

| ID | Regra |
|----|-------|
| HP-01 | Hero orienta; catálogo no feed/drawer |
| HP-02 | Tempo presente — hero viva |
| HP-03 | Máximo 1 CTA primário |
| HP-04 | Linha operacional = frase falada |
| HP-05 | Anti-dashboard |
| HP-06 | Anti-Google-clone |
| HP-07 | Hard cap 55vh; peek obrigatório |
| HP-08 | `leadingContent` antes de stories |

### Arrival (AR)

| ID | Regra |
|----|-------|
| AR-01 – AR-07 | Ver §3 |

### Plataforma (PL)

| ID | Regra |
|----|-------|
| PL-01 | Feed protagonista |
| PL-02 | Drawers ≠ modais tradicionais |
| PL-03 | Operacionalidade silenciosa |
| PL-04 | Piloto single-vertical até contrato maduro |
| PL-05 | Tier 1 aditivo — slots, não refactor shell |

Runtime detalhado: [`PERCEPTUAL_INVARIANTS.md`](../runtime/PERCEPTUAL_INVARIANTS.md).

---

## Como usar este documento

### Novo WS de feature

1. Ler §1 Core Thesis + §8 Gates  
2. Preencher G1–G8 por escrito no doc do WS  
3. Verificar anti-patterns §6  
4. Se tocar hero/chegada/feed: verificar §2–§4  

### PR review perceptivo

1. Pergunta gate §1  
2. Competicao emocional §5  
3. Anti-pattern scan §6  
4. Universalização §7  

### Regressão cultural

Se algo “parece útil” mas falha G1 → **utilitarização**. Reverter ou redimensionar escopo.

---

## Linhagem documental

| Fase | Documentos |
|------|------------|
| WS-09 | [`STRATEGIC_PRODUCT_AUDIT_POST_WS09.md`](../audit/STRATEGIC_PRODUCT_AUDIT_POST_WS09.md), WS-09B–D.1 audits |
| WS-10 Etapa 1 | [`OBSERVATIONAL_HARDENING_WS10.md`](../audit/OBSERVATIONAL_HARDENING_WS10.md), S1–S3 |
| WS-10 Etapa 2 | WS-10A, WS-10B, WS-10B.1, WS-10C |
| WS-10 Etapa 3 | **Este documento** |
| Runtime | [`PERCEPTUAL_INVARIANTS.md`](../runtime/PERCEPTUAL_INVARIANTS.md) |

---

## Manutenção

Alterar este documento requer:

1. **GO humano** explícito  
2. Sessão observacional ou evidência perceptiva documentada  
3. Atualização de baseline neste header  
4. Nenhuma feature shipada “antes” da consolidação sem exceção registrada  

```txt
Percepção validada → linguagem operacional → proteção contra drift.
```

---

*WS-10 Etapa 3 — Language Consolidation. O produto agora tem gramática explícita.*
