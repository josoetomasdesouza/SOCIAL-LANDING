# WS-19B — Conversational Coverage (v1.3)

**Workstream:** WS-19A Fase 3 / PR4 + v1.1 corpus hardening  
**Objetivo:** Corpus calibrado e adversarial **antes** da fase LLM — observabilidade apenas (sem mudar kernel).  
**Corpus:** `docs/audit/ws19b-conversational-coverage.json` (v1.3.0)  
**Reality harvest:** `docs/audit/ws19b-reality-harvest.json` · backlog `docs/audit/WS-19B_REALITY_BACKLOG.md`  
**Builder:** `node scripts/convergence/ws19b-build-v11-corpus.mjs`  
**Runner:** `pnpm qa:kernel-stub` (Phase 1 + relatório WS-19B)

---

## Distribuição alvo (v1.1)

| Métrica | Mínimo | Gate |
|---------|--------|------|
| Total cenários | **60+** | `corpusMin` |
| `calibration: human` | **40+** | `humanCalibratedMin` |
| Adversarial | 10+ (16 com extensões) | reportado |
| Negative controls | 3 | `escape_expected: true` |
| `calibration: probe` | canário classificador | fora do wrong-lane gate crítico |

Expectativas **human** vêm de `MANUAL_EXPECT_BY_REF` / `MANUAL_EXPECT_BY_ID` no builder — **não** de `classifyTurn()` no build.

---

## Métricas

| Métrica | Gate |
|---------|------|
| **Escape Rate** | **< 5%** no escopo: `escape_expected=false`, não-NC, **não-adversarial** |
| **Wrong Lane Rate** | **0** critical wrong lane: human + critical + não-adversarial + sem `known_product_gap` |

Adversarial: wrong_lane / escape **reportados**, não falham CI.

---

## Adversarial (10 núcleo B-41…B-50 + extensões)

| Tag | IDs |
|-----|-----|
| `transactional_indevido` | B-41, B-50 |
| `broad_indevido` | B-42, B-59 |
| `ambiguity` | B-44–B-46, B-54–B-57 |
| `chip_trap` | B-43, B-58 |
| `topic_drift` | B-47–B-49 |

---

## Negative controls

| ID | `expected_escape_reason` |
|----|--------------------------|
| NC-01 | `empty_or_null` |
| NC-02 | `augusta_generic` (fixture) |
| NC-03 | `broad_clarify_unexpected` (fixture) |

---

## IDs novos (v1.1)

- **Removidos:** B-13, B-40 (duplicata Dom Corleone / tendências)
- **Adversarial:** B-41…B-50
- **Follow-up vídeo:** B-51 (E-G46 carecas)
- **Expansão:** B-52 (E-M-APT-17), B-53 (E-M-APT-18), B-54…B-59 (ambiguidade / chip trap / broad), B-60 (E-M-APT-16 cacheado)

---

## v1.2 — Reality Harvest

| Origem | Campo corpus | Fonte |
|--------|--------------|-------|
| Smoke humano | `origin: "reality"` + `realityRef: "RH-###"` | `ws19b-reality-harvest.json` |
| Matrix / adversarial / probe | `origin: "synthetic"` | builder v1.1 |

Promoção: **Reality Backlog → Eval → Corpus → `pnpm qa:kernel-stub`**

## v1.3 — Reality Acceleration

### Reality metrics (corpus)

| Campo | Significado |
|-------|-------------|
| `reality_count` | Cenários com `origin: "reality"` |
| `synthetic_count` | Cenários `origin: "synthetic"` |
| `reality_percentage` | `reality_count / total × 100` |

### Promotion dashboard (harvest)

| Métrica | Significado |
|---------|-------------|
| **RH backlog** | `status: backlog` — bug registrado, sem fix |
| **RH fixed** | `status: fixed` — corrigido, ainda não promovido |
| **RH promoted** | `status: promoted` — eval + corpus ligados |
| **RH pending** | backlog + fixed (aguardando promoção completa) |

### Reality gate (advisory)

Se `reality_count < 10` (`gate.realityTargetMin`), o runner emite **WARN** — **não falha** o build.

Meta: aumentar participação real sem reduzir cobertura synthetic.

---

## Reality Review — Top Reality Scenarios

Cenários promovidos do harvest (fonte: `ws19b-reality-harvest.json`, status `promoted`):

| RH id | Eval associado | Corpus associado |
|-------|----------------|------------------|
| RH-001 | E-G46 | B-51 |
| RH-002 | E-G47 | B-61 |
| RH-003 | E-G48 | B-62 |
| RH-004 | E-G49 | B-63 |
| RH-005 | E-G50 | B-64 |
| RH-006 | E-G51 | B-65 |
| RH-007 | E-G52 | B-66 |
| RH-008 | E-G53 | B-67 |
| RH-009 | E-G54 | B-68 |
| RH-010 | E-G55 | B-69 |

---

## Relatório (`pnpm qa:kernel-stub`)

```txt
Total scenarios
Human calibrated · Probe calibrated
Reality: <count> / <target> · remaining: <n>
reality_count · synthetic_count · reality_percentage
Reality promotion dashboard (RH backlog / promoted / fixed / pending)
Top Reality Scenarios (promoted)
Reality gate (advisory) — se reality_count < 10
Adversarial · Negative controls
Escape rate · Wrong lane rate (full + gate scope)
```

Validar links harvest:

```bash
pnpm qa:reality-harvest
```

---

## Fora de escopo

- OpenAI / LLM bounded  
- Mudanças em kernel, ownership, `conversation-priority`, copy, `conversational-ai.tsx`

---

## Próximo

Revisão humana do Top 40+ (gate técnico ≠ certificação conversacional) → então Fase 4 LLM.
