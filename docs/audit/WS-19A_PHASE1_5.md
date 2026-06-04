# WS-19A — Fase 1.5 · Arquitetura conversacional (Appointment)

**Status:** 🟡 **ABERTA** — doc ✅ · PR1 delta mínimo ✅ (branch local)  
**Evals:** E-G00…E-G38 · `pnpm qa:kernel-stub` **39/39**  
**Predecessora:** [WS-19A_PHASE1_CLOSURE.md](./WS-19A_PHASE1_CLOSURE.md) @ `main` pós Fase 1 + Answer First Gate (E-G27…E-G34)  
**Sucessora planejada:** WS-19B Conversational Coverage (Top 100 perguntas) · Fase 2 adapters RS/HL/EC  
**Tipo:** Charter de decisão · **sem LLM** · **sem Tier 1** · PRs pequenos sequenciais

---

## 1. Por que esta fase existe

A percepção visual da Social Landing (WS-09 → WS-13) está madura. O gargalo atual é **arquitetura conversacional**:

- O usuário sente que a IA **ignora a pergunta** quando o stub retorna `null` e o adapter cai em `situatedFallbackV1` (*"fica na Augusta — veja serviços no feed…"*).
- Regras corretas foram adicionadas no kernel (Answer First, topic shift, post social), mas ainda **misturam classificação com copy** e deixam buracos sem lane.

**Fase 1.5** formaliza **lanes + estratégias + prioridade** antes de espalhar mais código ou discutir LLM.

---

## 2. Diagnóstico atual (Appointment)

### 2.1 Pipeline em produção

```txt
[chip ativo]     → resolveAnswerFirstGate → rule-kernel-stub (legacy)
[sem resposta]   → WS-08C (transacional)
[ainda null]     → kernel (2ª passagem)
[ainda null]     → WS-08D V1 (diálogo)
[ainda null]     → situatedFallbackV1  ← experiência "script Augusta"
```

### 2.2 O vilão percebido

| Camada | Sintoma humano | Causa técnica |
|--------|----------------|---------------|
| Kernel | Pergunta válida sem matcher | `return null` |
| Adapter | Texto genérico da casa | `fallbackResolver` após null |
| Mapper | Augusta filtrada no kernel | `kernelResponseToResolverResult` rejeita copy, mas adapter **já chamou** V1/fallback |

O usuário não distingue null de fallback — sente **"ele não entendeu"**.

### 2.3 Buracos já parcialmente tratados (Fase 1 + patches)

| Buraco | Mitigação atual | Ainda falta |
|--------|-----------------|-------------|
| Chip post captura tudo | `isAboutSelectedFeedPost`, E-G32…G34 | Prioridade formal |
| Preço sem dado | `buildCatalogPriceHint` | `missing_context` ambíguo |
| Mudança de assunto | `activeTopic`, operational first | Tabela `ConversationPriority` |
| Curitiba com vídeo | E-G28 resposta operacional direta | Post + "essa barbearia" → clarificar (E-G36) |

### 2.4 Quinto buraco: `in_domain_missing_context`

Não é `in_domain_unknown` (dado ausente no perfil).  
Não é `off_domain_light` (curiosidade externa).

É **intenção in_domain válida com referente ambíguo**:

> "Tem essa barbearia em Curitiba?" (com post social selecionado)

Interpretações: unidade aqui vs franquia vs serviço em outra cidade vs o post em si.

**Resposta correta:** esclarecimento estruturado (uma pergunta), não fallback Augusta.

Estimativa: **10–20%** dos bugs reais de conversação em demo.

---

## 3. Modelo alvo: classify → lane → strategy → answer

### 3.1 Princípio

O classificador **não escreve a resposta final**. Ele rotula o turno; um executor aplica a estratégia.

```txt
message + pack + session
    ↓
classifyTurn() → TurnClassification
    lane: AnswerabilityClass
    domainZone: KernelDomainZone
    strategy: ResponseStrategy
    priority: ConversationPriorityScore
    ↓
executeStrategy(classification) → KernelResponse
```

### 3.2 Lanes (`AnswerabilityClass` — evolução)

| Lane | `domainZone` típico | Significado |
|------|---------------------|-------------|
| `answerable_from_selected_context` | `in_domain` | Pergunta sobre o chip selecionado |
| `answerable_from_active_topic` | `in_domain` | Tópico forte vence chip |
| `answerable_from_catalog` | `in_domain` | Preço/serviço no catálogo |
| `answerable_from_operational_context` | `in_domain` / `in_domain_unknown` | Endereço, horário, filial, estacionamento |
| `answerable_with_honest_gap` | `in_domain_unknown` | Sem dado no perfil + 2º nível (catálogo, balcão) |
| **`in_domain_missing_context`** | **`in_domain`** | **Referente ambíguo — clarificar antes de responder** |
| `needs_clarification` | `in_domain` | Alvo ausente (ex.: preço sem chip) |
| `should_delegate_transactional` | `in_domain` | WS-08C |
| `blocked` | `off_domain_blocked` | Clínico / proibido |

**Nota:** `in_domain_missing_context` é lane dedicada; pode mapear para `answerability` estendido na Fase 1.5b.

### 3.3 `ResponseStrategy` (executor)

| Strategy | Comportamento |
|----------|---------------|
| `direct` | Resposta factual do pack |
| `honest_gap` | Declarar ausência + steer (catálogo, mapa, Agendar, balcão) |
| `clarify_target` | Uma pergunta de desambiguação |
| `clarify_broad` | Menu de foco (anti-null último recurso) |
| `delegate_08c` | Transacional |
| `detour_light` | Off-domain leve + ponte (Fase 2) |
| `blocked` | Recusa + retorno casa |

**Mesma intenção, estratégias diferentes** — exemplo `horário`:

- Pack com `openingHours` → `direct`
- Feriado sem calendário → `honest_gap`
- "Horário?" + chip post + "isso" → `clarify_target`

### 3.4 `ConversationPriority` (intenção vs chip)

Quando `intentPriority > chipAnchorPriority`, a intenção da **mensagem atual** vence o chip.

| Categoria | Peso | Exemplos de detecção |
|-----------|------|----------------------|
| `schedule` | 100 | agendar, vaga, horário de marcação |
| `arrival` | 95 | onde fica, estacionamento, como chego |
| `hours` | 90 | feriado, aberto, fecham |
| `pricing` | 85 | preço, pix, valor |
| `operational` | 80 | filial, cidade, capacidade |
| `service_chip` | 50 | serviço selecionado |
| `video_chip` | 45 | vídeo selecionado |
| `social_post_chip` | 40 | post selecionado |

**Regra:** estacionamento (95) > post (40) → nunca repetir copy do post.

Implementação Fase 1.5: tabela em `conversation-priority.ts` (PR 4); atalhos operacionais no classifier (PR 2 mínimo).

---

## 4. Política anti-null

### 4.1 Proibido como experiência final

```txt
resolveRuleKernelStub → null
  → situatedFallbackV1 (Augusta)
```

### 4.2 Ordem obrigatória após null no kernel

```txt
1. resolveBroadClarification()  — sempre retorna KernelResponse
2. (opcional rede técnica) situatedFallbackV1 — apenas se broad falhar; meta: nunca em smoke
```

### 4.3 Copy canônico — `clarify_broad`

```txt
Não captei o foco — é sobre horário, como chegar, preços, um item do feed ou agendar?
```

- `intent`: `discover`
- `topic`: `broad_clarify`
- `structure.answered`: `false`
- `followUpQuestion`: implícita na frase
- **Proibido** padrão Augusta no mapper e no smoke

### 4.4 Copy canônico — `in_domain_missing_context` (filial ambígua)

```txt
Você quer saber se esta unidade fica em Curitiba ou se existe outra unidade da [brandName] por lá?
```

- Máximo **uma** clarificação por thread; no 2º turno assumir interpretação mais provável (`operational` > chip).

---

## 5. Métricas (percepção humana)

| Métrica | Definição | GO Fase 1.5 (corpus inicial) |
|---------|-----------|------------------------------|
| **Answer Rate** | % turns com resposta útil (`answered` ou delegate) | ≥ 95% |
| **Escape Rate** | % turns com Augusta, `situated_fallback`, ou clarify sem ack | **< 5%** |
| **Wrong Lane Rate** | % evals que passam regex mas violam forbidden / juiz humano | → 0 no Top 40 |

**Implementação:** estender `ws19a-kernel-eval-runner-core.ts` com flags `escaped`, `lane`, `strategy` (PR 4).

Escape Rate > accuracy de intent — alinhado à experiência conversacional.

---

## 6. Escopo por PR (sequência acordada)

| PR | Conteúdo | Arquivos principais |
|----|----------|---------------------|
| **0** | Este documento | `docs/audit/WS-19A_PHASE1_5.md` |
| **1** | Anti-null adapter + broad clarify + stub safety net | `broad-clarification.ts`, `appointment-conversation-kernel-adapter.ts`, `rule-kernel-stub.ts` |
| **2** | `in_domain_missing_context` + strategy split (incremental) | `answerability-classifier.ts`, `types.ts` |
| **3** | `conversation-priority.ts` + evals multi-turn | `conversation-priority.ts`, matriz JSON |
| **4** | Métricas Answer/Escape + corpus Top 40 | runner, `WS-19B` draft |

### 6.1 Fora de escopo (mantém charter Fase 1)

- LLM / endpoint
- `components/business/conversational-ai.tsx` (Tier 1)
- `lib/runtime/**`, publication, storage
- Refactor grande monolítico do kernel
- V1.1 rules em `main`
- Adapters Restaurant / Health / Ecommerce (Fase 2)

---

## 7. Evals Fase 1.5 (mínimos — preservar E-G00…E-G34)

| ID | Cenário | Esperado |
|----|---------|----------|
| **E-G35** | Chip serviço + "Tem estacionamento?" | Operacional / chegada · **sem** detalhe do serviço |
| **E-G36** | Chip post + "Tem essa barbearia em Curitiba?" | `missing_context` / clarificar unidade vs franquia |
| **E-G37** | Chip qualquer + "o que significa isso pra minha cidade?" (ambíguo) | Clarificação · sem Augusta |
| **E-G38** | Mensagem fora do matcher (`me fala ai`) | Broad clarify · **sem** Augusta |

**Regressão:** `pnpm qa:kernel-stub` — E-G00…E-G34 + E-G35…E-G38 verdes.

**Nota E-G28:** vídeo + Curitiba permanece resposta operacional **direta** (referente claro: marca/unidade). E-G36 cobre post + "essa barbearia" (ambíguo).

---

## 8. Critérios GO / NO-GO

### GO Fase 1.5

```txt
✓ WS-19A_PHASE1_5.md commitado
✓ Zero Augusta em smoke manual (checklist §9)
✓ Nenhuma pergunta sem lane no corpus E-G35…G38 + stub safety net
✓ Escape Rate < 5% no corpus inicial (runner)
✓ E-G00…E-G34 preservados
✓ pnpm qa:kernel-stub verde
✓ pnpm qa:appointment + qa:ai-regression verdes (sem regressão AP)
```

### NO-GO

- Subir LLM para "consertar" null
- Reintroduzir V1.1 em `main`
- Ampliar lista infinita de regex sem prioridade
- Clarificação em loop (>1 vez seguida sem assumir interpretação)

---

## 9. Smoke manual obrigatório

1. Post "Nosso espaço foi renovado…" → "Onde fica esse espaço?" → endereço.  
2. Mesmo post → "Quantas pessoas cabem no espaço?" → lotação honesta · sem Augusta.  
3. Serviço selecionado → "Tem estacionamento?" → estacionamento · **não** duração do serviço.  
4. Post selecionado → "Tem essa barbearia em Curitiba?" → **pergunta de esclarecimento** (não Augusta).  
5. "me fala ai" sem contexto → broad clarify.  
6. Nenhum passo exibe *"veja serviços e profissionais no feed quando quiser"*.

---

## 10. Relação com WS-19B (próxima)

```txt
Pergunta real → Lane → Strategy → Resposta esperada → Fonte de dados → Eval ID
```

Meta: **Top 100** perguntas reais antes de LLM bounded.  
LLM enriquece resposta **depois** que Escape Rate < 5% no corpus — não mascara falta de modelagem.

---

## 11. Prompt de execução (referência)

```txt
Implemente a WS-19A Fase 1.5 da IA conversacional Appointment.

Objetivo:
Eliminar o caminho null → situatedFallbackV1/Augusta como experiência final,
criar modelagem explícita de lane + strategy, adicionar in_domain_missing_context
e formalizar prioridade de intenção sobre chip.

Escopo obrigatório:
1. docs/audit/WS-19A_PHASE1_5.md (este arquivo)
2. Menor delta: broad clarification + adapter anti-null
3. Evals E-G35…E-G38

Critério de sucesso:
Zero Augusta em smoke manual.
Nenhuma pergunta sem lane.
Escape Rate < 5% no corpus inicial.
Preservar E-G00…E-G34.
```

---

## Related

- [WS-19A_SOCIAL_LANDING_CONVERSATION_KERNEL.md](./WS-19A_SOCIAL_LANDING_CONVERSATION_KERNEL.md)
- [WS-08D_V2_CONVERSATION_KERNEL.md](./WS-08D_V2_CONVERSATION_KERNEL.md) §16 Contextual Detour
- [ws19a-conversation-kernel-eval-matrix.json](./ws19a-conversation-kernel-eval-matrix.json)
- [OPERATIONAL_HANDOFF_BASELINE.md](./OPERATIONAL_HANDOFF_BASELINE.md)
