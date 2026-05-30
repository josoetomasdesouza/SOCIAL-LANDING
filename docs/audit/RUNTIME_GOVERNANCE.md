# Runtime Governance — Social Landing

**Data:** 2026-05-23  
**Baseline publicada:** `main` @ `e002921`  
**Natureza:** regras operacionais para evolução futura — **não implementação**

> Complementa: `EVOLUTION_RULES.md`, `STATE_GOVERNANCE.md`, `FROZEN_SYSTEMS.md`, `GLOBAL_CONTRACTS.md`

---

## Propósito

Definir **quando** uma mudança é permitida, **como** classificá-la, e **o que** exige evidência antes de tocar o runtime. O projeto opera como **sistema multi-layer observável** — não como aplicação React monolítica.

---

## Princípios rector

1. **Observar antes de concluir** — divergência ≠ bug automático
2. **Preservar comportamento emergente legítimo** — transient states, shadow states, ownership concorrente
3. **Isolar timelines arquiteturais** — nunca misturar trilhas incompatíveis num PR
4. **Contratos antes de reducers** — extrair semântica antes de centralizar estado
5. **Tier 1 é perceptivo** — alteração perceptiva exige protocolo, não apenas typecheck

---

## Classificação de mudanças

Toda alteração proposta deve ser classificada **antes** de implementação:

| Classe | Descrição | Exemplos | Gate |
|--------|-----------|----------|------|
| **OBSERVATION_ONLY** | Documentação, shadow compare, REAL_USAGE, timeline | Audit docs, divergence logs | Nenhum |
| **SAFE_INSTRUMENTATION** | Wiring passivo `observe*` sem alterar UX | Event helpers (`lib/events/`) | Event validation checklist |
| **CONTRACT_CHANGE** | Altera comportamento observável documentado | composerMode policy, drawer close semantics | Contract doc + REAL_USAGE |
| **RUNTIME_MIGRATION** | Troca ownership/lifecycle de superfície | shadcn → ActionDrawer, scroll lock ref-count | DD-01 + migration strategy + rollback |
| **TIER1_RISK** | Toca morph, composer measurement, z-index, RAF | `post-to-chat-morph-layer.tsx`, `conversational-ai.tsx` | FROZEN_SYSTEMS protocol + perceptual QA |
| **FEATURE_WORK** | Nova capacidade de produto | ecommerce blocks, Goal Engine, IA adaptativa | Feature flag + trilha isolada |
| **BLOCKED_UNTIL_MAPPING** | Normalização, reducer apply, state unification | Shadow → runtime, global reducer | Runtime Truth Mapping GO |

---

## Regras de decisão

### Quando Tier 1 pode ser tocado

| Condição | Permitido? |
|----------|------------|
| Bug perceptivo **reproduzido** com evidência (vídeo/screenshot/timeline) | Sim — PR isolado, classificação TIER1_RISK |
| Shadow mismatch sem reprodução perceptiva | **Não** |
| Refactor “por limpeza” | **Não** |
| Instrumentação passiva (`observe*` only) | Sim — SAFE_INSTRUMENTATION |
| Strict Mode / cleanup edge com regressão comprovada | Sim — após tag `morph-stability-v1` baseline diff |

**Protocolo Tier 1:**

1. Ler `FROZEN_SYSTEMS.md` + `composer-continuity-contract.md`
2. Diff mínimo — grep consumers de `data-*`, z-index, timings
3. Perceptual QA mobile 375px + desktop
4. REAL_USAGE path afetado re-executado
5. EVOLUTION_LOG se sensível

### Quando divergência vira bug

| Sinal | Classificação |
|-------|---------------|
| Usuário não consegue completar fluxo (scroll preso, drawer irrecuperável) | **Bug** — P0/P1 |
| Shadow `composer_mode_mismatch` sem impacto perceptivo | **Observacional** — documentar |
| Evento ausente mas UX idêntica | **Observability gap** — P2 |
| Comportamento documentado como VERTICAL_SPECIFIC | **Não bug** — contrato local |
| Transient state <300ms durante transição | **Tolerância temporal** — investigar antes de corrigir |

### Quando transient state deve ser preservado

Preservar quando:

- Existe janela de animação (morph RAF ~480ms, drawer transition)
- `composerMode` muda em sequência drawer open → overlay → close → default
- Chips ocultos durante `morphActive` (CP-05)
- Strict Mode remount em DEV duplica eventos sem efeito perceptivo PROD
- Shadow snapshot captura estado intermediário entre dois eventos sync

**Não preservar** quando:

- Transient persiste >2s após interação completa
- `body.overflow` preso com zero drawers montados
- Context chips visíveis durante morph in-flight

### Quando shadow mismatch pode ser ignorado

| Divergência | Ignorar? | Condição |
|-------------|----------|----------|
| SD-02 close id `feed:video:none` | Sim (shadow normaliza) | Não aplicar shadow ao runtime |
| SD-01 pós-P0-03 | Revalidar | REAL_USAGE re-run |
| Orphan composer overlay sem drawer | Investigar | Pode ser race temporal |
| Stack B bridge vs ActionDrawer semantics | Sim | Até migração Fase 3 |

**Regra:** shadow informa decisão — **nunca** comanda runtime enquanto `SURFACE_SHADOW_APPLY_TO_RUNTIME = false`.

### Quando migração é permitida

| Pré-requisito | Status atual |
|---------------|--------------|
| DD-01 decidido | ✅ |
| Provider 12/12 | ✅ |
| Bridges instrumentados Stack B | ✅ (7 drawers) |
| REAL_USAGE re-run pós-P0-03 | ⏳ Pendente |
| Rollback plan por vertical | ⏳ Documentar por ciclo |
| 1 vertical por PR | Obrigatório |

**Ordem:** personal → influencer → institutional (ver `MIGRATION_STRATEGY.md`).

### Quando feature nova deve ser bloqueada

Bloquear merge se:

- PR mistura trilhas (ecommerce + convergence + Tier 1)
- Altera Tier 1 sem classificação TIER1_RISK
- Introduce reducer/orchestrator global
- Remove transient state sem timeline evidence
- Toca `lib/db/` ou schema no mesmo PR que runtime surface
- Não passa gate documentado da trilha

### Quando alteração exige Runtime Truth Mapping

| Alteração | Exige mapping? |
|-----------|----------------|
| Aplicar shadow predicted state ao runtime | **Sim — BLOCKED até GO** |
| Unificar composerMode em reducer único | **Sim** |
| Unificar drawer stacks | **Sim — parcialmente em curso** |
| Adicionar instrumentação passiva | Não |
| Corrigir bug scroll lock reproduzido | Não (patch isolado) |
| Goal Engine / adaptive UX | **Sim — BLOCKED** |

### Quando alteração exige rollback plan

Obrigatório para:

- RUNTIME_MIGRATION (revert drawer component)
- TIER1_RISK (revert para tag `morph-stability-v1`)
- CONTRACT_CHANGE em composerMode priority
- Qualquer merge que altere z-index hierarchy

**Rollback mínimo:** `git revert` do PR + REAL_USAGE smoke + screenshot diff.

---

## Matriz de autoridade

| Domínio | Autoridade runtime | Observadores | Shadow |
|---------|-------------------|--------------|--------|
| composerMode | ConversationSelectionContext | `composer.mode.changed` | `deriveComposerModeFromLayers` |
| Drawers | Component `isOpen` | `drawer.opened/closed` | layer registry |
| Morph | BSL `morphRequest` | `morph.started/completed` | read-only flag |
| Context | Provider state | `context.item.*` | — |
| Scroll lock | Drawer effects | — | — |
| Vertical | `/demo` selector | `feed.vertical.changed` | VERTICAL_SET |

**Regra:** observadores **nunca** escrevem autoridade. Shadow **nunca** escreve runtime.

---

## Gates obrigatórios por fase

| Fase | Gate documento |
|------|----------------|
| Qualquer PR runtime | `WORKSTREAM_ISOLATION_PLAN.md` |
| Instrumentação | `EVENT_VALIDATION.md` |
| Convergência Stack B | `MIGRATION_STRATEGY.md`, `STACK_DECISION.md` |
| Truth mapping | `REAL_USAGE_RE_RUN_PLAN.md` results + `NEXT_EVOLUTION_DECISION.md` |
| Contrato novo | `docs/audit/contracts/*.md` |
| Tier 1 | `FROZEN_SYSTEMS.md` |

---

## Anti-patterns proibidos

| Anti-pattern | Risco |
|--------------|-------|
| `git add .` em working tree contaminado | Destrói rastreabilidade |
| Corrigir shadow mismatch no Tier 1 sem classificação | Normalização destrutiva |
| Reducer global como “solução automática” | Mata emergência legítima |
| Instrumentar shadcn como stack permanente | Duas realidades eternas |
| Feature + convergence + db no mesmo PR | Timelines incompatíveis |
| Assumir state snapshot = UX truth | Ignora temporalidade |

---

## Checklist pré-merge (runtime)

```
[ ] Classificação atribuída (OBSERVATION_ONLY … BLOCKED)
[ ] Trilha correta (ver WORKSTREAM_ISOLATION_PLAN.md)
[ ] Tier 1 untouched OU protocolo TIER1_RISK completo
[ ] Nenhum arquivo proibido da trilha incluído
[ ] REAL_USAGE path afetado identificado
[ ] Rollback plan se RUNTIME_MIGRATION ou TIER1_RISK
[ ] EVOLUTION_LOG se CONTRACT_CHANGE ou TIER1_RISK
```

---

## Referências

- `docs/audit/WORKSTREAM_ISOLATION_PLAN.md`
- `docs/audit/NEXT_EVOLUTION_DECISION.md`
- `docs/convergence/STACK_DECISION.md`
- `docs/ai-handoffs/composer-continuity-contract.md`
- Tag: `foundation-observability-v1`, `morph-stability-v1`
