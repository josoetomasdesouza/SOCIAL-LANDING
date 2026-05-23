# EVOLUTION RULES — Social Landing

**Data:** 23/05/2026  
**Fases:** 9 (AI & Evolution Safety) + protocolos de evolução

---

## Filosofia

Evolução deve ser **gradual, reversível e governada**. O produto é um sistema operacional adaptativo de marcas — não um sandbox de experimentos destrutivos.

---

## O que IA poderá evoluir (futuro)

| Domínio | Autonomia | Condição |
|---------|-----------|----------|
| Copy de posts/blocos | Alta (com review) | Dentro do tom Brand DNA |
| Ordenação de feed | Média | A/B via feature flag |
| Sugestões de resposta IA | Alta | Mock → LLM com guardrails |
| Keywords de busca conversacional | Alta | Sem alterar layout |
| Metadados SEO | Média | Não afeta runtime UI Tier 1 |
| Blocos novos no editor | Baixa | Passa block-registry validation |
| Capabilities por vertical | Baixa | Declarativas, human approved |
| Crawl/extract-brand heuristics | Média | Server-side only |

---

## O que NUNCA poderá evoluir sozinha

| Domínio | Razão |
|---------|-------|
| Morph timings e easing | Assinatura perceptiva |
| Z-index hierarchy | Segurança de layering |
| composerMode API literals | Contrato congelado |
| data-* protocol | Comunicação inter-componentes |
| COMPOSER_SURFACE_COLOR | Identidade visual base |
| Long-press threshold 420ms | Gestual calibrado |
| Scroll lock behavior | Integridade navegação |
| Brand logo/colors primários | Brand DNA core |
| Publication snapshot publicado | Imutabilidade |
| RLS policies | Segurança |
| Permission matrix | Authz |

---

## Áreas que exigem aprovação humana

1. **Publish to production** — qualquer alteração em landing live
2. **Brand identity** — logo, palette primária, tipografia
3. **Frozen systems** — qualquer Tier 1 change
4. **New vertical capability** — block-registry flags
5. **Integration credentials** — OAuth, API keys
6. **Pricing/checkout flows** — implicações legais
7. **Data retention** — chat history, analytics
8. **Rollback de versão publicada**

---

## Áreas que aceitam testes automáticos

1. **landing-schema Zod validation** — fixtures valid/invalid
2. **Publish sandbox** — in-memory regression
3. **RLS smoke SQL** — scripts existentes
4. **Auth health** — auth-health-check.mjs
5. **Media API E2E** — quando ENABLE_* true
6. **Typecheck** — quando ignoreBuildErrors removido
7. **Block-registry consistency** — capabilities vs vertical reality

---

## Rule Engine (recomendação)

### Localização proposta

```
lib/rule-engine/
├── rules/           # Declarative JSON/TS rules
├── evaluator.ts     # Pure functions, no side effects
├── brand-dna.ts     # Immutable brand constraints
└── index.ts
```

### Tipos de regras

| Tipo | Exemplo |
|------|---------|
| **Hard block** | IA não pode alterar z-index tokens |
| **Soft warn** | Copy excede tom formal da marca |
| **Require approval** | Novo block type na landing publicada |
| **Auto-allow** | Reorder posts within same section |

### Integração

```
AI Proposal → Rule Engine → [block | warn | queue approval] → Evolution Pipeline
```

---

## Evolution Pipeline (recomendação)

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Proposal │ → │ Sandbox  │ → │ Validate │ → │ Review   │ → │ Publish  │
│ (L4)     │   │ preview  │   │ schema+  │   │ human/   │   │ promote  │
│          │   │          │   │ rules    │   │ auto     │   │ to L1    │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                    ↓ fail
                              ┌──────────┐
                              │ Rollback │
                              └──────────┘
```

**Já existe:** `publish-sandbox/` como proto do estágio Validate.  
**Falta:** UI preview, approval queue, promote to DB.

---

## Safety Layer

| Camada | Função |
|--------|--------|
| **Input guard** | Sanitize prompts, block PII leakage |
| **Output guard** | Schema validate before apply |
| **Action guard** | Whitelist mutating operations |
| **Rate guard** | Limit auto-evolutions per brand/day |
| **Audit** | audit-logs table (schema exists) |

---

## Brand DNA Protection

| Asset | Storage | Mutability |
|-------|---------|------------|
| Primary colors | Brand entity | Human only |
| Logo URL | Brand + MediaAsset | Human + publish |
| Tone/voice guidelines | Brand metadata (future) | Human + IA suggest |
| Social links | BrandSocialLinks | Human + crawl suggest |
| Composer surface color | **Frozen global** | Never IA |

Implementar `BrandDNA` read-only view consumido por IA e Rule Engine.

---

## Rollback System

| Nível | Mecanismo | Status |
|-------|-----------|--------|
| UI draft | Local state discard | ✅ Existe |
| Editor | Query slug reload | ✅ Parcial |
| Publication | `publication-versions` table | Schema ✅, UI ❌ |
| Sandbox | `publish-service-sandbox` rollback | ✅ In-memory |
| DB migration | Drizzle down manual | ⚠️ Process only |

**Regra:** toda publish gera version id imutável. Rollback = apontar live pointer.

---

## Feature Flags

### Ativos (env)

| Flag | Uso |
|------|-----|
| `ENABLE_DB` | Drizzle client |
| `ENABLE_AUTH` | Supabase auth adapter |
| `ENABLE_MEDIA_API` | Media routes |

### Documentados (unwired)

| Flag | Uso futuro |
|------|------------|
| `LANDING_PUBLISH_STRICT_DEFAULT` | Strict publish policy |
| `LANDING_SUPPORTED_LAYOUT_VERSIONS` | Layout version gate |

### Recomendados (novos)

| Flag | Uso |
|------|-----|
| `ENABLE_REAL_AI` | LLM vs mock resolver |
| `ENABLE_AUTO_EVOLUTION` | IA pode propor mudanças |
| `ENABLE_INTEGRATION_{PROVIDER}` | Por integração |
| `ENABLE_GOAL_ENGINE` | Goal tracking runtime |
| `ENABLE_EXPERIENCE_ENGINE` | Adaptive UX experiments |

**Princípio:** flags default **false**. Per-brand override no DB futuro.

---

## Protocolo de mudança (resumo)

Derivado de `docs/ai-handoffs/CHANGE_PROTOCOL.md` e `EVOLUTION_PROTOCOL.md`:

### Classificação de risco

| Classe | Exemplos | Requisito |
|--------|----------|-----------|
| **Verde** | Copy, docs | Escopo claro |
| **Amarelo** | Vertical feed logic | Test vertical completo |
| **Vermelho** | Tier 1, z-index, morph | Plano escrito + QA ampliado |

### Antes de alterar

1. Ler SYSTEM_ARCHITECTURE + FROZEN_SYSTEMS
2. Grep consumers
3. Classificar risco
4. Diff mínimo

### Depois de alterar

1. Checklist experiencial (EXPERIENCE_PRINCIPLES)
2. Registrar EVOLUTION_LOG se sensível
3. Screenshot mobile se visual

---

## Regras de evolução por sistema

| Sistema | Regra |
|---------|-------|
| Feed | Não adicionar navegação dashboard |
| Composer | Measurement fixes only in measurement layer |
| Drawers | Não unificar sem matriz |
| Schema | Backward compatible migrations |
| Mock → DB | Adapter layer obrigatório |
| IA | Never write Tier 1 directly |
| Integrations | Adapter + webhook idempotency |

---

## Conclusão

A Social Landing tem **sandbox de publish** e **permissions declarativas** como sementes corretas. Falta **Rule Engine runtime**, **approval pipeline** e **feature flags granulares** antes de liberar IA autônoma. Até lá: **mock IA + human publish**.
