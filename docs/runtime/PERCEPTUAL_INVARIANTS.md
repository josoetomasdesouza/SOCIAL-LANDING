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

## Social vertical invariants (post–WS-06.5 / WS-07.5)

Apply to **Influencer** (WS-06.5) and **Institutional** (WS-07.5) converged social-style verticals. Personal remains Stack A but uses a portfolio pattern — see personal precedent. See [`INFLUENCER_BEHAVIOR_SPEC.md`](./INFLUENCER_BEHAVIOR_SPEC.md) and [`INSTITUTIONAL_BEHAVIOR_SPEC.md`](./INSTITUTIONAL_BEHAVIOR_SPEC.md).

### I-S1 — Social drawers stay editorial

- Link lists, media kit, and partnership surfaces read as **feed extensions**, not admin panels  
- No centered dialog chrome; bottom sheet only  
- Content tone: creator-native (metrics, CTAs, soft cards) — not enterprise CRM  

**Test:** open media kit — user still feels on a creator landing page.

### I-S2 — Media kit is not a corporate modal

- Single sheet with profile, metrics grid, one contact CTA  
- No multi-step wizard, no form-heavy onboarding inside drawer  
- External contact (`mailto:`) is acceptable; inline forms are not required for influencer  

**Test:** media kit passes "creator portfolio" smell test, not "SaaS settings panel".

### I-S3 — Collab flows preserve contextual continuity

- Parcerias cards open **related** commercial surface (media kit) without route change  
- Dismiss returns to same feed scroll and composer state  
- Collab intent never dead-ends (no orphan state without drawer)  

**Test:** tap parcerias card → media kit → Escape → still on Influencer feed with composer restored.

---

## Institutional vertical invariants (post–WS-07.5)

Apply to **Institutional** after WS-07 ActionDrawer convergence. See [`INSTITUTIONAL_BEHAVIOR_SPEC.md`](./INSTITUTIONAL_BEHAVIOR_SPEC.md).

### I-I1 — Institutional drawers stay mission-forward

- Contact, team, and project surfaces read as **NGO landing extensions**, not admin dashboards  
- No centered dialog chrome; bottom sheet only  
- Content tone: impact, outreach, transparency — not enterprise CRM or ticketing UI  

**Test:** open contact drawer — user still feels on an institutional landing page, not a support portal.

### I-I2 — Contact outreach is a single-sheet flow

- One form with name, email, phone, message — no multi-step wizard  
- Submit shows success state; auto-close after brief confirmation is acceptable  
- Mock submission (no backend) is accepted — behavior must not regress to broken or silent failure  

**Test:** submit contact → success icon → drawer closes → reopen shows fresh form.

### I-I3 — Project and team flows preserve feed continuity

- Project cards open detail drawer with status, image, and description — no route change  
- Team expansion drawer lists full roster; feed preview cards remain inline  
- Dismiss returns to same scroll context and composer `default` mode  

**Test:** tap Escola Verde → project drawer → Escape → still on Institucional feed with composer restored.

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
- [`INFLUENCER_BEHAVIOR_SPEC.md`](./INFLUENCER_BEHAVIOR_SPEC.md)  
- [`INSTITUTIONAL_BEHAVIOR_SPEC.md`](./INSTITUTIONAL_BEHAVIOR_SPEC.md)  
- [`docs/os/EXPERIENCE_PHILOSOPHY.md`](../os/EXPERIENCE_PHILOSOPHY.md)  
