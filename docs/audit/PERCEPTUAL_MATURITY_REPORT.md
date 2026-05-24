# Perceptual Maturity Report — Social Landing

**Date:** 2026-05-24  
**Lens:** Product experience (not architecture)  
**Baseline:** `main` @ `38959cc` after Personal Phase 3  
**Method:** Code-path analysis + post-merge Playwright visual smoke on personal

---

## One-line verdict

The platform feels **premium in intent, hybrid in execution** — polished demo verticals with **visible seams** when users cross Stack A ↔ Stack B or composer-integrated ↔ composer-agnostic feeds.

**Perceptual maturity:** **Promising / hybrid** (not yet uniformly mature).

---

## Experience questionnaire

| # | Question | Answer | Confidence |
|---|----------|--------|------------|
| 1 | Does the platform feel premium? | **Mostly yes** on individual verticals — typography, feed rhythm, morph, composer | Medium |
| 2 | Does it feel experimental? | **Yes in edges** — dual drawer stacks, debug event panel, vertical switching | High |
| 3 | Would users notice stack differences? | **Yes** if they open drawers on Pessoal then Influencer/Institucional | High |
| 4 | Visual signs of incomplete convergence? | **Yes** — handle/X/80vh vs vaul; personal has Escape, most ActionDrawer verticals don’t | High |
| 5 | Does the system feel coherent? | **Within a vertical: yes. Across /demo: partial** | Medium |
| 6 | Runtime stable perceptually? | **Yes after personal merge** — no stuck scroll, closes work | High (personal); Medium (global) |
| 7 | Sense of fragility? | **Low on happy path; medium on edge stacks** (multi-drawer, composer overlap) | Medium |
| 8 | “Layers accumulated” feeling? | **Yes** — morph layer + composer + 3 drawer types + event debug button | High |
| 9 | Perceptual confidence? | **Growing** — first convergence proved discipline; product not fully unified | Medium |
| 10 | UX intentional vs emergent? | **Core spine intentional** (feed/composer/morph); **drawer layer emergent** (historical duplication) | High |

---

## Premium signals (what works)

- **Feed-as-social-product** — stories, sections, morph-to-chat feel designed, not bolted on  
- **Composer continuity** — drag, snap, overlay modes on integrated verticals feel considered  
- **ActionDrawer chrome** — handle, rounded top, backdrop — consistent **within Stack A**  
- **Motion** — morph ~500ms, drawer slide 300ms — calibrated, not random  
- **Personal post-convergence** — contact/project drawers feel native to Stack A family  

---

## Experimental / demo signals (what betrays maturity)

- **Vertical picker** — `/demo` is explicitly a model showroom  
- **Event debug panel** — valuable for dev; visible “instrumentation layer”  
- **Stack B drawers** — different physics and chrome on influencer/institutional  
- **Composer doesn’t always defer** — personal/influencer/institutional drawers don’t hide composer like booking flows  
- **No global Escape on ActionDrawer** — power users expect Escape; only personal restored it locally  

---

## User journey: convergence visibility

### Journey A — stay in Stack A (e.g. Agendamento → Restaurante)

**Perception:** Coherent. User likely thinks “one product.”

### Journey B — Pessoal → Influencer

**Perception:** Drawer **changes family**. Handle/X/80vh → vaul sheet/90vh. **User will notice** if they use drawers in both.

### Journey C — content post drawer → vertical action drawer

**Perception:** Third pattern (`BusinessFeedDrawer`). Trained user sees three drawer dialects — acceptable for demo, **not** for production brand site without unification narrative.

---

## Visual maturity matrix

| Element | Stack A (ActionDrawer) | Stack B (vaul bridge) | Feed drawer |
|---------|------------------------|----------------------|-------------|
| Handle bar | ✅ | ❌ | varies |
| X close | ✅ | shadcn default | “Fechar” / close patterns |
| Max height | 40–95vh by size prop | ~90vh | full feed semantics |
| Backdrop | fixed black/50 | vaul | yes |
| Escape | personal only | vaul native | partial |
| Composer interaction | often overlay/hidden | typically unchanged | overlay timing |

---

## Perceptual risks if convergence accelerates

1. **False “done” feeling** after personal — remaining 5 Stack B drawers still visible  
2. **Over-fitting Stack A chrome** — forcing 80vh on content that felt taller on vaul  
3. **Escape whack-a-mole** — local handlers per vertical vs one principled behavior  
4. **Composer surprises** — migrating influencer without deciding composerMode policy  

---

## Perceptual maturity stages (where Social Landing sits)

```
[ prototype ] → [ hybrid demo ] → [ converging product ] → [ unified premium ]
                      ▲
                 YOU ARE HERE
```

**Hybrid demo:** High craft in Tier 1 + feed; drawer layer still plural; governance ahead of UX unification.

---

## What would increase perceptual maturity (no implementation — direction only)

1. Complete Stack B → A on remaining 2 verticals **with same accepted deltas documented**  
2. One-page “drawer behavior contract” for users (Escape, composer, height)  
3. Decide composer policy for social/profile verticals (overlay vs default)  
4. Hide or gate Event Debug Panel outside dev  
5. **Do not** chase pixel parity with old vaul — chase **cross-vertical consistency**  

---

## Stabilization impact on perception

Post-merge personal validation: **STABLE_WITH_NOTES**

- No new perceptual regressions detected  
- Accepted deltas (handle/X/80vh) **stable** — not worsening  
- User switching to Influencer still exposes **intentional** inconsistency until next converge  

---

## Summary for executives

**The product is impressively designed at the core and honestly hybrid at the edges.**  
Personal Phase 3 improved **consistency for one vertical** without pretending the whole platform converged.  
That honesty is perceptually healthier than a rushed full migration.

**Rating:** **Promising hybrid — moving toward mature, not there yet.**
