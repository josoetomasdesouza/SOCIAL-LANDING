# Arquitetura do Sistema

## Escopo deste documento

Este documento descreve a arquitetura operacional atual do projeto em `/workspace`.
Ele deve ser lido antes de qualquer alteracao em feed, stories, composer, drawers,
morph, blur, overlays, spacing, z-index, medicao ou scroll.

Fonte complementar obrigatoria:

- `docs/ai-handoffs/composer-continuity-contract.md`

## Filosofia estrutural

O projeto deve operar como um ambiente social vivo:

- continuo, sem separacoes artificiais entre feed, stories e composer;
- conversacional, com o composer emergindo naturalmente do feed;
- social-first, evitando linguagem de dashboard, ecommerce classico ou app institucional;
- sofisticado de forma invisivel, com profundidade sutil e baixa ostentacao visual.

Qualquer mudanca pequena em superficie visual pode afetar sistemas acoplados por DOM,
medicao, scroll, layering ou ritmo perceptivo.

## Superficies principais

| Rota | Arquivo | Papel |
| --- | --- | --- |
| `/` | `app/page.tsx` | Social landing estatica premium, baseada em `SocialLanding` |
| `/demo` | `app/demo/page.tsx` | Selector de verticais e business/social landing conversacional |
| `/[slug]` | `app/[slug]/page.tsx` | Profile landing simples, fora do fluxo feed/composer |
| `/criar` | `app/criar/page.tsx` | Builder isolado com `framer-motion` |
| `/criar/editor` e `/criar/novo` | `app/criar/**/page.tsx` | Fluxos de editor/criacao |

As superficies nao devem ser misturadas. A arquitetura de `/criar` e isolada das
landings sociais/business.

## Arquitetura da home social (`/`)

Orquestrador principal:

- `components/social-landing/index.tsx`

Composicao conceitual:

```text
SocialLanding
  Business/Social header fixo
  Stories
  Search/category controls
  SectionFeed
  FeedDrawer
```

Caracteristicas:

- nao possui IA conversacional;
- nao possui morph post -> chip;
- usa drawer de feed proprio;
- preserva o padrao de feed editorial continuo.

## Arquitetura da business landing (`/demo`)

Entrada:

- `app/demo/page.tsx`
- `components/business/business-selector.tsx`

Verticais principais:

- `components/business/appointment/appointment-feed.tsx`
- `components/business/courses/courses-feed.tsx`
- `components/business/ecommerce/ecommerce-feed.tsx`
- `components/business/events/events-feed.tsx`
- `components/business/gym/gym-feed.tsx`
- `components/business/health/health-feed.tsx`
- `components/business/professionals/professionals-feed.tsx`
- `components/business/realestate/realestate-feed.tsx`
- `components/business/restaurant/restaurant-feed.tsx`
- `components/business/influencer/influencer-feed.tsx`
- `components/business/institutional/institutional-feed.tsx`
- `components/business/personal/personal-feed.tsx`

Composicao dominante:

```text
ConversationSelectionProvider
  *Feed vertical
    BusinessSocialLanding
      Business stories
      Business sections
      ContextSelectable cards
      PostToChatMorphLayer
      ConversationalAI
      BusinessFeedDrawer
      ActionDrawer / custom drawers
```

## Sistemas criticos

### Tier 1 - revisar o sistema completo antes de editar

| Arquivo | Responsabilidade | Risco |
| --- | --- | --- |
| `components/business/conversational-ai.tsx` | Composer, sheet, drag, medicao, chips, historico, auto-grow | Critico |
| `components/business/business-social-landing.tsx` | Orquestracao de feed, stories, drawer, morph e composer | Critico |
| `components/business/conversation-selection-context.tsx` | Estado compartilhado de contexto e `composerMode` | Critico |
| `components/business/context-selectable.tsx` | Long-press, cache de origem do morph, selecao visual | Critico |
| `components/business/post-to-chat-morph-layer.tsx` | Animacao RAF post -> chip | Critico |

### Tier 2 - editar com cuidado e validar o fluxo completo

| Arquivo | Responsabilidade | Risco |
| --- | --- | --- |
| `components/business/action-drawer.tsx` | Drawers de acao, scroll lock, interacao com composer | Alto |
| `components/business/business-feed-drawer.tsx` | Drawer de feed business, scroll interno, padding do composer | Alto |
| `components/social-landing/feed-drawer.tsx` | Drawer de feed social, scroll lock e scroll-to-post | Alto |
| `app/globals.css` | Tokens, utilitarios, scrollbar, safe-area, keyframes | Alto |

### Tier 3 - verticais

Cada vertical possui decisoes proprias de `composerMode`, drawers, carrinho,
checkout ou CTA. Nao unificar a logica entre verticais sem validar cada caso.

## Contratos tecnicos imoveis

### `composerMode`

Valores validos e congelados:

```ts
"default" | "overlay" | "hidden"
```

Usos principais:

- `default`: composer integrado ao feed;
- `overlay`: composer acima de drawers ou superficies especificas;
- `hidden`: composer oculto em fluxos que nao devem ser sobrepostos.

### Atributos `data-*`

Estes atributos sao protocolo entre componentes. Nao renomear, remover ou trocar
por refs sem revisao arquitetural.

| Atributo | Quem aplica | Quem consome |
| --- | --- | --- |
| `data-post-context-source` | `ContextSelectable` | Morph source lookup |
| `data-conversation-composer` | `ConversationalAI` | Fallback de destino do morph |
| `data-conversation-context-chip` | Chip visivel | Destino principal do morph |
| `data-conversation-context-chip-target` | Clone de medicao | Fallback de destino do chip |
| `data-conversation-context-rail` | Rail de contexto | Medicao de layout |
| `data-section` | Secoes do feed | Navegacao por stories |

### `COMPOSER_SURFACE_COLOR`

Valor base congelado:

```ts
rgba(45,50,58,0.96)
```

Ele ancora a superficie do composer, o painel conversacional e a continuidade
visual do morph.

## Hierarquia de z-index

Tratar como hierarquia absoluta.

| Z-index | Sistema |
| --- | --- |
| `z-0` | Pattern/doodle interno do composer |
| `z-[1]` | Estado selecionado de `ContextSelectable` |
| `z-10` | Internos de story, sticky header de drawer, controles secundarios |
| `z-20` | Chevrons desktop de story |
| `z-[29]` | Mascara gradiente do composer |
| `z-30` | Composer default |
| `z-40` | Cart bar do restaurant |
| `z-50` | Headers, feed drawers, action drawers, demo link |
| `z-[60]` | Composer quando feed drawer esta aberto |
| `z-[65]` | `PostToChatMorphLayer` |
| `z-[70]` | Composer em modo `overlay` |
| `z-[100]` | Story viewer fullscreen e toast |

Nao inserir novas camadas sem mapear a relacao com composer, morph, drawers e
story viewer.

## Timings calibrados

| Sistema | Valor | Observacao |
| --- | --- | --- |
| Long-press | `420ms` | Evita ativacao acidental durante scroll |
| Morph post -> chip | `480ms` | Sincronizado com chip oculto/visivel |
| TTL do morph source | `1800ms` | Sobrevive a re-render/unmount curto |
| Story auto-advance | `5000ms` | Cadencia editorial |
| Story tick | `50ms` | Progress bar |
| Story -> drawer delay | `500ms` | Depois do scroll visual |
| Drawer scroll-to-post | `100ms` | Apos montagem do drawer |
| AI reply simulation | `700ms` | Typing indicator minimo |
| Sheet transition | `300ms ease-out` | Desligada durante drag |
| Action/feed drawer slide | `300ms ease-out` | Consistencia de entrada |

## Sistema de medicao

O composer depende de medicao real do DOM:

- `visualViewport` quando disponivel;
- fallback para `window.innerHeight`;
- `ResizeObserver`;
- refs de shell, top area, context rail, form, mensagens e auto-grow;
- `useLayoutEffect` para medir antes da transicao visual.

Nao substituir medicao por constantes globais ou compensacoes matematicas frageis.

## Sistema de scroll

Contratos:

- drawers travam `document.body.style.overflow` independentemente;
- scroll do drawer e scroll da pagina nao devem competir;
- morph cancela em scroll/resize para evitar coordenadas obsoletas;
- story navigation depende de `data-section` e `scrollIntoView`;
- o chat faz auto-scroll ao receber novas mensagens.

Nao centralizar scroll lock sem revisar todos os drawers.

## Sistemas congelados

Nao tocar sem justificativa tecnica documentada:

- `post-to-chat-morph-layer.tsx`;
- singleton `rememberedMorphSource`;
- `LONG_PRESS_MS`;
- TTL de morph source;
- snap/drag do sheet;
- ratios de altura do sheet;
- hierarquia de z-index;
- `composerMode` e seus valores literais;
- protocolo `data-*`;
- padroes de scroll lock dos drawers;
- `COMPOSER_SURFACE_COLOR`;
- offsets calibrados como `bottom-[88px]` e paddings de protecao do composer.

## Ultimo estado bom conhecido

Historico recente relevante:

- `cc97ead Recover last good feed visual state (#33)`;
- `324c225 revert: restaurar demo page e business landing ao estado anterior (feed-native-top) (#31)`;
- `c5d51da Fix composer resume auto-grow measurement (#30)`;
- `7dd3d8f feat: expand composer when AI reply arrives while collapsed (#29)`;
- `978909b docs: Contrato de Continuidade Tecnica - Composer/Landing Flow (#28)`.

O baseline operacional atual e `main` em `324c225`, com `cc97ead` como referencia
nominal do ultimo bom estado visual recuperado.

## Regra de ouro

Se houver conflito entre uma solucao rapida e a preservacao da coerencia sistemica,
preservar a coerencia sistemica.
