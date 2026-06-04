# WS-08D V1 — Plano de Execução da Primeira PR Técnica

**Baseline:** `origin/main` @ `dc4281b`  
**Decisão humana:** `GO implementação WS-08D V1` — **V1-core somente**  
**Autorização:** [`WS-08D_V1_GO_RECORD.md`](./WS-08D_V1_GO_RECORD.md) · charter §11 I2  
**Branch:** `workstream/ws-08d-v1-establishment-dialogue`  
**Tipo:** primeira PR de código · pronta para codificação

---

## Decisão registrada (inviolável)

```txt
GO implementação WS-08D V1

Ordem: [2] WS-08C → [1] diálogo V1 → [3] fallback situado
Sem Tier 1 · sem invariantes · sem runtime · sem drawer no composer
Categorias: T-01, T-02, T-03, T-04 (texto), T-05, T-13, P-FB01
```

---

## 1. Arquivos a criar (exatos)

| # | Caminho | Responsabilidade |
|---|---------|------------------|
| C1 | `lib/mock-data/appointment-establishment-dialogue-context.ts` | Tipos `EstablishmentDialogueContext`, `EstablishmentDialogueOperational`, `EstablishmentDialogueArrival` |
| C2 | `lib/mock-data/appointment-establishment-dialogue-v1.ts` | Classificadores + copy T01–T13 + FB; `resolveEstablishmentDialogueV1(input, ctx) → { text } \| null` |
| C3 | `lib/mock-data/appointment-conversation-resolver-composed.ts` | `createAppointmentConversationResolverWithDialogue(ctx): ConversationResponseResolver` |
| C4 | `scripts/qa/fixtures/appointment-dialogue-v1-flows.json` | Metadados AP-D01…08 (documentação harness) |
| C5 | — | `WS-08D_V1_GO_RECORD.md` publicado em commit docs-only (não repetir na PR técnica) |

**Não criar nesta PR:** `appointment-dialogue-v1-validation.mjs` separado — estender `appointment-ai-resolver-validation.mjs` (menos scripts, um gate).

---

## 2. Arquivos a modificar (exatos)

| # | Caminho | Mudança permitida |
|---|---------|-------------------|
| M1 | `components/business/appointment/appointment-feed.tsx` | `useMemo` → `createAppointmentConversationResolverWithDialogue({ operational, arrival, config, serviceNames })` |
| M2 | `lib/mock-data/appointment-conversational-search.ts` | **Nenhuma** (consumido via C3) |
| M3 | `scripts/convergence/appointment-ai-resolver-validation.mjs` | Steps 5–7 patterns; adicionar steps 9–16 (AP-D01…08) |
| M4 | `scripts/qa/fixtures/ai-canonical-flows.json` | AP-05, AP-06 `contentPattern` / `forbiddenPattern` |
| M5 | `package.json` | Apenas se necessário documentar steps no script existente — **sem novo script obrigatório** |

**Proibido modificar:** `conversational-ai.tsx`, `business-social-landing.tsx`, `appointment-conversational-visual-block.tsx`, `lib/runtime/**`, `docs/ai/AI_CONVERSATIONAL_INVARIANTS.md`, outras verticais.

---

## 3. Sequência de implementação

### Fase 0 — Branch

```bash
git fetch origin
git checkout -b workstream/ws-08d-v1-establishment-dialogue origin/main
# ou origin/main após merge do plano GO, se aplicável
```

### Fase 1 — Contexto (C1)

- Definir `EstablishmentDialogueContext`:
  - `brandName: string`
  - `operational: { liveState, placeHint, hoursHint?, momentHint?, openingHours }`
  - `arrival: { addressLine, parkingHint?, referenceHint? }`
  - `serviceNames: string[]` (nomes de `appointmentBarberServices` para T-13)

### Fase 2 — Diálogo V1 (C2)

Implementar **apenas** classificadores V1-core (ordem de tentativa **dentro de [1]** após [2] null):

| Ordem interna [1] | Função | Templates | Não capturar |
|-------------------|--------|-----------|--------------|
| 1 | `matchOutOfDomain` | T13-A…E | se [2] já respondeu |
| 2 | `matchHours` | T03-A…D | cues de `agendar`, `degrade`, chips |
| 3 | `matchLocation` | T04-A,B,C,E | `como chego` → T04-D texto only |
| 4 | `matchArrivalText` | T04-D | **sem** visualBlock / drawer |
| 5 | `matchFirstVisit` | T05-A…C | |
| 6 | `matchGreeting` | T01-A…E | |
| 7 | `matchSmallTalk` | T02-A…C | |

- Copy: strings de [`WS-08D_V1_CONVERSATIONAL_TEMPLATES.md`](./WS-08D_V1_CONVERSATIONAL_TEMPLATES.md) com interpolação `ctx`.
- `situatedFallbackV1(input, ctx)` → FB-A/B (P-FB01); **sempre** retorna `{ text }`.
- **Proibido em C2:** RECOMMENDATION_CUES, schedule cues, service keywords (ficam em [2]).

### Fase 3 — Composto (C3)

```typescript
export function createAppointmentConversationResolverWithDialogue(
  ctx: EstablishmentDialogueContext
): ConversationResponseResolver {
  const transactional = createAppointmentMockConversationResolver()
  return (input) => {
    const fromTransactional = transactional(input)
    if (fromTransactional) return fromTransactional

    const fromDialogue = resolveEstablishmentDialogueV1(input, ctx)
    if (fromDialogue) return fromDialogue

    return { text: situatedFallbackV1(input, ctx) }
  }
}
```

**Invariante:** composto **nunca** retorna `null`.

### Fase 4 — Wiring (M1)

- Importar `createAppointmentConversationResolverWithDialogue`.
- `useMemo` deps: `appointmentHeroOperationalContext`, `appointmentArrivalContext`, `appointmentBarberShopConfig`, `appointmentBarberServices`.
- Passar `openingHours` de config + `serviceNames` mapeados.

### Fase 5 — Testes (M3, M4)

- Atualizar AP-05 / AP-06 patterns (§4.2).
- Adicionar steps 9–16 AP-D (§4.3).
- Rodar gates localmente (§5).

### Fase 6 — PR

- Título: `feat(appointment): WS-08D V1 establishment dialogue (core)`
- Corpo: decisão GO, ordem [2][1][3], lista arquivos, checklist §6.

---

## 4. Plano de testes

### 4.1 Regressão WS-08C — AP-01…AP-07

| ID | Prompt / setup | Expectativa | Step atual |
|----|----------------|-------------|------------|
| AP-01 | `preciso cortar o cabelo` | `appointment-conversation-results-block` ≥2 botões | Step 1 |
| AP-02 | `degrade` | bloco com Degrade/Carlos | Step 2 |
| AP-03 | chip `appointment-barber-barber-1` + `quais servicos?` | bloco serviços | Step 3 |
| AP-04 | chip + `tem algo a tarde?` | schedule ou results | Step 4 |
| AP-05 | `voces tem estacionamento` | texto situado; **sem** bloco booking | Step 5 — **atualizar pattern** |
| AP-06 | reload + `qual o estacionamento` | sem Carlos; texto situado | Step 7 — **atualizar pattern** |
| AP-07 | chip + `quero agendar` → CTA | drawer `Escolha data e horario` | Step 6 |

**Comando:** `pnpm qa:appointment` → **16/16** após adicionar AP-D (8 legado + 8 novos).

**Harness JSON:** `pnpm qa:ai-regression` — appointment flows AP-01…07 com patterns alinhados a M4.

### 4.2 AP-05 / AP-06 — patterns novos (M4 + M3)

Substituir:

```json
"contentPattern": "Barba Negra|ajudar|orientar"
```

Por:

```json
"contentPattern": "Augusta|estacionamento|conveniado|Barba Negra|barbearia"
```

`forbiddenPattern` AP-05/06 (manter + reforçar):

```txt
Ver horarios|Degrade|Carlos Silva|Como posso ajudar|rapidinho
```

### 4.3 Novos — AP-D01…AP-D08 (M3 steps 9–16)

| ID | Prompt | visualBlock | contentPattern (regex) | forbidden |
|----|--------|-------------|------------------------|-----------|
| AP-D01 | `Olá` | false | `Augusta|bem-vindo|Barba Negra|vontade` | `Ver horarios|Degrade` |
| AP-D02 | `Bom dia` | false | `Bom dia|Augusta` | idem |
| AP-D03 | `Estão atendendo hoje?` | false | `Aberto|Augusta|20h` | bloco appointment |
| AP-D04 | `Que horas fecham?` | false | `20h|Seg|Augusta` | bloco appointment |
| AP-D05 | `vocês tem estacionamento` | false | `estacionamento|conveniado|Augusta` | `Ver horarios|Degrade` |
| AP-D06 | `Qual produto para limpeza do rosto` | false | `não|hidrat|rosto|fazemos` | bloco + `Confirmar` |
| AP-D07 | `Nunca fui aí` | false | `primeira|serviço|barbeiro|bem-vindo` | bloco booking |
| AP-D08 | `Como eu chego aí?` | false | `Augusta|chegar|Paulista|endereço` | **sem** exigir drawer |

**Nota AP-D08:** V1-core = copy T04-D referenciando hero; **não** assert de drawer aberto.

### 4.4 Gates obrigatórios pré-merge

```bash
pnpm run build
pnpm qa:events          # 8/8
pnpm qa:appointment     # 16/16 (após extensão)
pnpm qa:ai-regression   # incl. AP-01…07
pnpm ts:budget          # se tocar TS
```

**Diff review manual:**

- [ ] Zero mudanças em `conversational-ai.tsx`
- [ ] Zero imports `operational-ai` no client
- [ ] `appointment-conversational-search.ts` diff vazio ou só comentário

---

## 5. Critérios de rollback

| ID | Gatilho | Ação |
|----|---------|------|
| R-01 | `qa:appointment` ou `qa:events` falha na `main` | Revert PR |
| R-02 | `qa:ai-regression` falha AP-01…07 | Revert PR |
| R-03 | AP-D falha massivo (copy) | Revert ou fix forward em 24h |
| R-04 | Diff inclui Tier 1 / invariantes / runtime | Revert imediato (violação escopo) |
| R-05 | Tom “assistente virtual” em observação | Revert ou desligar camada [1] via flag |
| R-06 | Ordem [2][1][3] invertida em código review | Block merge |

Charter completo: [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md) §12.

---

## 6. Checklist pré-merge

### Escopo

- [ ] GO humano citado no PR
- [ ] Apenas arquivos C1–C3 + M1 + M3 + M4 (+ C5 opcional)
- [ ] T-06, T-07, T-11, T-12 **ausentes** do classificador
- [ ] T-04 sem `visualBlock` / sem drawer composer
- [ ] Ordem `[2]→[1]→[3]` verificada em C3

### Copy (AC-C)

- [ ] AC-C01: E-01…E-27 (exc. gaps V2), E-47/48/69–71/75 cobertos
- [ ] AC-C02: sem strings §“Exemplos proibidos”
- [ ] AC-C03: T03/T04 instâncias batem mock injetado do feed
- [ ] AC-C04: FB sem `ajudar.*rapidinho` / `Como posso ajudar`
- [ ] AC-C05: checklist [`WS-08D_V1_CONVERSATIONAL_TEMPLATES.md`](./WS-08D_V1_CONVERSATIONAL_TEMPLATES.md) §4 no PR
- [ ] AC-C06: invariantes não alterados

### Testes

- [ ] `pnpm qa:appointment` 16/16
- [ ] `pnpm qa:ai-regression` green
- [ ] `pnpm qa:events` 8/8
- [ ] `pnpm run build` PASS

### Pós-merge (observação)

- [ ] Nota humana copy-only (WS-13 checklist) — pode ser issue follow-up

---

## 7. Esqueleto de classificação (referência codificação)

**Greeting cues (ex.):** `^(oi|ola|olá|bom dia|boa tarde|boa noite|e ai|e aí|valeu|obrigad)`  
**Hours cues:** `aberto|atendendo|fecham|horas|funciona domingo`  
**Location:** `onde fica|endereco|endereço|estacionamento|parar o carro`  
**Arrival text:** `como chego|como ir|como chegar`  
**First visit:** `nunca fui|primeira vez|como funciona`  
**Out of domain:** `limpeza de rosto|manicure|restaurante|ganhou o jogo|atendem mulher`  
**Exclusão [1] quando:** mensagem contém `agendar|degrade|fade|horario com|quais servicos` → deixar para [2].

---

## 8. Resumo PR (copiar para GitHub)

```markdown
## WS-08D V1 — Establishment dialogue (core)

**Decision:** GO implementação WS-08D V1 — V1-core only.

**Resolver order:** WS-08C → establishment dialogue V1 → situated fallback (never null).

**Not changed:** Tier 1, invariants, runtime, WS-18A, visual blocks, drawers in composer.

## Test plan
- [ ] pnpm qa:appointment (16/16)
- [ ] pnpm qa:ai-regression
- [ ] pnpm qa:events (8/8)
- [ ] pnpm run build
- [ ] Templates checklist WS-08D_V1_CONVERSATIONAL_TEMPLATES §4
```

---

## Related

- [`WS-08D_V1_IMPLEMENTATION_PLAN.md`](./WS-08D_V1_IMPLEMENTATION_PLAN.md)
- [`WS-08D_V1_CONVERSATIONAL_TEMPLATES.md`](./WS-08D_V1_CONVERSATIONAL_TEMPLATES.md)
- [`WS-08D_CONVERSATIONAL_MATRIX_REAL.md`](./WS-08D_CONVERSATIONAL_MATRIX_REAL.md)
