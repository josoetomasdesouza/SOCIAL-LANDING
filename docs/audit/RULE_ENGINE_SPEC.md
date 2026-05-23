# RULE ENGINE SPEC — Social Landing

**Implementação:** `lib/rules/`  
**Fase:** Evaluate-only foundation

---

## Objetivo

Avaliar propostas (Brand DNA changes, AI actions) **sem aplicar mutações** — preparação para evolução supervisionada.

---

## Componentes

| Arquivo | Papel |
|---------|-------|
| `rule-types.ts` | RuleDefinition, RuleContext, RuleViolation |
| `rule-registry.ts` | Regras declarativas registradas |
| `rule-evaluator.ts` | Pure evaluator |
| `rule-engine.ts` | Facade `ruleEngine.evaluate()` |

---

## Severidades

| Severity | Significado |
|----------|-------------|
| `info` | Informativo |
| `warn` | Alerta — não bloqueia |
| `block` | Proposta rejeitada |

---

## Scopes

`brand.dna` | `publication` | `ai.proposal` | `integration` | `surface` | `global`

---

## Regras registradas (v1)

| ID | Scope | Severity | Descrição |
|----|-------|----------|-----------|
| `brand.dna.protect-composer-surface` | brand.dna | block | composerSurface imutável |
| `brand.dna.protect-core-fields` | brand.dna | block | BRAND_DNA_PROTECTED_FIELDS |
| `brand.behavior.no-aggressive-promo` | brand.dna | warn | Promo agressiva vs EP-6 |
| `ai.block-tier1-mutation` | ai.proposal | block | morph, z-index, timings |
| `ai.block-auto-publish` | ai.proposal | block | Publish exige humano |

---

## Uso

```typescript
import { evaluateAiProposal, evaluateBrandDnaProposal } from "@/lib/rules"

const result = evaluateAiProposal(
  { action: "publish.apply", target: "landing" },
  brandId
)

if (!result.allowed) {
  // log violations — never apply
}
```

---

## Garantias

- **Pure functions** — sem I/O, sem side effects
- **Não conectado ao runtime UI** nesta fase
- **Não substitui** permissions matrix (`landing-schema/permissions.ts`)

---

## Evolução futura

- Regras por vertical (block-registry capabilities)
- Approval queue L4 → L1
- Integration com Event Engine (`ai.proposal.submitted`)
