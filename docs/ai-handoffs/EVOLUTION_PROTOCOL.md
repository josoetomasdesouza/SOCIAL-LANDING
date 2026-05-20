# Protocolo de Evolucao da Memoria Operacional

## Objetivo

Este protocolo define como a memoria operacional do projeto deve evoluir. A meta
e garantir que decisoes, riscos, contratos e relacoes invisiveis sobrevivam a
cada chat, branch e PR.

Documentos de memoria:

- `SYSTEM_ARCHITECTURE.md`
- `VISUAL_LANGUAGE.md`
- `CHANGE_PROTOCOL.md`
- `EVOLUTION_PROTOCOL.md`
- `EVOLUTION_LOG.md`
- `composer-continuity-contract.md`

## Principio

Codigo muda rapido; memoria operacional deve preservar o por que.

Cada agente deve registrar nao apenas o que mudou, mas:

- por que mudou;
- quais contratos foram preservados;
- quais riscos foram evitados;
- quais acoplamentos foram descobertos;
- quais novas regras derivam da mudanca.

## Quando atualizar a memoria

Atualizar os handoffs quando houver:

- mudanca em arquitetura;
- mudanca em linguagem visual;
- mudanca em feed, stories, composer, drawers ou morph;
- descoberta de relacao invisivel;
- regressao corrigida;
- decisao de preservar comportamento existente;
- nova area congelada;
- nova regra anti-regressao;
- novo risco de mobile/desktop;
- alteracao em protocolo de mudanca.

Mesmo uma mudanca pequena pode exigir registro se ela proteger um contrato
perceptivo importante.

## Quando nao atualizar

Nao e necessario atualizar memoria para:

- typo sem impacto;
- comentario local sem decisao nova;
- mudanca experimental revertida antes de PR;
- alteracao de dependencia sem efeito no fluxo social/business;
- documentacao temporaria fora dos handoffs.

Se houver duvida, registrar no `EVOLUTION_LOG.md` com entrada curta.

## Responsabilidade de cada documento

### `SYSTEM_ARCHITECTURE.md`

Registrar:

- superficies e rotas;
- componentes centrais;
- sistemas criticos;
- contratos tecnicos;
- z-index, timings e medicao;
- areas congeladas;
- ultimo estado bom conhecido.

Atualizar quando:

- rota ou superficie mudar;
- componente central for criado/removido;
- contrato tecnico mudar;
- novo acoplamento estrutural for descoberto.

### `VISUAL_LANGUAGE.md`

Registrar:

- filosofia visual;
- contratos perceptivos;
- regras de feed/stories/composer;
- uso de blur, sombra, spacing, divisorias e surfaces;
- memoria visual recente.

Atualizar quando:

- ritmo visual mudar;
- stories/topo/feed forem ajustados;
- composer mudar visualmente;
- nova regra anti-dashboard/ecommerce/institucional surgir.

### `CHANGE_PROTOCOL.md`

Registrar:

- classificacao de risco;
- checklists de pre e pos alteracao;
- proibicoes;
- validacoes obrigatorias;
- regras por tipo de arquivo.

Atualizar quando:

- uma regressao revelar falha no processo;
- novo tipo de risco aparecer;
- uma area precisar virar congelada;
- um fluxo de validacao se mostrar insuficiente.

### `EVOLUTION_PROTOCOL.md`

Registrar:

- como evoluir os documentos;
- quando registrar decisoes;
- formato de log;
- criterios de consolidacao.

Atualizar quando:

- o processo de memoria precisar mudar;
- a equipe/agentes adotarem nova disciplina de handoff;
- surgirem documentos novos.

### `EVOLUTION_LOG.md`

Registrar cronologicamente:

- decisoes relevantes;
- alteracoes arquiteturais;
- ajustes perceptivos importantes;
- regressos evitados;
- relacoes invisiveis descobertas;
- referencias a commits/PRs quando conhecidas.

Este e o primeiro lugar a atualizar apos uma mudanca sensivel.

### `composer-continuity-contract.md`

Contrato tecnico detalhado do composer/landing flow. Deve ser preservado como
referencia historica e tecnica, especialmente para:

- morph;
- composer sheet;
- drag;
- measurement;
- data attributes;
- scroll lock;
- z-index.

Atualizar somente quando o contrato tecnico mudar de fato.

## Formato recomendado de entrada no log

Cada entrada do `EVOLUTION_LOG.md` deve seguir:

```md
## AAAA-MM-DD - Titulo curto

### Contexto

O que motivou a decisao.

### Mudanca

O que mudou.

### Impacto visual

Como afeta percepcao, ritmo, continuidade ou superficies.

### Impacto estrutural

Como afeta arquitetura, acoplamentos, contratos ou arquivos criticos.

### Regresses evitadas

Quais falhas essa decisao previne.

### Novas regras derivadas

Regras que agentes futuros devem seguir.

### Arquivos relacionados

- `arquivo`
```

## Como registrar relacoes invisiveis

Quando descobrir que dois sistemas dependem um do outro de forma nao obvia,
registrar:

- sistema A;
- sistema B;
- mecanismo de acoplamento;
- sintoma se quebrar;
- como validar;
- se deve virar area congelada.

Exemplo:

```md
Feed drawer padding (`pb-36`) protege o ultimo post contra o composer fixo.
Remover parece simplificacao visual, mas causa conteudo escondido no mobile.
```

## Como derivar novas regras

Uma regra nova deve nascer de pelo menos um destes casos:

- regressao real;
- risco tecnico confirmado;
- decisao perceptiva recorrente;
- acoplamento invisivel descoberto;
- area congelada alterada com dificuldade;
- validacao manual obrigatoria identificada.

Evitar criar regras abstratas demais. Toda regra deve apontar para um sistema,
contrato ou risco concreto.

## Consolidacao de memoria

Quando `EVOLUTION_LOG.md` acumular varias entradas sobre o mesmo tema:

1. manter o historico no log;
2. consolidar a regra estavel no documento mestre adequado;
3. referenciar a decisao original;
4. nao apagar contexto historico util.

Exemplos:

- varias entradas sobre composer -> consolidar em `SYSTEM_ARCHITECTURE.md`;
- varias entradas sobre blur/surface -> consolidar em `VISUAL_LANGUAGE.md`;
- varias entradas sobre validacao -> consolidar em `CHANGE_PROTOCOL.md`.

## Protecao contra drift documental

Ao atualizar memoria:

- nao criar contradicao com `composer-continuity-contract.md`;
- nao remover areas congeladas sem explicacao;
- nao trocar regra especifica por regra generica;
- nao registrar decisao especulativa como fato;
- distinguir estado atual, decisao e hipotese.

## Ordem de leitura para agentes futuros

1. `SYSTEM_ARCHITECTURE.md`
2. `VISUAL_LANGUAGE.md`
3. `CHANGE_PROTOCOL.md`
4. `EVOLUTION_PROTOCOL.md`
5. `EVOLUTION_LOG.md`
6. `composer-continuity-contract.md`

Para tarefas no composer ou morph, ler tambem o contrato tecnico completo antes
de qualquer plano.

## Regra final

A memoria operacional e parte do sistema. Se ela ficar desatualizada, agentes
futuros vao quebrar contratos invisiveis sem perceber.
