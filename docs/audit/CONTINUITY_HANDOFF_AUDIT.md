# Auditoria de Continuidade — Social Landing

**Tipo:** snapshot estratégico · handoff operacional · memória institucional  
**Data:** 2026-05-31  
**Baseline:** `main` @ `b88172c`  
**Piloto:** Appointment / Barba Negra  
**Propósito:** permitir retomada integral em nova conversa sem perda de linguagem, direção ou maturidade perceptiva

---

## Prompt de continuidade (copiar para nova sessão)

```txt
Baseline: main @ b88172c
WS-13 Etapa 1 observacional ativo
M-01 corrigido: morph card → composer unificado entre feed e drawers
Não houve motion polish
M-05 permanece observação residual
Próximo passo: Sessão B humana com foco nos 5 pilares + checar se M-01 realmente desapareceu perceptivamente
```

**Contrato perceptivo restaurado (M-01):**

```txt
mesma gesture → mesma viagem física
```

---

## 1. Estado atual do produto

### O que a Social Landing parece hoje

```txt
feed editorial social-native
+ presença operacional humana (piloto)
+ continuidade física da marca (piloto)
+ inteligência conversacional silenciosa
```

Perceptivamente, é uma **interface de presença contextual viva** — ambienta, descobre e **prepara deslocamento digital → físico**, sem virar utilitário. Não é categoria existente; é síntese emergente validada principalmente em **uma vertical**.

O usuário sente:

- **Conversa**, não app — especialmente no path chegada (`na Augusta` → drawer)
- **Mesma superfície** — feed continua após fechar drawers (scroll preservado, peek visível)
- **Peso físico leve** — drawers deslizam e desaceleram; não teletransportam
- **Presença no tempo presente** — hero viva, linha operacional falada, não banner estático

### O que ela NÃO parece

| Rejeitado | Por quê |
|-----------|---------|
| Google Business Profile / clone de mapas | Lugar é linguagem, não feature |
| Dashboard operacional | Mata atmosfera |
| App de booking / marketplace | Booking existe como drawer transacional, não como home |
| Rede social completa | Stories + feed sim; sem grafo, timeline algorítmica |
| CRM / gestão de marca | Operacionalidade silenciosa, não painéis |
| Motion showcase | Animação desaparece quando funciona |

### Categoria perceptiva emergente

**Presença contextual editorial** — landing social-native que **prepara chegada**, não informa presença.

Tese central (constitucional):

```txt
A Social Landing não informa presença.
Ela prepara chegada.
```

Corolário:

```txt
A Social Landing não informa endereço.
Ela prepara chegada.
```

### O que tornou Appointment especial

Appointment / Barba Negra é **laboratório de presença física**, não “vertical de booking”.

Camadas proprietárias validadas:

| Camada | Contribuição |
|--------|--------------|
| **Hero operacional viva** | Tempo presente, cover atmosférico, linha falada |
| **Arrival grammar** | `na Augusta` → “Chegar na Augusta” — continuação de conversa |
| **Feed editorial** | Descoberta, bastidores, reviews — promessa abaixo do hero |
| **Deferência contextual** | Composer hidden na chegada; overlay no booking service |
| **Continuidade espacial** | Retorno ao mesmo scroll após drawer (WS-11) |
| **Continuidade física** | Drawer momentum/settle antes de unmount (WS-12) |
| **Maps como fallback** | Outline, footer — não protagonista emocional |

Sequência canônica:

```txt
Intro → Hero (presença viva) → Stories → Feed (descoberta)
→ Drawer (aprofundamento) → Maps/WhatsApp (fallback operacional)
```

Cada camada respira na anterior. Demo alterna Appointment (futuro) e outras verticais (spine anterior) — **assimetria intencional**.

---

## 2. Linha do tempo estratégica

| Fase | Descoberta / entrega | Mudança perceptiva | Preservado | Removido / evitado |
|------|----------------------|--------------------|------------|-------------------|
| **WS-09** (B→D.1) | Chegada contextual; hero operacional; linha falada | Localização virou **linguagem**; hero viva; drawer chegada nasce do contexto | Feed editorial, morph, composer spine | Endereço como botão; mapa embed; chegada utilitária |
| **WS-10 Etapa 1** | Observação pura (3 sessões @ 320/390) | Aprendeu **o que não tocar**; PDCs documentados | Tudo — zero código | Impulso de “consertar” sem evidência |
| **WS-10A** | Maps hierarchy cleanup | Maps deixa de sequestrar emocionalmente | Copy humana domina | Maps sólido preto como CTA |
| **WS-10B** | Composer ↔ drawer coexistence | Chegada respira sozinha @ 320 | Composer retorna ao fechar | Dual-interface (copy + composer glass) |
| **WS-10C** | Hero/feed spatial @ 320 | Feed peek ~26px → ~87px; cadence vertical | Hero @ 390 inalterado | Comprimir hero para “mostrar feed” |
| **Etapa 3** | `PERCEPTUAL_LANGUAGE_SYSTEM.md` | Linguagem oficial; gates G1–G8; anti-patterns | Runtime Tier 1 | Dependência de “sensibilidade do momento” |
| **WS-11** | Arrival return scroll continuity | Fechar drawer = **mesmo lugar** no feed | Drawer como aprofundamento | “Recomeçar do zero” perceptivo |
| **WS-12** | Drawer physical continuity | Release → momentum/settle → close (~280ms) | Motion invisível | Teletransporte binário (~0ms) |
| **WS-12.1** | Validação perceptiva (GO) | Confirmou: motion = consequência do gesto | Thresholds intactos | Micro-tuning sem evidência |

### Arco narrativo fechado

```txt
WS-10  → linguagem perceptiva
WS-11  → continuidade espacial
WS-12  → continuidade física
WS-12.1 → validação perceptiva
```

Alinhamento com princípios clássicos de UX motion: continuidade reduz ruptura; easing imita desaceleração; motion explica causa/efeito; mapa espacial preservado; boa animação desaparece perceptivamente.

---

## 3. Linguagem consolidada

### Documentos centrais (autoridade)

| Documento | Papel |
|-----------|-------|
| [`docs/os/PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md) | Constituição perceptiva · gramática · gates G1–G8 · anti-patterns |
| [`docs/runtime/PERCEPTUAL_INVARIANTS.md`](../runtime/PERCEPTUAL_INVARIANTS.md) | Invariantes Tier 1 runtime (6 core + social/institutional) |

### Hero Language

- **Tempo presente** — hero transmite *agora*
- **Linha operacional falada** — “Aberto agora · na Augusta · encaixe leve hoje”
- **Lugar como linguagem** — `placeHint` integrado à frase, tapável
- **CTA único primário** — um gesto principal
- **Feed como promessa** — peek abaixo do hero; feed não some nem compete no fold
- **Hard caps:** 55vh default; calibragem ≤360px appointment-only (36–50vh)

### Arrival Grammar (AR-01 – AR-07)

- Drawer = **continuação de conversa**, não nova página
- Título nasce do lugar: “Chegar na Augusta”
- Copy domina: referenceHint, routeHint, parkingHint, arrivalMood
- **Sem mapa embed** — Maps/WhatsApp no footer como fallback outline
- **Deferência contextual:** composer `hidden` na chegada; retorna ao fechar

### Feed System

- **Editorial**, não catálogo no fold
- **Peek como promessa** — continuidade hero → feed @ 320
- Booking/catálogo vivem em drawers e seções — não substituem presença no primeiro gesto
- Cadence: hero → stories → primeira seção → composer

### Hierarchy Rules

- **Quem respira primeiro** — pergunta gate para cada momento
- Duas interfaces legíveis simultaneamente = ruptura
- Silêncio ≠ minimalismo extremo; respiro = cadence emocional

### Anti-patterns (rejeitar em review)

Dashboardização · Google clone · excesso de CTA · explicação excessiva (ETA, trânsito) · overlays agressivos · multitool feeling · feature consciente de si · utilitarização progressiva · universalização precoce · layout hack · design showcase · esconder composer sem restauração · aplicar fix 320 no 390

### Appointment philosophy

```txt
Laboratório de presença física.
Não vertical de booking.
Assimetria intencional vs outras verticais.
Não universalizar sem observação + gate humano.
```

Regra cultural pós-marco:

```txt
Toda feature nova deve parecer inevitável.
Não inteligente.
```

---

## 4. Estado perceptivo atual

| Camada | Estado | Notas |
|--------|--------|-------|
| **Hero contextual** | Forte / estável | Vivo @ 320 e 390; cadence calibrada WS-10C |
| **Arrival grammar** | Muito forte | Copy editorial; Maps fallback; composer deferido |
| **Feed continuity** | Boa | Peek @ 320; retorno scroll WS-11; mesma superfície |
| **Spatial continuity** | Boa | `preservePageScroll` no arrival; scroll restaurado |
| **Drawer physics** | Natural | Momentum ~250ms; settle ease-out; GO WS-12.1 |
| **Composer coexistence** | Resolvida | Hidden chegada; overlay service/pro; retorno silencioso |
| **Morph card → composer** | Unificado (M-01 ✅) | Feed + drawers + custom modules — mesmo pipeline 480ms @ `b88172c` |
| **Maps hierarchy** | Correta | Outline fallback WS-10A |
| **Motion protagonism** | Baixo (ótimo) | Consequência do gesto, não showcase |
| **Cultural discipline** | Muito alta | Gates G1–G8; observação antes de código |

### Zonas estáveis

- Tese “prepara chegada”
- Arrival path (hero → tap lugar → drawer)
- Feed-first + peek @ 320
- Drawer como sheet físico (não modal)
- Composer restore cycle
- Motion invisível pós-WS-12
- Morph feed ↔ drawer unificado (M-01 — correção de contrato, não polish)

### Zonas frágeis

- **M-05 (residual)** — composer `hidden` @ chegada → `getComposerFallbackRect()` pode land impreciso; observar, não fixar sem evidência
- **Booking ↔ chegada** — dois registros emocionais na mesma vertical (presença vs transacional); tensão aceitável, não ruptura
- **Stories vs highlights** — competição leve monitorada
- **Assimetria demo** — Appointment maduro vs outras verticais; risco de “copiar Appointment” sem fit
- **Sessão B humana** — GO cultural condicionado a validação externa

### Tensões remanescentes (observar, não feature)

| Tensão | Status |
|--------|--------|
| Dois registros presença/booking | Debt conhecido — Proxy A: leve reorientação booking→chegada |
| Rush path parcialmente utilitário | Aceitável no booking |
| Universalização hero/chegada | Proibida sem gate humano |

### Riscos conhecidos

| Risco | Descrição |
|-------|-----------|
| **Overbuilding** | Base boa → impulso de adicionar features |
| **Motion perfectionism** | Refinar thresholds/springs sem evidência |
| **Utilitarização progressiva** | Cada PR “só adiciona utilidade” |
| **Sofisticar o invisível** | IA, personalização, antecipação perceptível |
| **Universalização precoce** | Replicar piloto Appointment em verticais anti-fit |
| **Dashboardização** | Grids, métricas, tabs na hero |

---

## 5. Decisões irreversíveis (ou quase)

Estas decisões **não devem ser revertidas** sem GO humano explícito + bump de baseline:

| Decisão | Razão |
|---------|-------|
| **“Prepara chegada, não informa presença”** | Tese central; identidade emergente |
| **Maps = fallback operacional** | Outline, footer — nunca protagonista emocional |
| **Motion invisível** | WS-12 validado; não showcase, não bounce teatral |
| **Feed como promessa / protagonista editorial** | PL-01; closing drawer = mesmo scroll |
| **Deferência contextual do composer** | Hidden na chegada; restore ao fechar |
| **Appointment como vertical especial** | Laboratório; não universalizar sem observação |
| **Drawers ≠ modais** | Bottom sheet, pull-to-close, continuidade física |
| **Lugar como linguagem (`na Augusta`)** | Gramática proprietária WS-09 |
| **Feature inevitável, não inteligente** | Disciplina pós-WS-11 |
| **Evitar dashboardização** | Anti-pattern constitucional |
| **Calibragem 320 appointment-only** | Não aplicar fixes narrow no 390 |
| **Observação antes de expansão** | WS-10 Etapa 1 como precedente |
| **G1–G8 por escrito antes de WS funcional** | Sistema imunológico validado WS-11/12 |

---

## 6. Sistema imunológico

### Gates G1–G8 (obrigatório antes de código)

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

**Stop:** falha G1 ou G6 · falha G7 sem GO humano

### Processo obrigatório antes de WS funcional

```txt
1. Responder G1–G8 por escrito no doc do WS
2. Escopo micro — uma camada perceptiva por vez
3. Observação (se hero/chegada/composer/espacial)
4. Implementação mínima
5. Validação perceptiva (não só QA técnico)
6. GO/NO-GO explícito
```

### Regras operacionais

- **Micro-escopo** — WS-10A/B/C model: um PDC por PR
- **Observação antes de expansão** — Etapa 1 WS-10 precedente
- **Validação perceptiva antes de refinamento** — WS-12.1 modelo; não tunar thresholds sem evidência
- **Motion work pausado** — sem WS-12B, springs, gesture orchestration

### Validação na prática (WS-11 / WS-12)

| WS | Gates | Validação |
|----|-------|-----------|
| WS-11 | G1–G8 ✅ | `preservePageScroll`; proxy scroll 260px restaurado |
| WS-12 | G1–G8 ✅ | velocity + settle; ~0ms → ~250ms flick visible |
| WS-12.1 | N/A (não funcional) | GO perceptivo; motion = gesto, não showcase |

Gates técnicos piloto: `pnpm typecheck` · `pnpm qa:appointment` · viewports 320 + 390

---

## 7. Estado operacional atual

| Item | Estado |
|------|--------|
| **Branch** | `main` |
| **Sync origin** | ✅ `main` @ `b88172c` |
| **Último commit** | `b88172c` — fix M-01 morph continuity feed ↔ drawers |
| **Commit anterior relevante** | `a819db3` handoff sync · `d24edd7` WS-13 Etapa 1 · `6d47b50` WS-12.1 |
| **WS ativo** | **WS-13 Etapa 1** (observacional · Sessão B pendente) |
| **M-01** | ✅ **Corrigido** @ `b88172c` — revalidação perceptiva na Sessão B |
| **M-05** | Observação residual (fallback rect @ chegada) |
| **Motion work** | **Pausado** — M-01 foi restauração de contrato, não evolução de motion |
| **Sessão B humana** | ☐ **Pendente** — [`WS-13_SESSION_B_FACILITATOR.md`](WS-13_SESSION_B_FACILITATOR.md) |
| **Proxy A** | ✅ documentado |
| **Artefatos recentes** | `ws121-*.png` · `ws121-perceptual-metrics.json` · scripts `ws12-*` |

### Documentação de referência rápida

| Tema | Arquivo |
|------|---------|
| Linguagem oficial | `docs/os/PERCEPTUAL_LANGUAGE_SYSTEM.md` |
| Invariantes runtime | `docs/runtime/PERCEPTUAL_INVARIANTS.md` |
| Workstreams | `docs/os/WORKSTREAMS.md` |
| Observação WS-10 | `docs/audit/OBSERVATIONAL_HARDENING_WS10.md` |
| Auditoria estratégica pós-09 | `docs/audit/STRATEGIC_PRODUCT_AUDIT_POST_WS09.md` |
| Human continuity | `docs/audit/WS-11_HUMAN_CONTINUITY_VALIDATION.md` |
| **Presença contínua (WS-13)** | `docs/audit/WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md` |
| **M-01 morph audit** | `docs/audit/WS-13_MORPH_ENTRYPOINT_AUDIT.md` |
| **Sessão B facilitador** | `docs/audit/WS-13_SESSION_B_FACILITATOR.md` |
| Drawer physics | `docs/audit/WS-12_DRAWER_PHYSICAL_CONTINUITY.md` |
| Drawer validation | `docs/audit/WS-12-1_DRAWER_PHYSICS_PERCEPTUAL_VALIDATION.md` |

### Código-chave (continuidade)

| Área | Arquivos |
|------|----------|
| Hero | `components/business/appointment/appointment-operational-hero.tsx` |
| Arrival | `components/business/appointment/appointment-arrival-drawer.tsx` |
| Feed/composer/morph | `components/business/conversation-context-morph.tsx` · `conversation-selection-context.tsx` · `appointment-feed.tsx` |
| Drawers shared | `lib/ui/use-drawer-sheet-drag.ts` · `lib/ui/drawer-layout.ts` · `components/business/action-drawer.tsx` |
| Scroll preserve | `preservePageScroll` prop em `action-drawer.tsx` |

---

## 8. Próximo passo recomendado

```txt
Sessão B humana (5 pilares + revalidação perceptiva M-01)
        ↓
Preencher WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md §Registro
        ↓
Pausa curta
        ↓
Decidir Etapa 2 / WS funcional apenas com evidência humana
```

**Não abrir novo fix agora.** M-01 está corrigido tecnicamente; falta confirmar que a ruptura **desapareceu perceptivamente** para o participante externo.

### Por que NÃO abrir novo WS imediatamente

O projeto está num estado raro:

```txt
consistente o suficiente para observar,
e não necessariamente precisando de mais construção imediatamente.
```

O risco maior **não é falta de qualidade — é excesso de intervenção**.

| Risco | Consequência |
|-------|--------------|
| Overbuilding | Perda de identidade emergente |
| Motion perfectionism | Motion vira protagonista |
| Sofisticar o invisível | Sistema perceptível demais |
| Universalizar piloto | Dilui gramática proprietária |

### Protocolo Sessão B (resumo)

- **Quem:** 1 participante externo, não envolvido no projeto
- **Duração:** 5–8 min por fluxo
- **Briefing:** “navegue como visitante” — sem vocabulário de produto
- **Fluxos:** casual scroll+chegada+retorno · rush booking+chegada · 320/device real
- **Observar:** hesitação, naturalidade, continuidade espontânea
- **Perguntas indiretas depois:** conversa ou app? perdeu contexto? feed = continuação?
- **Registrar:** 3–5 frases por fluxo; hesitação + naturalidade + quebra (se houver)

### O que NÃO abrir agora

- WS-12B / advanced physics / spring refinement
- Gesture orchestration
- Maps/ETA/IA chegada
- Universalização hero/chegada
- Qualquer WS sem evidência perceptiva humana

---

## 9. Pergunta central para futura conversa

Toda retomada deve começar por:

```txt
A Social Landing continua aprofundando presença contextual
ou começou a adicionar inteligência perceptível demais?
```

Variantes operacionais:

```txt
Isso aprofunda presença contextual
ou transforma a experiência em utilitário?
```

```txt
Isso aumenta continuidade física/espacial
ou só deixa a animação mais chamativa?
```

```txt
Toda feature nova deve parecer inevitável.
Não inteligente.
```

---

## Síntese executiva (handoff em 30 segundos)

A Social Landing deixou de ser “feed + drawers” e tornou-se **protetora de continuidade mental**. Appointment prova uma gramática: hero viva → chegada conversacional → feed editorial → drawers físicos → fallback operacional silencioso.

Ciclo WS-10→12.1 **fechado e versionado**. Motion pausado. **Próximo insight vem de humano real**, não de código.

O produto já tem **comportamento próprio**, não só interface própria. Proteger isso vale mais do que construir mais.

---

## Índice de commits recentes (Appointment arc)

| Commit | WS | Essência |
|--------|-----|----------|
| `b6d5670` | WS-10C | Hero/feed cadence @ 320 |
| `7af5943` | Etapa 3 | `PERCEPTUAL_LANGUAGE_SYSTEM.md` |
| `2d0e56d` | WS-11 | Scroll preserve no arrival |
| `60913bd` | WS-12 | Drawer momentum/settle |
| `6d47b50` | WS-12.1 | Validação perceptiva GO |
| `b3bc15c` | Handoff | Mapa cognitivo oficial |
| `d24edd7` | WS-13 Etapa 1 | Baseline observacional presença contínua |
| `b88172c` | M-01 fix | Morph feed ↔ drawer unificado — contrato perceptivo restaurado |

---

*Memória institucional — continuidade perceptiva, não backlog de features.*
