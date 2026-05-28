# Runtime Constitution — Social Landing Tier 1

**Status:** ✅ Official post–WS-02.5  
**Baseline:** `673395d`  
**Authority:** This document + [`docs/os/`](../os/) governance layer

---

## Runtime philosophy

Social Landing runtime is a **converged perceptual system** — feed, composer, morph, and drawers act as one surface. The user never leaves the editorial feed mentally; transactional flows are sheets over the same world.

**Principles:**

1. **Continuity over chrome** — gesture and motion, not buttons and dialogs  
2. **Composer as anchor** — layout orbits the conversational bottom edge  
3. **One drawer family** — Stack A (`ActionDrawer`) is law; Stack B is debt  
4. **Events as truth** — if it didn't emit, it didn't happen (dev protocol)  
5. **Baseline before acceleration** — no AI/DB until CI + types + this constitution  

---

## Runtime identity

```txt
Feed (editorial) + Composer (conversation) + Drawers (transaction) + Morph (bridge)
```

| Layer | Identity |
|-------|----------|
| Feed | Sections, stories, PostCards — business-native social landing |
| Composer | Compact AI shell; modes default / overlay / hidden |
| Drawer | Bottom sheet; drag-dismiss; composer-aware clearance |
| Morph | Spatial handoff from content to conversation |

---

## Frozen zones (operational)

See [`docs/os/FREEZE_ZONES.md`](../os/FREEZE_ZONES.md). Summary:

| Zone | Status |
|------|--------|
| ActionDrawer core | 🔴 Frozen |
| Morph runtime | 🔴 Frozen |
| Composer core | 🔴 Frozen |
| Instrumentation contracts | 🟡 Frozen interface |
| E-commerce resolver | 🔴 Frozen |
| Feed baseline | 🟡 Frozen interface |

Post–WS-02.5: **runtime convergence era frozen** — patch-only on cores.

---

## Allowed evolution

| Class | Allowed | Gate |
|-------|---------|------|
| Feed wiring | New sections, props, mock data | Code review |
| Checkout wiring | `onRegisterFooter`, mode effects | Stack A parity doc |
| Stack B migration | Influencer → institutional | WS-06/07 + baseline specs |
| AI resolver inject | New resolver file per vertical | WS-08; no core edit |
| Bugfix on frozen core | Minimal diff | VALIDATION_PROTOCOL + GO |
| Docs baseline update | Version bump in TIER1_BASELINE | WS-02.5 process |

---

## Anti-patterns (forbidden)

| Anti-pattern | Why |
|--------------|-----|
| Modal dialog with close X on ActionDrawer | Breaks drawer identity |
| Composer hidden without transactional reason | Silent disappearance |
| Hard-coded bottom padding magic numbers | Drift from metrics system |
| Mixed Stack A + B semantics in one vertical | Parity debt |
| AI resolver inside composer core | Coupling + regression surface |
| Merging runtime + DB + AI in one PR | Operational entropy |
| Redefining “correct” without updating `docs/runtime/` | Perceptual drift |

---

## Perceptual principles

Full list: [`PERCEPTUAL_INVARIANTS.md`](./PERCEPTUAL_INVARIANTS.md)

**Summary:** bottom sheets, editorial feed, visible CTAs, spatial morph, continuous scroll, explicit composer lifecycle, natural timing.

---

## Architectural confidence model

Beyond build/lint — ask before every PR:

| Question | Document |
|----------|----------|
| Is this behavior official? | `KNOWN_GOOD_BEHAVIORS.md` |
| Does drawer match spec? | `DRAWER_BEHAVIOR_SPEC.md` |
| Does composer match spec? | `COMPOSER_BEHAVIOR_SPEC.md` |
| Is checkout pattern approved? | `CHECKOUT_PATTERNS.md` |
| Is this safe on frozen core? | `FREEZE_ZONES.md` |
| What era are we in? | `MASTER_ROADMAP.md` |

**Confidence levels:**

- 🟢 **Converged** — matches baseline; wiring-only change  
- 🟡 **Review** — touches frozen interface or Stack B  
- 🔴 **Blocked** — core behavior change without GO  

---

## Workstream sequence (post–baseline)

```txt
WS-02.5 (this) → WS-04 CI → WS-05 TypeScript → WS-06/07 Stack B → WS-08 AI
```

**Do not skip WS-04/05 for AI.**

---

## Amendment process

1. Propose change with perceptual before/after  
2. Human GO  
3. Update affected `docs/runtime/*` + version in `TIER1_BASELINE.md`  
4. Re-run `pnpm qa:events`  
5. Record in `VALIDATION_PROTOCOL` or PR body  

---

## Related documents

| Doc | Role |
|-----|------|
| [`TIER1_BASELINE.md`](./TIER1_BASELINE.md) | Commit snapshot + vertical matrix |
| [`KNOWN_GOOD_BEHAVIORS.md`](./KNOWN_GOOD_BEHAVIORS.md) | Happy paths |
| [`docs/os/RUNTIME_CONSTITUTION.md`](../os/) | — (this is runtime-specific constitution) |
| [`docs/os/MASTER_ROADMAP.md`](../os/MASTER_ROADMAP.md) | Era sequencing |

---

*WS-02.5 crystallizes post–PR #52 runtime. Treat everything above as law until baseline version increments.*
