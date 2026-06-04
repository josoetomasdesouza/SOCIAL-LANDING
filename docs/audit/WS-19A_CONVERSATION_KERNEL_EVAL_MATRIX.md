# WS-19A — Matriz de Avaliação Cross-Model (Conversation Kernel)

**Baseline:** `origin/main` @ `72d49ad`  
**Charter:** [`WS-19A_SOCIAL_LANDING_CONVERSATION_KERNEL.md`](./WS-19A_SOCIAL_LANDING_CONVERSATION_KERNEL.md)  
**Fixture (fonte de verdade):** [`ws19a-conversation-kernel-eval-matrix.json`](./ws19a-conversation-kernel-eval-matrix.json)  
**Harness Fase 1:** `pnpm qa:kernel-stub` — 22 evals obrigatórios  
**Status:** ✅ **Matriz publicada** · ✅ **Fase 1 stub verde** · 🔴 **Fase 2 NÃO ABERTA** · 🔴 **LLM/endpoint NO-GO**  
**Closure:** [`WS-19A_PHASE1_CLOSURE.md`](./WS-19A_PHASE1_CLOSURE.md)

---

## Registro institucional (bloqueios mantidos)

```txt
WS-19A Fase 1 stub:          FECHADA @ 72d49ad (22/22 qa:kernel-stub)
WS-19A Fase 2:               NÃO ABERTA
LLM visitante:               NO-GO
Endpoint Kernel:             NO-GO
Código V1.1 local em main:   PROIBIDO (baseline comparativo apenas)
Tier 1 / conversational-ai:  INTOCADO
WS-18A:                      ISOLADO
```

**Selected Context Grounding:** requisito **obrigatório fase 1** (GK-17…19) — **coberto no stub** @ PR #78.

**Gate Fase 1 (atingido):** E-G00…E-G10 + **E-G18…E-G26** + **E-X11…E-X12** + E-M-APT-15…18 verdes + `qa:kernel-stub` 26/26.

**Active Topic Resolution (E-G23…E-G26):** tópico forte (`schedule`, `service`, `professional`, `arrival`, `pricing`) vence `selectedContextItem` após mudança de assunto — ver `lib/conversation-kernel/active-topic.ts`.

---

## Cobertura mínima (atingida)

| Camada | Meta | Publicado |
|--------|------|-----------|
| **E-G** global | ≥10 | **22** (E-G00…E-G22) |
| **E-M** por modelo | ≥5 cada | **APT 18** · **RS 7** · **HL 7** · **EC 7** |
| **E-X** cross-model | ≥10 | **14** (E-X01…E-X10, **E-X11…12** grounding, E-X15…16) |

**Total evals definidos:** 68 · dimensão **Selected Context Grounding** adicionada em 2026-05-24.

**Nota IDs:** E-X11/E-X12 passam a designar **grounding cross-model**; evals antigos multi-turn/localização renumerados para **E-X15** / **E-X16**.

---

## Tipos de conversa (15)

| # | Tipo | IDs exemplo |
|---|------|-------------|
| 1 | Cumprimento | E-G01, E-M-*-01, E-X01 |
| 2 | Pedido vago | E-G10, E-M-APT-02, E-X01 |
| 3 | Transacional claro | E-G09, E-M-APT-03, E-X09 |
| 4 | Pergunta prática | E-G04, E-M-APT-04, E-X02 |
| 5 | Fora do catálogo | E-G11, E-M-APT-05, E-X06 |
| 6 | Profissional/pessoa | E-G12, E-M-APT-06 |
| 7 | Horário/disponibilidade | E-G14, E-M-APT-14 |
| 8 | Localização/chegada | E-G13, E-M-APT-10, E-X16 |
| 16 | **Selected context grounding** | E-G18…22, E-M-APT-15…18, E-X11…12 |
| 9 | Mudança de assunto | E-G02, E-M-APT-08, E-X04 |
| 10 | Meta reclamação | E-G03, E-M-RS-07, E-X03 |
| 11 | Fora domínio leve | E-G05, E-M-EC-06, E-X07 |
| 12 | Fora domínio bloqueado | E-G06, E-M-HL-07, E-X08 |
| 13 | Reformulação | E-G07, E-X10 |
| 14 | 3+ turnos | E-G08, E-X15 |
| 15 | Responder primeiro | E-G01, E-M-APT-11, E-X05 |

---

## Campos por eval (schema)

Cada entrada no JSON contém:

| Campo | Descrição |
|-------|-----------|
| `id` | E-G* / E-M-* / E-X* |
| `model` | `appointment` \| `restaurant` \| `health` \| `ecommerce` \| `all` |
| `prompts` | String ou sequência (multi-turn) |
| `category` | Um dos 15 tipos |
| `domainZone` | `in_domain` \| `in_domain_unknown` \| `off_domain_light` \| `off_domain_blocked` |
| `topicShiftExpected` | boolean |
| `idealReply` | Copy de referência (não igualdade literal) |
| `expectedAction` | `KernelAction` planejada |
| `forbiddenActions` | Anti-padrões (cards errados, assistant, inventar dado, …) |
| `successCriteria` | Critério objetivo / regex / estrutura |
| `riskIfFails` | Impacto produto |
| `groundingExpected` | `source`, `itemIds`, `confidence` (quando chip ativo) |
| `selectedContext` | Metadados do chip no cenário (fixture) |

---

## Selected Context Grounding (dimensão nova)

### Diagnóstico (evidência produto)

Com chip selecionado, o Composer hoje pode:

- Ignorar título do item e cair em **fallback Augusta** (V1 P-FB01).
- Confundir **notícia editorial** (Dom Corleone) com operação **Barba Negra** (lista barbeiros).
- Responder **genérico** mesmo com serviço no contexto.

### Contratos (resumo)

- **Entrada:** `ModelContextPack.selectedContextItems[]` — ver charter §4.
- **Saída:** `KernelResponse.grounding` — `source`, `itemIds`, `confidence`.
- **GK-17:** chip ativo → grounding antes de fallback/bloco errado.
- **GK-18:** `isExternalOrEditorial` → sem cards da casa atual.

### Respostas ideais — quatro prints

| Print | Chip | Pergunta | Resposta ideal |
|-------|------|----------|----------------|
| **#1** | VIDEO *Tutorial: Fade Perfeito em 5 Minutos* | será que vai ficar em mim? | “Sobre o fade do vídeo — não dá pra prometer como fica no seu rosto 😄; vale ver com um barbeiro no feed e levar a referência.” `grounding.source=selected_context` |
| **#2** | VIDEO *Tendências de Corte Masculino 2024* | qual tendência para cabelo cacheado? | “O vídeo fala tendências masculinas; pra cacheado, o feed tem estilos/referências — ou pergunta no balcão qual corte encaixa.” |
| **#3** | NOTÍCIA *Barbearia Dom Corleone…* | Onde fica a barbearia Dom Corleone? | “Isso é notícia da Dom Corleone, outra casa — aqui é a Barba Negra na Augusta; não tenho o endereço deles no que mostramos.” **Sem** cards Carlos/Degrade. |
| **#4** | SERVIÇO *Corte Masculino* | fale mais sobre esse corte | “Corte masculino tradicional, ~30 min por aqui — vê detalhe e barbeiros no feed se quiser marcar.” `knownFacts` do catálogo. |

**Evals:** E-M-APT-15…18 · espelhos globais E-G19, E-G20, E-G18, E-G18.

---

## E-G — Evals globais (22)

| ID | Categoria | Foco |
|----|-----------|------|
| E-G00 | schema | Validação `ModelContextPack` + `KernelResponse` |
| E-G01 | answer_first | Horário antes de steer |
| E-G02 | topic_shift | Discovery → estacionamento |
| E-G03 | meta_complaint | “Você só fala isso?” |
| E-G04 | practical | pix honesto (`in_domain_unknown`) |
| E-G05 | off_domain_light | Silvio Santos → detour |
| E-G06 | off_domain_blocked | Diagnóstico clínico |
| E-G07 | reformulation | Turno vago → horário claro |
| E-G08 | multi_turn_3plus | Olá → moderno → degrade |
| E-G09 | transactional | marcar horário → delegate |
| E-G10 | vague_request | “me ajuda” ≤1 pergunta |
| E-G11 | out_of_catalog | massagem |
| E-G12 | person_entity | Marcos não cadastrado |
| E-G13 | location_arrival | Como chego |
| E-G14 | hours_availability | tem vaga hoje (≠ parking) |
| E-G15 | schema | Preserva `qa:ai-regression` 26/26 |
| E-G16 | meta_complaint | Blacklist “Como posso ajudar” |
| E-G18 | selected_context | Serviço selecionado — fale mais |
| E-G19 | selected_context | Vídeo — combina comigo / ficar em mim |
| E-G20 | selected_context | Notícia entidade externa — onde fica |
| E-G21 | selected_context | Fato desconhecido no chip — honesto |
| E-G22 | selected_context | Chip ativo prioridade sobre fallback |

---

## E-M — Por modelo (resumo)

### Appointment (18) — V1.1 sintomas + prints

| ID | Prompt (resumo) | Nota |
|----|-----------------|------|
| E-M-APT-01…14 | Cumprimento, discovery, degrade, gray zone, topic shift, AP legado | Ver JSON |
| E-M-APT-15…18 | **Selected context** — prints fade, tendências, Dom Corleone, Corte Masculino | Ver JSON |

### Restaurant (7)

| ID | Foco | Protege |
|----|------|---------|
| E-M-RS-02 | Recomendação | RS-03, WS-08A |
| E-M-RS-03 | Picanha | RS-02 |
| E-M-RS-04 | Entrega bairro | RS-05 |
| E-M-RS-06 | topic_shift sobremesa→pix | — |

### Health (7)

| ID | Foco | Protege |
|----|------|---------|
| E-M-HL-03 | Limpeza de pele | HL-02, WS-08B |
| E-M-HL-04 | Convênio | HL-05 |
| E-M-HL-07 | Bloqueio diagnóstico | GK-09 |

### Ecommerce (7)

| ID | Foco | Protege |
|----|------|---------|
| E-M-EC-02…03 | Skincare / protetor | EC-02/03, frozen |
| E-M-EC-04 | Horário fallback | EC-05 |
| E-M-EC-06 | off_domain_light futebol | — |

---

## E-X — Cross-model (14)

| ID | Classe testada em 4 modelos |
|----|---------------------------|
| E-X01 | Cumprimento situado (não Tier 1 rotativo) |
| E-X02 | pix / `in_domain_unknown` |
| E-X03 | meta complaint |
| E-X04 | topic_shift vague → pix |
| E-X05 | answer_first “abertos agora?” |
| E-X06 | out_of_catalog massagem |
| E-X07 | off_domain_light jogo |
| E-X08 | off_domain_blocked prescrição |
| E-X09 | transacional por entidade (degrade/picanha/limpeza/protetor) |
| E-X10 | reformulação |
| **E-X11** | **selected chip — “fale mais sobre isso” (4 modelos)** |
| **E-X12** | **item externo/editorial — não confundir com marca atual** |
| E-X15 | multi_turn 3+ (ex-E-X11) |
| E-X16 | como chego (ex-E-X12) |

**Prova de plataforma:** E-X02, E-X06, E-X09, **E-X11, E-X12** — comportamento por *classe*, pack por modelo.

---

## Mapeamentos obrigatórios

### Substituição AP-D15…25 (V1.1 sintomas → WS-19A)

| V1.1 | Evals WS-19A |
|------|----------------|
| AP-D15 feminino | E-M-APT-09, E-G11 |
| AP-D16 Marcos | E-M-APT-06, E-G12 |
| AP-D17 Curitiba | E-M-APT-10 |
| AP-D18 pix | E-M-APT-04, **E-X02** |
| AP-D19 filho | E-M-APT-12 |
| AP-D20 Wi-Fi | E-M-APT-13 |
| AP-D21 duração | E-M-APT-11, **E-X05** |
| AP-D22 remarcar | E-M-APT-08, **E-G02** |
| AP-D23 cancelar | E-M-APT-08 |
| AP-D24 massagem | E-M-APT-05, E-G11 |
| AP-D25 marcar horário | E-M-APT-07, **E-G09** |

**Nota:** V1.1 local serve **baseline comparativo** ao implementar stub; matriz 19A é autoridade futura.

### Prova topic shift

`E-G02`, `E-M-APT-08`, `E-M-RS-06`, `E-X04`

### Prova “responder primeiro, conduzir depois”

`E-G01`, `E-M-APT-11`, `E-M-EC-07`, `E-X05`

### Prova anti-ChatGPT genérico

`E-G03`, `E-G05`, `E-G06`, `E-G16`, `E-M-RS-07`, `E-M-HL-07`, `E-M-EC-06`, `E-X02`, `E-X03`, `E-X07`

### Selected Context Grounding

`E-G18…22` · `E-M-APT-15…18` · `E-X11` · `E-X12` · mapping `printEvidenceMapping` no JSON.

### Proteção resolvers legados (Era 3)

| Resolver | Evals guardião |
|----------|----------------|
| **WS-08C** Appointment | E-M-APT-03, 07, 14, E-G09, E-G15, E-X09 |
| **WS-08A** Restaurant | E-M-RS-02, 03, 04, E-X09 |
| **WS-08B** Health | E-M-HL-02, 03, 04, E-X09 |
| **ecommerce frozen** | E-M-EC-02, 03, 04, E-G15, E-X09 |

**Regra:** Kernel usa `delegate_transactional_resolver` — **não reimplementa** lógica WS-08A/B/C no kernel.

---

## Relação WS-08D

| Artefato WS-08D | Papel após matriz 19A |
|-----------------|------------------------|
| V1 produção | Mantida até migração; E-M-APT-* protege AP-D01…14 |
| V1.1 rules | **NO-GO** — evals 19A substituem AP-D15…25 |
| V2 Appointment | Perfil + evals E-M-APT + detour = E-G05 / E-M-EC-06 |

---

## Fase 1 futura (sem LLM)

1. Harness lê fixture JSON (opcional).
2. Rule-kernel stub valida `KernelResponse` + **`grounding`** quando chip presente.
3. `buildModelContextPack` projeta `selectedContextItems` a partir de `contextItems` Tier 1.
4. Appointment primeiro; depois RS/HL/EC.
5. **Não** commitar código V1.1 rules.

---

## Related

- [`WS-19A_SOCIAL_LANDING_CONVERSATION_KERNEL.md`](./WS-19A_SOCIAL_LANDING_CONVERSATION_KERNEL.md)
- [`AI_CANONICAL_FLOWS.md`](../ai/AI_CANONICAL_FLOWS.md)
- [`WS-08D_V1_1_GRAY_ZONE_SPEC.md`](./WS-08D_V1_1_GRAY_ZONE_SPEC.md)
