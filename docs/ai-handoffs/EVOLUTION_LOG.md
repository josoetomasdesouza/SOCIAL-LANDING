# Log Evolutivo

Este log registra decisoes, recuperacoes, contratos e memorias operacionais do
projeto. Ele deve ser atualizado sempre que uma mudanca alterar arquitetura,
linguagem visual, protocolo ou risco sistemico.

## 2026-06-04 - WS-21 documentacao fechada (D1 / D2 / D2b) — G0 doc

### Contexto

A iniciativa **WS-21 — Composer Hybrid Architecture** definiu a direcao
arquitetural **antes** de qualquer codigo Tier 1: sticky composer + thread
in-flow, remocao do sheet expansivo (~90vh), preservacao feed-first e
patrimonio WS-09→WS-13 (morph, modes, drawers, smoke-fume compact).

Documentacao concluida em tres PRs doc-only apos PR #86 (ADR package).

### Mudanca

**Documentos registrados (sem runtime):**

| Entrega | PR | Artefato principal |
|---------|-----|-------------------|
| **D1** | #86 | ADR, Challenge Review, Plano P0/P1 |
| **D2** | #87 | `COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md`, continuity delta, P0 paper |
| **D2b** | #88 | `PERCEPTUAL_INVARIANTS.md` — P-04, P-06a (C1/C2 Frozen Zone) |

**Decisao arquitetural (ADR):**

```txt
Feed editorial → Thread in-flow → Composer sticky
− sheet expansivo  ·  − inline puro ChatGPT
```

**Baseline main pos-D2b:** `a4c0d2b`

### Impacto visual

Nenhuma mudanca de runtime. Comportamento perceptivo **alvo** documentado:

- first paint feed-first inalterado;
- conversa como extensao do feed, nao painel assistente;
- smoke-fume compact preservado; junction gradient no engajamento (v2 spec);
- morph post→chip, modes hidden/overlay, drawers — congelados em principio.

P0 paper @ 320/390: **GO** para direcao hibrida.

### Impacto estrutural

Nenhum codigo alterado. Runtime permanece **v1** (`COMPOSER_BEHAVIOR_SPEC.md`
oficial; sheet expansivo ainda em producao).

**R0 nao iniciado.** Flag `composer-layout=v2` nao implementada.

Proxima fase permitida apos **G0 humano formal**: R0 (flag plumbing only).

### Regressoes evitadas

- Implementacao hibrida sem ADR ou spec v2;
- Conflito P-06a / P-04 (sheet expand) vs arquitetura v2;
- Drift entre continuity contract v1 e behavior spec v2;
- Inicio de codigo Tier 1 antes de frozen zone review.

### Novas regras derivadas

- `COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md` e contrato de **comportamento** para R0+;
- `composer-continuity-contract-v2-delta.md` aplica-se ao path v2 futuro;
- `ai.surface.opened` = primeira visibilidade da thread in-flow (nao sheet);
- `threadEngagedProgress` substitui `expansionProgress` sheet-based (P-06a);
- Piloto runtime: Appointment only ate GO pos-P3.

### Arquivos relacionados

- `docs/audit/WS-21_COMPOSER_HYBRID_ARCHITECTURE_ADR.md`
- `docs/audit/WS-21_ADR_CHALLENGE_REVIEW.md`
- `docs/audit/WS-21_P0_P1_PROTOTYPE_PLAN.md`
- `docs/audit/WS-21_P0_PAPER_PROTOTYPE.md`
- `docs/runtime/COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md`
- `docs/ai-handoffs/composer-continuity-contract-v2-delta.md`
- `docs/runtime/PERCEPTUAL_INVARIANTS.md` (P-04, P-06a emendas)
- `docs/runtime/COMPOSER_BEHAVIOR_SPEC.md` (v1 runtime — banner v2)

### Status G0

| Gate | Estado |
|------|--------|
| D1 + D2 + D2b merged | ✅ |
| Frozen Zone Review | ✅ |
| C1 + C2 (P-06a, P-04) | ✅ |
| C3 (este log) | ✅ |
| G0 humano explicito | Pendente declaracao formal |
| R0 | **NO-GO** ate G0 |

---


### Contexto

O projeto possuia um contrato tecnico detalhado para continuidade do composer,
mas os documentos mestres de arquitetura, linguagem visual, protocolo de mudanca,
protocolo evolutivo e log historico ainda nao existiam no repositorio.

### Mudanca

Foram criados os documentos:

- `SYSTEM_ARCHITECTURE.md`
- `VISUAL_LANGUAGE.md`
- `CHANGE_PROTOCOL.md`
- `EVOLUTION_PROTOCOL.md`
- `EVOLUTION_LOG.md`

### Impacto visual

Nenhuma mudanca visual foi implementada. Os novos documentos preservam e
explicitam os contratos perceptivos existentes:

- feed continuo;
- composer nao-modal;
- integracao natural entre feed, stories e composer;
- profundidade sutil;
- ausencia de linguagem institucional, dashboard ou ecommerce classico.

### Impacto estrutural

Nenhum codigo foi alterado. A mudanca estrutura a memoria operacional para que
agentes futuros entendam:

- rotas e superficies;
- sistemas criticos;
- areas congeladas;
- z-index, timings e medicao;
- protocolo `data-*`;
- processo de classificacao de risco;
- regras de atualizacao da memoria.

### Regresses evitadas

- Implementacoes futuras sem leitura do contrato tecnico;
- mudancas pequenas em blur, spacing ou z-index tratadas como triviais;
- perda de memoria sobre o ultimo estado visual bom;
- alteracoes em composer, feed ou stories sem classificacao de risco;
- esquecimento de atualizar handoffs apos decisoes sensiveis.

### Novas regras derivadas

- A memoria operacional passa a ser parte do sistema.
- Toda mudanca sensivel deve atualizar `EVOLUTION_LOG.md`.
- Regras estaveis devem ser consolidadas no documento mestre correspondente.
- Documentacao mestre deve distinguir estado atual, decisao e hipotese.

### Arquivos relacionados

- `docs/ai-handoffs/SYSTEM_ARCHITECTURE.md`
- `docs/ai-handoffs/VISUAL_LANGUAGE.md`
- `docs/ai-handoffs/CHANGE_PROTOCOL.md`
- `docs/ai-handoffs/EVOLUTION_PROTOCOL.md`
- `docs/ai-handoffs/EVOLUTION_LOG.md`
- `docs/ai-handoffs/composer-continuity-contract.md`

## 2026-05-19 - Contrato de continuidade tecnica do composer/landing flow

### Contexto

O fluxo business/social ganhou acoplamentos fortes entre feed, composer, morph,
drawers, scroll, z-index e medicao. Era necessario preservar esses contratos para
evitar regressao silenciosa.

### Mudanca

Foi introduzido o contrato tecnico em:

- `docs/ai-handoffs/composer-continuity-contract.md`

### Impacto visual

O contrato protege:

- continuidade feed -> composer;
- morph post -> chip;
- superficie escura sutil do composer;
- profundidade atmosferica contida;
- relacao entre drawer, composer e story viewer.

### Impacto estrutural

O documento formaliza:

- arquivos Tier 1, Tier 2 e Tier 3;
- areas congeladas;
- protocolo `data-*`;
- hierarquia de z-index;
- timings calibrados;
- checklists mobile/desktop;
- regras anti-refactor e anti-cleanup.

### Regresses evitadas

- Morph animar de coordenadas erradas;
- chip ficar invisivel permanentemente;
- scroll lock preso;
- composer em camada errada;
- sheet medir altura incorreta;
- unificacao indevida de `composerMode` por vertical.

### Novas regras derivadas

- Nao tratar atributos `data-*` como strings arbitrarias.
- Nao extrair o RAF do morph sem revisar singleton e lifecycle.
- Nao centralizar scroll lock dos drawers sem revisar cada cleanup.
- Nao simplificar medicao do sheet.

### Arquivos relacionados

- `docs/ai-handoffs/composer-continuity-contract.md`

## 2026-05-20 - Recuperacao do ultimo estado visual bom do feed

### Contexto

O historico recente registra recuperacao explicita do estado visual bom do feed.
O commit de referencia e:

- `cc97ead Recover last good feed visual state (#33)`

Tambem ha restauracao no topo atual:

- `324c225 revert: restaurar demo page e business landing ao estado anterior (feed-native-top) (#31)`

### Mudanca

O feed e a demo/business landing foram restaurados para um estado visual
considerado bom, especialmente relacionado ao topo nativo do feed.

### Impacto visual

A decisao reforca:

- feed como superficie continua;
- topo nativo em vez de bloco institucional;
- reducao de fragmentacao;
- preservacao da cadencia social.

### Impacto estrutural

Arquivos historicamente relacionados:

- `app/demo/page.tsx`
- `components/business/business-social-landing.tsx`

### Regresses evitadas

- Topo parecer header institucional;
- feed parecer montagem de blocos separados;
- demo perder continuidade social;
- controles duplicados competirem com stories/feed.

### Novas regras derivadas

- Tratar `feed-native-top` como baseline perceptivo atual.
- Alteracoes no topo do feed exigem classificacao no minimo Zona Amarela.
- Se o topo afetar stories, composer ou drawer, classificar como Zona Vermelha.

### Arquivos relacionados

- `app/demo/page.tsx`
- `components/business/business-social-landing.tsx`

## 2026-05-20 - Composer resume auto-grow measurement

### Contexto

O composer precisa retomar conversas e crescer de forma natural quando ha
conteudo existente ou resposta de IA chegando enquanto o sheet esta colapsado.
O commit de referencia e:

- `c5d51da Fix composer resume auto-grow measurement (#30)`

### Mudanca

O sistema de auto-grow/medicao do composer foi corrigido para preservar altura
e expansao com base no conteudo real.

### Impacto visual

O composer evita saltos perceptivos e reforca a sensacao de superficie viva:

- conversa retoma sem quebra;
- resposta de IA nao fica escondida;
- sheet cresce com continuidade;
- composer permanece conversacional, nao modal.

### Impacto estrutural

Area sensivel:

- `components/business/conversational-ai.tsx`

Sistemas envolvidos:

- `useLayoutEffect`;
- refs de medicao;
- `visualViewport`;
- auto-grow;
- snap heights;
- transicao de altura.

### Regresses evitadas

- Sheet preso em altura errada;
- resposta de IA fora da area visivel;
- composer expandindo por timeout artificial;
- medicao divergente entre mobile e desktop.

### Novas regras derivadas

- Corrigir problemas de altura na camada de medicao, nao com compensacao visual.
- Nao remover ou reordenar `useLayoutEffect` de medicao sem revisar o fluxo todo.
- Toda mudanca em auto-grow e Zona Vermelha.

### Arquivos relacionados

- `components/business/conversational-ai.tsx`

## 2026-05-20 - Expansao do composer quando resposta de IA chega colapsada

### Contexto

Quando uma resposta de IA chega enquanto o composer esta colapsado, a experiencia
deve continuar conversacional e nao esconder o novo conteudo.
O commit de referencia e:

- `7dd3d8f feat: expand composer when AI reply arrives while collapsed (#29)`

### Mudanca

O composer passou a expandir quando a resposta de IA chega em estado colapsado.

### Impacto visual

Melhora a continuidade da conversa:

- resposta aparece como continuidade do fluxo;
- o usuario nao precisa descobrir que houve conteudo novo escondido;
- o composer parece vivo e responsivo.

### Impacto estrutural

Area sensivel:

- `components/business/conversational-ai.tsx`

Sistemas envolvidos:

- estado de mensagens;
- pending AI reply;
- sheet height;
- auto-scroll;
- snap/expanded state.

### Regresses evitadas

- Nova mensagem invisivel;
- composer parecer passivo;
- usuario perder continuidade conversacional.

### Novas regras derivadas

- Eventos conversacionais devem refletir no estado perceptivo do sheet.
- Nao esconder conteudo novo atras de estado colapsado.

### Arquivos relacionados

- `components/business/conversational-ai.tsx`

## 2026-05-20 - Topo nativo do feed

### Contexto

O topo do feed foi tratado como parte essencial da continuidade social. Um topo
com aparencia institucional ou independente quebra a sensacao de ambiente vivo.

### Mudanca

O estado atual preserva o topo nativo do feed como referencia visual.

### Impacto visual

- Stories e conteudo inicial parecem pertencer ao mesmo fluxo;
- o feed evita sensacao de landing institucional;
- a entrada do usuario no ambiente e mais social-first.

### Impacto estrutural

Qualquer mudanca no topo pode afetar:

- stories;
- busca/filtros;
- primeiras secoes;
- drawer navigation;
- percepcao do composer como continuidade do feed.

### Regresses evitadas

- Duplicacao de controles;
- cabecalho institucional;
- cortes artificiais antes do feed;
- perda de cadencia social.

### Novas regras derivadas

- O topo do feed nao e area isolada.
- Alterar topo exige revisar stories e primeira dobra.

### Arquivos relacionados

- `components/business/business-social-landing.tsx`
- `components/social-landing/index.tsx`

## 2026-05-20 - Remocao de busca duplicada

### Contexto

Busca duplicada cria redundancia perceptiva e pode fazer a interface parecer um
dashboard ou catalogo, em vez de ambiente social continuo.

### Mudanca

A memoria recente registra a remocao de uma busca duplicada para preservar
continuidade e reduzir fragmentacao de controles.

### Impacto visual

- Menos competicao por atencao no topo;
- menor sensacao de painel;
- stories e feed recuperam prioridade;
- o ritmo inicial fica mais natural.

### Impacto estrutural

Areas potencialmente envolvidas:

- search bar;
- stories;
- topo do feed;
- filtros/categorias;
- orquestrador da landing.

### Regresses evitadas

- Controles redundantes;
- sensacao de ecommerce/catalogo;
- fragmentacao do topo;
- perda de foco social.

### Novas regras derivadas

- Antes de adicionar busca/filtro, verificar se ja existe controle equivalente.
- Duplicacao funcional tambem e regressao perceptiva.

### Arquivos relacionados

- `components/business/business-social-landing.tsx`
- `components/social-landing/index.tsx`

## 2026-05-20 - Divisorias dos stories

### Contexto

Divisorias proximas aos stories afetam o ritmo do topo e a percepcao de
continuidade. Elas podem ajudar a cadencia, mas tambem podem criar separacoes
artificiais.

### Mudanca

A memoria recente registra tratamento especifico das divisorias dos stories como
decisao visual sensivel.

### Impacto visual

- Divisorias devem ser sutis;
- stories continuam integrados ao feed;
- o topo evita virar modulo isolado;
- a primeira dobra preserva fluxo social.

### Impacto estrutural

Qualquer ajuste em divisorias pode afetar:

- spacing;
- densidade visual;
- hierarquia do topo;
- percepcao da transicao stories -> feed.

### Regresses evitadas

- Separacao artificial entre stories e feed;
- aparencia de dashboard;
- excesso de linhas ou bordas;
- perda de leveza estrutural.

### Novas regras derivadas

- Divisorias sao ajustes de ritmo, nao bordas estruturais.
- Mudancas em divisorias perto dos stories exigem validacao perceptiva.

### Arquivos relacionados

- `components/business/business-social-landing.tsx`
- `components/social-landing/stories.tsx`
