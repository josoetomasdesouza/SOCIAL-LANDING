# Auditoria Estratégica — Pós WS-09D.1

**Data:** 2026-05-31  
**Baseline:** `main` @ `24394e9` (PR #76 mergeado)  
**Escopo:** identidade emergente de produto — não QA, não changelog  
**Stack analisado:** WS-09B → WS-09B.1 → WS-09C → WS-09C.1 → WS-09D → WS-09D.1  
**Piloto:** Appointment / Barba Negra  
**Autoridade:** ponte entre o que a Social Landing era e o que está começando a virar

---

## Veredicto executivo

A Social Landing **deixou de ser apenas um feed editorial com drawers conversacionais** e começou a se tornar uma **interface de presença contextual viva** — uma camada que ambienta, descobre e **prepara a transição digital → físico**, sem virar utilitário.

O maior acerto do stack WS-09 não foi visual. Foi **gramatical**:

> **A localização virou linguagem, não feature.**

Isso é raro. E frágil. O diferencial nasceu da **humanização silenciosa** — operacionalidade sem barulho, chegada sem mapa, contexto sem dashboard.

**Recomendação imediata:** **PAUSA observacional.** Não expandir, não universalizar, não adicionar camadas utilitárias. Consolidar contratos perceptivos antes de qualquer novo WS.

---

## 1. Identidade emergente do produto

### O que a Social Landing parece hoje

| Metáfora | Fit | Evidência |
|----------|-----|-----------|
| **Presença contextual viva** | ★★★★★ | Hero operacional + linha humana + chegada contextual (Appointment) |
| **Interface de atmosfera** | ★★★★☆ | Feed editorial, morph, composer, silêncio visual preservado |
| **Camada digital → físico** | ★★★★☆ | WS-09D.1: “na Augusta” → “Chegar na Augusta” — continuidade, não navegação |
| **Feed editorial social-native** | ★★★★☆ | Stories, seções, long-press → morph — spine intacto pós-WS-09 |
| **Microsite / landing page** | ★★★☆☆ | Coluna central, seções modulares — mas drawers e composer a elevam |
| **Rede social** | ★★☆☆☆ | Stories e feed sim; ausência de grafo social, timeline algorítmica, perfis |
| **Sistema operacional de marca** | ★★☆☆☆ | Sinais operacionais sim; sem painéis, métricas, gestão |
| **App utilitário / marketplace** | ★☆☆☆☆ | Booking e Maps existem como **fallback**, não como experiência principal |

### Leitura sintética

Hoje a Social Landing é, perceptivamente:

```txt
feed editorial social-native
+ presença operacional humana (piloto)
+ continuidade física da marca (piloto)
+ inteligência conversacional silenciosa
```

Não é uma categoria existente. É uma **síntese** que ainda só se manifesta completamente em **uma vertical**.

### O que ela NÃO parece mais

| Antes (pré-WS-09) | Depois (pós-WS-09D.1) |
|-------------------|------------------------|
| Landing que termina no digital | Landing que **prepara deslocamento** |
| Hero como banner estático | Hero como **presença viva no tempo presente** |
| Endereço como dado utilitário | Lugar como **frase falada** (“na Augusta”) |
| Chegada como link solto / botão | Chegada como **aprofundamento contextual** |
| Appointment como “vertical de booking” | Appointment como **laboratório de presença física** |
| Produto demo coerente por vertical | Produto com **camada proprietária emergente** |

### O que ela ainda NÃO parece (e não deve parecer cedo)

- Google Business Profile
- Dashboard operacional
- Marketplace de descoberta local
- App de mapas / navegação
- CRM / gestão de marca
- Rede social completa

---

## 2. Linguagem perceptiva

### Superfícies auditadas

| Superfície | Papel no sistema | Coerência pós-WS-09 |
|------------|------------------|---------------------|
| **Hero viva** | Presença + contexto operacional | ✅ Gramática nova, alinhada a `HERO_OPERATIONAL_AUDIT.md` |
| **Feed** | Protagonista editorial | ✅ Peek preservado; hero não substitui seções |
| **Stories** | Camada social-native | ⚠️ Reordenados após hero (B.1) — melhor, mas ainda competem semanticamente com highlights |
| **Drawers** | Profundidade contextual | ✅ Chegada compacta; booking/checkout inalterados |
| **Composer** | Continuidade conversacional | ✅ Overlay durante arrival drawer; morph intacto |
| **Chegada contextual** | Transição digital → físico | ✅ Mesma atmosfera (`bg-card`, copy humano, sem mapa) |

### Existe linguagem perceptiva coerente?

**Dentro do piloto Appointment: sim.**

A sequência perceptiva ficou legível:

```txt
Intro (chrome social)
→ Hero (presença viva + linha operacional)
→ Stories (camada social)
→ Feed (descoberta editorial)
→ Drawer (aprofundamento contextual)
→ Maps/WhatsApp (fallback operacional)
```

Cada camada **respira** na anterior. O drawer de chegada não parece “outra página” — parece **continuação da mesma conversa**.

**Na plataforma inteira: parcial.**

| Camada | Appointment | Outras verticais Stack A | Stack B (influencer/personal/inst) |
|--------|-------------|--------------------------|-------------------------------------|
| Hero viva | ✅ | ❌ ausente | ❌ ausente |
| Chegada contextual | ✅ | ❌ | ❌ |
| Linha operacional humana | ✅ | ❌ | ❌ |
| ActionDrawer + composer modes | ✅ | ✅ (parcial) | ⚠️ shadcn drawer, física diferente |
| Morph → composer | ✅ (feed) | ✅ | ⚠️ Missing em alguns |

**Leitura:** ainda parece “vários sistemas juntos” **entre verticais**, mas **dentro do piloto** a linguagem emergiu coerente. O risco não é fragmentação interna — é **generalização prematura** antes da gramática estar madura.

### Padrões perceptivos que emergiram (candidatos a contrato)

1. **Contexto antes de utilidade** — informação operacional nasce da cena, não de blocos
2. **Profundidade por continuidade** — drawers estendem a atmosfera, não abrem apps
3. **Silêncio inteligente** — poucos elementos, copy falado, sem metadado visível
4. **Fallback operacional** — Maps/WhatsApp no footer, não no centro da experiência
5. **Feed peek como âncora** — hero nunca pode eliminar a promessa do feed abaixo

---

## 3. Relação digital → físico

### O que surgiu

| Camada | Mecanismo | Estado |
|--------|-----------|--------|
| **Presença operacional** | Linha humana na overlay (“Aberto agora · na Augusta…”) | ✅ WS-09C/C.1 |
| **Lugar como linguagem** | `placeHint` clicável integrado à frase | ✅ WS-09D.1 |
| **Chegada contextual** | Drawer “Chegar na Augusta” + copy orientador | ✅ WS-09D/D.1 |
| **Orientação humana** | referenceHint, routeHint, parkingHint, arrivalMood | ✅ mock editorial |
| **Fallback espacial** | “Abrir no Maps” — externo, footer | ✅ sem embed |

### Auditoria perceptiva

| Pergunta | Resposta |
|----------|----------|
| Parece natural? | **Sim** — especialmente porque nasce da frase já lida |
| Parece raro? | **Sim** — quase nenhum produto trata chegada como continuidade editorial |
| Parece útil? | **Sim, com limite** — copy humano > mapa quebrado; Maps como escape hatch |
| Parece excessivo? | **Não no estado atual** — uma linha + drawer compacto; sem coordenadas, ETA, trânsito |
| Ganha valor em quais categorias? | Onde **deslocamento físico** é parte da experiência de marca |

### Verticais por valor de “chegada contextual”

| Fit | Verticais | Por quê |
|-----|-----------|---------|
| **Forte** | Appointment, restaurant, health, gym/studio, hotel boutique*, coworking*, café* | Visita presencial é o produto |
| **Moderado** | Events (venue), realestate (visita), courses (presencial/híbrido), professionals (consultório) | Chegada importa, mas não é o gesto primário |
| **Fraco** | E-commerce | Logística ≠ presença; frete ok, “chegada” não |
| **Anti-fit** | Influencer, personal, institutional | Presença digital; endereço físico raramente central |

*\* não implementados — fit perceptivo inferido*

### Insight estratégico central

```txt
A Social Landing não quer informar o endereço.
Ela quer preparar a chegada.
```

Isso posiciona o produto numa camada **UX de presença física** — transição digital → físico com tom editorial, não utilitário.

---

## 4. Riscos estratégicos

### Mapa de riscos (médio prazo)

| Risco | Probabilidade | Impacto | Já apareceu? | Sinal observável |
|-------|---------------|---------|--------------|------------------|
| **Google clone** | Alta se não contido | Crítico | 🟡 tentativa | OSM map removido — acerto; Maps CTA sólido ainda chama atenção |
| **Dashboardização** | Média | Crítico | 🟢 contido | Hero evita grids/métricas; vigilância contínua |
| **Excesso operacional** | Alta | Alto | 🟡 latente | Tentação de ETA, trânsito, lotação, horário completo |
| **IA invasiva** | Média | Alto | 🟢 contido | Resolver editorial; sem “assistente de chegada” |
| **Excesso de contexto** | Média | Médio | 🟡 latente | Linha operacional densa demais vira ficha técnica |
| **Marketplace creep** | Baixa-média | Alto | 🟢 contido | Feed não agrega competidores |
| **Perda de atmosfera** | Média | Crítico | 🟢 contido pós-polish | Remoção do mapa restaurou silêncio |
| **Perda de feed-first** | Baixa | Crítico | 🟢 contido | Peek 241px preservado em B.1 |
| **Excesso de features** | Alta | Alto | 🟡 pós-sucesso | Confiança após merge #76 |
| **Perda de silêncio visual** | Média | Alto | 🟢 contido | Drawer compacto; copy > chrome |
| **Universalização precoce** | Alta | Crítico | 🟡 tentação | 11 verticais sem hero; pressão de “replicar” |
| **Stack B divergência** | Média | Médio | 🔴 presente | influencer/personal/inst — drawer física diferente |
| **Assimetria vertical visível** | Alta | Médio | 🟡 presente | Só Appointment tem presença viva |

### Riscos que **já começaram** a aparecer

1. **Tentação utilitária pós-vitória** — mapa OSM foi adicionado e quebrou premium; removido a tempo
2. **Maps como protagonista visual** — CTA sólido no footer ainda compete com copy (aceitável; monitorar)
3. **Assimetria Appointment vs resto** — demo alterna entre “produto futuro” e “produto anterior”
4. **Stories vs hero** — competição semântica leve (highlights vs rings)

### Riscos que **ainda não** apareceram (mas são os mais perigosos)

- ETA / distância / trânsito
- Mapa embed interativo
- Horário completo em grade
- Lotação / fila em tempo real
- Perfil comercial empilhado (tel, endereço, estrelas, fotos, Q&A)
- IA que narra chegada em voz de assistente

---

## 5. Contratos recomendados

Estes padrões **já existem na prática** e deveriam virar contrato oficial antes de qualquer expansão.

### Contratos de presença (Hero)

| ID | Regra | Origem |
|----|-------|--------|
| **HP-01** | Hero **orienta**; catálogo vive no feed e no drawer | HERO_OPERATIONAL_AUDIT §1.3 |
| **HP-02** | Hero transmite **tempo presente** — não banner estático | WS-09B |
| **HP-03** | Máximo **1 CTA primário** na hero; highlights são secundários | WS-09B observation |
| **HP-04** | Linha operacional = **frase falada**, não metadado uppercase | WS-09C.1 |
| **HP-05** | Hero **não pode** virar dashboard (grids, tabs, métricas, widgets) | HERO_OPERATIONAL_AUDIT §1.3 |
| **HP-06** | Hero **não pode** virar clone Google (mapa+endereço+tel empilhados) | HERO_OPERATIONAL_AUDIT §1.4 |
| **HP-07** | Hard cap **55vh** — feed peek obrigatório | WS-09B pilot |
| **HP-08** | `leadingContent` antes de stories quando hero for presença dominante | WS-09B.1 |

### Contratos de chegada (Arrival)

| ID | Regra | Origem |
|----|-------|--------|
| **AR-01** | Chegada **nasce do contexto** — nunca link/botão solto “Como chegar” | WS-09D.1 |
| **AR-02** | Lugar é **linguagem** (`placeHint` na linha operacional) | WS-09D.1 |
| **AR-03** | Drawer título **nasce do lugar** (“Chegar na Augusta”) | WS-09D.1 |
| **AR-04** | Drawer **content-fit** — sem folha em branco | WS-09D.1 polish |
| **AR-05** | Copy humano **domina**; Maps é **fallback operacional** | WS-09D.1 + review |
| **AR-06** | **Sem mapa embed** até asset local confiável e intencional | WS-09D.1 polish |
| **AR-07** | Hero → drawer = **mesma atmosfera** (continuidade, não nova página) | WS-09D.1 |

### Contratos de plataforma (invariantes reforçados)

| ID | Regra | Ref |
|----|-------|-----|
| **PL-01** | Feed continua **protagonista** | PERCEPTUAL_INVARIANTS §2 |
| **PL-02** | Drawers **nunca** parecem modal tradicional | PERCEPTUAL_INVARIANTS §1 |
| **PL-03** | Operacionalidade **silenciosa** — sem narrar IA | EXPERIENCE_PRINCIPLES |
| **PL-04** | Piloto single-vertical até contrato maduro | WS-09B.1 observation |
| **PL-05** | Tier 1 mínimo aditivo (`leadingContent` slot) — sem refactor shell | WS-09B.1 |

### Anti-patterns oficiais

| Anti-pattern | Por quê mata |
|--------------|--------------|
| Link “Como chegar” abaixo do CTA primário | Quebra hierarquia; feature colada |
| Mini mapa externo quebrado | Percepção premium → placeholder |
| Drawer 95dvh com pouco conteúdo | Folha em branco; sensação inacabada |
| Endereço como bloco utilitário na hero | Google clone |
| Preço/grade/horário completo na overlay | Ficha técnica |
| ETA, distância, trânsito, lotação | App utilitário |
| Universalizar hero/chegada sem observação | Dilui gramática proprietária |
| Replicar padrão Appointment em e-commerce | Anti-fit vertical |

---

## 6. Verticais — fit da camada WS-09

### Hero viva + operacionalidade humana

| Fit | Verticais | Racional |
|-----|-----------|----------|
| **Forte** | appointment, restaurant, health, gym, café*, hotel boutique*, studio* | Marca física com ritmo do dia |
| **Moderado** | events, realestate, professionals, courses | Presença importa; operacionalidade varia |
| **Fraco** | ecommerce, courses (100% EAD) | Transação/logística > presença |
| **Anti-fit** | influencer, personal, institutional | Identidade digital; endereço periférico |

### Chegada contextual

| Fit | Verticais | Racional |
|-----|-----------|----------|
| **Forte** | appointment, restaurant, health, gym, café*, coworking*, hotel* | Deslocamento = parte da experiência |
| **Moderado** | events (venue), realestate (visita), professionals | Chegada relevante mas não central |
| **Fraco** | courses, ecommerce | Entrega digital ou correio |
| **Anti-fit** | influencer, personal, institutional | Sem gesto de “ir até lá” |

### Regra de expansão

> Só expandir camada WS-09 para vertical onde **presença física** é parte do gesto emocional primário — não onde endereço é metadado de negócio.

---

## 7. O que NÃO fazer agora

**CRÍTICO.** Próximos passos que seriam **ansiedade arquitetural**, não evolução natural:

| Não fazer | Por quê |
|-----------|---------|
| Universalizar hero/chegada para 11 verticais | Gramática ainda nasceu em 1 piloto |
| WS-09D.2 com mapa/fachada sem observação | Repetir erro OSM; pressa visual |
| ETA, distância, trânsito, lotação | Mata silêncio; vira Waze |
| Horário completo / grade na overlay | Ficha técnica |
| IA contextual de chegada | Invasiva; quebra tom editorial |
| Perfil comercial empilhado | Google clone |
| Dashboard operacional na hero | Dashboardização |
| Automations / triggers / regras de contexto | Complexidade antes de linguagem |
| Metadata excessiva na linha operacional | Perde humanização C.1 |
| Reduzir Maps a zero | Fallback legítimo — só não pode ser protagonista |
| Novo WS antes de observação orgânica | Confiança pós-merge = maior risco |

### Pausa recomendada (pós #76)

```txt
Observação orgânica real
→ comparação entre verticais (perceptiva, não feature)
→ sensação de uso
→ percepção emocional
→ comportamento do fluxo
```

**Duração sugerida:** até haver evidência de uso real ou nova tensão perceptiva documentada — não deadline artificial.

---

## 8. Próxima fase natural

Sem roadmap detalhado. Apenas direção perceptiva.

### Tensão emergente

A plataforma agora vive **duas velocidades**:

1. **Spine maduro** — feed, morph, composer, drawers Stack A (Era 3 cognitiva)
2. **Camada proprietária nascente** — presença viva + chegada contextual (Era 4 perceptiva?)

A tensão não é técnica. É **identitária**: o que generalizar da camada Appointment sem diluir?

### Direção perceptiva (não feature)

| Direção | Descrição |
|---------|-----------|
| **Consolidar linguagem** | Documentar gramática hero → contexto → chegada como contrato de produto |
| **Observar silêncio** | O que usuários *não* pedem (mapas, ETA) importa tanto quanto o que pedem |
| **Comparar verticais** | Onde a camada faria sentido *como linguagem* — não como feature checklist |
| **Proteger feed-first** | Qualquer evolução deve preservar peek, ritmo, morph |

### Camadas ainda invisíveis (oportunidade estrutural)

Estas **não** são próximos WS — são horizontes perceptivos:

| Camada | Hipótese | Condição para emergir |
|--------|----------|----------------------|
| **Micro material visual** | Fachada/textura no drawer — 5–10% da altura | Asset local confiável; nunca placeholder |
| **Momento do dia** | Hero muda tom (manhã/noite) sem virar widget | Observação de valor emocional |
| **Chegada como ritual** | “Como é chegar aqui” como narrativa de marca | Copy + tom; zero utilitário |
| **Presença social do lugar** | Quem está lá agora — sem virar chat | Muito arriscado; só se silencioso |
| **Continuidade pós-visita** | Feed retoma relação após deslocamento | Requer produto real, não demo |

### O que NÃO é próxima fase

- Mapas complexos
- Navigation stack
- Business profile
- Operational dashboard
- Marketplace local
- IA proativa de deslocamento

---

## Tensões emergentes (síntese)

| Tensão | Polo A | Polo B | Resolução recomendada |
|--------|--------|--------|----------------------|
| **Utilidade vs atmosfera** | Maps, horários, endereço | Silêncio, copy humano | Utilidade como fallback, nunca centro |
| **Piloto vs plataforma** | Appointment completo | 11 verticais sem camada | Pausa; não replicar |
| **Operacional vs editorial** | Status, disponibilidade | Narrativa de marca | Operacional **falado**, não listado |
| **Profundidade vs simplicidade** | Mais contexto no drawer | Drawer textual demais | Micro material visual — futuro, sutil |
| **Confiança vs disciplina** | “Funcionou, expandir!” | “Pausa, observar” | **Disciplina** — maior risco agora é excesso |

---

## Leitura perceptiva do produto atual

### Em uma frase

> A Social Landing está se tornando uma **interface de presença contextual** que usa o feed social como espinha dorsal e começa a estender a marca para o mundo físico — **sem deixar de ser editorial**.

### Em três camadas

```txt
Camada 1 — Atmosfera (madura)
  feed · stories · morph · composer

Camada 2 — Presença viva (nascente, piloto)
  hero · linha operacional · contexto humano

Camada 3 — Continuidade física (nascente, piloto)
  chegada contextual · orientação · fallback Maps
```

### O que tornou o PR #76 forte

Não adicionou features. Adicionou **operacionalidade, chegada, contexto físico e continuidade** sem quebrar silêncio visual, atmosfera, feed-first ou social-native feeling.

Isso era **muito fácil de destruir**. Não foi destruído.

---

## Anti-direções (lista de proteção)

1. Não transformar Social Landing em sistema de mapas  
2. Não transformar hero em business profile  
3. Não transformar drawer em painel operacional  
4. Não empilhar metadata utilitária na overlay  
5. Não universalizar antes de observação  
6. Não adicionar IA que narra chegada  
7. Não competir com Google/Waze/Maps como produto  
8. Não sacrificar feed peek por densidade operacional  
9. Não tratar sucesso do piloto como mandato de replicação  
10. Não confundir “preparar chegada” com “informar endereço”  

---

## Possíveis próximas camadas naturais (horizonte, não backlog)

| Camada | Natureza | Quando |
|--------|----------|--------|
| Contrato oficial WS-09 | Documentação | Após pausa observacional |
| D.2 micro visual | Perceptivo, sutil | Se drawer textual cansar em uso real |
| Maps visual de-emphasis | Perceptivo | Se CTA dominar em testes |
| Vertical piloto #2 | restaurant ou health | Só se fit forte + contrato maduro |
| Stack B convergence | Técnico-perceptivo | Paralelo, não bloqueia WS-09 |

---

## Referências

| Documento | Relação |
|-----------|---------|
| `HERO_OPERATIONAL_AUDIT.md` | Contrato pré-implementação hero viva |
| `WS-09B_POST_MERGE_OBSERVATION.md` | Piloto hero integrado |
| `WS-09B1_LEADING_CONTENT_OBSERVATION.md` | Ordem intro → hero → stories |
| `WS-09C1_OPERATIONAL_HUMANIZATION.md` | Linha operacional humana |
| `WS-09D1_CONTEXTUAL_ARRIVAL_INTEGRATION.md` | Chegada contextual integrada |
| `EXPERIENCE_PRINCIPLES.md` | Princípios de proteção premium |
| `PERCEPTUAL_INVARIANTS.md` | Invariantes Tier 1 |
| `GLOBAL_CONTRACTS.md` | Contratos observáveis globais |
| `VERTICAL_BEHAVIOR_MATRIX.md` | Assimetria entre verticais |

---

## Disciplina operacional — gate para novos WS

A partir deste documento, **cada novo workstream** deve provar explicitamente:

| # | Pergunta obrigatória |
|---|----------------------|
| 1 | **O que aprofunda presença contextual?** — não “o que adiciona feature” |
| 2 | **O que evita utilitarização?** — anti-patterns listados e limites respeitados |
| 3 | **O que mantém feed-first?** — peek, ritmo, morph, composer intactos |
| 4 | **O que NÃO será construído?** — escopo negativo explícito, não implícito |

### Critério de decisão (substitui “é útil?”)

```txt
Isso aprofunda presença contextual
ou transforma a experiência em utilitário?
```

Se a resposta inclinar para utilitário → **não entra**, mesmo que seja “útil”.

### Tese registrada

> **A Social Landing não informa endereço. Prepara chegada.**

Esta frase redefine hero, drawer, contexto, feed, fallback, atmosfera — e o que **não** deve entrar no produto.

### Ativo a proteger

O maior ativo atual não é UI, motion, drawer ou contextual memory.

É **discernimento perceptivo**.

Perder isso → “mais um app bonito”.  
Proteger isso → categoria perceptiva própria.

---

## Decisão final

| Pergunta | Resposta |
|----------|----------|
| Que tipo de produto está emergindo? | **Presença contextual viva com continuidade digital → físico** |
| Está pronto para expandir? | **Não** — pausa observacional |
| O que proteger? | **Humanização silenciosa, feed-first, linguagem > feature** |
| Maior risco agora? | **Excesso de confiança pós-merge** |
| Próximo passo natural? | **Observar, comparar, contratar — não construir** |

---

*Auditoria estratégica — ponte entre Era 3 (cognitiva/conversacional) e Era 4 emergente (presença física contextual).*
