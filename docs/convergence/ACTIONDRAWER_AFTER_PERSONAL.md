# ActionDrawer — Assessment After Personal Migration

**Date:** 2026-05-24  
**Context:** First real Stack B → Stack A convergence (`43c969a`)  
**Scope:** Readiness review only — no runtime changes

---

## Summary verdict

| Question | Answer |
|----------|--------|
| Stable enough for converged verticals? | **Yes** — 9 Stack A verticals already in production on main; personal is now #10 |
| Ready for influencer? | **Conditionally** — migrate with same pattern; expect 2 drawers + links UX review |
| Ready for institutional? | **Conditionally** — structurally closest to personal (3 drawers); higher content complexity |
| Ready for global API expansion? | **No** — do not generalize Escape, vertical, or drawerKind props yet |

---

## 1. Is ActionDrawer stable enough?

**Yes, for scoped convergence.**

Evidence:

- Used across appointment, ecommerce, courses, restaurant, realestate, professionals, events, gym, health
- Personal migration added only **`drawerId?: string`** — 10 lines net change
- No changes to scroll lock, z-index, event bus, or instrumentation core
- 8/8 global demo checklist passed after personal migrate

**Caveats (known, pre-existing):**

- No global Escape key handler
- `reserveComposerSpace` in interface but not fully implemented
- Cart/product drawer variants live in same file (not false abstraction yet, but file is large)

---

## 2. Limitations surfaced by personal migration

| Limitation | Severity | Personal workaround |
|------------|----------|---------------------|
| **No native Escape** | Medium | Local `useEffect` in `personal-feed.tsx` |
| **Title used as default event ID** | High for dynamic titles | `drawerId` optional prop |
| **No `vertical` in events** | Low (no runtime consumer) | Accepted as Stack A parity |
| **`drawerKind` hardcoded `action`** | Low | Accepted vs bridge `other` |
| **80vh lg cap vs 90vh vaul** | Visual | `size="lg"` + ACCEPTED_WITH_NOTE |
| **Different chrome (handle, X)** | Visual | Stack A standard — not a bug |

---

## 3. Was `drawerId` optional the correct solution?

**Yes.**

| Alternative | Why rejected |
|-------------|--------------|
| Use `title` as ID | Breaks `personal:project` / institutional project pattern |
| Required `drawerId` everywhere | Breaking change across 9 verticals |
| Separate `eventId` + `displayTitle` | Over-engineering for one migration |
| Fork ActionDrawer for Stack B | Violates convergence goal |

**Implementation quality:**

- `const eventDrawerId = drawerId ?? title` — clear fallback
- Existing callers unchanged
- Effect deps include `eventDrawerId` — correct

**Future:** Influencer + institutional should pass explicit `drawerId` for all Stack B drawers with stable IDs.

---

## 4. Should Escape remain local?

**Yes — for this convergence phase.**

| Factor | Assessment |
|--------|------------|
| Personal needed Escape for parity with vaul | Local handler restores UX |
| Most Stack A verticals never had Escape | Global add changes legacy behavior |
| Scope constraint | Forbidden global ActionDrawer refactor |
| Strict Mode safety | Cleanup verified in personal |

**When to revisit:** After ≥2 Stack B migrations, with explicit ADR:

- Option A: ActionDrawer `enableEscapeClose?: boolean` (default false)
- Option B: Shared hook `useDrawerEscape(isOpen, onClose)` imported per vertical
- **Not now:** inline `keydown` on ActionDrawer for all verticals

---

## 5. Signs of false abstraction?

**None introduced by personal migrate.**

Watch list (pre-existing):

| Signal | Location | Action |
|--------|----------|--------|
| `CartDrawer` / `ProductDetailDrawer` in same file | `action-drawer.tsx` | Keep — working; don’t split during convergence |
| `reserveComposerSpace` unused | interface | Don’t implement until vertical needs it |
| Multiple size/inset props | ActionDrawer | Calibrated per vertical — not one-size |

**Anti-false-abstraction rule:** Do not extract `ConvergedDrawer` wrapper until ≥3 Stack B verticals migrated with identical boilerplate.

---

## 6. Signs of overfitting to Stack A?

**Moderate — intentional.**

Personal now behaves like restaurant/health:

- Same chrome, same payload shape, same scroll lock
- **Trade-off:** Lost vaul-native feel; gained stack consistency

**Not overfit yet because:**

- We did **not** force global Escape
- We did **not** retroactively add `vertical` to all ActionDrawer emits
- We did **not** change influencer/institutional to match personal preemptively

**Risk:** Team assumes “ActionDrawer = complete drawer platform” — it is **convergence target**, not final drawer OS.

---

## 7. Ready for influencer?

**Conditionally yes — not immediately.**

| Factor | Influencer |
|--------|------------|
| Drawer count | 2 (`influencer:media-kit`, `influencer:links`) |
| Structural similarity to personal | High |
| Stable IDs | Yes — already on bridge |
| Extra UX | Copy-link interactions in links drawer |
| RU-R precedent | `influencer:links` captured in RU-R-03 |
| Risk | Links drawer list + copy state; media-kit layout height |

**Recommendation:** Next **candidate** after pause, using same pattern — but require fresh spec + observation pass, not copy-paste personal PR.

---

## 8. Ready for institutional?

**Conditionally yes — lower priority than influencer for “ease”, higher for “blast radius”.**

| Factor | Institutional |
|--------|---------------|
| Drawer count | **3** (contact, team, project) |
| Similarity to personal | Very high (contact + project nearly identical) |
| Extra drawer | Team list — scroll/content height |
| Additional components | Uses `SocialCompactHero`, `SocialContactCTA` in feed — more surface area |
| Risk | More drawers = more event validation cases; team drawer untested in RU-R subset |

**Recommendation:** Migrate **after** influencer proves pattern on 2-drawer vertical; institutional is template-rich but 3-drawer validation is heavier.

---

## 9. What must NOT be generalized yet

| Do NOT generalize now | Reason |
|----------------------|--------|
| Global Escape on ActionDrawer | Behavior change across 9 verticals |
| Required `drawerId` on all ActionDrawers | Breaking churn |
| `vertical` prop on ActionDrawer | No proven consumer; wait for shadow ADR |
| `drawerKind` configurability | `action` vs `other` is convergence marker, not config soup |
| Unified drawer size tokens (90vh parity) | Visual refinement phase — separate workstream |
| Extract shared `useStackBDrawerMigrate` hook | Only 1 vertical migrated |
| Delete `InstrumentedDrawerBridge` | Still used by influencer + institutional |
| Merge ActionDrawer + BusinessFeedDrawer | Tier 1 / feed-drawer semantics differ |

---

## ActionDrawer capability matrix (post-personal)

| Capability | Status |
|------------|--------|
| Open/close state | ✅ Stable |
| Backdrop + X close | ✅ Stable |
| Body scroll lock | ✅ Stable |
| Event instrumentation | ✅ Stable (+ drawerId) |
| Stable IDs for dynamic titles | ✅ Via drawerId |
| Escape close | ⚠️ Per-vertical opt-in |
| Vertical in payload | ❌ Not emitted |
| composerMode integration | ❌ Not in ActionDrawer (vertical feed responsibility) |
| Feed-drawer parity | ❌ Different component (`BusinessFeedDrawer`) |

---

## Recommended ActionDrawer roadmap (docs only)

1. **Now:** Freeze API — only bugfixes on converged verticals
2. **After influencer migrate:** Decide Escape hook vs prop with evidence from 2 Stack B verticals
3. **After institutional migrate:** Evaluate bridge deprecation **proposal** (not deletion)
4. **Visual refinement phase (later):** Size tokens, 90vh discussion — separate approval track

**No ActionDrawer code changes until next approved convergence spec.**
