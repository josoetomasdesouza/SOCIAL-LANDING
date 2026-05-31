# AI Canonical Flows

**Status:** Official regression snapshot (light patterns)  
**Fixture source of truth:** `scripts/qa/fixtures/ai-canonical-flows.json`  
**Harness:** `pnpm qa:ai-regression`  
**Baseline commit:** `3eab7c1`

---

## 1. Purpose

Canonical flows define **expected conversational behavior** per vertical using pattern snapshots — not full text equality. They detect silent regression, hydration drift, and fallback breakage before new verticals (WS-08C Appointment).

Each flow runs in **isolation** (fresh page load per scenario).

---

## 2. Scenario types

| Scenario | Validates |
|----------|-----------|
| `category` | Taxonomy/specialty intent → filtered cards |
| `specific-entity` | Named entity match → targeted card(s) |
| `recommendation` | Guided/open intent → editorial suggestions |
| `contextual-follow-up` | Long-press + follow-up prompt → context-aware results |
| `fallback` | Out-of-scope prompt → mock reply, **no** resolver cards |
| `drawer-linkage` | Card/CTA → existing feed drawer or composer detail |

---

## 3. Ecommerce (frozen reference)

| ID | Scenario | Prompt | Expected pattern |
|----|----------|--------|------------------|
| EC-01 | category | `quero produtos para pele` | Product cards; Protetor/Hidratante/Solar |
| EC-02 | specific-entity | `protetor solar facial` | Protetor Solar visible |
| EC-03 | recommendation | `me ajuda com skincare facial` | ≥1 skincare product card |
| EC-04 | contextual-follow-up | LP + `o que combina?` | **Manual** (checklist B1) — feed LP hides composer in automation |
| EC-05 | fallback | `qual o horario de funcionamento` | Mock host voice; **no** product cards |
| EC-06 | drawer-linkage | `protetor solar facial` → tap product | Detail panel (Adicionar/variante) |

### Acceptable deltas

- Product order in cards may change if ranking changes
- Copy prefix may vary ("Encontrei" vs "Considerando")
- Exact product count 1–3

### Forbidden regressions

- Fallback returns product cards for non-skincare prompts
- Context follow-up returns null when chip is active
- Drawer/detail fails to open on card tap

---

## 4. Restaurant

| ID | Scenario | Prompt | Expected pattern |
|----|----------|--------|------------------|
| RS-01 | category | `quero sobremesas` | Sobremesa items (Pudim/Petit Gateau) |
| RS-02 | specific-entity | `picanha na brasa` | Picanha card |
| RS-03 | recommendation | `o que voce recomenda?` | ≥2 interactive buttons |
| RS-04 | contextual-follow-up | LP `menu-item-item-4` + `o que combina?` | Menu cards with prices |
| RS-05 | fallback | `voces entregam em qual bairro` | Mock; **no** menu block |
| RS-06 | drawer-linkage | `picanha na brasa` → tap | Item drawer (customizations) |

### Acceptable deltas

- Popular items rotation
- Category label wording in copy

### Forbidden regressions

- Empty cart cart-intent returns null instead of popular nudge
- Menu block >3 items
- Drawer opens wrong item

---

## 5. Health

| ID | Scenario | Prompt | Expected pattern |
|----|----------|--------|------------------|
| HL-01 | category | `dermatologista` | Dra. Ana / Dermatologia |
| HL-02 | specific-entity | `limpeza de pele` | Limpeza de Pele service |
| HL-03 | recommendation | `quero melhorar minha pele` | ≥2 interactive CTAs |
| HL-04 | contextual-follow-up | LP `doc-3` + `esse profissional atende o que?` | Consulta/Limpeza/Estética |
| HL-05 | fallback | `aceita convenio unimed` | Mock; **no** Agendar block |
| HL-06 | drawer-linkage | LP `doc-3` + `quero agendar consulta` → CTA | "Escolha data e horario" |

### Acceptable deltas

- Professional order in specialty results
- Service subtitle text

### Forbidden regressions

- Diagnosis/triage copy in any response
- Schedule CTA creates inline booking form
- Context follow-up returns only pro card when services exist in data

---

## 6. Pattern matching rules

| Field | Meaning |
|-------|---------|
| `contentPattern` | Regex (case-insensitive) must match thread or block text |
| `forbiddenPattern` | Regex must **not** match |
| `visualBlock: true` | Resolver cards expected |
| `visualBlock: false` | Mock fallback — no vertical block |
| `minInteractive` | Minimum button count in block |

---

## 7. Updating canonical flows

1. Edit `ai-canonical-flows.json`
2. Mirror changes in this doc
3. Run `pnpm qa:ai-regression`
4. If intentional behavior change → update [`AI_REGRESSION_RULES.md`](./AI_REGRESSION_RULES.md) + audit report

---

## Related

- [`AI_REGRESSION_RULES.md`](./AI_REGRESSION_RULES.md)
- [`AI_RUNTIME_BASELINE.md`](./AI_RUNTIME_BASELINE.md)
- [`AI_FAILURE_MODES.md`](./AI_FAILURE_MODES.md)
