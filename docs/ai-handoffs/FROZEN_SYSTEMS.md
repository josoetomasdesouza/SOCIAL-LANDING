# Sistemas Congelados e Protecao Arquitetural

## Objetivo deste documento

Este e o documento de protecao arquitetural mais critico do projeto. Ele mapeia
os sistemas altamente sensiveis que nao podem ser alterados casualmente, mesmo
quando a mudanca parece pequena, estetica ou local.

O documento existe para impedir:

- regressoes arquiteturais;
- simplificacoes perigosas;
- refactors destrutivos;
- solucoes locais frageis;
- hacks perceptivos;
- perda de continuidade entre feed, stories e composer;
- transformacao do produto em dashboard, ecommerce classico ou app institucional.

Fontes de base:

- `composer-continuity-contract.md`;
- `SYSTEM_ARCHITECTURE.md`;
- `VISUAL_LANGUAGE.md`;
- `CHANGE_PROTOCOL.md`;
- `EVOLUTION_LOG.md`;
- estado atual do codigo.

## Regra central

Um sistema congelado nao e necessariamente um sistema perfeito. Ele e um sistema
cujo comportamento atual carrega contratos invisiveis. Muitas partes parecem
duplicadas, locais, "feias" ou simplificaveis porque estao protegendo relacoes
entre DOM, scroll, medicao, z-index, percepcao e continuidade conversacional.

Se um agente nao consegue explicar exatamente o que um sistema protege, ele nao
deve altera-lo.

## Legenda de risco

| Nivel | Significado |
| --- | --- |
| Verde | Pode receber mudancas documentais ou copy sem impacto runtime. Ainda exige escopo claro. |
| Amarelo | Pode receber ajuste pequeno, mas exige leitura do fluxo, validacao mobile/desktop e diff minimo. |
| Vermelho | Nao alterar casualmente. Exige analise sistemica, plano explicito, validacao ampliada e justificativa forte. |

## Regressoes historicas e memorias que orientam este documento

- **Composer resume auto-grow measurement**: problemas de altura devem ser
  corrigidos na camada de medicao real, nao com timeouts ou compensacoes visuais.
- **Topo nativo do feed**: o topo do feed e parte da experiencia social, nao um
  header institucional separado.
- **Remocao de busca duplicada**: duplicacao funcional tambem pode ser regressao
  perceptiva, pois fragmenta o topo e aproxima a interface de dashboard/catalogo.
- **Divisorias dos stories**: divisorias sao ritmo, nao bordas estruturais.
- **Recuperacao do ultimo estado visual bom**: o baseline atual prioriza
  continuidade, contencao e integracao feed/stories/composer.

## Hacks proibidos

Nao resolver problemas congelados com:

- `setTimeout` para "esperar o DOM" sem entender a medicao;
- offsets magicos para esconder sobreposicao;
- `z-index` maior sem mapear a hierarquia inteira;
- troca de `data-*` por props locais sem revisar consumidores;
- duplicacao de busca/filtro para "facilitar" navegacao;
- blur, sombra ou gradiente mais forte para mascarar problema de profundidade;
- modal tradicional para substituir drawer/composer;
- estado React para substituir refs usados como leitura sincrona;
- unificacao de logicas por vertical sem testar cada vertical;
- cleanup de codigo que existe para preservar lifecycle, scroll ou medicao.

## Anti-patterns globais

- "Parece duplicado, vou centralizar."
- "Parece um numero arbitrario, vou normalizar."
- "E so visual, nao precisa testar."
- "Vou aumentar o z-index para garantir."
- "Vou trocar por uma animacao mais premium."
- "Vou adicionar uma camada glass para ficar moderno."
- "Vou transformar o composer em modal para simplificar."
- "Vou remover data attributes e passar refs."
- "Vou usar timeout porque no meu teste funcionou."

## Sintomas de overdesign

- excesso de glassmorphism;
- sombras grandes ou dramativas;
- muitos backgrounds alternados;
- bordas e divisorias em toda transicao;
- multiplas superficies empilhadas;
- controles duplicados;
- CTAs com aparencia de ecommerce classico;
- feed parecendo dashboard modular;
- composer parecendo produto separado do feed;
- stories parecendo menu institucional.

## Sintomas de quebra de continuidade

- feed parece dividido em blocos independentes;
- topo parece header externo ao feed;
- stories parecem navegacao e nao camada social;
- composer parece modal sobreposto;
- drawer compete com composer;
- chip aparece sem origem perceptiva;
- morph pula, nasce do lugar errado ou some;
- scroll muda de contexto sem explicacao;
- conteudo fica escondido atras do composer;
- resposta de IA chega sem reposicionar a conversa;
- blur/profundidade chamam mais atencao que o conteudo.

---

## 1. Morph layer

### 1. Nome do sistema

Morph layer (`PostToChatMorphLayer`).

### 2. Objetivo real do sistema

Criar a ponte perceptiva entre um card do feed e um chip de contexto no composer.
Ele transforma a selecao social em memoria conversacional visivel. Nao e apenas
animacao decorativa; e a prova visual de que o feed e o composer pertencem ao
mesmo ambiente.

### 3. Por que ele e sensivel

O morph depende de coordenadas reais do DOM, atributos `data-*`, timing de
480ms, cancelamento em scroll/resize, reduced motion e destino que pode mudar
durante layout shift. Pequenas mudancas na origem, no destino, no z-index ou no
timing podem quebrar a continuidade sem gerar erro no console.

### 4. O que quebra se alterar incorretamente

- Clone anima de `(0,0)` ou para coordenada errada;
- chip fica invisivel permanentemente;
- morph fica sob composer/drawer;
- scroll faz o clone "rasgar" na tela;
- usuario perde a relacao post -> conversa;
- composer passa a parecer sistema separado do feed.

### 5. Arquivos envolvidos

- `components/business/post-to-chat-morph-layer.tsx`
- `components/business/context-selectable.tsx`
- `components/business/business-social-landing.tsx`
- `components/business/conversational-ai.tsx`

### 6. Contratos invisiveis

- `data-post-context-source` localiza a origem;
- `data-conversation-context-chip` localiza o chip visivel;
- `data-conversation-context-chip-target` localiza clone de medicao;
- `data-conversation-composer` e fallback de destino;
- chip real pode ficar `opacity-0` enquanto o clone anima;
- `prefers-reduced-motion` deve pular animacao sem quebrar estado.

### 7. Relacoes com outros sistemas

- Context selection dispara o morph;
- measurement system define destino;
- z-index hierarchy posiciona o clone;
- scroll behavior cancela coordenadas obsoletas;
- composer surface precisa parecer o destino natural.

### 8. Sintomas classicos de regressao

- clone aparece em canto errado;
- chip duplica ou nunca aparece;
- card selecionado nao gera feedback perceptivo;
- animacao pula;
- morph some atras do sheet;
- regressao sem erro no console.

### 9. O que e permitido alterar

- Documentacao;
- copy ou comentarios explicativos;
- ajustes somente apos mapear origem, destino, z-index, timing e reduced motion;
- correcao de bug comprovado com validacao mobile/desktop.

### 10. O que e proibido alterar casualmente

- RAF do morph;
- timing de 480ms;
- easing;
- cancelamento em scroll/resize;
- busca por `data-*`;
- fallback para composer;
- z-index `z-[65]`;
- comportamento de hidden chip.

### 11. Nivel de risco

Vermelho.

---

## 2. Drag physics

### 1. Nome do sistema

Fisica de drag do sheet do composer.

### 2. Objetivo real do sistema

Permitir que o composer se comporte como uma superficie fisica e viva, com
arrasto direto, previsivel e integrado ao viewport. A intencao perceptiva e
evitar modal rigido e manter controle conversacional natural.

### 3. Por que ele e sensivel

O drag usa pointer events, pointer capture, refs de estado, altura inicial,
limiar de fechamento e distincao entre drag e transicao programatica. Ele compete
com scroll mobile, viewport dinamico e snap orchestration.

### 4. O que quebra se alterar incorretamente

- drag rouba scroll da pagina;
- sheet fecha acidentalmente;
- sheet nao acompanha o dedo;
- transicao CSS atua durante drag e causa lag;
- pointer perdido deixa estado preso;
- mobile parece quebrado ou pesado.

### 5. Arquivos envolvidos

- `components/business/conversational-ai.tsx`

### 6. Contratos invisiveis

- `dragStateRef` evita stale closures e re-renders;
- pointer capture mantem controle mesmo fora do handle;
- transicao de altura deve ser desabilitada durante drag;
- drag inicia no handle, nao em qualquer area do composer;
- close threshold depende de metricas calculadas.

### 7. Relacoes com outros sistemas

- snap orchestration;
- measurement system;
- viewport calculations;
- scroll behavior;
- composer auto-grow;
- overlay/depth layering.

### 8. Sintomas classicos de regressao

- sheet vibra durante arrasto;
- pagina rola junto com sheet;
- sheet pula para altura inesperada;
- drag fica preso depois de soltar;
- fechamento acidental ao tentar ler mensagens.

### 9. O que e permitido alterar

- Comentarios ou documentacao;
- pequenos fixes apenas com reproducao clara;
- ajuste apos validar touch, mouse, mobile narrow viewport e reduced motion.

### 10. O que e proibido alterar casualmente

- handlers `pointerdown`, `pointermove`, `pointerup`;
- estrutura de `dragStateRef`;
- pointer capture;
- regra de inicio do drag;
- limiar de fechamento;
- interacao entre drag e transicao.

### 11. Nivel de risco

Vermelho.

---

## 3. Snap orchestration

### 1. Nome do sistema

Orquestracao de snap do composer sheet.

### 2. Objetivo real do sistema

Definir estados fisicos coerentes para o composer: compacto, medio, expandido e
fechamento. O snap traduz conteudo conversacional em posturas previsiveis da
superficie.

### 3. Por que ele e sensivel

Os snap points dependem de viewport, conteudo medido, top area, context rail,
form, mensagens e auto-grow. Eles nao sao apenas constantes visuais; sao o
contrato entre conteudo, gesto e espaco disponivel.

### 4. O que quebra se alterar incorretamente

- composer cobre conteudo essencial;
- mensagens ficam escondidas;
- expanded nao cabe no viewport;
- compact fica pequeno demais para contexto;
- resposta de IA chega fora da area visivel;
- drag perde previsibilidade.

### 5. Arquivos envolvidos

- `components/business/conversational-ai.tsx`

### 6. Contratos invisiveis

- `compact`, `auto`, `medium`, `expanded`, `closeThreshold`;
- ratios calibrados `0.9`, `0.55`, `0.22`;
- deduplicacao de snap points;
- transicao de 300ms fora do drag;
- relacao com resposta de IA e auto-scroll.

### 7. Relacoes com outros sistemas

- drag physics;
- measurement system;
- viewport calculations;
- composer auto-grow;
- conversation continuity system.

### 8. Sintomas classicos de regressao

- sheet abre em altura errada;
- snap nao estabiliza;
- composer parece modal fullscreen sem intencao;
- conteudo novo nao aparece;
- teclado mobile causa altura quebrada.

### 9. O que e permitido alterar

- Documentar melhor os estados;
- corrigir bug de snap com evidencia;
- adicionar validacao se um novo estado for inevitavel.

### 10. O que e proibido alterar casualmente

- ratios de viewport;
- shape de `sheetMetrics`;
- close threshold;
- deduplicacao;
- associacao entre mensagens novas e expansao;
- transicao durante drag.

### 11. Nivel de risco

Vermelho.

---

## 4. Composer auto-grow

### 1. Nome do sistema

Auto-grow do composer.

### 2. Objetivo real do sistema

Permitir que o composer cresca com conteudo real da conversa, especialmente ao
retomar historico ou receber resposta de IA enquanto esta colapsado. O sistema
preserva a sensacao de conversa viva.

### 3. Por que ele e sensivel

Historicamente ja exigiu correcao: "composer resume auto-grow measurement". Isso
mostra que altura do composer e resultado de medicao, nao de suposicao. Qualquer
atalho cria saltos visuais.

### 4. O que quebra se alterar incorretamente

- resposta de IA fica escondida;
- composer nao cresce ao retomar conversa;
- sheet pula de altura;
- input cobre mensagens;
- experiencia parece travada ou passiva.

### 5. Arquivos envolvidos

- `components/business/conversational-ai.tsx`

### 6. Contratos invisiveis

- medicao do conteudo precede transicao;
- auto-grow conversa com snap points;
- mensagens novas acionam scroll e possivel expansao;
- refs evitam leitura obsoleta;
- nao usar timeout como substituto de layout real.

### 7. Relacoes com outros sistemas

- measurement system;
- snap orchestration;
- conversation continuity system;
- viewport calculations;
- AI reply simulation.

### 8. Sintomas classicos de regressao

- nova mensagem fora de vista;
- sheet colapsado mesmo com resposta;
- altura errada apos reload;
- flicker ao abrir historico;
- espaco vazio artificial.

### 9. O que e permitido alterar

- Ajustes de medicao comprovados;
- documentacao;
- correcao que reduza divergencia entre conteudo real e altura.

### 10. O que e proibido alterar casualmente

- trocar medicao por constantes;
- usar timeout para forcar altura;
- remover refs de medicao;
- reordenar `useLayoutEffect` sem analise;
- tratar auto-grow como apenas CSS.

### 11. Nivel de risco

Vermelho.

---

## 5. Measurement system

### 1. Nome do sistema

Sistema de medicao do composer e layout conversacional.

### 2. Objetivo real do sistema

Medir o DOM real para que composer, chips, mensagens, form, rail e sheet
respondam ao conteudo e ao viewport sem depender de suposicoes frageis.

### 3. Por que ele e sensivel

Medicao e o alicerce de auto-grow, snap, morph destination e viewport behavior.
Se medir cedo demais, tarde demais ou com elemento errado, a regressao pode ser
silenciosa.

### 4. O que quebra se alterar incorretamente

- sheet mede altura zero ou antiga;
- chip target fica errado;
- morph vai para destino incorreto;
- expanded excede viewport;
- scroll automatico falha;
- iOS Safari quebra com toolbar dinamica.

### 5. Arquivos envolvidos

- `components/business/conversational-ai.tsx`
- `components/business/business-social-landing.tsx`
- `components/business/post-to-chat-morph-layer.tsx`

### 6. Contratos invisiveis

- `useLayoutEffect` mede antes do paint/transicao perceptiva;
- `ResizeObserver` reage a mudancas de conteudo;
- `visualViewport` e preferivel quando existe;
- fallback `window.innerHeight` e necessario;
- hidden measurement chips existem para destino estavel.

### 7. Relacoes com outros sistemas

- composer auto-grow;
- snap orchestration;
- viewport calculations;
- post-to-chat morph flow;
- context selection system.

### 8. Sintomas classicos de regressao

- altura correta apenas apos segunda interacao;
- flicker no primeiro render;
- morph acerta algumas vezes e falha em outras;
- chips empurram layout inesperadamente;
- teclado mobile desorganiza tudo.

### 9. O que e permitido alterar

- Melhorar medicao se preservar sequencia e contratos;
- adicionar logs temporarios durante investigacao, removendo antes do commit;
- documentar dependencias.

### 10. O que e proibido alterar casualmente

- remover `useLayoutEffect`;
- substituir por `useEffect` sem prova;
- apagar measurement targets;
- trocar medicao por numeros fixos;
- simplificar `visualViewport`;
- remover `ResizeObserver` sem alternativa equivalente.

### 11. Nivel de risco

Vermelho.

---

## 6. Z-index hierarchy

### 1. Nome do sistema

Hierarquia absoluta de z-index.

### 2. Objetivo real do sistema

Garantir que feed, composer, morph, drawers, story viewer, headers e overlays
aparecam na ordem perceptiva correta. O usuario deve sentir continuidade e
profundidade, nao competicao de camadas.

### 3. Por que ele e sensivel

Os valores sao absolutos, nao relativos. Alguns conflitos sao intencionais, como
composer acima do feed drawer quando drawer esta aberto. "Aumentar z-index" pode
corrigir uma tela e quebrar outras tres.

### 4. O que quebra se alterar incorretamente

- story viewer nao fica acima de tudo;
- composer fica sob drawer quando deveria guiar conversa;
- morph some atras do composer;
- action drawer cobre area errada;
- header compete com overlays;
- interface parece empilhamento artificial.

### 5. Arquivos envolvidos

- `components/business/business-social-landing.tsx`
- `components/business/conversational-ai.tsx`
- `components/business/post-to-chat-morph-layer.tsx`
- `components/business/business-feed-drawer.tsx`
- `components/business/action-drawer.tsx`
- `components/social-landing/feed-drawer.tsx`
- story components internos.

### 6. Contratos invisiveis

- `z-30`: composer default;
- `z-[60]`: composer sobre feed drawer;
- `z-[65]`: morph layer;
- `z-[70]`: composer overlay;
- `z-[100]`: story viewer/toast;
- `z-[29]`: mascara abaixo do shell e acima do feed.

### 7. Relacoes com outros sistemas

- overlay/depth layering;
- drawer orchestration;
- morph layer;
- composer mode orchestration;
- story/feed continuity contracts.

### 8. Sintomas classicos de regressao

- clique vai para camada invisivel;
- componente visivel nao responde;
- story abre atras de outro elemento;
- morph aparece cortado;
- drawer parece modal quebrado;
- composer perde prioridade conversacional.

### 9. O que e permitido alterar

- Documentar novos valores;
- inserir camada nova somente com mapa completo;
- corrigir conflito comprovado em todas as combinacoes.

### 10. O que e proibido alterar casualmente

- aumentar z-index isoladamente;
- usar `z-[999]`;
- inserir overlay sem mapa;
- mudar `z-[65]`, `z-[60]`, `z-[70]`, `z-[100]`;
- remover `z-[29]` da mascara.

### 11. Nivel de risco

Vermelho.

---

## 7. Drawer orchestration

### 1. Nome do sistema

Orquestracao de drawers.

### 2. Objetivo real do sistema

Permitir que feed drawers, action drawers, product/cart/checkout flows e composer
convivam sem parecer modais independentes. Drawers devem aprofundar o feed, nao
quebrar o ambiente.

### 3. Por que ele e sensivel

Drawers interagem com `composerMode`, z-index, scroll lock, padding inferior,
largura do feed, story navigation e verticais especificas. Cada vertical possui
regras proprias.

### 4. O que quebra se alterar incorretamente

- composer aparece sobre checkout quando deveria sumir;
- carrinho fica sob composer;
- feed drawer esconde ultimo post;
- body scroll fica preso;
- drawer abre com largura desalinhada;
- vertical perde fluxo proprio.

### 5. Arquivos envolvidos

- `components/business/business-social-landing.tsx`
- `components/business/business-feed-drawer.tsx`
- `components/business/action-drawer.tsx`
- `components/social-landing/feed-drawer.tsx`
- arquivos de verticais em `components/business/*/*-feed.tsx`

### 6. Contratos invisiveis

- `pb-36` protege conteudo no feed drawer;
- `bottom-[88px]` protege cart bar no restaurant;
- scroll lock deve limpar no unmount;
- feed drawer e composer possuem conflito intencional de z-index;
- action drawers podem exigir `hidden` ou `overlay`.

### 7. Relacoes com outros sistemas

- composer mode orchestration;
- scroll lock system;
- z-index hierarchy;
- feed/stories spacing rhythm;
- viewport calculations.

### 8. Sintomas classicos de regressao

- ultimo conteudo impossivel de ler;
- composer cobre botao primario;
- drawer parece modal institucional;
- scroll de fundo continua ativo;
- drawer fecha e body permanece travado.

### 9. O que e permitido alterar

- Ajuste de conteudo dentro de drawer;
- fix local com validacao de abertura/fechamento;
- mudanca em uma vertical sem generalizar para outras.

### 10. O que e proibido alterar casualmente

- unificar todos os drawers;
- centralizar scroll lock sem revisar lifecycle;
- remover padding de protecao;
- mudar z-index de drawer;
- alterar `composerMode` por conveniencia;
- refatorar verticais em bloco.

### 11. Nivel de risco

Vermelho.

---

## 8. Scroll lock system

### 1. Nome do sistema

Sistema de scroll lock dos drawers.

### 2. Objetivo real do sistema

Impedir que o feed de fundo role enquanto uma superficie de drawer esta aberta,
mantendo o foco espacial e evitando mistura de scrolls.

### 3. Por que ele e sensivel

O padrao repetido em drawers parece duplicacao, mas cada drawer gerencia seu
proprio cleanup. Centralizar pode criar lock preso ou disputa entre drawers.

### 4. O que quebra se alterar incorretamente

- `body` fica sem scroll apos fechar;
- fundo rola atras do drawer;
- drawer perde scroll interno;
- dois drawers disputam cleanup;
- mobile fica inutilizavel.

### 5. Arquivos envolvidos

- `components/social-landing/feed-drawer.tsx`
- `components/business/business-feed-drawer.tsx`
- `components/business/action-drawer.tsx`

### 6. Contratos invisiveis

- `document.body.style.overflow = "hidden"` quando aberto;
- reset para `""` quando fechado;
- cleanup no return do `useEffect`;
- independencia por drawer e intencional.

### 7. Relacoes com outros sistemas

- drawer orchestration;
- viewport calculations;
- morph layer cancelamento em scroll;
- composer visibility;
- mobile UX.

### 8. Sintomas classicos de regressao

- nao consegue rolar a pagina depois de fechar;
- fundo se move durante drawer;
- drawer parece prender a tela;
- scroll position muda inesperadamente;
- bug so aparece em sequencia abrir/fechar.

### 9. O que e permitido alterar

- Comentarios;
- correcao se preservar padrao nos tres drawers;
- validacao de cleanup em cada drawer.

### 10. O que e proibido alterar casualmente

- substituir por hook global;
- remover cleanup;
- usar contador global sem prova;
- mudar apenas um drawer;
- misturar scroll lock com logica visual.

### 11. Nivel de risco

Vermelho.

---

## 9. Feed/stories spacing rhythm

### 1. Nome do sistema

Ritmo de spacing entre feed e stories.

### 2. Objetivo real do sistema

Manter a primeira dobra social, respiravel e continua. Stories, topo nativo,
busca/filtros e primeiras secoes precisam parecer um fluxo, nao blocos
institucionais empilhados.

### 3. Por que ele e sensivel

Spacing, divisorias e densidade sao perceptivos. Ajustes pequenos podem fazer a
landing parecer dashboard, ecommerce ou pagina institucional. Historicamente,
topo nativo, busca duplicada e divisorias dos stories ja exigiram cuidado.

### 4. O que quebra se alterar incorretamente

- topo vira header institucional;
- stories parecem menu;
- busca duplica controle;
- feed parece separado do composer;
- primeira dobra perde ritmo social;
- usuario sente camadas artificiais.

### 5. Arquivos envolvidos

- `components/business/business-social-landing.tsx`
- `components/social-landing/index.tsx`
- `components/social-landing/stories.tsx`
- componentes de stories business internos

### 6. Contratos invisiveis

- topo nativo e baseline perceptivo;
- divisorias devem ser sutis;
- busca duplicada e regressao perceptiva;
- spacing deve orientar, nao separar;
- stories devem parecer descoberta social.

### 7. Relacoes com outros sistemas

- story/feed continuity contracts;
- blur/depth atmosphere;
- composer surface contracts;
- drawer navigation;
- z-index quando story viewer abre.

### 8. Sintomas classicos de regressao

- "cara de dashboard";
- excesso de linhas;
- muito respiro premium artificial;
- stories isolados;
- controles competindo no topo;
- feed perde cadencia.

### 9. O que e permitido alterar

- Ajuste de copy;
- divisoria sutil com justificativa perceptiva;
- spacing pequeno validado em mobile/desktop;
- remocao de redundancia.

### 10. O que e proibido alterar casualmente

- adicionar barras, navs rigidas ou headers pesados;
- duplicar busca;
- criar separadores fortes;
- transformar stories em menu;
- reorganizar topo sem revisar primeira dobra.

### 11. Nivel de risco

Amarelo a Vermelho. Vermelho quando afeta stories, composer ou primeira dobra.

---

## 10. Composer surface contracts

### 1. Nome do sistema

Contratos de superficie do composer.

### 2. Objetivo real do sistema

Preservar o composer como superficie conversacional integrada ao feed, com
profundidade sutil, dark glass contido e sensacao de continuidade.

### 3. Por que ele e sensivel

Cor, blur, radius, sombra, borda e opacidade nao sao decoracao isolada. Eles
definem se o composer parece vivo e natural ou modal premium artificial.

### 4. O que quebra se alterar incorretamente

- composer parece modal;
- excesso de glassmorphism;
- morph nao combina com destino;
- sombra pesa demais;
- contraste separa feed e conversa;
- ambiente perde sofisticacao invisivel.

### 5. Arquivos envolvidos

- `components/business/conversational-ai.tsx`
- `components/business/post-to-chat-morph-layer.tsx`
- `components/business/business-social-landing.tsx`

### 6. Contratos invisiveis

- `COMPOSER_SURFACE_COLOR = "rgba(45,50,58,0.96)"`;
- `backdrop-blur-[18px]`;
- `rounded-[28px]`;
- borda branca sutil;
- sombra difusa;
- mascara gradiente em camada propria.

### 7. Relacoes com outros sistemas

- morph layer;
- overlay/depth layering;
- blur/depth atmosphere;
- measurement system;
- z-index hierarchy.

### 8. Sintomas classicos de regressao

- painel parece vidro exagerado;
- composer chama mais atencao que conversa;
- feed e composer parecem produtos distintos;
- borda/sombra marca demais;
- chip parece colado em superficie errada.

### 9. O que e permitido alterar

- Documentacao;
- ajuste visual apenas com comparacao perceptiva;
- correcao de contraste se preservar atmosfera.

### 10. O que e proibido alterar casualmente

- `COMPOSER_SURFACE_COLOR`;
- blur;
- radius;
- sombra;
- borda;
- mascara gradiente;
- transformar o composer em card branco/premium/ecommerce.

### 11. Nivel de risco

Vermelho.

---

## 11. Overlay/depth layering

### 1. Nome do sistema

Layering de overlay e profundidade.

### 2. Objetivo real do sistema

Organizar profundidade entre feed, drawer, composer, morph, story viewer e
backdrops sem criar sensacao de pilha artificial de modais.

### 3. Por que ele e sensivel

Overlay nao e so z-index. Ele combina blur, opacidade, backdrop, pointer events,
scroll, largura e contexto. Um overlay forte demais quebra continuidade; fraco
demais mistura interacoes.

### 4. O que quebra se alterar incorretamente

- usuario nao entende qual camada esta ativa;
- tap/click cai em elemento errado;
- story viewer perde dominancia;
- composer compete com drawer;
- atmosfera vira glassmorphism exagerado.

### 5. Arquivos envolvidos

- `components/business/business-social-landing.tsx`
- `components/business/conversational-ai.tsx`
- `components/business/business-feed-drawer.tsx`
- `components/business/action-drawer.tsx`
- `components/social-landing/feed-drawer.tsx`

### 6. Contratos invisiveis

- backdrops sustentam foco sem institucionalizar;
- composer pode ficar acima do feed drawer;
- story viewer sempre domina;
- morph precisa ficar visivel durante transicao;
- pointer-events devem respeitar camada ativa.

### 7. Relacoes com outros sistemas

- z-index hierarchy;
- drawer orchestration;
- blur/depth atmosphere;
- composer mode orchestration;
- scroll lock system.

### 8. Sintomas classicos de regressao

- camada ativa parece errada;
- backdrop escuro demais;
- app parece modal stack;
- interacao bloqueada invisivelmente;
- profundidade sem naturalidade.

### 9. O que e permitido alterar

- Ajuste de backdrop com justificativa;
- correcao de pointer-events comprovada;
- documentar nova camada antes de implementar.

### 10. O que e proibido alterar casualmente

- adicionar overlay novo;
- alterar opacity/blur sem validar percepcao;
- mudar pointer-events;
- alterar backdrop para esconder falha de z-index;
- criar multiplas superficies para resolver problema local.

### 11. Nivel de risco

Vermelho.

---

## 12. Viewport calculations

### 1. Nome do sistema

Calculos de viewport.

### 2. Objetivo real do sistema

Adaptar composer, snap, expanded height, close threshold e drawers ao espaco
real disponivel, especialmente em mobile e iOS Safari.

### 3. Por que ele e sensivel

Viewport mobile muda com toolbar, teclado e orientacao. `visualViewport` existe
para capturar essas mudancas. Simplificar para `window.innerHeight` pode parecer
funcionar no desktop e falhar no mobile real.

### 4. O que quebra se alterar incorretamente

- sheet fica alto demais;
- botao/input fica sob teclado;
- close threshold fica errado;
- expanded ultrapassa tela;
- drawer e composer se sobrepoem;
- bug aparece apenas em mobile.

### 5. Arquivos envolvidos

- `components/business/conversational-ai.tsx`
- drawers business/social quando relacionados a altura

### 6. Contratos invisiveis

- preferir `visualViewport` quando disponivel;
- fallback para `window.innerHeight`;
- considerar bottom offset do shell;
- safe margin superior;
- recalcular em resize.

### 7. Relacoes com outros sistemas

- measurement system;
- snap orchestration;
- drag physics;
- scroll lock system;
- composer auto-grow.

### 8. Sintomas classicos de regressao

- funciona no desktop e falha no celular;
- sheet corta conteudo com teclado;
- drag fecha cedo demais;
- altura muda ao rolar a pagina;
- expanded parece fullscreen acidental.

### 9. O que e permitido alterar

- Melhorar suporte a caso real documentado;
- adicionar fallback seguro;
- validar em viewport mobile estreito.

### 10. O que e proibido alterar casualmente

- remover `visualViewport`;
- usar apenas `100vh`;
- ignorar teclado mobile;
- substituir por constante;
- mudar safe margin sem testar.

### 11. Nivel de risco

Vermelho.

---

## 13. Conversation continuity system

### 1. Nome do sistema

Sistema de continuidade conversacional.

### 2. Objetivo real do sistema

Preservar a conversa como memoria viva entre mensagens, contexto selecionado,
historico persistido, resposta de IA e estado visual do composer.

### 3. Por que ele e sensivel

Ele mistura estado React, refs, `localStorage`, roles literais de mensagem,
context events, auto-scroll e expansao do sheet. Alterar uma parte pode apagar
historico ou quebrar reconstrucao do contexto.

### 4. O que quebra se alterar incorretamente

- historico nao carrega;
- contexto some apos reload;
- remover chip nao limpa evento associado;
- resposta de IA chega fora de ordem;
- sheet nao reflete conversa nova;
- conversa parece resetada.

### 5. Arquivos envolvidos

- `components/business/conversational-ai.tsx`
- `components/business/conversation-selection-context.tsx`

### 6. Contratos invisiveis

- key `business-conversation-history:{brand}`;
- roles `"user"`, `"ai"`, `"context_event"`;
- `context_event` e filtrado/removido por logica especifica;
- refs sincronas evitam stale closures;
- mensagem nova pode exigir auto-scroll/expansao.

### 7. Relacoes com outros sistemas

- context selection system;
- composer auto-grow;
- snap orchestration;
- measurement system;
- composer mode orchestration.

### 8. Sintomas classicos de regressao

- chips duplicados;
- evento de contexto fantasma;
- historico desaparece;
- AI responde sem contexto selecionado;
- composer nao expande com resposta.

### 9. O que e permitido alterar

- Copy de mensagens;
- correcao de persistencia com migracao clara;
- documentar estrutura;
- ajuste que preserve roles e key.

### 10. O que e proibido alterar casualmente

- renomear roles;
- mudar formato de localStorage;
- trocar refs criticas por estado;
- apagar `context_event`;
- alterar limpeza de chips sem testar historico.

### 11. Nivel de risco

Vermelho.

---

## 14. Context selection system

### 1. Nome do sistema

Sistema de selecao de contexto.

### 2. Objetivo real do sistema

Permitir que o usuario selecione partes do feed por long-press e transforme
conteudo social em contexto conversacional. E a interacao que torna o feed
falante.

### 3. Por que ele e sensivel

Long-press compete com scroll mobile. A selecao tambem alimenta morph, chips,
estado global por vertical, haptics e estado visual de cards. O threshold foi
calibrado para evitar ativacao acidental.

### 4. O que quebra se alterar incorretamente

- long-press ativa ao tentar rolar;
- selecao fica lenta;
- haptic dispara errado;
- morph perde origem;
- card parece pressionado sem selecionar;
- contexto duplica.

### 5. Arquivos envolvidos

- `components/business/context-selectable.tsx`
- `components/business/conversation-selection-context.tsx`
- `components/business/business-social-landing.tsx`
- cards e secoes das verticais

### 6. Contratos invisiveis

- `LONG_PRESS_MS = 420`;
- `rememberedMorphSource` module-level;
- `data-post-context-source`;
- ignore de targets interativos;
- haptic leve;
- maximo de itens no contexto.

### 7. Relacoes com outros sistemas

- morph layer;
- post-to-chat morph flow;
- conversation continuity system;
- composer surface contracts;
- feed/stories spacing rhythm.

### 8. Sintomas classicos de regressao

- scrolling vira selecao acidental;
- botao dentro do card dispara selecao;
- chip aparece sem animacao;
- fonte do morph nao encontrada;
- selecao visual parece pesada.

### 9. O que e permitido alterar

- Ajuste de estilo de selected state com validacao perceptiva;
- correcao de alvo interativo;
- documentacao;
- suporte a novo tipo de card preservando atributos.

### 10. O que e proibido alterar casualmente

- `LONG_PRESS_MS`;
- singleton de morph source;
- `data-post-context-source`;
- ignore de elementos interativos;
- trocar module-level cache por context/state;
- remover haptic sem decisao.

### 11. Nivel de risco

Vermelho.

---

## 15. Post-to-chat morph flow

### 1. Nome do sistema

Fluxo post-to-chat completo.

### 2. Objetivo real do sistema

Conectar acao no feed, memoria de origem, atualizacao de contexto, chip oculto,
animacao morph, exibicao do chip e continuidade da conversa. E o fluxo completo
que faz o feed virar conversa.

### 3. Por que ele e sensivel

Este fluxo atravessa varios componentes sem prop drilling pesado, usando
atributos DOM, singleton, filas/estado de morph e callbacks. Quebrar qualquer
elo produz regressao silenciosa.

### 4. O que quebra se alterar incorretamente

- selecao atualiza contexto mas nao anima;
- anima mas chip nao aparece;
- chip aparece mas historico nao registra;
- origem some apos re-render;
- remover chip nao limpa contexto;
- feed e composer deixam de parecer conectados.

### 5. Arquivos envolvidos

- `components/business/context-selectable.tsx`
- `components/business/business-social-landing.tsx`
- `components/business/post-to-chat-morph-layer.tsx`
- `components/business/conversational-ai.tsx`
- `components/business/conversation-selection-context.tsx`

### 6. Contratos invisiveis

- ordem: long-press -> remember source -> update context -> hide chip -> morph -> show chip;
- source cache TTL 1800ms;
- chip oculto durante animacao;
- `onComplete` restaura visibilidade;
- reduced motion preserva estado sem animacao.

### 7. Relacoes com outros sistemas

- context selection system;
- morph layer;
- measurement system;
- conversation continuity system;
- z-index hierarchy.

### 8. Sintomas classicos de regressao

- chip permanente em `opacity-0`;
- morph funciona so na primeira vez;
- contexto selecionado sem chip;
- animacao para destino antigo;
- chip rail mede altura errada.

### 9. O que e permitido alterar

- Corrigir bug com teste do fluxo inteiro;
- ajustar copy/labels de contexto;
- adicionar novo tipo de contexto mantendo protocolo.

### 10. O que e proibido alterar casualmente

- ordem do fluxo;
- TTL de source;
- hidden chip lifecycle;
- `onComplete`;
- protocolo DOM;
- maximo de contexto sem revisar layout.

### 11. Nivel de risco

Vermelho.

---

## 16. Blur/depth atmosphere

### 1. Nome do sistema

Atmosfera de blur e profundidade.

### 2. Objetivo real do sistema

Criar profundidade sutil e sofisticacao invisivel, sem transformar a interface
em glassmorphism explicito ou camada premium artificial.

### 3. Por que ele e sensivel

Blur, sombra, opacity e gradiente sao linguagem sistemica. Eles orientam foco,
continuidade e relacao entre superficies. Exagero cria overdesign; ausencia pode
achatar e institucionalizar.

### 4. O que quebra se alterar incorretamente

- excesso de vidro;
- sombras agressivas;
- superficies parecem desconectadas;
- drawer vira modal pesado;
- composer parece popup premium;
- feed perde atmosfera social.

### 5. Arquivos envolvidos

- `components/business/conversational-ai.tsx`
- `components/business/business-feed-drawer.tsx`
- `components/business/action-drawer.tsx`
- `components/social-landing/feed-drawer.tsx`
- headers/stories conforme superficie

### 6. Contratos invisiveis

- header com blur mais atmosferico;
- feed drawer backdrop com blur leve;
- composer com blur calibrado;
- action drawer mais simples;
- mascara gradiente do composer como transicao, nao decoracao.

### 7. Relacoes com outros sistemas

- composer surface contracts;
- overlay/depth layering;
- z-index hierarchy;
- feed/stories spacing rhythm;
- story/feed continuity contracts.

### 8. Sintomas classicos de regressao

- usuario nota o efeito antes do conteudo;
- muitas camadas translucidas;
- contraste fica lavado;
- premium explicito demais;
- app parece template de UI.

### 9. O que e permitido alterar

- Ajuste sutil justificado por legibilidade;
- reducao de excesso;
- documentacao de decisao visual.

### 10. O que e proibido alterar casualmente

- intensificar blur para esconder separacao;
- adicionar gradientes fortes;
- aumentar sombras;
- criar novas superficies translucent;
- mudar atmosfera junto com logica funcional.

### 11. Nivel de risco

Amarelo a Vermelho. Vermelho quando envolve composer, drawers ou stories.

---

## 17. Composer mode orchestration

### 1. Nome do sistema

Orquestracao de `composerMode`.

### 2. Objetivo real do sistema

Controlar quando o composer esta integrado, sobreposto ou oculto, preservando
continuidade conversacional sem cobrir fluxos onde ele atrapalharia.

### 3. Por que ele e sensivel

Cada vertical tem cenarios proprios: produto, carrinho, checkout, cart bar,
drawers customizados e feed drawer. Unificar parece limpeza, mas remove contexto
de negocio e quebra camadas.

### 4. O que quebra se alterar incorretamente

- composer cobre checkout;
- composer some quando deveria guiar conversa;
- cart bar e composer se sobrepoem;
- z-index fica errado;
- vertical perde fluxo proprio;
- usuario sente conflito entre compra e conversa.

### 5. Arquivos envolvidos

- `components/business/conversation-selection-context.tsx`
- `components/business/business-social-landing.tsx`
- `components/business/*/*-feed.tsx`
- `components/business/conversational-ai.tsx`

### 6. Contratos invisiveis

- valores literais `"default" | "overlay" | "hidden"`;
- `overlay` implica prioridade visual;
- `hidden` protege fluxos de acao;
- offset pode complementar modo, como `bottom-[88px]`;
- cleanup de modo por vertical e obrigatorio.

### 7. Relacoes com outros sistemas

- drawer orchestration;
- z-index hierarchy;
- composer surface contracts;
- scroll lock system;
- viewport calculations.

### 8. Sintomas classicos de regressao

- composer visivel sobre checkout;
- composer atras do drawer;
- vertical funciona diferente sem explicacao;
- restaurant cart bar coberta;
- modo fica preso apos fechar drawer.

### 9. O que e permitido alterar

- Ajustar uma vertical com caso real;
- documentar regra de uma vertical;
- adicionar modo de uso dentro dos valores existentes.

### 10. O que e proibido alterar casualmente

- renomear valores;
- adicionar quarto valor sem revisao total;
- unificar verticais;
- remover offsets calibrados;
- mudar className de z-index sem mapa.

### 11. Nivel de risco

Vermelho.

---

## 18. Story/feed continuity contracts

### 1. Nome do sistema

Contratos de continuidade entre stories e feed.

### 2. Objetivo real do sistema

Fazer stories parecerem camada social de descoberta conectada ao feed, com
navegacao espacial para secoes e viewer fullscreen acima de tudo.

### 3. Por que ele e sensivel

Stories conectam percepcao, scroll, `data-section`, timing, progress bar,
divisorias e topo nativo. Se virarem menu ou carrossel institucional, quebram a
filosofia social-first.

### 4. O que quebra se alterar incorretamente

- story nao encontra secao;
- scroll posiciona errado;
- viewer abre atras de camada;
- progress parece nervoso;
- stories parecem navegacao de site;
- feed perde entrada social.

### 5. Arquivos envolvidos

- `components/business/business-social-landing.tsx`
- `components/social-landing/stories.tsx`
- `components/social-landing/index.tsx`
- secoes/cards que aplicam `data-section`

### 6. Contratos invisiveis

- `data-section` e protocolo de navegacao;
- story viewer usa camada dominante;
- auto-advance 5000ms;
- tick de progress 50ms;
- delay story -> drawer/scroll preserva sequencia;
- divisorias sao ritmo, nao cortes.

### 7. Relacoes com outros sistemas

- feed/stories spacing rhythm;
- z-index hierarchy;
- overlay/depth layering;
- drawer orchestration;
- blur/depth atmosphere.

### 8. Sintomas classicos de regressao

- tap no story nao leva a lugar certo;
- primeira dobra parece fragmentada;
- story viewer compete com composer;
- divisoria pesa demais;
- busca/filtro duplica papel dos stories.

### 9. O que e permitido alterar

- Ajustar conteudo de story;
- corrigir mapping de secao preservando `data-section`;
- refinamento de divisoria com validacao perceptiva.

### 10. O que e proibido alterar casualmente

- remover `data-section`;
- trocar stories por menu rigido;
- alterar timing sem validacao;
- inserir busca duplicada;
- mover viewer para camada inferior;
- criar corte visual forte entre stories e feed.

### 11. Nivel de risco

Vermelho.

---

## Onde novos agentes podem mexer

Geralmente seguro, desde que o escopo seja claro:

- documentacao em `docs/ai-handoffs`;
- copy de documentacao;
- copy de conteudo nao estrutural;
- pequenos ajustes em conteudo de uma vertical, sem tocar composer/drawers/morph;
- comentarios explicativos que nao alteram runtime.

Com cautela:

- spacing local fora da primeira dobra;
- copy visivel em cards;
- ajustes de conteudo em stories;
- mudancas em uma vertical isolada.

Sempre validar se o ajuste nao toca contratos invisiveis.

## Onde novos agentes nao devem mexer sem analise completa

- `components/business/conversational-ai.tsx`;
- `components/business/business-social-landing.tsx`;
- `components/business/context-selectable.tsx`;
- `components/business/post-to-chat-morph-layer.tsx`;
- `components/business/conversation-selection-context.tsx`;
- drawers;
- z-index;
- blur/sombra/surface do composer;
- `composerMode`;
- `data-*`;
- medicao/viewport;
- drag/snap;
- scroll lock;
- topo/stories/primeira dobra.

## Checklist obrigatorio antes de tocar sistema congelado

- Qual sistema congelado esta envolvido?
- Qual contrato perceptivo ele protege?
- Qual relacao invisivel pode quebrar?
- O comportamento atual foi observado?
- O comportamento desejado foi descrito?
- Existe alternativa documental ou de menor diff?
- O diff altera apenas uma responsabilidade?
- Mobile e desktop foram considerados?
- O ultimo estado visual bom continua preservado?
- A mudanca precisa atualizar `EVOLUTION_LOG.md`?

## Regra final

Sistemas congelados so devem mudar quando a mudanca fortalece o sistema. Se a
mudanca apenas deixa o codigo mais simples para o agente, mas reduz continuidade,
previsibilidade ou coerencia perceptiva, ela deve ser rejeitada.
