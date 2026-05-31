# WS-10 — Sessão 1 — Relatório Observacional Perceptivo

**Data:** 2026-05-31  
**Baseline:** `main` @ `a6ec41b`  
**Observador:** sessão assistida (Playwright + leitura visual lenta)  
**Ambiente:** 390×844 · uso lento · `/demo` → Agendamento  
**Contraste:** Restaurante, E-commerce  
**Regra:** zero código · zero feature · zero implementação

---

## Veredicto da sessão

A Social Landing no Appointment **já sustenta a tese de presença contextual viva** no fold hero → chegada. O produto respira, a linha operacional soa falada, e o drawer de chegada lê como **continuação da mesma conversa**.

O momento em que a experiência **deixa de parecer presença e volta a parecer UI** é previsível e localizado: **footer utilitário do drawer de chegada** (Maps sólido) e, com mais intensidade, **drawer de booking** (catálogo de serviços em sheet alto).

**Missão cumprida:** identificar o que **não perder** — contenção, silêncio, linguagem integrada — e onde a utilitarização **ainda ronda**, sem propor correção.

---

## Fluxos percorridos

| # | Fluxo | Status |
|---|-------|--------|
| 1 | Fold zero — hero, linha, stories, feed peek | ✅ |
| 2 | Scroll lento no feed — cadência editorial | ✅ |
| 3 | Tap `na Augusta` → drawer chegada | ✅ |
| 4 | Leitura copy + footer Maps/WhatsApp | ✅ |
| 5 | Fechamento drawer (parcial — ver nota) | ⚠️ |
| 6 | `Agendar horario` → drawer booking | ✅ |
| 7 | Fechamento booking → retorno hero | ✅ |
| 8 | Repetição chegada | ✅ (script) |
| 9 | Contraste Restaurante | ✅ |
| 10 | Contraste E-commerce | ✅ |

**Nota de sessão:** fechamento por backdrop em um take não dismissou o drawer; Escape funcionou nos takes seguintes. Registrado como fricção de gesto, não como item de Etapa 2 automático — observação apenas.

---

## Screenshots

| Momento | Arquivo |
|---------|---------|
| Fold zero Appointment | `ws10-s1-01-hero-fold.png` |
| Feed após scroll lento | `ws10-s1-02-feed-cadence.png` |
| Drawer chegada aberto | `ws10-s1-03-arrival-drawer-open.png` |
| Drawer chegada — copy + footer | `ws10-s1-04-arrival-drawer-detail.png` |
| Pós-chegada (drawer ainda visível em 1 take) | `ws10-s1-05-after-arrival-close.png` |
| Drawer booking — catálogo | `ws10-s1-06-booking-drawer.png` |
| Retorno pós-booking | `ws10-s1-07-after-booking-close.png` |
| Contraste Restaurante | `ws10-s1-09-restaurant-contrast.png` |
| Contraste E-commerce | `ws10-s1-10-ecommerce-contrast.png` |

---

## 1. Onde parece vivo?

| Superfície | Leitura perceptiva |
|------------|-------------------|
| **Hero cover + overlay** | A marca *está* no lugar — luz quente, gradiente, nome sobre cena. Não parece banner de template. |
| **Linha operacional** | `Aberto agora · na Augusta · encaixe leve hoje · até 20h` soa como **frase falada**, não ficha. Dot verde discreto; ritmo inline. |
| **`na Augusta`** | Integrado à frase; underline + chevron leve. Descoberta, não botão de feature. |
| **Headline editorial** | *"Corte preciso, barba bem feita e um clima de casa…"* — convite, não CTA corporativo. |
| **Drawer chegada — título** | `Chegar na Augusta` nasce do lugar já lido. Continuidade semântica forte. |
| **Drawer chegada — copy** | Orientação humana (*portaria discreta*, *movimento tranquilo depois das 18h*). **Prepara chegada**, não informa endereço. |
| **Compactação do drawer** | Sheet proporcional ao conteúdo; respiro branco intencional, não folha infinita. |
| **Feed peek no fold** | Primeira seção visível abaixo de stories — feed continua **promessa**, não rodapé. |
| **Retorno pós-booking** | Hero + composer restaurados — atmosfera de “casa” permanece. |

---

## 2. Onde parece ferramenta?

| Superfície | Leitura perceptiva |
|------------|-------------------|
| **CTA `Abrir no Maps`** | Botão preto sólido, full-width — **fallback operacional** legítimo, mas visualmente **protagonista demais** vs copy editorial acima. |
| **Drawer booking** | `Escolha o servico` + cards preço/duração/thumbnail — **catálogo**. Utilitário aceitável para booking, mas contraste forte com chegada contextual. |
| **Seção feed `Agendar Horario`** | Ícone calendário + label uppercase + lista preço/chevron — energia **app de agendamento**, não editorial puro. |
| **Highlights + Stories** | Duplicação semântica (`Cortes`, `Barba`, `Agendar` em pills e rings) — não quebra, mas **fala React/sistema** mais que lugar. |
| **Event debug panel** | `Events (N)` / Issues — quebra atmosfera no demo (dev); lembrar que sessões reais humanas não devem incluir isso na leitura de produto. |

---

## 3. Onde perde atmosfera?

| Momento | O que acontece |
|---------|----------------|
| **Olhar desce para footer do drawer chegada** | Copy humano → **bloco preto Maps** — queda de tom emocional para ferramenta externa. |
| **Abertura drawer booking** | Sheet alto, lista densa — sensação muda de *presença* para *transação*. |
| **Scroll feed até serviços** | Cadência editorial cede para **lista com preço** — esperado na vertical, mas é o segundo “frio” após hero quente. |
| **Troca Appointment → Restaurante** | Appointment parece **produto futuro**; Restaurante parece **social landing clássica**. Assimetria perceptível — intencional, mas exige contenção para não virar inconsistência. |

Transições drawer **não** parecem modais abruptos — `rounded-t-3xl`, backdrop, sheet bottom ancorado mantêm família visual.

---

## 4. Onde explica demais?

| Elemento | Leitura |
|----------|---------|
| Drawer chegada — 4 linhas de copy | No limite superior do aceitável; ainda **humanas**, não tutorial. Não cortar ainda. |
| Endereço no subtitle do drawer | Necessário como ancoragem; uma linha — ok. |
| Descrições nos cards de booking | Explicam serviço (*Corte tradicional com maquina…*) — útil para booking, **verboso** para presença. |
| Labels uppercase em seções do feed | `AGENDAR HORARIO` energy — explica estrutura do app ao usuário. |

Nada no fluxo de **chegada** explica demais hoje. O excesso verboso concentra-se no **booking/feed utilitário** — zona permitida, mas distinta.

---

## 5. Momento crítico — presença → UI

### Primário (chegada contextual)

```txt
Leitura do copy humano
        ↓
Olhar atinge "Abrir no Maps" (sólido, full-width)
        ↓
Experiência vira ferramenta externa
```

**Preservar:** tudo *antes* desse olhar.  
**Fragilidade:** hierarquia footer vs corpo do drawer.

### Secundário (booking)

```txt
Tap "Agendar horario"
        ↓
Sheet alto + catálogo preço/duração
        ↓
UI de agendamento clássica (aceitável, mas outra gramática)
```

**Leitura:** não é bug — é **dois registros** na mesma vertical: *presença* (hero/chegada) vs *transação* (booking). O risco é **contaminar** o primeiro com o segundo.

### Terciário (feed scroll)

```txt
Stories/highlights
        ↓
Seção "Servicos populares" com chevrons
        ↓
Marketplace leve
```

---

## Questionário perceptivo (Sessão 1)

| ID | Resposta | Nota |
|----|----------|------|
| Q1 Ferramenta? | **Leve** | Maps + booking; hero/chegada não |
| Q2 Vivo? | **Sim** | Hero + linha + chegada |
| Q3 Explica demais? | **Não** (chegada) · **Leve** (booking) | |
| Q4 Perdeu silêncio? | **Leve** | Footer Maps; debug panel no demo |
| Q5 UI vs presença? | **Leve** | Momento crítico no footer |
| Q6 Hero → drawer mesma conversa? | **Sim** | Melhor acerto da sessão |
| Q7 Feed protagonista? | **Parcial** | Peek ok; hero domina fold |
| Q8 Google clone? | **Não** | Sem mapa, sem perfil empilhado |
| Q9 Dashboard? | **Não** | |
| Q10 Contenção? | **Contenção** | Assimetria vertical parece escolha |

---

## Hero respiration

| Aspecto | Leitura |
|---------|---------|
| Densidade vertical | Hero + stories + peek — denso mas **respirável**; cover com ar negativo no topo da cena. |
| Hierarquia | Marca → linha operacional → headline → 1 CTA — ordem emocional correta. |
| Silêncio | Sem badges, grids, métricas. **Preservar.** |
| Fragilidade | Highlights + stories repetem vocabulário — não quebra silêncio, adiciona **camadas**. |

---

## Feed cadence

| Aspecto | Leitura |
|---------|---------|
| Scroll lento | Transição hero → chips → stories → seções é **contínua**, não saltos de layout. |
| Tom | Editorial no topo; **utilitário** ao chegar em serviços/preços. |
| Protagonismo | Feed existe no fold; hero domina emoção. Equilíbrio aceitável para piloto. |
| Preservar | Peek da primeira seção — âncora feed-first. |

---

## Drawer emotional weight

| Drawer | Peso emocional | Peso utilitário |
|--------|----------------|-----------------|
| **Chegada** | Alto (copy, título contextual) | Médio (Maps/WhatsApp footer) |
| **Booking** | Baixo | Alto (catálogo, preços, sheet alto) |

**Leitura:** dois drawers, duas gramáticas — **correto** se mantidos separados. Perigo: fazer chegada parecer booking (mapa, coords, ETA).

---

## Footer hierarchy (chegada)

```txt
Corpo editorial (dominante em área e tom)
        ↓
CTA Maps (dominante em contraste visual)
        ↓
WhatsApp outline (secundário — equilibrado)
```

**Candidato #1 de dívida perceptiva (Etapa 2):** Maps ainda **grita** apesar do copy ganhar a narrativa.

---

## Presence vs UI — tensão

| Polo presença | Polo UI |
|---------------|---------|
| Cover, linha falada, `na Augusta` | Maps sólido |
| Copy de chegada | Cards preço/duração |
| Headline editorial | Section headers uppercase |
| Drawer compacto chegada | Drawer alto booking |

**Tensão produtiva** — desde que não colapsem num único registro utilitário.

---

## Contraste vertical

| Vertical | Sensação fold zero |
|----------|-------------------|
| **Appointment** | Presença viva + operacional + chegada possível |
| **Restaurante** | Social landing clássica — intro + stories + grid food |
| **E-commerce** | Idem — catálogo forward |

**Assimetria:** intencional e **forte**. Appointment não deve ser “normalizado” para parecer Restaurante; Restaurante não deve receber hero/chegada por imitação.

---

## O que preservar (não tocar)

1. Linha operacional como **frase falada** — sem preço, sem grade horária completa  
2. **`na Augusta` na frase** — linguagem, não link solto  
3. Título drawer **nasce do lugar**  
4. Copy de chegada **humano** — portaria, ritmo, estacionamento como dicas, não specs  
5. Drawer chegada **compacto** — content-fit  
6. **Sem mapa embed** — silêncio > placeholder  
7. Feed peek no fold  
8. **Contenção** — assimetria Appointment como laboratório, não template  

---

## O que parece frágil (monitorar)

1. Maps CTA — protagonismo visual vs fallback  
2. Duplicação stories/highlights — camadas semânticas redundantes  
3. Dois registros (presença vs booking) na mesma vertical — risco de contaminação futura  
4. Assimetria demo — usuário pode achar Appointment “quebrado” vs outras verticais se não houver contenção narrativa  

---

## O que ameaça contenção intencional

| Ameaça | Por quê |
|--------|---------|
| Adicionar mapa/fachada sem asset maduro | Repete erro OSM |
| Peso visual Maps “porque é CTA principal” | Esquece que experiência principal é copy |
| Universalizar hero/chegada | Dilui gramática nascida no piloto |
| Empilhar metadata na linha operacional | Volta ficha técnica (WS-09C.1 revertido) |
| ETA/trânsito/lotação | Waze creep |
| Igualar booking drawer à chegada ou vice-versa | Colapsa registros |

---

## Perceptual debt candidates (Etapa 2 — hipóteses, não aprovação)

| # | Item | Tipo | Prioridade | Evidência sessão |
|---|------|------|------------|------------------|
| PDC-01 | Peso visual `Abrir no Maps` | Utilitarização involuntária | **Alta** | Momento crítico primário |
| PDC-02 | Contraste chegada compact vs booking alto | Inconsistência de energia | Média | Dois drawers |
| PDC-03 | Section headers feed uppercase | SaaS/app | Baixa | Feed cadence |
| PDC-04 | Stories + highlights overlap | Ruído semântico | Baixa | Hero respiration |
| PDC-05 | WhatsApp outline balance | Referência positiva | — | Secundário bem calibrado |

**Explicitamente fora da Etapa 2 desta sessão:** mapas, features, IA, universalização.

---

## Veredicto final

| | |
|-|-|
| **Reforça tese** | ✅ Hero → chegada como presença contextual viva |
| **Neutro** | Feed utilitário / booking — gramática distinta, aceitável |
| **Sinal de risco** | ⚠️ Maps footer — único ponto onde utilitarização ameaça silêncio sem quebrar tese |

**Próximo passo WS-10:** Sessão 2 (320px + uso rápido) ou Sessão 2 humana real — **ainda sem Etapa 2 código**.

---

*Sessão 1 — entender o que NÃO perder.*
