# Next Evolution Decision — Social Landing

**Data:** 2026-05-23  
**Baseline publicada:** `main` @ `e002921`  
**Fase concluída:** Runtime Governance + Observation Planning  
**Código alterado nesta fase:** nenhum

---

## Resumo

A Social Landing completou estabilização runtime incremental e entrou em fase de **governança de evolução**. O runtime opera como sistema multi-layer observável. O maior risco atual é **contaminação de trilhas** no working tree — não regressão Tier 1.

---

## 1. Estamos prontos para Runtime Truth Mapping completo?

### Veredicto: **NO-GO** (com ressalvas)

| Critério | Status |
|----------|--------|
| Tier 1 estável | ✅ |
| Event bus + shadow compare-only | ✅ |
| Provider 12/12 | ✅ |
| P0-03 fechado | ✅ |
| REAL_USAGE re-run pós-avancos | ❌ Pendente |
| Stack B migração drawer | ❌ Bridges only |
| Contratos extraídos | 🟡 Skeleton only |
| Temporal mapping | ❌ Planned, not executed |
| Priority rules composerMode | ❌ Implícitas |
| Working tree isolado | ❌ Contaminado |

**GO parcial permitido:**

- Shadow compare-only accumulation ✅
- REAL_USAGE re-run execution ✅
- Temporal mapping sessions ✅
- Docs/contracts evolution ✅

**NO-GO para:**

- Aplicar shadow ao runtime
- Reducer migration
- State unification
- Truth mapping como "fonte única" enquanto dual stack drawer existir

---

## 2. O que precisa acontecer antes?

### Ordem obrigatória

```
A. Governança (este pacote)                    ✅ feito
B. Isolar working tree em trilhas               ⏳ executar git, não só docs
C. REAL_USAGE re-run (RU-R-01…20)               ⏳
D. Temporal mapping TC-01…06                    ⏳
E. Reclassificar SD-01 pós re-run               ⏳
F. Stack B Fase 3 — migração 1 vertical/ciclo   ⏳
G. Contratos preenchidos com evidência          ⏳
H. Gate review → GO Truth Mapping               ⏳
```

### Blockers duros

1. **Dual stack drawer** — bridges observam, não convergem ownership
2. **REAL_USAGE não reexecutado** desde P0-03 + bridges
3. **composerMode priority** implícita — precisa evidência temporal
4. **Working tree** — ecommerce, db, shadow local misturados

### Blockers moles (documentar, não bloquear observação)

- P1-01 appointment hero morph
- P2-07 media-kit UI gap
- P2-04 duplicate React keys
- ref-count scroll lock (latente)

---

## 3. Stack B deve migrar agora ou só depois do REAL_USAGE re-run?

### Recomendação: **depois do REAL_USAGE re-run**

| Opção | Prós | Contras |
|-------|------|---------|
| Migrar agora | Remove dual stack faster | Sem baseline pós-P0-03; confunde regressões |
| Re-run primeiro | Baseline claro; SD-01/bridges validados | Delay 2–3 dias |
| **Re-run → piloto personal migrate** | **Menor risco; ordem correta** | Requer disciplina trilha |

**Sequência recomendada:**

1. REAL_USAGE re-run on clean `e002921`
2. Document results
3. Migrar **personal** only (2 drawers, morph N/A) — primeiro ciclo Fase 3
4. Re-run REAL_USAGE RU-R-03 subset
5. influencer → institutional

**Não migrar** enquanto working tree contaminado — impossível atribuir divergências.

---

## 4. Shadow deve continuar compare-only?

### Recomendação: **SIM — indefinidamente até gate GO**

| Setting | Valor | Razão |
|---------|-------|-------|
| `SURFACE_SHADOW_APPLY_TO_RUNTIME` | `false` | Sem evidência suficiente de política |
| `SURFACE_MACHINE_APPLY_TO_TIER1` | `false` | Tier 1 frozen |
| DEV-only | `true` | Zero impacto PROD |
| Acumular timeline | 1–2 semanas | Distinguir inevitável vs tolerância |

Shadow cedo demais como controller = **normalização destrutiva** de comportamento emergente legítimo.

---

## 5. Quais trilhas devem ser bloqueadas temporariamente?

| Trilha | Status | Até quando |
|--------|--------|------------|
| **ecommerce-wip** | 🔴 Bloquear merge com runtime | PR isolado + review |
| **db-media** | 🟡 Bloquear merge com business runtime | Infra PR separado |
| **Tier 1 morph local WIP** | 🔴 Descartar ou PR TIER1_RISK isolado | Após perceptual QA |
| **Reducer / state unification** | 🔴 BLOCKED_UNTIL_MAPPING | Gate GO |
| **Goal Engine / adaptive AI** | 🔴 BLOCKED | Contratos + mapping |
| **stack-b-convergence Fase 3** | 🟡 Pausar até REAL_USAGE re-run | Results doc |
| **runtime-observability** | 🟢 Permitido | Com governance |
| **shadow-audit-docs** | 🟢 Permitido | Docs-only PR |
| **REAL_USAGE execution** | 🟢 Permitido | Observation only |

---

## 6. Quais documentos viram gate obrigatório?

### Gate document set (próximas fases)

| Documento | Gate para |
|-----------|-----------|
| `RUNTIME_GOVERNANCE.md` | Qualquer PR runtime |
| `WORKSTREAM_ISOLATION_PLAN.md` | Qualquer PR — escolher trilha |
| `REAL_USAGE_RE_RUN_PLAN.md` + **RESULTS** | Stack B migration Fase 3 |
| `RUNTIME_TEMPORAL_MAPPING_PLAN.md` + **MAP** | CONTRACT_CHANGE composer priority |
| `docs/audit/contracts/*.md` | RUNTIME_MIGRATION |
| `NEXT_EVOLUTION_DECISION.md` (revisão) | Truth Mapping GO |
| `SURFACE_DIVERGENCES.md` | Shadow policy decisions |
| `FROZEN_SYSTEMS.md` | TIER1_RISK |
| `MIGRATION_STRATEGY.md` | Stack B drawer migration |

---

## 7. Próximo passo técnico mais seguro

### Imediato (esta semana)

1. **Isolar working tree** — branches por trilha (`WORKSTREAM_ISOLATION_PLAN.md`)
2. **Commit docs-only PR** — este pacote governance + audit (sem runtime code)
3. **Executar REAL_USAGE re-run** on clean main — preencher RESULTS

### Curto prazo (próximas 2 semanas)

4. **Temporal mapping** TC-01–TC-04 sessions DEV
5. **Acumular shadow timeline** — não corrigir divergências
6. **Preencher contracts** com evidência dos passos 3–5

### Médio prazo (após gate parcial)

7. **Stack B migration** personal pilot
8. **Revisar NEXT_EVOLUTION_DECISION** → possível GO parcial Truth Mapping

---

## Matriz de decisão consolidada

| Decisão | Resposta |
|---------|----------|
| Truth Mapping completo | **NO-GO** |
| Shadow compare-only | **GO** |
| REAL_USAGE re-run | **GO** — próximo passo |
| Stack B migrate now | **NO-GO** — após re-run |
| Docs governance PR | **GO** |
| Ecommerce merge | **NO-GO** |
| ref-count scroll lock | **Defer** P2 — após drawer convergence plan |

---

## Riscos atuais (top 5)

1. **Contaminação working tree** — timelines incompatíveis num commit
2. **Dual stack drawer** — Truth Mapping enviesado
3. **Priority rules implícitas** — composerMode race não documentado
4. **Engenharia simplificadora** — reducer/unify como reflexo
5. **Bridge permanente** — instrumentar sem migrar vira segunda stack

---

## Próximo prompt sugerido

Colar no Cursor (chat **Runtime Observation**, branch clean `main`):

```txt
Executar REAL_USAGE re-run conforme docs/audit/REAL_USAGE_RE_RUN_PLAN.md.

Regras:
- Baseline main @ e002921, working tree limpo
- NÃO alterar código
- NÃO corrigir divergências encontradas
- Preencher docs/audit/REAL_USAGE_RE_RUN_RESULTS.md com resultados RU-R-01 a RU-R-20
- Classificar cada item: observar / documentar / investigar / bloquear
- Atualizar SURFACE_DIVERGENCES.md se SD-01 status mudou
- Revisar NEXT_EVOLUTION_DECISION.md com veredicto GO/NO-GO atualizado

Ferramentas: /demo DEV, Event Debug Panel, __SURFACE_SHADOW__, Playwright se disponível.
Viewports: 390×844 mobile, 1280×800 desktop.
```

---

## Artefatos produzidos nesta fase

| # | Arquivo |
|---|---------|
| 1 | `docs/audit/RUNTIME_GOVERNANCE.md` |
| 2 | `docs/audit/WORKSTREAM_ISOLATION_PLAN.md` |
| 3 | `docs/audit/REAL_USAGE_RE_RUN_PLAN.md` |
| 4 | `docs/audit/RUNTIME_TEMPORAL_MAPPING_PLAN.md` |
| 5 | `docs/audit/contracts/COMPOSER_CONTRACT.md` |
| 6 | `docs/audit/contracts/DRAWER_CONTRACT.md` |
| 7 | `docs/audit/contracts/MORPH_CONTRACT.md` |
| 8 | `docs/audit/contracts/SURFACE_CONTRACT.md` |
| 9 | `docs/audit/contracts/EVENT_ORDERING_CONTRACT.md` |
| 10 | `docs/audit/contracts/OWNERSHIP_CONTRACT.md` |
| 11 | `docs/audit/NEXT_EVOLUTION_DECISION.md` |

**Pendente pós-execução:** `REAL_USAGE_RE_RUN_RESULTS.md`, `RUNTIME_TEMPORAL_MAP.md`

---

## Referências cruzadas

- `BEHAVIOR_FIX_PRIORITY.md` — atualizar após re-run
- `STABILIZATION_REPORT.md` — baseline histórico
- `STACK_DECISION.md` — DD-01
- `WORKING_TREE_AUDIT.md` — contaminação
