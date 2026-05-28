# Perceptual Invariants — Tier 1 Runtime

**Status:** ✅ Official post–WS-02.5  
**Baseline:** `673395d`

These are **non-negotiable perceptual truths** of Social Landing Tier 1. Violating any invariant is a product regression even if tests pass.

---

## Core invariants

### 1. Drawers never feel like traditional modals

- Sheets anchor to the **bottom** of the viewport  
- Rounded top corners, drag handle visible  
- No centered dialog box; no mandatory close X  
- Dismiss feels **physical** (pull away), not administrative (click X)  

**Test:** user can close without hunting chrome.

---

### 2. Feed remains editorial

- Content sections read as a **social landing page**, not an app dashboard  
- Drawers slide over the feed; feed context is not replaced by a new route  
- Story viewer, sections, and composer coexist in one continuous surface  

**Test:** closing drawer returns to same scroll context.

---

### 3. CTA never covers critical content

- Primary actions are reachable without content hidden beneath them  
- Scroll padding or pin semantics guarantee last meaningful content is readable  
- Checkout totals, time slots, form fields must scroll above pinned CTAs  

**Test:** worst-case content length on mobile 390×844.

---

### 4. Morph preserves spatial continuity

- Long-press item **travels** toward composer — not teleport  
- 480ms ease-out; user perceives one continuous motion  
- Context chip appears as destination of morph, not unrelated popup  

**Test:** morph.started → morph.completed ordering; no layout jump at end.

---

### 5. Scroll feels continuous

- Internal drawer scroll is smooth; no nested scroll traps  
- Pull-to-close only when at scroll top — otherwise content scrolls  
- Calendar time slots scroll into view above footer (barbearia)  

**Test:** flick scroll in long checkout form; drag only closes at top.

---

### 6. Composer never disappears silently

- If composer vanishes, user must infer **why** (checkout/booking active)  
- When drawer closes, composer **returns** without refresh  
- Hidden mode is intentional — not a bug or loading state  

**Test:** open/close checkout three times; composer always restores.

---

### 7. Transitions feel natural

| Transition | Target feel |
|------------|-------------|
| Sheet open | 300ms ease-out from bottom |
| Drag | Finger-following with slight resistance |
| Backdrop | Fades with pull — not binary flash |
| Morph | 480ms — neither sluggish nor snappy |
| Mode change | No flash of wrong composer state |

---

## Secondary invariants

| ID | Invariant |
|----|-----------|
| P-01 | Header cart badge updates immediately on add (restaurant, e-commerce) |
| P-02 | Feed drawer backdrop does not wash out immersive feed sheet |
| P-03 | Escape closes drawer without side effects on composer |
| P-04 | First AI message opens surface once — not on every send |
| P-05 | Vertical switch on `/demo` emits `feed.vertical.changed` |

---

## Verification

| Method | Coverage |
|--------|----------|
| Manual `/demo` walkthrough | All 6+ Stack A verticals |
| `pnpm qa:events` | Global event + morph + drawer + composer |
| Perceptual review | Before any Tier 1 core change |

---

## When invariants conflict with implementation

**Implementation yields.** Update code to match invariants — not the reverse.

If an invariant must change, require:

1. Human product GO  
2. Baseline version bump  
3. Update this document + affected specs  

---

## Related

- [`RUNTIME_CONSTITUTION.md`](./RUNTIME_CONSTITUTION.md)  
- [`DRAWER_BEHAVIOR_SPEC.md`](./DRAWER_BEHAVIOR_SPEC.md)  
- [`docs/os/EXPERIENCE_PHILOSOPHY.md`](../os/EXPERIENCE_PHILOSOPHY.md)  
