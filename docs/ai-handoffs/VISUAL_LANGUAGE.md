# Linguagem Visual e Contratos Perceptivos

## Intencao do produto

O projeto deve parecer:

- vivo;
- organico;
- conversacional;
- social-first;
- continuo;
- atmosferico;
- sofisticado de forma invisivel.

O projeto nao deve parecer:

- institucional;
- dashboard tradicional;
- ecommerce classico;
- app com navbar/modal rigido;
- interface fragmentada em camadas artificiais.

## Principio central

Feed, stories e composer devem parecer partes de um unico ambiente vivo. O
composer nao deve parecer um modal sobreposto ao feed; ele deve emergir do feed
e continuar a conversa iniciada pelos cards, stories e drawers.

## Contratos perceptivos obrigatorios

Nao regredir:

- continuidade do feed;
- sensacao social-first;
- sensacao conversacional;
- profundidade atmosferica sutil;
- integracao natural entre feed, stories e composer;
- ausencia de separacoes artificiais;
- ausencia de sensacao de modal tradicional;
- ausencia de sensacao institucional;
- contencao visual;
- sofisticacao invisivel.

## Proibicoes visuais

Evitar sempre:

- excesso de glassmorphism;
- sombras agressivas;
- gradientes fortes;
- multiplas superficies desnecessarias;
- divisorias artificiais;
- efeitos premium explicitos;
- cards com aparencia de catalogo ecommerce classico;
- headers ou barras que transformem o feed em dashboard.

## Prioridades visuais

Priorizar:

- naturalidade;
- ritmo visual;
- continuidade;
- leveza estrutural;
- profundidade sutil;
- baixa friccao perceptiva;
- coerencia entre mobile e desktop;
- superficies que sustentam o conteudo sem competir com ele.

## Feed

O feed e a superficie primaria. Ele deve manter cadencia social e editorial:

- coluna central contida;
- fluxo vertical continuo;
- cards com hierarquia clara, sem excesso de molduras;
- spacing suficiente para respiracao, mas sem criar blocos desconectados;
- secoes reconheciveis sem parecerem modulos de dashboard;
- CTAs integrados ao conteudo, nao isolados como banners institucionais.

Evitar no feed:

- linhas duras entre todas as secoes;
- fundos alternados fortes;
- containers aninhados demais;
- sombras que parecam cards de marketplace;
- componentes que interrompam a rolagem social.

## Stories

Stories sao uma camada social de orientacao e descoberta, nao uma navegacao
institucional.

Contratos:

- devem se integrar ao topo nativo do feed;
- nao devem duplicar funcoes de busca ou filtros ja presentes no contexto;
- divisorias devem ser sutis e ritmicas;
- o viewer fullscreen deve permanecer acima de todo o resto;
- a navegacao para secoes depende de continuidade espacial.

Memoria recente:

- houve remocao de busca duplicada para reduzir redundancia perceptiva;
- divisorias dos stories foram tratadas como ajuste sensivel de ritmo;
- o topo nativo do feed e parte do ultimo estado visual bom.

## Composer

O composer e uma superficie conversacional viva, nao um modal.

Contratos:

- deve parecer ancorado ao feed;
- deve preservar superficie escura sutil baseada em `rgba(45,50,58,0.96)`;
- deve usar profundidade e blur com contencao;
- deve manter relacao natural com chips de contexto;
- deve responder ao conteudo e ao estado da conversa sem saltos visuais;
- deve preservar auto-grow e medicao real do conteudo.

Evitar no composer:

- aumentar glassmorphism sem necessidade;
- intensificar sombras;
- trocar blur por superficies opacas pesadas;
- criar separacao dura entre input, mensagens e contexto;
- alterar radius, cor, z-index ou altura sem mapear morph e medicao.

## Morph post -> chip

O morph e uma costura perceptiva entre feed e composer. Ele confirma que um
elemento social virou contexto conversacional.

Contratos:

- origem deve vir do card selecionado;
- destino deve ser o chip real ou clone de medicao;
- o chip real pode ficar temporariamente oculto durante a animacao;
- timing e easing devem permanecer calibrados;
- scroll/resize podem cancelar para evitar coordenadas erradas.

Nao tratar o morph como efeito decorativo. Ele e protocolo perceptivo e tecnico.

## Blur, sombra e profundidade

Profundidade deve ser atmosferica, nao cenografica.

Referencias atuais:

- header social com `backdrop-blur-xl`;
- feed drawer backdrop com `backdrop-blur-sm`;
- composer com `backdrop-blur-[18px]`;
- action drawer com backdrop mais simples;
- mascara gradiente do composer em camada propria.

Regras:

- blur deve apoiar continuidade, nao esconder arquitetura;
- sombras devem ser difusas e contidas;
- gradientes devem ser mascaras ou transicoes sutis, nao decoracao forte;
- opacidade deve preservar leitura de profundidade sem virar vidro chamativo.

## Divisorias

Divisorias sao ajustes de ritmo, nao separadores estruturais rigidos.

Usar divisorias apenas quando:

- ajudam a leitura de uma transicao editorial;
- preservam o fluxo continuo;
- nao criam blocos independentes;
- nao parecem bordas de dashboard.

Qualquer divisoria perto de stories, topo do feed ou composer tem risco visual
maior por alterar cadencia e continuidade.

## Spacing

Spacing e parte da arquitetura perceptiva.

Contratos:

- paddings inferiores protegem conteudo do composer;
- offsets de vertical, como `bottom-[88px]` no restaurant, sao calibrados;
- spacing de story/topo preserva a entrada nativa do feed;
- densidade deve evitar tanto aperto institucional quanto vazio premium artificial.

Nao corrigir sobreposicao com numeros locais sem mapear o sistema que mede ou
ancora a superficie.

## Mobile

Mobile e a experiencia primaria para validacao perceptiva.

Contratos:

- feed deve parecer nativo e continuo;
- drawers podem ocupar fullscreen sem parecer modal rigido;
- composer deve permanecer acessivel sem cobrir conteudo essencial;
- drag do sheet deve parecer fisico e previsivel;
- long-press nao pode competir com scroll natural;
- story viewer deve dominar a tela quando aberto.

## Desktop

Desktop deve preservar a mesma linguagem social, sem virar painel administrativo.

Contratos:

- coluna central contida;
- composicao nao deve se espalhar em dashboard;
- drawers bottom-sheet devem manter foco editorial;
- composer nao deve quebrar a largura visual estabelecida.

## Relacoes invisiveis

Antes de ajustar qualquer elemento visual, assumir acoplamento entre:

- feed;
- stories;
- composer;
- blur;
- overlays;
- divisorias;
- spacing;
- densidade visual;
- profundidade;
- surfaces;
- auto-grow;
- measurement systems;
- scroll behavior;
- morph;
- drawer orchestration.

Nada disso deve ser tratado como independente sem validacao.

## Memoria visual recente

### Composer resume auto-grow measurement

Decisao: composer deve retomar e crescer com base em medicao real, nao em
compensacoes visuais. Isso preserva continuidade quando a conversa reabre ou
quando resposta de IA chega.

### Topo nativo do feed

Decisao: o topo do feed deve parecer parte do proprio ambiente social, nao um
header institucional separado.

### Remocao de busca duplicada

Decisao: remover redundancia quando ela cria sensacao de interface fragmentada
ou excesso de controles.

### Divisorias dos stories

Decisao: divisorias devem reforcar cadencia, nunca criar cortes artificiais.

### Recuperacao do ultimo estado visual bom

Decisao: o estado visual bom recuperado e referencia de contencao, continuidade
e equilibrio entre feed, stories e composer.

## Checklist perceptivo

Antes de aprovar qualquer diff visual, responder:

- O feed ainda parece continuo?
- O composer ainda emerge naturalmente do feed?
- Alguma superficie passou a parecer modal tradicional?
- Alguma camada virou dashboard/ecommerce classico?
- Blur, sombra, opacidade ou gradiente ficaram explicitos demais?
- O mobile continua natural?
- Desktop preserva coluna social em vez de painel?
- Stories ainda parecem sociais e integrados?
- O ritmo visual mudou? Se sim, por que?
