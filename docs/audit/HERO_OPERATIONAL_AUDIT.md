# WS-09A — Hero Operacional Viva — Auditoria Perceptiva

**Date:** 2026-05-31  
**Baseline:** `origin/main` @ `d50ff55` (Era 3 cognitiva consolidada)  
**Type:** Strategic / perceptual contract — **no implementation**  
**Authority:** Contrato para futuros PRs de Hero Viva

---

## 0. Propósito

Este documento define a **gramática perceptiva** da futura camada **Hero Operacional Viva** — como a marca deve *existir* dentro da Social Landing sem regressão em:

- feed editorial
- continuidade contextual (morph → composer)
- profundidade de drawer
- orquestração do composer
- sensação social-native
- inteligência silenciosa

**Não é:** redesign, UI kit, mockup, ou especificação de componentes React.

**É:** contrato de presença, hierarquia, limites e anti-padrões.

---

## 1. Gramática da Hero

### 1.1 O que torna uma hero “viva”

Uma hero viva transmite **presença operacional da marca em tempo presente**, não um banner estático.

| Sinal | Mecanismo perceptivo |
|-------|----------------------|
| **Presença** | A marca parece *estar aqui agora* — status, horário, contexto do dia |
| **Respiração** | Espaço negativo generoso; tipografia editorial; poucos elementos |
| **Contexto** | Uma frase que situa o visitante (“Aberto agora”, “Filas leves hoje”) |
| **Profundidade sugerida** | Mídia dominante convida a explorar, não a comprar imediatamente |
| **Continuidade** | Hero não termina em borda dura — o feed nasce como extensão natural |
| **Silêncio inteligente** | Informação operacional sem narrar que é IA |

**Referência interna existente:** `SocialCompactHero` variant `editorial` (appointment, institutional) — border-y, headline editorial, mídia 4:3, um CTA. Este é o **embrião correto**, não o header utilitário atual (`BusinessFeedIntro`).

### 1.2 O que quebra a sensação viva

- Hero estática sem sinal temporal (parece PDF)
- Copy institucional longa (“Somos líderes em…”)
- Múltiplos CTAs competindo
- Badges e pills sem função narrativa
- Mídia genérica de stock sem vínculo com a marca
- Hero que não muda quando o feed scrolla (monólito congelado)
- Informação duplicada do intro header + hero + primeira seção

### 1.3 O que transforma hero em dashboard

| Gatilho | Por quê |
|---------|---------|
| Grid 2×2+ de métricas | Painel analítico |
| Filtros, tabs, sort | Ferramenta de gestão |
| Mini-cards com ícones utilitários | Widget board |
| 4+ CTAs simultâneos | Console de ações |
| Listagens completas (menu, serviços) | Catálogo disfarçado |
| Comparadores, tabelas | ERP |

**Regra:** Hero **orienta**; catálogo vive no feed e no drawer.

### 1.4 O que transforma hero em clone Google Business

| Gatilho | Por quê |
|---------|---------|
| Bloco mapa + endereço + horário + telefone empilhados | Layout utilitário frio |
| Estrelas + contagem de reviews em destaque central | Agregador de reputação |
| Chips de “Serviços”, “Fotos”, “Perguntas” | Navegação de produto Google |
| Foto quadrada + nome + categoria + botões utilitários | Template GBP |
| “Gerenciar perfil” energy | Admin, não presença |

**Diferença exigida:** Google **informa utilidade**; Social Landing **convida presença editorial**.

---

### 1.5 Elementos permitidos (máximo por hero)

| Slot | Permitido | Limite |
|------|-----------|--------|
| **Mídia dominante** | 1 imagem ou carrossel lento | 1 slot; ver §7 |
| **Identidade** | Nome + logo pequeno OU nome sobre mídia | 1 linha nome |
| **Status operacional** | 1 linha contextual (aberto, fila, evento) | Max 60 chars |
| **Resumo editorial** | 1 headline + 1 subheadline opcional | Headline ≤ 2 linhas |
| **Resumo contextual IA** | 1 frase orientativa, não chat | ≤ 120 chars; sem “Como posso ajudar?” |
| **CTA primário** | 1 ação principal | 1 botão filled |
| **CTA secundário** | 1 ação ghost/text | 1 link ou botão outline |
| **Highlights horizontais** | Scroll de 3–5 chips/cards leves | Max 5 itens visíveis |
| **Sinal social leve** | Rating OU prova social, não ambos em destaque | 1 indicador |

**Densidade máxima:** 7 elementos perceptivos distintos acima da primeira seção de feed (incluindo mídia).

**Densidade ideal:** 5 elementos (mídia, nome, status, headline, 1 CTA).

### 1.6 Elementos proibidos

- Carrinho, avatar de usuário genérico, ícones de admin
- Formulários, inputs, campos de busca
- Chat composer embutido na hero
- Listagem completa de produtos/serviços
- Mapa interativo full-width
- Tabela de horários completa (vai para drawer ou seção feed)
- Métricas de negócio (vendas, conversões, visitantes)
- Banners promocionais rotativos estilo e-commerce 2015
- Pop-ups, modais, tooltips na hero
- Badge “Powered by AI” ou equivalente

### 1.7 Ritmo visual e comportamento emocional

```txt
[ Respiração ] → [ Presença (mídia) ] → [ Reconhecimento (nome) ]
    → [ Contexto (status) ] → [ Convite (headline) ] → [ Ação suave (CTA) ]
        → [ Exploração (highlights) ] → [ Feed ]
```

**Tom emocional:** confiança calma, não urgência.  
**Velocidade:** hero não anima entrada agressiva; fade/slide ≤ 300ms se houver.  
**Estado emocional alvo:** “Estou dentro da casa da marca”, não “Estou num funil”.

---

## 2. Hierarquia perceptiva

### 2.1 Ordem de percepção recomendada (mobile 390×844)

| Ordem | Elemento | Tempo atencional estimado |
|-------|----------|---------------------------|
| 1 | Mídia dominante (ou ambiente visual) | 0–1.5s — impacto cinematográfico |
| 2 | Nome da marca | Ancoragem identitária |
| 3 | Status operacional (1 linha) | “Vivo agora” |
| 4 | Headline editorial | Promessa / clima |
| 5 | CTA primário | Convite único |
| 6 | Highlights horizontais (opcional) | Portas de entrada ao feed |
| 7 | Stories (existente) | Ritmo social já estabelecido |
| 8 | Primeira seção do feed | Exploração |

**Resumo contextual IA (se presente):** entre headline e CTA, **nunca acima** do nome. Deve ler como legenda editorial, não balão de chat.

### 2.2 Validação crítica

| Pergunta | Resposta |
|----------|----------|
| Isso funciona? | **Sim**, se hero ≤ 45–55vh e feed visível no primeiro scroll |
| Existe excesso? | **Sim**, se hero + stories + intro header > 65vh combined |
| Feed perde protagonismo? | **Sim**, se hero contém catálogo ou >1 CTA + highlights densos |
| Hero compete com composer? | **Não**, se composer permanece fixo inferior e hero não usa bottom sticky |

### 2.3 Hierarquia vs. componentes atuais

Hoje existem **três camadas competindo** no topo:

1. `BusinessFeedIntro` — logo, descrição, carrinho fantasma, avatar genérico  
2. `BusinessStories` — bubbles Instagram  
3. `SocialCompactHero` (2 verticais) — embutido em seção primária  

**Contrato futuro:** Hero Viva **substitui ou absorve** o intro utilitário. Stories **permanecem** abaixo da hero (ritmo social). Hero **não duplica** descrição longa do config.

---

## 3. Relação Hero ↔ Feed

### 3.1 Como o feed deve nascer da hero

O feed não deve parecer “outra página”. Coesão via:

| Sinal | Implementação futura (conceitual) |
|-------|-----------------------------------|
| **Tipografia contínua** | Mesmas classes editoriais (`socialPatternClasses`) |
| **Margem horizontal alinhada** | `px-4 sm:px-5` — mesma coluna |
| **Transição sem borda forte** | Evitar card box pesado entre hero e seção 1; preferir border-y editorial ou espaçamento |
| **Título de seção como capítulo** | “Serviços populares” lê como continuação, não novo app |
| **Primeiro módulo ecoa hero CTA** | Se hero CTA = “Agendar”, primeiro módulo = serviços/agenda (já true em appointment) |

### 3.2 Hero deve influenciar primeiros cards?

**Sim, levemente — não deterministicamente.**

- Highlight selecionado na hero pode **scroll/reveal** primeira seção relacionada  
- **Não:** reordenar feed inteiro dinamicamente (risco de caos + memória)  
- **Não:** injetar cards exclusivos só visíveis via hero (fragmentação)

### 3.3 Sinais de coesão vs. fragmentação

| Coesão ✅ | Fragmentação ❌ |
|-----------|-----------------|
| Mesma coluna, mesmo ritmo vertical | Hero full-bleed + feed boxed diferente |
| Paleta e peso tipográfico consistentes | Hero glass pesado + feed flat |
| CTA hero abre mesmo drawer que card feed | CTA hero abre fluxo exclusivo |
| Status hero reflete dados do mock/config | Status hero inventado vs. feed contraditório |

---

## 4. Relação Hero ↔ Drawer

### 4.1 Princípio

Drawer é **profundidade contextual**. Hero é **presença superficial**.  
Hero convida; drawer aprofunda. Mesma família perceptiva (Stack A bottom sheet).

### 4.2 Hero deve abrir drawers?

**Sim — com limite estrito.**

| Ação hero | Drawer permitido | Proibido |
|-----------|------------------|----------|
| CTA primário “Agendar” | ActionDrawer booking (service/pro/datetime) | Confirmar agendamento direto |
| Highlight “Ver cardápio” | ServicesDrawer / feed section scroll | Catálogo completo inline |
| Tap mídia | Galeria leve OU story viewer | Lightbox admin |
| Status “Aberto · até 20h” | Drawer info horários (opcional) | Mapa full-screen |
| WhatsApp | External / intent signal | Chat interno |

**Máximo:** 2 tipos de drawer distintos acionáveis diretamente da hero.

### 4.3 Riscos de “camadas demais”

```txt
Hero → abre drawer → composer overlay → morph layer = COLAPSO PERCEPTIVO
```

**Regras:**

1. Drawer aberto da hero → composer `overlay` ou `hidden` (padrão existente)  
2. Hero **não permanece visível** acima de drawer full — feed subjace, hero scroll away  
3. Nunca hero + drawer + story viewer + composer expandido simultaneamente  
4. Profundidade máxima na stack: **3 camadas** (feed+hero scroll, drawer, composer parcial)

### 4.4 Quando quebra naturalidade

- Hero com 3 CTAs cada um abrindo drawer diferente  
- Drawer de “informação” só para dados que cabem em 1 linha de status  
- Hero CTA que duplica exatamente botão já visível no primeiro card do feed  

---

## 5. Relação Hero ↔ Composer

### 5.1 Princípio crítico

**O composer permanece o anchor inferior da experiência.**  
Hero é **prelude**; composer é **continuidade conversacional**. Não inverter.

Evidência Tier 1: `docs/runtime/COMPOSER_BEHAVIOR_SPEC.md`, invariantes perceptivos, Era 3 AI card-first.

### 5.2 Competição de atenção

| Estado | Hero | Composer |
|--------|------|----------|
| Idle feed scroll | Protagonista superior | Compact footprint |
| Composer engaged | Recede (scroll) | Protagonista |
| Drawer open | Oculta / fora de viewport | `hidden` ou `overlay` |
| Morph active | Pausa leitura hero | Destino visual do morph |

### 5.3 Hero deve colapsar?

**Sim — compressão progressiva no scroll**, não desaparecimento abrupto.

| Scroll | Comportamento recomendado |
|--------|---------------------------|
| 0 | Hero full prescribed height |
| 0–80px | Status + nome sticky opcional (mini bar) |
| >80px | Mídia parallax leve ou fade; hero cede espaço |
| Composer expand | Hero **não** expande; composer nunca empurra hero para modal |

**Proibido:** hero sticky full-height; hero que empurra composer off-screen permanentemente.

### 5.4 Resumo contextual IA na hero vs. composer

| Onde | Função |
|------|--------|
| Hero IA line | 1 frase estática orientativa (“Hoje é um bom dia para…” ) — **não interativa** |
| Composer | Diálogo, cards, follow-up, morph context |

**NUNCA:** input de chat, typing indicator, ou suggestion chips na hero.

### 5.5 Riscos

- EX-05 (`AI_PERCEPTUAL_HEALTH.md`): drawer + composer + context — mitigado por modes  
- Hero IA + composer aberto = **dupla voz** — proibido simultâneo  
- CTA hero “Pergunte à IA” que auto-expande composer — **watch zone**; preferir gesto explícito  

---

## 6. Comportamento mobile

### 6.1 Dimensões alvo (viewport 390×844)

| Zona | Altura alvo | Notas |
|------|-------------|-------|
| Hero mídia | 28–38vh | Cinematográfico, não fullscreen |
| Hero texto + CTA | 12–18vh | Editorial compact |
| **Total hero** | **40–55vh** | Primeira seção feed visível ao scroll leve |
| Stories | ~12vh | Below hero; já existente |
| Composer compact | ~12–15vh footprint | Invariante Tier 1 |

**Hard cap hero:** 55vh sem stories. Com stories abaixo, **hero+stories ≤ 60vh** antes do primeiro título de seção.

### 6.2 Safe area e respiro

- Respeitar `env(safe-area-inset-top)` na mídia edge-to-edge  
- Padding inferior da hero: min 16px antes de stories ou seção  
- Não colar CTA no bottom da hero a ≤8px da borda (parece banner)

### 6.3 Impacto cognitivo

Above-the-fold ideal:

```txt
[ Marca reconhecível ]
[ 1 motivo para ficar ]
[ 1 ação opcional ]
[ Indício de que há mais abaixo — peek feed ou scroll cue sutil ]
```

**Evitar:** hero tão alta que usuário não percebe scroll; hero tão curta que parece header.

---

## 7. Carrossel / foto viva

### 7.1 Faz sentido?

**Sim, com intensidade mínima.** Uma mídia viva sugere marca operacional (ambiente, bastidores, pratos, corte). Carrossel **não** é obrigatório — foto estática forte often suficiente.

### 7.2 Parâmetros permitidos

| Parâmetro | Valor |
|-----------|-------|
| Slides | 2–4 max |
| Autoplay | Opcional; **off por default**; se on: ≥6s por slide |
| Transição | Crossfade lento (400–600ms); **sem** slide horizontal agressivo |
| Indicador | Dots discretos ou progress bar fina — max 4 |
| Gestão | Swipe manual sempre prioritário |
| Conteúdo | Mesma marca, mesma sessão — não ads mixados |

### 7.3 Proibido

- Autoplay <4s (anúncio)  
- Setas grandes laterais estilo banner  
- Texto comercial sobre cada slide  
- Vídeo com áudio auto  
- Carrossel + vídeo + stories **redundantes** no mesmo viewport  

### 7.4 “Janela viva da marca”

Metáfora perceptiva: usuário espiria vitrine ou sala — não passa outdoor.  
Referências: Apple editorial hero (1 imagem forte), Airbnb listing cover (1 hero photo), Spotify artist header (1 arte + nome).

---

## 8. Camada Google-like — o que absorver e rejeitar

### 8.1 Absorver (reinterpretado)

| Elemento GBP | Reinterpretação Social Landing |
|--------------|--------------------------------|
| Nome | Tipografia editorial sobre ou abaixo mídia |
| Nota | 1 linha social proof secundária — não hero central |
| Status aberto/fechado | Linha viva contextual — verbo no presente |
| Localização | Chip ou subheadline — não mapa hero |
| CTAs rápidos | Max 2 — mapear para drawers existentes |
| Fotos | Mídia dominante ou carrossel lento |
| Reviews | **Feed section**, não hero |
| Contexto operacional | Headline + status, não widget grid |

### 8.2 Rejeitar

- Knowledge panel layout (coluna info + coluna ações)  
- Q&A, Posts, Updates tabs  
- “Directions”, “Save”, “Share” icon row GBP clone  
- Street View embed  
- Competitor suggestions  
- Metric tiles (views, searches)  

### 8.3 Diferença perceptiva Google vs. Social Landing

| Google Business | Social Landing Hero Viva |
|-----------------|--------------------------|
| Utilidade primeiro | Presença primeiro |
| Informação densa | Respiração editorial |
| Interface de produto Google | Ambiente social-native da marca |
| Usuário busca dado | Usuário explora casa |
| Frio, confiável, genérico | Calor, contextual, específico |
| Reviews como prova central | Conteúdo + conversa como prova |

### 8.4 Transformar informação em presença viva

**Técnica de copy:** presente continuativo + sensorial leve

- ❌ “Horário: Seg-Sáb 9h-20h”  
- ✅ “Aberto agora · atendemos até 20h”  

- ❌ “4.8 estrelas (328 avaliações)”  
- ✅ “Bem avaliado por quem passa por aqui” (detalhe no feed)

- ❌ “Agende seu horário online”  
- ✅ “Ver horários disponíveis” (CTA suave — alinhado WS-08C)

---

## 9. Anti-padrões — NUNCA FAZER

### 9.1 Lista explícita

| ID | Anti-padrão | Severidade |
|----|-------------|------------|
| H-N01 | Hero >55vh mobile sem peek feed | S1 |
| H-N02 | >2 CTAs filled simultâneos | S1 |
| H-N03 | Grid de métricas / KPIs | S1 |
| H-N04 | Composer ou input de chat na hero | S1 |
| H-N05 | Mapa interativo hero | S1 |
| H-N06 | Listagem catálogo completa na hero | S1 |
| H-N07 | Autoplay carrossel agressivo (<4s) | S1 |
| H-N08 | Clone visual Google Business (icon row + tabs) | S1 |
| H-N09 | Badge “Destaque” + badge promo + badge AI | S2 |
| H-N10 | Glassmorphism pesado multi-layer | S2 |
| H-N11 | Vídeo background loop distraindo | S2 |
| H-N12 | Hero sticky full-screen persistente | S2 |
| H-N13 | Duplicar intro header + hero + primeira seção | S2 |
| H-N14 | IA narrando cards visíveis no feed | S2 |
| H-N15 | Confirmar transação na hero (booking/checkout) | S1 |
| H-N16 | Pop-up promo sobre hero | S1 |
| H-N17 | Avatar usuário genérico na hero (demo chrome) | S2 |
| H-N18 | Carrinho em hero de vertical não-commerce | S2 |

**S1 = block merge** · **S2 = human review required**

### 9.2 Padrões “quase certos” que viram regressão

- `SocialCompactHero` variant `default` com badge “Destaque” + highlights + CTA — **ok como módulo**, **denso demais** como hero global  
- `SocialContactCTA` como hero — **operacional demais**; pertence a seção feed ou drawer, não topo  
- Stories **acima** da hero — inverte hierarquia; stories permanecem **abaixo**

---

## 10. Piloto recomendado

### 10.1 Vertical escolhida: **Appointment (Barba Negra)**

| Critério | Por quê appointment |
|----------|---------------------|
| Operacional natural | Status, horário, profissionais, serviços |
| Hero embrião existente | `SocialCompactHero` editorial + `SocialContactCTA` |
| Semi-stateful AI | WS-08C validado — CTA suave → calendar drawer |
| Drawer maduro | Booking flow multi-step já coerente |
| Google-like fit | Barbearia/salão é caso GBP clássico — teste de reinterpretação |
| Risco contido | Vertical isolada; não toca ecommerce frozen |

### 10.2 Vertical alternativa (fase 2): **Restaurant**

- Forte módulo primário + operacional (delivery, horário)  
- Sem semi-stateful ainda — menor complexidade composer  
- Risco: over-trigger AI restaurant em hero com CTA “Recomendar”

### 10.3 Vertical desaconselhada para piloto

| Vertical | Motivo |
|----------|--------|
| Ecommerce | Resolver frozen; hero viva conflita com product grid primário |
| Institutional | Já fragmentado; mock incoerente — confunde auditoria |
| Influencer | Link-in-bio semantics; hero operacional artificial |
| Personal | Portfolio, não operação |

### 10.4 Escopo do piloto futuro (quando autorizado — WS-09B)

**In scope conceitual:**

- Substituir/absorver intro header em appointment  
- Hero slot único no shell ou seção `primary-action` canonizada  
- 1 mídia + status + headline + 1 CTA + highlights opcionais  
- Wire CTA → `handleStartBooking` / `openScheduleBooking` existentes  

**Out of scope:**

- Tier 1 `business-social-landing.tsx` refactor amplo  
- Novo drawer type  
- LLM / status real-time  
- Generalizar para 12 verticais  

### 10.5 Riscos do piloto

| Risco | Mitigação |
|-------|-----------|
| Hero + ScheduleModule redundantes | Hero CTA único; módulo vira “explorar” |
| Composer competição | Manter composer default; hero scroll away |
| 55vh breach com stories | Medir combined height em QA visual |
| Percepção GBP clone | Audit copy + layout contra §8 |

### 10.6 Gate de saída do piloto (futuro)

- [ ] Hero appointment ≤55vh em 390×844  
- [ ] Peek primeira seção visível  
- [ ] CTA abre drawer existente — sem novo fluxo  
- [ ] Composer anchor intacto  
- [ ] `pnpm qa:events` 8/8 + `pnpm qa:appointment` 8/8  
- [ ] Human checklist: 0× H-N01–H-N08  
- [ ] Nenhuma alteração Tier 1 frozen sem GO  

---

## 11. Contrato para PRs futuros

Qualquer PR de implementação Hero Viva deve referenciar este documento e declarar:

1. Quais slots da §1.5 usa  
2. Altura mobile medida  
3. Relação hero→drawer mapeada  
4. Comportamento scroll vs. composer  
5. Anti-padrões H-N* verificados  

**Branch sugerida (futuro):** `workstream/hero-operational-pilot-appointment`  
**Workstream ID:** WS-09B (implementação — **não autorizada por este doc**)

---

## 12. Síntese executiva

A **Hero Operacional Viva** é a camada onde a marca **respira no presente** — não onde ela **reporta dados**.

Social Landing já possui linguagem para isso (`SocialCompactHero` editorial, appointment flow, composer orchestration). O risco não é técnico — é **dashboardização** e **clone Google**.

**Regra de ouro:**

> Hero convida presença. Feed explora universo. Drawer aprofunda intenção. Composer continua conversa.

---

## Related

- [`ERA3_COGNITIVE_BASELINE_SNAPSHOT.md`](./ERA3_COGNITIVE_BASELINE_SNAPSHOT.md)
- [`PERCEPTUAL_MATURITY_REPORT.md`](./PERCEPTUAL_MATURITY_REPORT.md)
- [`docs/os/EXPERIENCE_PHILOSOPHY.md`](../os/EXPERIENCE_PHILOSOPHY.md)
- [`docs/runtime/PERCEPTUAL_INVARIANTS.md`](../runtime/PERCEPTUAL_INVARIANTS.md)
- [`docs/ai/AI_PERCEPTUAL_HEALTH.md`](../ai/AI_PERCEPTUAL_HEALTH.md)
- [`components/business/social-compact-hero.tsx`](../../components/business/social-compact-hero.tsx)

---

## Recommendation

**GO** — Gramática definida. Próximo passo autorizado: **WS-09B piloto appointment** (implementação mínima), somente após GO humano explícito e PR isolado.

**NO-GO** — Implementação imediata, redesign wide, ou hero em múltiplas verticais simultâneas.
