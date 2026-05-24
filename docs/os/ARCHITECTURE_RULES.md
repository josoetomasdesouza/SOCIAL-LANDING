# Regras Arquiteturais — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md), [`docs/ai-handoffs/SYSTEM_ARCHITECTURE.md`](../ai-handoffs/SYSTEM_ARCHITECTURE.md)

---

## Duas camadas

| Camada | Papel | Mutabilidade |
|--------|-------|--------------|
| **Tier 1 perceptivo** | Feed, morph, composer, drawers | Congelado |
| **Fundação evolutiva** | Events, surfaces, DNA, rules, integrations | Evolui ao redor do Tier 1 |

---

## Princípios invioláveis

1. **Tier 1 não é refatorado** — fundação observa, não comanda
2. **Event bus passivo** — zero automação, zero side effects além de log/buffer
3. **Surface reducer** — espelho organizacional; `SURFACE_MACHINE_APPLY_TO_TIER1 = false`
4. **Brand DNA** — read-only em runtime público
5. **Rule engine** — avalia propostas; nunca aplica mudanças
6. **Integrations** — ports isolados; adapters reais fail-closed
7. **Tier 1 nunca importa provider SDK**

---

## Módulos da fundação

```
lib/
├── events/           # Bus passivo + observabilidade DEV
├── surfaces/         # Reducer/machine (organização, não runtime Tier 1)
├── brand-dna/        # Identidade declarativa
├── rules/            # Evaluate-only
├── integrations/     # Ports + adapters
├── landing-schema/   # Contrato de dados (isolado da UI)
└── db/               # Persistência gated (ENABLE_*)
```

---

## Superfícies do produto

| Rota | Stack | Notas |
|------|-------|-------|
| `/demo` | Business + PassiveEventProvider | Event debug DEV |
| `/` | SocialLanding legacy | Sem IA |
| `/criar` | Builder isolado | Não misturar |
| `/[slug]` | Profile estático | Fora do fluxo |

---

## Antes de alterar arquitetura

1. Ler `docs/ai-handoffs/SYSTEM_ARCHITECTURE.md`
2. Classificar impacto: Tier 1 vs fundação
3. Se Tier 1 → protocolo frozen obrigatório
4. Documentar decisão em `EVOLUTION_LOG.md`
