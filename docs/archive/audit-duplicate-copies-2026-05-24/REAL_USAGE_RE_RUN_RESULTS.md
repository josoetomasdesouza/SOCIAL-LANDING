# REAL_USAGE Re-run Results — `/demo`

**Executado:** 2026-05-24T13:00:03Z (batch 1) · **RU-R-03 retry:** 2026-05-24T13:04:05Z  
**Baseline:** `main` @ `e002921`  
**Ambiente:** DEV `http://127.0.0.1:3000/demo`  
**Viewport principal:** mobile 390×844  
**Método:** Playwright headless + `demo-event-checklist.mjs` (8/8) + capture estendido RU-R subset  
**Modo:** CONTROLLED EXECUTION — **nenhum código alterado**

> **Nota working tree:** testes rodaram com working tree local dirty (ecommerce WIP, passive-event-provider). Event bus e shadow DEV ativos. Resultados refletem runtime servido pelo dev server local — **não** diff ecommerce WIP em paths não visitados.

---

## Resumo executivo

| Métrica | Resultado |
|---------|-----------|
| `demo-event-checklist` | **8/8 PASS** |
| Testes RU-R automatizados | **12/20** capturados (RU-R-03 retry ✅) |
| Testes RU-R manual/pending | **9/20** |
| Blockers Tier 1 | **0** |
| RU-01 scroll lock | **refutado** — overflow limpo pós-close exact |
| SD-01 feed drawer overlay | **runtime CONFIRMADO** — overlay emite |
| Descoberta temporal crítica | **composer.mode.changed precede drawer.opened ~37ms** no feed drawer |

---

## Event summary (sessão combinada)

```json
{
  "feed.vertical.changed": 12,
  "composer.mode.changed": 7,
  "drawer.opened": 5,
  "surface.opened": 5,
  "drawer.closed": 2,
  "surface.closed": 2,
  "morph.started": 2,
  "morph.completed": 2,
  "ai.surface.opened": 1
}
```

Checklist appointment path adicional: `whatsapp.clicked`, `user.intent.signal` — 8/8 PASS.

---

## Resultados RU-R-01 → RU-R-20

### RU-R-01 — Troca de vertical

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Vertical** | appointment → ecommerce (reload selector) |
| **Timeline** | `feed.vertical.changed` @ 12:59:25.596Z, @ 12:59:27.356Z |
| **Eventos** | 2× `feed.vertical.changed` |
| **Shadow** | 0 divergences; timelineLen=1 per navigation |
| **Divergência** | none |
| **Classificação temporal** | TEMPORALLY_VALID, OWNERSHIP_TRANSFER |
| **Perceptual** | smooth |
| **Risco arquitetural** | baixo |
| **Status** | **ACCEPTED** |

---

### RU-R-02 — Feed drawer Stack A (ecommerce)

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Vertical** | ecommerce |
| **Timeline capturada** | |
| | 12:59:30.226Z `composer.mode.changed` → **overlay** |
| | 12:59:30.263Z `drawer.opened` (+37ms) |
| | 12:59:30.264Z `surface.opened` |
| | 12:59:31.223Z `composer.mode.changed` → default (+957ms close) |
| | 12:59:31.258Z `drawer.closed` |
| | 12:59:31.259Z `surface.closed` |
| **Shadow** | composer_mode_mismatch (×2), orphan_composer_mode (×1), drawer_registry_mismatch (×2) |
| **Divergência** | SD-02 confirmado; SD-01 **cleared runtime** |
| **Classificação temporal** | TEMPORALLY_VALID, TRANSIENT_OVERLAP (overlay before drawer event) |
| **Perceptual** | smooth — overlay + drawer OK |
| **Risco arquitetural** | baixo perceptivo; médio shadow ordering |
| **Status** | **ACCEPTED** — documentar ordem temporal |

**Insight:** P0-03 funciona — runtime emite overlay. Shadow orphan porque **composer precede drawer** no bus (~37ms).

---

### RU-R-03 — Drawers Stack B (bridges) — **RETRY CAPTURED**

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Vertical selector** | `Pessoal` · `Influencer` (não "Personal") |
| **Retry date** | 2026-05-24T13:04:00Z |

#### personal — contact bridge

| Campo | Valor |
|-------|-------|
| **Seletor** | `getByRole('button', { name: 'Entrar em contato', exact: true }).first()` |
| **Ação** | click → drawer open → Escape close |
| **Timeline** | |
| | 13:04:00.171Z `drawer.opened` `{drawerId: personal:contact}` |
| | 13:04:00.174Z `surface.opened` (+3ms) |
| | 13:04:01.147Z `drawer.closed` |
| | 13:04:01.148Z `surface.closed` (+1ms) |
| **Close method** | Escape — **funciona** |
| **overflow after** | `(empty)` |
| **Shadow** | `composer_mode_mismatch` — runtime `default` vs shadow `overlay` |
| **Console errors** | none |

#### influencer — links bridge

| Campo | Valor |
|-------|-------|
| **Seletor** | `getByRole('button', { name: 'Ver todos os links', exact: true })` |
| **Ação** | click → drawer open → Escape close |
| **Timeline** | |
| | 13:04:04.701Z `drawer.opened` `{drawerId: influencer:links}` |
| | 13:04:04.703Z `surface.opened` (+2ms) |
| | 13:04:05.678Z `drawer.closed` |
| | 13:04:05.679Z `surface.closed` (+1ms) |
| **Close method** | Escape — **funciona** |
| **overflow after** | `(empty)` |
| **Shadow** | `composer_mode_mismatch` — same pattern as personal |
| **Console errors** | none |

**Classificação temporal:** TEMPORALLY_VALID (event pairs), TEMPORALLY_TOLERATED (shadow composer — bridge não altera composerMode by design)

**Divergência shadow:** runtime `composerMode=default` while drawer open — **observacional**, not bridge failure. Shadow policy expects overlay; Stack B bridge **observes only**.

**Perceptual:** smooth — drawer visible, Escape closes cleanly

**Risco arquitetural:** baixo para bridge instrumentation; médio for migration (composer sync decision deferred)

**Status:** **ACCEPTED**

**Nota automação:** vertical selector must be **`Pessoal`**; scroll feed before click if composer occludes content.

---

### RU-R-04 — Long-press / morph

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Vertical** | appointment (Tutoriais PostCard) |
| **Timeline** | |
| | 12:59:38.180Z `morph.started` |
| | 12:59:38.687Z `morph.completed` (**507ms**) |
| **Shadow** | 0 divergences |
| **Classificação temporal** | TEMPORALLY_VALID, INTERRUPT_WINDOW |
| **Perceptual** | smooth |
| **Status** | **ACCEPTED** |

Checklist path: morph.started → completed order OK (8/8).

---

### RU-R-05 — Composer context chips

| Campo | Valor |
|-------|-------|
| **Status** | **OBSERVE** — não isolado nesta sessão; coberto indiretamente por morph path |
| **Nota** | incluir em CAPTURED manual próximo |

---

### RU-R-06 — Primeira mensagem composer

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Vertical** | appointment |
| **Timeline** | 12:59:59.025Z `ai.surface.opened` (×1) |
| **Shadow** | 0 divergences |
| **Status** | **ACCEPTED** |

Checklist: segunda mensagem não repete ai.surface.opened — PASS.

---

### RU-R-07 — WhatsApp / agendamento

| Campo | Valor |
|-------|-------|
| **Status** | **ACCEPTED** via checklist — whatsapp.clicked + user.intent.signal order OK |
| **realestate** | **OBSERVE** — não executado nesta sessão |

---

### RU-R-08 — Scroll durante morph

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Vertical** | appointment |
| **Timeline** | |
| | 12:59:42.216Z `morph.started` |
| | 12:59:42.505Z `morph.completed` (**289ms** — cancel) |
| **Classificação temporal** | CANCELLED_FLOW, TEMPORALLY_VALID |
| **Perceptual** | interrupted graceful |
| **Status** | **ACCEPTED** — MF-03 confirmado |

---

### RU-R-09 — Close por botão Fechar (realestate)

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Vertical** | realestate |
| **Timeline** | overlay @ 45.558Z → drawer @ 45.598Z → restore @ 46.475Z → close @ 46.515Z |
| **overflow during** | `hidden` |
| **overflow after** | `(empty)` |
| **Shadow** | SD-02 pattern + temporal composer/drawer ordering |
| **Status** | **ACCEPTED** — RU-01 refutado novamente |

---

### RU-R-10 — Close por Escape

| Campo | Valor |
|-------|-------|
| **Status** | **OBSERVE** — não executado |

---

### RU-R-11 — Close por backdrop

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Vertical** | appointment feed drawer |
| **Resultado** | `drawer_still_open_after_backdrop=true` |
| **overflow** | `hidden` (correto — drawer aberto) |
| **Classificação temporal** | TEMPORALLY_TOLERATED, PERCEPTUAL_RISK UX |
| **Status** | **ACCEPTED** — comportamento documentado, não scroll bug |

---

### RU-R-12 — Troca vertical com drawer aberto

| Campo | Valor |
|-------|-------|
| **Status** | **OBSERVE** — reload selector only in RU-R-01 |

---

### RU-R-13 — Mobile viewport

| Campo | Valor |
|-------|-------|
| **Status** | **ACCEPTED** — todos testes 390×844; shadow `mobileViewport: true` |

---

### RU-R-14 — Keyboard open/close

| Campo | Valor |
|-------|-------|
| **Status** | **INVESTIGATE** — requer device físico; headless não emula keyboard |

---

### RU-R-15 — Appointment hero sem morph

| Campo | Valor |
|-------|-------|
| **Status** | **OBSERVE** — P1-01 known gap; não re-testado |

---

### RU-R-16 — Custom modules morph incompleto

| Campo | Valor |
|-------|-------|
| **Status** | **OBSERVE** |

---

### RU-R-17 — Ecommerce composer policy

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Vertical** | ecommerce |
| **Timeline** | product ActionDrawer @ 49.340Z; composer.mode.changed @ 49.345Z (same ms) |
| **Runtime composer** | `default` at shadow snapshot instant |
| **Shadow** | predicted `overlay` — composer_mode_mismatch |
| **Classificação temporal** | TRANSIENT_OVERLAP — vertical effect lag vs drawer event |
| **Status** | **OBSERVE** — SD-04; checkout/cart path não exercitado |

---

### RU-R-18 — Booking overlay (appointment)

| Campo | Valor |
|-------|-------|
| **Viewport** | 390×844 |
| **Timeline** | drawer @ 52.305Z → composer.mode.changed @ 52.309Z (+4ms) |
| **Shadow** | mismatch at drawer.opened (runtime default, shadow overlay) |
| **Status** | **ACCEPTED** — composer follows drawer within 4ms; perceptual OK |

Checklist step 6: composer.mode.changed on booking — PASS.

---

### RU-R-19 — Realestate scroll lock

| Campo | Valor |
|-------|-------|
| **Status** | **ACCEPTED** — ver RU-R-09; overflow limpo |

---

### RU-R-20 — Influencer media-kit trigger gap

| Campo | Valor |
|-------|-------|
| **Status** | **OBSERVE** — P2-07; não exercitado |

---

## Matriz de status

| Status | Count | IDs |
|--------|-------|-----|
| **ACCEPTED** | 12 | RU-R-01,02,**03**,04,06,07,08,09,11,13,18,19 + checklist |
| **OBSERVE** | 6 | RU-R-05,10,12,15,16,17,20 |
| **INVESTIGATE** | 1 | RU-R-14 (keyboard device) |
| **BLOCKER** | 0 | — |

---

## Descoberta temporal principal (CAPTURED)

**Composer precede drawer no feed drawer path:**

```text
t+0ms   composer.mode.changed → overlay
t+37ms  drawer.opened
t+38ms  surface.opened
```

**No close:**

```text
t+0ms   composer.mode.changed → default
t+35ms  drawer.closed
```

Isso explica shadow `orphan_composer_mode` sem bug perceptivo runtime. Classificação: **TEMPORALLY_VALID** + shadow ordering lag.

---

## Gate impact

| Gate | Antes re-run | Após re-run |
|------|--------------|-------------|
| SD-01 feed drawer | assumed cleared | **CONFIRMED runtime** |
| RU-01 | P2 | **refutado again** |
| Morph Tier 1 | stable | **stable** (507ms, cancel OK) |
| Stack B bridges | **ACCEPTED** RU-R-03 retry | personal + influencer events OK |
| Truth Mapping GO | NO-GO | **NO-GO** — dual stack + 9 manual pending |

---

## Próximos passos (execução)

1. ~~Re-run RU-R-03~~ ✅ done 2026-05-24
2. RU-R-14 em device físico
3. RU-R-17 checkout/cart hidden path
4. Desktop 1280×800 pass (pending)
5. Preencher 9 OBSERVE restantes ou marcar DEFER com prazo

---

## Referências

- `REAL_USAGE_RE_RUN_PLAN.md`
- `SESSION_TIMELINES.md` (CAPTURED updates)
- `SURFACE_DIVERGENCES.md` (revalidação SD-01–04)
- Raw capture: sessão Playwright 2026-05-24 (ephemeral, não commitado)
