# Surface Divergences — Shadow vs Runtime

**Modo:** Shadow compare-only · DEV `/demo`  
**Data base:** 2026-05-23  
**Revalidação:** 2026-05-24 — REAL_USAGE re-run CAPTURED

---

## Revalidação temporal pós-captura (SD-01 → SD-04)

| ID | Status pós re-run | Decisão |
|----|-------------------|---------|
| **SD-01** | **Runtime CLEARED** feed drawer — overlay emite (P0-03) | Shadow ainda mismatch por **ordem temporal** (composer ~37ms antes drawer) — **observacional**, não bug |
| **SD-02** | **CONFIRMED** | `drawer_registry_mismatch` em close — **observacional**; shadow normaliza |
| **SD-03** | **REFINED** | Booking: composer +4ms após drawer — perceptual OK; shadow mismatch instantâneo only |
| **SD-04** | **PARTIAL** | Product drawer: lag composer vs drawer event — **observacional**; checkout path não exercitado |

**Nova divergência temporal documentada:**

### SD-T01 · `orphan_composer_mode` — composer precede drawer

| | Runtime | Shadow |
|---|---------|--------|
| **Quando** | feed drawer open | `composer.mode.changed` before `drawer.opened` (~37ms) |
| **composerMode** | overlay | default (no layer yet) |
| **Causa** | BSL `syncFeedDrawerComposerOpen` / effect before drawer instrumentation effect | Shadow reducer needs open layer for overlay prediction |
| **Classificação** | **TEMPORALLY_TOLERATED** — perceptual smooth |
| **Blocker?** | **Não** |
| **Ação** | Document in EVENT_ORDERING; **não** reorder Tier 1 without temporal contract |
| **Migration?** | Shadow-only tolerance window (~50ms) if ever needed — **not runtime** |

---

## SD-01 · feed drawer composer overlay (historical + revalidated)

| | Runtime (2026-05-24) | Shadow |
|---|----------------------|--------|
| **Quando** | ecommerce feed drawer tap | CAPTURED |
| **composerMode** | **overlay** @ 30.226Z | predicted default until drawer @ 30.263Z |
| **Causa original** | Pré-P0-03 appointment gap | **Resolvido runtime** |
| **Classificação atual** | **CLEARED runtime** · shadow temporal lag only |
| **Blocker?** | Não |
| **Ação** | Atualizar contratos: overlay **emite**; shadow orphan é SD-T01 |

---

## SD-02 · drawer_registry_mismatch — feed drawer close id

| | Runtime | Shadow |
|---|---------|--------|
| **Quando** | `drawer.closed` | CAPTURED ecommerce + realestate |
| **Close id** | `feed:video:none` | normalizado para layer aberta |
| **Classificação** | **observacional** + STALE_BUT_SAFE |
| **Blocker?** | Não perceptivo; sim automação futura |
| **Ação** | Manter shadow normalização; considerar instrumentação id no migrate cycle |
| **Migration?** | Opcional em ActionDrawer migrate — **not urgent** |

---

## SD-03 · booking overlay (appointment)

| | Runtime | Shadow |
|---|---------|--------|
| **Quando** | Agendar agora | CAPTURED @ 2026-05-24 |
| **Timing** | drawer +4ms before composer.mode.changed | shadow mismatch at drawer.opened instant |
| **Classificação** | **TEMPORALLY_TOLERATED** |
| **Blocker?** | Não |
| **Ação** | OBSERVE — alinhado em <10ms |

---

## SD-04 · Ecommerce composer policy

| | Runtime | Shadow |
|---|---------|--------|
| **Quando** | product ActionDrawer | CAPTURED partial |
| **Gap** | checkout/cart hidden path **not exercised** |
| **Classificação** | **observacional** — incomplete capture |
| **Blocker?** | Não |
| **Ação** | INVESTIGATE cart/checkout in next capture session |
| **Migration?** | Priority contract doc before unify |

---

## Divergências NÃO observadas (re-run 2026-05-24)

| Kind | Status |
|------|--------|
| `duplicate_drawer_open` | Não reproduzido |
| `duplicate_composer_transition` | Suprimido |
| `impossible_composer_hidden` | Não reproduzido |
| Event storm | Não observado |
| Morph Tier 1 regression | Não observado |

---

## Classificação resumida (atualizada)

| ID | Kind | Severidade | Corrigir agora? | Contrato? |
|----|------|------------|-----------------|-----------|
| SD-01 | composer feed drawer | **cleared runtime** | ❌ | EVIDENCED overlay emits |
| SD-T01 | orphan_composer temporal | observacional | ❌ | SKELETON ordering |
| SD-02 | drawer_registry | observacional | ❌ | SKELETON |
| SD-03 | booking timing | tolerado | ❌ | — |
| SD-04 | ecommerce policy | observacional | ❌ | needs checkout capture |

---

## Recomendação (pós CONTROLLED EXECUTION)

- **Não corrigir Tier 1** por shadow orphan SD-T01 — perceptual smooth
- **Não aplicar shadow ao runtime**
- Próxima captura: Stack B bridges + ecommerce checkout hidden
- Ao migrar personal: re-run shadow compare Stack B paths

---

## Referências

- `REAL_USAGE_RE_RUN_RESULTS.md`
- `SESSION_TIMELINES.md` — SESSION-C02
- `EVENT_ORDERING_ANALYSIS.md`
