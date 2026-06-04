# Perceptual Invariants — Tier 1 Runtime

**Status:** ✅ Official post–WS-02.5 (runtime v1) · **WS-21 emendas** P-04, P-06a abaixo  
**Baseline:** `673395d`  
**WS-21:** Alinhado a [`COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md`](COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md) · ADR [`WS-21`](../audit/WS-21_COMPOSER_HYBRID_ARCHITECTURE_ADR.md)

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
| P-04 | First AI message opens conversation thread in-flow once (`ai.surface.opened`) — not on every send; **not** composer sheet expansion |
| P-05 | Vertical switch on `/demo` emits `feed.vertical.changed` |
| P-06 | Composer smoke surface: compact flat glass on sticky shell; engaged junction gradient (WS-21); inner transparent; minimal page mask when thread active |

---

## Composer surface (post–WS-13)

Production default: **vidro fumê escuro** (`smoke-fume`). Tokens: `lib/ui/composer-surface-material.ts`.

### P-04 — Conversation thread opens once per session

**Event:** `ai.surface.opened` (name unchanged — semantics updated WS-21)

| | v1 runtime (deprecated path) | v2 spec (WS-21 hybrid) |
|---|------------------------------|-------------------------|
| **Trigger** | First message; often coincided with composer sheet expand | **First time thread in-flow becomes visible** after user send |
| **Means** | “AI surface opened” | “Conversation thread opened in feed column” |
| **Must not trigger on** | Every subsequent send | Shell height change or sheet snap |

- Fires **once** per conversation session when the thread zone first renders with engagement — not on every AI reply  
- Morph alone does **not** open the thread and must **not** fire this event  
- Implementations on `composer-layout=v2` MUST NOT fire on composer sheet expansion (deprecated)

**Test:** send first message → single `ai.surface.opened`; send second → no duplicate. On v2: event correlates with thread in-flow visible, not sticky shell growing.

---

### P-06 — Material lives on the shell only

- Outer sticky `<section>` carries blur + tint; **inner surfaces stay transparent** when smoke is active  
- No opaque layers inside the composer that kill the glass read  
- Page mask: **open fade** at idle; **minimal or off** when thread in-flow is engaged (feed must remain readable — WS-21 feed-first)

**Test:** scroll feed behind composer on `/demo` — content reads through compact glass. When thread engaged (v2): feed above thread stays legible; no full-page dim.

### P-06a — Compact shell vs engaged thread (WS-21)

Supersedes v1 “compact vs expanded **sheet**” semantics. See [`COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md`](COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md) §9.

| State | When | Material |
|-------|------|----------|
| **Compact** | Sticky shell idle or with chip rail; **no** thread in-flow visible | Flat dark glass `rgba(10,14,20,0.82)`, blur ~18–22px — **no gradient** on shell |
| **Engaged junction** | Thread in-flow visible (`threadEngagedProgress` > 0) | **Local** smoke gradient (~80–120px) at feed↔thread junction — not on 90vh panel |
| **Progress signal** | `threadEngagedProgress` 0→1 as thread appears / first turns render | Junction blur and gradient interpolate — **not** `expansionProgress` from sheet height |

**Deprecated v1 (composer-layout=v1 only until G3):** expanded sheet at max height; `expansionProgress` from snap/drag/auto-grow; full-page mask intensifying with sheet height.

**Preserved perceptual intent:** compact = integrated pill; engaged = material drama at the **boundary** between editorial feed and conversation — without turning the composer into a chat app panel.

**Test (v2):** first send → thread appears after editorial sections; junction gradient may appear; sticky shell stays compact (~124px with chip). Scroll up → feed editorial still reachable. No 90vh sheet; no scroll-in-scroll.

**Test (v1 path, until removed):** open chat — gradient on shell expand; collapse to pill — compact glass. v1 tests sunset at G3.

### P-06b — Opt-out is explicit, not silent

- Baseline solid bar (`off`) only via `?composer-smoke=off`, `localStorage`, or `NEXT_PUBLIC_COMPOSER_SMOKE_EXPERIMENT=off`  
- Default absence of override **must not** revert to baseline  

**Test:** fresh session on `/demo` → Agendamento → composer shows smoke-fume without query param.

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

- [`COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md`](COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md) — WS-21 hybrid behavior (draft)  
- [`RUNTIME_CONSTITUTION.md`](./RUNTIME_CONSTITUTION.md)  
- [`DRAWER_BEHAVIOR_SPEC.md`](./DRAWER_BEHAVIOR_SPEC.md)  
- [`INFLUENCER_BEHAVIOR_SPEC.md`](./INFLUENCER_BEHAVIOR_SPEC.md)  
- [`INSTITUTIONAL_BEHAVIOR_SPEC.md`](./INSTITUTIONAL_BEHAVIOR_SPEC.md)  
- [`docs/os/EXPERIENCE_PHILOSOPHY.md`](../os/EXPERIENCE_PHILOSOPHY.md)  
