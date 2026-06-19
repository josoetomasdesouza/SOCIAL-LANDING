# Log Evolutivo

Este log registra decisoes, recuperacoes, contratos e memorias operacionais do
projeto. Ele deve ser atualizado sempre que uma mudanca alterar arquitetura,
linguagem visual, protocolo ou risco sistemico.

## 2026-06-13 - Conversational training style

### Contexto

Foram fornecidos exemplos de conversa mais proximos de um assistente moderno:
decisoes abertas, comparacoes, follow-ups implicitos, retomadas longas,
duvidas emocionais e perguntas gerais com nuance.

### Mudanca

Foi criado `docs/ai/CONVERSATION_TRAINING_STYLE_GUIDE.md` e adicionado
`pnpm qa:conversation-training-style`. O provider LLM recebeu instrucoes de
estrutura conversacional: explorar criterio antes de recomendar, responder
conhecimento geral antes de reconectar, tratar follow-up curto pelo assunto
ativo e pedir objetivo antes de produtos/acoes.

O fallback local ganhou coberturas pequenas para:

- decisao aberta sobre corte;
- usuario enjoado do visual;
- "mais moderno" e cabelo cacheado;
- recomendacao de pomada por acabamento desejado;
- pergunta aberta sobre R$ 100 mil;
- pesquisa Samsung via tool/web route.

### Regra derivada

Treinamento conversacional nao deve decorar frases. Deve preservar estruturas:
pergunta real, criterio relevante, explicacao proporcional e proximo passo util.
Se parecer formulario, falhou.

## 2026-06-13 - Question Satisfaction Layer

### Contexto

O agente ja tinha intent, topic manager, tool router, anti-repetition e camadas
de linguagem, mas ainda podia responder ao classificador em vez de responder a
pergunta do usuario. O caso real foi: depois de falar sobre cabelo feminino
cacheado, "voces cortam cabelo feminino?" foi tratado como outro assunto.

### Mudanca

Foi criada `lib/conversation-intelligence/question-satisfaction-layer.ts` como
gate final antes da resposta sair. A camada valida perguntas criticas contra a
resposta candidata e repara quando a resposta nao satisfaz a duvida minima:

- pergunta sim/nao sobre servico precisa responder se existe confirmacao;
- "que horas?" depois de jogos precisa responder horarios dos jogos;
- pedido "cite 3" precisa listar tres itens coerentes com o sujeito atual.

Tambem foi adicionado `pnpm qa:question-satisfaction` e o audit real ganhou o
cenario `question-satisfaction-female-hair-service`.

Depois da primeira correcao, a camada foi lapidada para derivar um contrato de
resposta por turno (`questionType`, `target`, `expectedAnswerShape`,
`mustAnswer`, `mustNotSay`). Isso evita que a validacao seja apenas patch de
casos isolados e reduz falso positivo como "qual jogo tem hoje?" virar pergunta
de servico.

Na V2, esse contrato passou a ser calculado antes do LLM/fallback e enviado no
`LlmBrainProviderInput`. O brain local e o prompt do provider priorizam
`questionContract` antes de `intent`, `nextMove`, `topicStack`, `toolRoute` ou
tom. O verificador final permanece como rede de seguranca, mas respostas
originadas de contrato nao recebem costura generica do conductor.

### Regra derivada

Antes de personalidade, formato ou continuidade, a resposta precisa resolver a
pergunta real do usuario. Se a resposta nao contem a informacao minima pedida, a
camada final deve reparar ou bloquear a saida.

## 2026-06-13 - Agente conversacional universal

### Contexto

A IA ainda se comportava como chatbot de dominio: perguntas de tempo, futebol,
noticias ou clima eram puxadas para servico/agenda.

### Mudanca

Foi adicionada uma camada universal antes do brain de negocio:

- `lib/conversation-intelligence/topic-manager.ts` mantém stack de assuntos
  ativos/pausados/fechados;
- `lib/conversation-intelligence/tool-router.ts` decide entre resposta geral,
  dados em tempo real e ferramentas Social Landing;
- `app/api/conversation/tools/route.ts` expõe providers fail-closed para data,
  clima, noticias, esportes e busca web;
- `pnpm qa:universal-agent` valida Netflix, futebol, clima, noticias,
  tecnologia, mudança de assunto, retorno e agendamento após conversa livre.

### Regra derivada

A Social Landing não é o cérebro da conversa; é um conjunto de ferramentas. O
agente deve responder assuntos gerais diretamente e só usar agenda/catalogo
quando o usuário realmente pedir.

## 2026-06-13 - Anti-repetition guard conversacional

### Contexto

A camada conversacional ainda podia repetir aberturas e frases de template,
especialmente quando o fallback local ou o conductor costuravam respostas em
turnos longos.

### Mudanca

Foi criado `lib/conversation-intelligence/anti-repetition.ts` e o guard passou a
rodar no retorno final do resolver inteligente. Ele compara a resposta candidata
com historico recente, bloqueia aberturas repetidas, detecta similaridade alta e
remove linguagem interna/robotica.

Tambem foi adicionado `pnpm qa:anti-repetition`, com 20 turnos adversariais, e o
audit real ganhou o cenario `anti-repetition-natural-language`.

### Regra derivada

Resposta conversacional nao pode parecer template: sem abertura repetida, sem
similaridade alta entre turnos recentes, sem termos internos como contexto atual,
continuidade, intencao, resolver, visualBlock ou acao clara.

## 2026-06-13 - Gate adversarial humano

### Contexto

O audit de produto precisava validar conversa humana fora do roteiro, nao apenas
fluxos bonitos ou fixtures deterministicas.

### Mudanca

Foi criado `pnpm qa:human-adversarial-conversation`, rodando Playwright no
`/demo?composer-layout=v2` com cenarios adversariais:

- mudanca de assunto e retorno;
- critica direta a IA;
- escrita abreviada;
- referencias externas misturadas ao dominio;
- pedidos impossiveis;
- conversa livre com inseguranca.

O audit registra JSON bruto em `.review/human-adversarial-conversation-audit.json`
e falha em P0/P1.

### Regra derivada

A IA precisa reconhecer critica, inseguranca, escrita ruim e pedidos impossiveis
sem repetir resposta, inventar dado transacional, forcar contexto anterior ou
antecipar cards.

## 2026-06-13 - Quality gate conversacional

### Contexto

A camada LLM-first precisava medir qualidade humana, nao apenas acerto funcional.
Respostas corretas mas secas, sem continuidade ou com card cedo demais ainda
degradam a experiencia.

### Mudanca

Foi criado `pnpm qa:conversation-quality`, com fixtures multi-vertical e score por
resposta para continuidade, naturalidade, reflexao, proximo passo, uso de memoria
e disciplina de ferramenta.

### Regra derivada

Conversa aprovada precisa conduzir. Se a IA perde contexto, inventa dado
transacional ou antecipa cards, o QA falha.

## 2026-06-13 - Provider LLM real com fallback local

### Contexto

A Conversation Intelligence Layer passou a ter brain LLM-first. A etapa seguinte
precisava conectar provider real sem deixar o app inventar dados transacionais ou
vazar SDK/chave para Tier 1.

### Mudanca

Foi criado um provider plugavel para o brain conversacional:

- `lib/conversation-intelligence/llm-provider.ts`
- rota server `app/api/conversation/llm-brain/route.ts`
- fallback deterministico local quando env/rede/JSON falham
- metadados `actionRequest` e `conversationMode` preservados

### Regra derivada

O LLM gera texto e decisao de ferramenta. Preco, agenda, disponibilidade e cards
continuam controlados por resolvers/tools do app.

### Regresses evitadas

- SDK ou chave de provider no Tier 1;
- cards cedo demais por entusiasmo generativo;
- invencao de preco/agenda/disponibilidade;
- dependencia obrigatoria de env externa para QA local.

## 2026-05-20 - Criacao dos documentos mestres de memoria operacional

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

## 2026-06-13 - WS-H02 User Progress Preservation

### Contexto

Fail Closed continuava correto em seguranca, mas algumas respostas comerciais
encerravam a conversa em limitacao seca quando faltava dado confirmado.

### Mudanca

Criada camada `UserProgressPreservation` para atuar depois do fail-closed
operacional: se a resposta bloquear uma query recuperavel, a IA nao inventa
dado e troca o encerramento por uma pergunta minima util.

### Contrato

- Fail Closed nao inventa disponibilidade, preco ou politica.
- WS-H02 preserva o objetivo comercial quando falta slot operacional.
- Queries nao recuperaveis mantem o fail-closed original.

### Validacao

- `pnpm conversation:lab:rc` passou.
- Regression: 99% satisfaction, P0 7, P1 11.
- Real-agent: 96% satisfaction, P0 25, P1 31.
- `invented_data_count`: 0.
- `no_leak`: 0.

### Arquivos relacionados

- `lib/conversation-intelligence/user-progress-preservation.ts`
- `lib/conversation-intelligence/resolver-adapter.ts`
- `conversation-lab/datasets/golden/user-progress-preservation-regressions.jsonl`
- `conversation-lab/reports/summary/latest.md`

## 2026-06-14 - WS-H02-R1 Residual Hardening

### Contexto

Depois do WS-H02, dois residuos ficaram visiveis: recuperacao de horario curto
com tool label inconsistente e preco curto cross-vertical caindo em defaults de
barbearia.

### Mudanca

Microcorrecao restrita:

- WS-H02 agora usa contexto recente para diferenciar `que horas?` ambiguo de
  `sobre/e o horario` como retomada operacional explicita.
- Recuperacao de preco curto usa pergunta generica ou vertical contextual, sem
  assumir corte/barba quando o historico aponta consulta, produto ou restaurante.
- Respostas WS-H02 com pergunta minima util deixam de ser sobrescritas pelo
  composer transacional generico de agenda.
- Default antigo do brain local para preco sem servico deixou de assumir corte
  masculino/barba em contexto cross-vertical.

### Validacao

- `pnpm conversation:lab:rc` passou.
- Regression: 99% satisfaction, P0 7, P1 11.
- Real-agent: 97% satisfaction, P0 21, P1 29.
- `invented_data_count`: 0.
- `no_leak`: 0.

### Arquivos relacionados

- `lib/conversation-intelligence/user-progress-preservation.ts`
- `lib/conversation-intelligence/resolver-adapter.ts`
- `lib/conversation-intelligence/human-communication-layer.ts`
- `lib/conversation-intelligence/llm-brain.ts`
