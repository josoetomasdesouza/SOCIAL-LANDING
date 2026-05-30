# Institutional Behavior Spec — Official post–WS-07

**Status:** ✅ Official post–WS-07.5  
**Baseline commit:** `1b64b8f` (PR #63 merged)  
**Stack:** ActionDrawer (Stack A) — **no** `InstrumentedDrawerBridge`  
**Authority:** Vertical snapshot; complements [`DRAWER_BEHAVIOR_SPEC.md`](./DRAWER_BEHAVIOR_SPEC.md)

---

## Scope

This spec defines **observed, accepted behavior** for the Institutional vertical on `/demo` after WS-07 convergence. It does not modify Tier 1 core law — it documents how institutional applies Stack A drawers in an NGO/editorial context.

---

## Drawer inventory

| Drawer ID | Title | Size | Trigger(s) |
|-----------|-------|------|------------|
| `institutional:contact` | Fale Conosco | `lg` | Hero **Fale conosco**; `SocialContactCTA` primary action |
| `institutional:team` | Nossa Equipe | `lg` | **Ver equipe completa** (team preview section) |
| `institutional:project` | `{project.title}` | `lg` | Project card click (e.g. Escola Verde) |

All three use `ActionDrawer` with stable `drawerId`. Event source: `action-drawer`; `drawerKind: "action"`.

---

## Drawer behavior

Follows [`DRAWER_BEHAVIOR_SPEC.md`](./DRAWER_BEHAVIOR_SPEC.md) unless noted below.

| Property | Institutional value |
|----------|----------------------|
| Entry | Bottom sheet, rounded top, drag handle |
| Height | `size="lg"` — **80vh cap** (Stack A), not vaul 95% |
| Body lock | `overflow: hidden` while open |
| Internal scroll | `DrawerScrollBody` — team list and project detail scroll inside sheet |
| Open events | `drawer.opened` + `surface.opened` (matching IDs) |
| Close events | `drawer.closed` + `surface.closed` |

### Close semantics (official)

| Method | Supported | Notes |
|--------|-----------|-------|
| Escape | ✅ | ActionDrawer global listener |
| Backdrop tap | ✅ | Backdrop `onClick` → `onClose` |
| Drag down | ✅ | Handle zone / pull at scroll top |
| Close X button | ❌ | Intentionally absent — Stack A standard |

After close: `document.body.style.overflow` restored to `""`; feed scroll position preserved.

---

## composerMode overlay

When **any** institutional drawer is open:

```text
composerMode = "overlay"
```

When all drawers closed:

```text
composerMode = "default"
```

| Rule | Behavior |
|------|----------|
| Overlay clearance | Composer reserves clearance above drawer (`useComposerOverlayClearance`) |
| On unmount | Resets to `default` |
| Events | `composer.mode.changed` on open and close (observed in `qa:institutional`) |
| Hidden mode | **Not used** — institutional has no checkout/booking flow |

---

## Contact drawer flow

**Purpose:** Outreach form for supporters, partners, and general inquiries.

| Step | User action | System response |
|------|-------------|-----------------|
| 1 | Tap **Fale conosco** (hero or contact CTA) | `institutional:contact` opens |
| 2 | Fill name, email, phone, message | Inline form fields (mock — no backend) |
| 3 | Tap **Enviar mensagem** | Success state with check icon |
| 4 | Auto-dismiss | After 2s, drawer closes; form resets on next open |
| 5 | Manual dismiss | Escape / backdrop / drag at any time |

**Tone:** Mission-forward outreach sheet — **not** a corporate CRM modal. Single-column form; one primary CTA.

**Accepted delta:** Contact form is mock-only (pre–WS-07 behavior preserved). No API submission.

---

## Team drawer flow

| Step | User action | System response |
|------|-------------|-----------------|
| 1 | Tap **Ver equipe completa** | `institutional:team` opens |
| 2 | Scroll team list | Avatar, name, role per member |
| 3 | Tap LinkedIn icon | Ghost button (no external URL wired — decorative) |
| 4 | Dismiss | Escape / backdrop / drag |

Team preview cards in feed remain inline; drawer is the expanded roster.

---

## Project drawer flow

| Step | User action | System response |
|------|-------------|-----------------|
| 1 | Tap project card (title + status badge) | `institutional:project` opens with selected project |
| 2 | View hero image, status, description | Scroll inside sheet if needed |
| 3 | Tap **Ver relatorio completo** | Primary CTA (no route change — mock) |
| 4 | Dismiss | Escape / backdrop / drag |

Drawer title reflects selected project (`selectedProject.title`). Status badge colors: blue = Em andamento, green = Concluido.

---

## Feed sections (non-drawer)

These sections render inline and do **not** open drawers:

| Section | Behavior |
|---------|----------|
| Proposito (pillars) | Mission/vision/values cards |
| Impacto | Metric grid |
| FAQ | Accordion expand/collapse |
| Videos / Products / News | Standard `BusinessSocialLanding` post cards |

Only contact, team expansion, and project detail use drawers.

---

## Accepted visual deltas vs Stack B (vaul)

| Delta | Before (vaul) | After (ActionDrawer) | Verdict |
|-------|---------------|----------------------|---------|
| Sheet height | ~95% snap | ~80vh `lg` | ACCEPTED_WITH_NOTE |
| Chrome | vaul default | Drag handle, Stack A backdrop | ACCEPTED |
| Event `drawerKind` | `other` | `action` | ACCEPTED |
| Event `source` | `instrumentation` | `action-drawer` | ACCEPTED |
| Close X | None on vaul institutional | None on ActionDrawer | Parity |
| Contact padding | vaul `p-6` wrapper | ActionDrawer body padding | ACCEPTED — minor chrome shift |

Do **not** chase vaul pixel parity in institutional — convergence target is Stack A semantics.

---

## TypeScript baseline

| Metric | Post–WS-07 |
|--------|------------|
| Total baseline | **8** |
| `institutional-feed.tsx` | **0** |
| Tier 1 frozen | **0** |

WS-07.5 does not change baseline — docs only.

---

## Known-good flows

| ID | Flow | Drawer ID | QA step |
|----|------|-----------|---------|
| INS-01 | Open contact drawer | `institutional:contact` | qa:institutional #1 |
| INS-02 | Close contact (Escape) | `institutional:contact` | qa:institutional #2 |
| INS-03 | Overflow clean post-contact | — | qa:institutional #2b |
| INS-04 | Open team drawer | `institutional:team` | qa:institutional #3 |
| INS-05 | Close team (Escape) | `institutional:team` | qa:institutional #4 |
| INS-06 | Open project drawer | `institutional:project` | qa:institutional #5 |
| INS-07 | Close project (Escape) | `institutional:project` | qa:institutional #6 |
| INS-08 | Body overflow clean final | — | qa:institutional #7 |
| INS-09 | composer overlay on drawer open | — | events in #2, #4, #6 |
| INS-10 | Global morph/drawer/composer | — | qa:events 8/8 |

---

## Residual risks (accepted)

| ID | Risk | Severity | Owner |
|----|------|----------|-------|
| R-01 | 80vh lg cap vs former vaul 95% | Low | ACCEPTED_WITH_NOTE |
| R-02 | Contact form mock — no backend | N/A | Pre-existing; by design |
| R-03 | LinkedIn buttons decorative (no URL) | Low | Product — future wire |
| R-04 | Project report CTA mock (no route) | Low | Product — future wire |
| R-05 | Stack B remains on gym, personal, professionals, appointment | Medium | Future workstreams |
| R-06 | `ignoreBuildErrors: true` — 8 TS errors remain | Medium | WS-08+ / Stack B peel |

---

## Validation

```bash
pnpm dev
pnpm qa:institutional   # 9/9 — vertical drawer protocol
pnpm qa:events          # 8/8 — global Tier 1 regression
pnpm qa:influencer      # 8/8 — no cross-vertical regression
```

Manual: select **Institucional** on `/demo` → exercise contact, team, project drawers; Escape dismiss.

---

## Related

- [`WS-07_INSTITUTIONAL_VALIDATION_REPORT.md`](../audit/WS-07_INSTITUTIONAL_VALIDATION_REPORT.md)  
- [`INFLUENCER_BEHAVIOR_SPEC.md`](./INFLUENCER_BEHAVIOR_SPEC.md) — social vertical precedent  
- [`PERCEPTUAL_INVARIANTS.md`](./PERCEPTUAL_INVARIANTS.md) — I-I1…I-I3  
- [`scripts/convergence/institutional-actiondrawer-validation.mjs`](../../scripts/convergence/institutional-actiondrawer-validation.mjs)
