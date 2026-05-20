# Protocolo de Mudanca

## Objetivo

Este protocolo define como agentes devem analisar, classificar, implementar e
validar mudancas no projeto sem regredir os contratos arquiteturais e perceptivos.

Aplica-se especialmente a mudancas em:

- feed;
- stories;
- composer;
- drawers;
- morph;
- blur;
- overlays;
- divisorias;
- spacing;
- z-index;
- scroll;
- medicao;
- auto-grow;
- surfaces.

## Regra absoluta

Nao implementar antes de analisar:

1. estado atual do codigo;
2. contratos existentes nos handoffs;
3. sistemas envolvidos;
4. relacoes invisiveis;
5. ultimo estado bom conhecido;
6. riscos visuais e arquiteturais.

## Preparacao obrigatoria

Antes de qualquer alteracao:

1. ler os documentos em `docs/ai-handoffs/`;
2. rodar:

```bash
git status --short --branch
git branch --show-current
git log --oneline -5
```

3. confirmar branch de trabalho, nunca editar diretamente `main`;
4. identificar arquivos criticos e areas congeladas;
5. separar comportamento atual de comportamento desejado;
6. descrever o menor diff possivel.

## Classificacao de risco

### Zona Verde

Mudancas com baixo risco sistemico:

- texto em documentacao;
- copy isolada sem impacto visual estrutural;
- ajustes em arquivos fora do fluxo feed/stories/composer;
- correcao de comentario sem alterar runtime.

Mesmo na Zona Verde, validar escopo e evitar cleanup oportunista.

### Zona Amarela

Mudancas com risco moderado:

- copy visivel em cards ou secoes;
- pequenas alteracoes em spacing local;
- ajuste de conteudo em uma vertical;
- mudanca em drawer sem alterar scroll lock, z-index ou medicao;
- mudanca visual que nao toca composer, morph ou stories.

Exige:

- mapear mobile e desktop;
- revisar consumidores;
- validar se o ritmo do feed mudou.

### Zona Vermelha

Mudancas de alto risco:

- composer;
- morph;
- long-press;
- drag/snap do sheet;
- z-index;
- blur/opacity/shadow/radius/surface do composer;
- scroll lock;
- medicao/auto-grow;
- `composerMode`;
- atributos `data-*`;
- stories viewer ou story -> section navigation;
- paddings/offsets que protegem conteudo do composer;
- qualquer alteracao simultanea em feed + composer + drawer.

Exige analise completa, plano explicito e validacao ampliada.

## Sistemas congelados

Nao alterar sem justificativa critica documentada:

- `post-to-chat-morph-layer.tsx`;
- `rememberedMorphSource`;
- `LONG_PRESS_MS = 420`;
- morph duration `480ms`;
- morph source TTL `1800ms`;
- drag handlers do sheet;
- ratios do sheet;
- valores literais de `composerMode`;
- `COMPOSER_SURFACE_COLOR`;
- protocolo `data-*`;
- hierarquia de z-index;
- padrao de scroll lock dos drawers;
- offsets calibrados por vertical.

## Proibicoes de implementacao

Nao resolver problemas sistemicos com:

- timeouts artificiais;
- compensacoes matematicas frageis;
- patches locais sem mapear arquitetura;
- hacks perceptivos;
- alteracoes simultaneas de logica funcional e linguagem visual;
- refactors oportunistas;
- renomeacoes sem necessidade;
- unificacao de sistemas que parecem duplicados mas sao intencionais.

## Regra de separacao de responsabilidades

Uma alteracao deve ter uma responsabilidade principal.

Exemplos:

- mudar documentacao: apenas docs;
- corrigir medicao: nao alterar visual;
- ajustar visual: nao alterar logica funcional;
- mexer em uma vertical: nao unificar outras verticais;
- ajustar drawer: nao tocar morph ou composer se nao for necessario.

## Plano pre-implementacao

Antes de editar, documentar:

1. comportamento atual;
2. comportamento desejado;
3. diferenca entre eles;
4. classificacao de risco;
5. arquivos a tocar;
6. arquivos explicitamente preservados;
7. contratos afetados;
8. relacoes invisiveis;
9. menor diff possivel;
10. validacao prevista.

Se a tarefa veio com pedido explicito de aguardar aprovacao, parar aqui.

## Regras por tipo de arquivo

### `conversational-ai.tsx`

Antes de editar:

- ler o arquivo inteiro;
- mapear medicao, drag, auto-grow e z-index;
- confirmar que `data-conversation-*` permanecem;
- confirmar que `COMPOSER_SURFACE_COLOR` nao muda sem razao explicita;
- validar mobile real ou simulado com viewport estreita.

### `business-social-landing.tsx`

Antes de editar:

- mapear story navigation;
- mapear drawer orchestration;
- mapear z-index do composer;
- confirmar `data-section`;
- confirmar que morph source/destination continuam operando.

### `context-selectable.tsx`

Antes de editar:

- preservar `LONG_PRESS_MS`;
- preservar singleton de morph source;
- preservar `data-post-context-source`;
- nao trocar refs por estado React.

### `post-to-chat-morph-layer.tsx`

Antes de editar:

- tratar como congelado;
- mapear timing, RAF, cancelamento e reduced motion;
- validar chip invisivel/visivel;
- validar scroll/resize.

### Drawers

Antes de editar:

- preservar scroll lock;
- validar cleanup do `body.style.overflow`;
- validar z-index;
- validar padding inferior para composer;
- validar abertura e fechamento mobile/desktop.

### Verticais

Antes de editar:

- entender a logica propria de `composerMode`;
- nao unificar comportamentos;
- validar pelo menos a vertical tocada;
- se houver carrinho/checkout, validar `hidden` e offsets.

## Validacao obrigatoria

### Validacao de escopo

Confirmar:

- somente arquivos planejados foram alterados;
- nenhum arquivo congelado foi tocado por acidente;
- nenhum arquivo fora do escopo recebeu cleanup;
- nenhuma dependencia foi adicionada sem necessidade.

### Validacao tecnica

Quando aplicavel, rodar:

```bash
npm run typecheck
npm run lint
```

Se a mudanca for apenas documentacao, validar:

```bash
git diff --check
```

### Validacao perceptiva

Quando houver UI:

- comparar mobile e desktop;
- verificar feed continuo;
- verificar stories integrados;
- verificar composer nao-modal;
- verificar morph;
- verificar drawers e scroll lock;
- verificar z-index com story viewer, drawer e composer;
- verificar que blur/sombra/gradiente continuam sutis.

## Relatorio pos-mudanca

Ao final, reportar:

- arquivos alterados;
- resumo do diff;
- linhas adicionadas/removidas;
- o que nao foi tocado;
- contratos preservados;
- riscos restantes;
- como validar manualmente.

## Atualizacao de memoria

Se a mudanca alterar arquitetura, linguagem visual, protocolo ou regra de
evolucao, atualizar os documentos correspondentes em `docs/ai-handoffs/`.

Sempre atualizar `EVOLUTION_LOG.md` quando uma decisao relevante for tomada,
mesmo que o codigo alterado seja pequeno.

## Git e PR

Para agentes cloud:

- criar branch com prefixo `cursor/`;
- nao alterar `main` diretamente;
- commitar cada mudanca logica;
- enviar branch com `git push -u origin <branch>`;
- criar ou atualizar PR antes do resumo final quando houver alteracao.

## Criterio final

Se houver duvida entre velocidade e preservacao sistemica, preservar o sistema.
