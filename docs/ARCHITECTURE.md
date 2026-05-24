# ARCHITECTURE — Social Landing

**Atualizado:** 23/05/2026 — Fase evolutiva (fundação estrutural)

---

## Visão

Social Landing opera em **duas camadas**:

| Camada | Papel | Mutabilidade |
|--------|-------|--------------|
| **Tier 1 perceptivo** | Feed, morph, composer, drawers | Congelado — ver `FROZEN_SYSTEMS.md` |
| **Fundação evolutiva** | Events, surfaces, DNA, rules, integrations | Evolui ao redor do Tier 1 |

---

## Módulos da fundação (nova fase)

```
lib/
├── events/           # Event bus passivo + observabilidade DEV
├── surfaces/         # Surface reducer/machine (organização, não runtime Tier 1)
├── brand-dna/        # Identidade declarativa da marca
├── rules/            # Rule engine evaluate-only
├── integrations/     # Ports + adapters stub + mocks
├── landing-schema/   # Contrato de dados (isolado da UI)
└── db/               # Persistência gated (ENABLE_*)
```

---

## Princípios arquiteturais

1. **Tier 1 não é refatorado** — fundação observa, não comanda
2. **Event bus passivo** — zero automação, zero side effects além de log/buffer
3. **Surface reducer** — espelho organizacional; `SURFACE_MACHINE_APPLY_TO_TIER1 = false`
4. **Brand DNA** — read-only em runtime público; campos protegidos
5. **Rule engine** — avalia propostas; nunca aplica mudanças
6. **Integrations** — ports isolados; adapters reais fail-closed

---

## Fluxo de observabilidade

```
Tier 2/3 instrumentation (drawers, context, demo, CTA)
        ↓ observe* helpers
lib/events/event-bus.ts (passive emit)
        ↓
├── event-replay.ts (ring buffer)
├── event-listeners.ts (DEV console)
└── event-debugger.ts → EventDebugPanel (/demo, DEV only)
```

**Eventos Tier 1 pendentes de wiring** (tipos definidos, sem tocar morph/composer):
- `morph.started` / `morph.completed`
- `ai.surface.opened`
- `feed.item.viewed`

Ver `docs/audit/EVENT_CONTRACTS.md`.

---

## Superfícies do produto

| Rota | Stack | Event debug |
|------|-------|-------------|
| `/demo` | Business + PassiveEventProvider | ✅ DEV panel |
| `/` | SocialLanding legacy | — |
| `/criar` | Builder isolado | — |
| `/[slug]` | Profile estático | — |

---

## Documentação relacionada

| Documento | Conteúdo |
|-----------|----------|
| **`docs/os/README.md`** | **Sistema Operacional de Produto (constituição — ler primeiro)** |
| `docs/audit/ARCHITECTURE_REPORT.md` | Auditoria completa |
| `docs/audit/FROZEN_SYSTEMS.md` | Sistemas congelados |
| `docs/audit/EVENT_MAP.md` | Mapa de eventos |
| `docs/audit/EVENT_CONTRACTS.md` | Contratos tipados |
| `docs/audit/EXPERIENCE_PRINCIPLES.md` | Princípios UX |
| `docs/audit/BRAND_DNA_SPEC.md` | Brand DNA |
| `docs/audit/RULE_ENGINE_SPEC.md` | Rule Engine |
| `docs/audit/INTEGRATION_PORTS.md` | Integration ports |
| `docs/ai-handoffs/SYSTEM_ARCHITECTURE.md` | Memória operacional Tier 1 |

---

## Próximas fases (não implementadas)

- Wiring Tier 1 observational hooks (morph, AI surface) via protocolo frozen
- Surface reducer → composerMode (gradual, feature-flagged)
- Schema bridge UI ↔ landing-schema
- Goal Engine sobre event bus
