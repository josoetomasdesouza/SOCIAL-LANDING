# Composer Behavior Spec — v2 Draft (WS-21 Hybrid)

**Status:** 🟡 **DRAFT** — aguardando review frozen zone (PR D2)  
**Runtime:** v1 permanece oficial até GO pós-P3 + merge deste draft  
**Baseline:** `433cbba` (PR #86 — WS-21 D1)  
**Autoridade:** subordinado a [`WS-21_COMPOSER_HYBRID_ARCHITECTURE_ADR.md`](../audit/WS-21_COMPOSER_HYBRID_ARCHITECTURE_ADR.md)  
**Supersedes (parcial):** [`COMPOSER_BEHAVIOR_SPEC.md`](COMPOSER_BEHAVIOR_SPEC.md) v1 — cláusulas listadas em §16  
**Referências:** Challenge Review · P0/P1 Plan · P0 Paper · [`composer-continuity-contract-v2-delta.md`](../ai-handoffs/composer-continuity-contract-v2-delta.md)

```txt
Este documento descreve COMPORTAMENTO — não implementação.
Implementação pertence a R0+ (após G0).
Não autoriza alteração de runtime enquanto status = DRAFT.
```

---

## 0. Metadados

| Campo | Valor |
|-------|-------|
| **Iniciativa** | WS-21 — Composer Hybrid (Sticky + Thread In-Flow) |
| **Versão spec** | v2 draft |
| **Piloto runtime** | Appointment (`/demo`) + flag `composer-layout=v2` — **futuro** |
| **Fora de escopo** | Kernel, resolver copy, LLM, WS-20, redesign visual global |
| **Emotional target** | *“Continuei no mesmo lugar social — só começou uma conversa no fim.”* |

---

## 1. Philosophy

The composer remains a **persistent conversational input surface** at the bottom of the feed — not a chat widget bolted on.

**v2 reframe:** the composer is **not** the conversation container. It is:

```txt
sticky input + context chip rail + morph target
```

Conversation **turns** live in a **thread in-flow** — an extension of the editorial column, not a panel over it.

The system participates in operational deferrence via frozen modes:

- **`default`** — sticky visible; thread visible when engaged  
- **`overlay`** — sticky above feed drawer; thread **hidden**  
- **`hidden`** — sticky and thread absent; drawers breathe  

**Feed-first rule:** first paint = editorial presence (hero, stories, sections). Conversation does not occupy the fold until the user engages.

**Rejected alternatives (ADR):** inline pure ChatGPT; expansive composer sheet (~90vh) as terminal state.

---

## 2. Spatial model

### 2.1 Three layers (page column)

```txt
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — FEED EDITORIAL                                │
│  intro · hero · stories · sections                       │
│  · page scroll                                           │
│  · first paint = social presence                         │
└─────────────────────────────────────────────────────────┘
                          │
           engagement gate (§3.2)
                          ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 2 — THREAD IN-FLOW                                │
│  · inside `<main>`, after last editorial section         │
│  · before site footer                                    │
│  · same max-width column as feed                         │
│  · page scroll — NO internal scroll container            │
└─────────────────────────────────────────────────────────┘
                          │
                    always above
                          ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 3 — COMPOSER STICKY (viewport fixed bottom)       │
│  · compact height (~62px idle, ~124px with chip rail)    │
│  · smoke-fume compact material                           │
│  · chip rail + input + send                              │
│  · morph target — height STABLE when engaged             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Placement rules (A7 — P0)

| Rule | Requirement |
|------|-------------|
| Thread anchor | **After** last `BusinessSection` in `<main>`, **before** `BusinessFooter` |
| Thread width | Same column as feed (`max-w-lg` → `lg:max-w-[600px]`) |
| Composer | Fixed/sticky viewport bottom; **never** inside thread |
| Morph target | **Never** on thread — only on sticky shell |
| Footer | Thread may push footer down; footer remains reachable via page scroll |

### 2.3 Feed ↔ thread junction (A1 — P0)

The transition from editorial feed to conversation thread MUST NOT use:

- A card titled “Chat” / “Assistente”  
- A 90vh boxed panel  
- Full-page dim mask over the feed  

The transition SHOULD use:

- Continuity of column and typography  
- Optional **local** smoke-fume gradient (~80–120px) at the junction (smoke v2 — §9)  
- No header bar separating “app modes”

---

## 3. Thread in-flow contract

### 3.1 Ownership

| Concern | Owner |
|---------|-------|
| Message list rendering | Thread zone (in-flow) |
| Message state / typing | Conversation runtime (implementation detail — not spec) |
| Scroll of turns | **Page** (`document` / main column) |
| Visual blocks (transacional) | Rendered in thread; heavy actions may open drawers (product policy) |

### 3.2 Engagement gate

Thread zone is **absent or empty** until:

```txt
isConversationSessionActive === true
```

Typically triggered by the user’s **first send** in the session. Pre-send states:

- Idle: no thread  
- Post-morph with chip: no thread (chip lives on sticky shell only)

**Rule:** morph alone does **not** open the thread.

### 3.3 Turn rendering

| Element | Behavior |
|---------|----------|
| User turns | Right-aligned bubbles; existing typography |
| AI turns | Left-aligned; existing typography — **not** boxed as separate app |
| Typing indicator | In thread, above sticky composer clearance |
| `context_event` rows | In thread on first appearance; chips persist on sticky rail |
| Visual blocks | In thread under AI turn; drawer triggers unchanged |

**Max width:** bubbles ~78% column width (preserve v1 ratio).

### 3.4 Growth & history

- Thread grows **downward** in document flow (pushes footer).  
- New turns append; page scroll brings latest turn into view after AI reply.  
- `localStorage` history policy: **unchanged** from v1 until separate WS.  
- Thread content survives mode transitions except **overlay/hidden** visibility rules (§6).

### 3.5 Explicit prohibitions

- No `overflow-y: auto` scroll container for the thread  
- No snap heights for thread  
- No drag handle on thread  
- No thread inside `[data-conversation-composer]`  
- No morph target attributes on thread nodes

---

## 4. Sticky composer contract

### 4.1 Role

The sticky shell is **input chrome only** when engaged:

```txt
context chip rail (when applicable) + avatar + text field + send
```

It is **not** a conversation transcript.

### 4.2 DOM contract

| Attribute / token | Element | Purpose |
|-------------------|---------|---------|
| `data-conversation-composer="true"` | Sticky shell | Clearance measurement; morph fallback rect |
| `data-conversation-context-rail="true"` | Chip rail | Layout measurement |
| `data-conversation-context-chip` | Context chips | Morph target |
| `data-conversation-context-chip-target` | Hidden measurement chips | Morph fallback |
| `data-conversation-thread-anchor="true"` | Thread zone in `<main>` | Portal/render target (implementation) |
| `--composer-scroll-clearance-px` | `:root` | Padding for sticky footprint only |

### 4.3 Height stability

| State | Expected footprint |
|-------|-------------------|
| Idle | ~62px (input row + padding) |
| Chip rail visible | ~124px (chip + input) |
| Engaged multi-turn | **Same as chip state** — shell does **not** grow with messages |

**Prohibited:** expand-on-AI-reply; expand-on-first-message; snap to 90vh.

### 4.4 Surface material (smoke-fume)

| State | Material |
|-------|----------|
| Idle / compact | `smoke-fume` flat glass pill — **unchanged** identity |
| Engaged | Compact shell remains; junction gradient on thread side (§9) |
| Full-page mask z-29 | **Off or minimal** when thread engaged (feed must remain readable) |

### 4.5 Chip rail

- Chips appear after morph or long-press selection.  
- Chips stay on sticky shell **during** conversation — not duplicated as primary UI in thread.  
- Removing chip removes corresponding `context_event` from history (v1 behavior).

### 4.6 Clearance & metrics

Published via `ConversationSelectionContext.setComposerScrollMetrics`:

| Metric | v2 definition |
|--------|---------------|
| `composerCompactFootprintPx` | Viewport bottom → **sticky shell top** (compact only) |
| `composerBottomInsetPx` | Shell bottom → viewport bottom |
| `composerScrollClearancePx` | `footprint + bottomInset` |

**Rule:** thread in-flow height is **excluded** from footprint. Thread is page content, not overlay clearance.

Functions in `composer-scroll-clearance.ts` retain names; semantics align to compact shell (§16 supersession).

---

## 5. Monoscroll contract

### 5.1 Principle

One primary scroll axis for the social column:

```txt
page scroll = feed + thread
```

The sticky composer does not scroll. Drawers retain **their own** internal scroll (distinct surface — glossary §17).

### 5.2 User gestures

| Gesture | v2 result |
|---------|-----------|
| Swipe up/down on feed | Scrolls feed sections |
| Swipe on thread | Continues same page scroll |
| Swipe on sticky composer | No scroll (fixed) |
| Swipe inside feed drawer | Drawer internal scroll only |

**Fail condition (S-06):** scroll-in-scroll between page and composer message body.

### 5.3 Scroll-to-turn

After AI reply completes, the system SHOULD scroll the page so the latest turn is visible above the sticky composer — **without** expanding the shell.

**Rule (A8 — P0):** after many turns, user MUST be able to scroll **up** to hero and editorial sections without trap. No auto-scroll lock that prevents reaching feed.

### 5.4 Collapsed substitute (A2 — P0)

v1 **collapsed / compact-resume-preview** is **deprecated**.

| v1 affordance | v2 substitute |
|---------------|---------------|
| Drag down to minimize chat | Scroll up → feed editorial |
| Collapsed preview of last message | Thread remains in document; scroll reveals |
| “Minimize but keep session” | Sticky composer pill stays; optional future badge “conversa ativa” (**TBD** — not blocking D2) |

Dismiss session entirely: existing close-conversation / clear context flows (vertical policy).

---

## 6. Modes × thread visibility

Mode literals **unchanged:** `default` | `overlay` | `hidden`

### 6.1 Matrix

| Mode | Sticky shell | Thread in-flow | Footprint metrics | z-index shell |
|------|--------------|----------------|-------------------|---------------|
| `default` | Visible | Visible when engaged | Published (compact) | z-30 (or z-60 if feed drawer open without overlay promotion — v1 ref) |
| `overlay` | Visible | **Hidden** (A3) | Published (compact) | z-[70] |
| `hidden` | Hidden | **Hidden** | **0** (skip publish) | — |

### 6.2 Transition rules

| Event | Mode | Thread |
|-------|------|--------|
| Feed drawer opens | → `overlay` (save prior) | Hide |
| Feed drawer closes | → restore saved | Restore if engaged |
| ActionDrawer checkout / arrival / booking datetime | → `hidden` | Hide |
| Drawer closes / effect cleanup | → `default` or prior | Restore if engaged |
| Story viewer | Per feed logic | Typically n/a |

**Restore invariant:** closing a drawer MUST restore composer mode **and** thread visibility consistent with engaged state — no silent loss of history.

### 6.3 Overlay note (ADR §7.4)

ADR allows thread “paused or scrollable behind” drawer. **v2 spec chooses hide** for overlay (P0/P1 decision — lower perceptual risk). Revisit post-P3 only with observation evidence.

---

## 7. Morph interaction

**Unchanged in essence** — target remains sticky shell.

| Step | Behavior |
|------|----------|
| Long-press PostCard (420ms) | `morph.started` |
| Morph in flight | Layer z-65; target rect on sticky shell |
| Morph complete (480ms) | Context item added; chip visible on shell |
| Thread | Does **not** open on morph alone |

Morph duration **480ms** — shell must not jump; chip rect stable at completion.

---

## 8. Contextual persistence

Inherited from v1 without semantic change:

| Feature | Behavior |
|---------|----------|
| Context items | Chips from morph / long-press |
| Provider | `ConversationSelectionProvider` per feed |
| Toggle | Long-press adds/removes |
| Resolver / placeholder | Vertical props — not core spec change |
| History key | `business-conversation-history:{brand}` |

---

## 9. Smoke-fume v2 (A6 — P0)

### 9.1 Supersedes P-06a expanded clause

v1 tied material drama to **sheet height** (`expansionProgress`).

v2 signal:

```txt
threadEngagedProgress ∈ [0, 1]
```

Derived from thread visibility / first in-flow expansion — **not** from shell height.

### 9.2 Material rules

| Progress | Surface |
|----------|---------|
| 0 | Compact smoke-fume shell only |
| (0, 1] | Local gradient at feed↔thread junction (~80–120px) |
| 1 | Full engaged; **no** full-page dim |

Compact shell material at progress 0: **indistinguishable** from v1 idle (S-07).

---

## 10. Feed integration matrix

Inherited from v1 — mode **policy** unchanged; thread visibility per §6.

| Feed event | Composer mode | Thread |
|------------|---------------|--------|
| Feed drawer opens | → `overlay` | Hide |
| Feed drawer closes | → restore | Restore if engaged |
| ActionDrawer checkout open | → `hidden` | Hide |
| ActionDrawer closes | → `default` | Restore if engaged |
| Story viewer | Per feed | Per feed |

Vertical-specific `composerMode` writers: **do not unify** (12 feeds).

---

## 11. Instrumentation

### 11.1 Existing events (retained)

| Event | When |
|-------|------|
| `composer.mode.changed` | Mode transition |
| `morph.started` / `morph.completed` | Long-press morph |

### 11.2 `ai.surface.opened` — semantic update (A4)

| | v1 runtime semantics | v2 spec semantics |
|---|-------------------|-------------------|
| **Trigger** | First message; often coincided with sheet expand | **First time thread in-flow becomes visible** in session |
| **Meaning** | “AI conversation surface opened” | “Conversation thread opened in feed column” |
| **Not** | Sheet snap to expanded | Shell height change |

Event name **retained** (add-only compatibility). Implementations MUST NOT fire on sheet expand in v2 path.

### 11.3 Add-only (WS-21)

| Event | When |
|-------|------|
| `composer.thread.inflow.opened` | First thread zone render with ≥1 turn |
| `composer.sheet.expansion.deprecated` | Temporary — v1 path only during pilot |

---

## 12. Expected behavior checklist (v2)

### Load & idle
- [ ] Composer visible on feed load (default vertical)  
- [ ] Hero + editorial dominate fold — no thread  
- [ ] Composer compact (~62px) — not separate app  

### Engagement
- [ ] First send opens thread in-flow after sections  
- [ ] Shell stays compact (~124px with chip)  
- [ ] No full-page dim over feed  
- [ ] `ai.surface.opened` fires on thread first visible — not on shell expand  

### Monoscroll
- [ ] Single page scroll through feed + thread  
- [ ] No scroll inside composer for messages  
- [ ] User can scroll up to hero after multi-turn  

### Modes
- [ ] Checkout/arrival: composer **hidden**, not obscured  
- [ ] Hidden → footprint 0  
- [ ] Feed drawer: overlay; thread hidden; composer above drawer  
- [ ] Drawer close restores mode + thread without reload  

### Morph
- [ ] Long-press → morph 480ms → chip on sticky  
- [ ] Morph target not (0,0) @ 320/390  

### Clearance
- [ ] Pinned CTA aligns when composer hidden  
- [ ] Overlay: last feed line visible above composer  
- [ ] No hard-coded clearance px in feeds  

### Anti-silent-failure
- [ ] No silent disappearance (hidden without drawer = bug)  

---

## 13. Anti-patterns (v2)

Inherited from v1:

- Composer visible under pinned checkout CTA  
- `hidden` without restore on unmount  
- Hard-coded clearance px in feeds  
- Adding composer mode from instrumentation scripts  

**Added v2:**

- Thread inside sticky shell  
- Sheet expand / 90vh conversation panel  
- Scroll-in-scroll (page + composer body)  
- Full-page dim on engaged conversation  
- Header/card labeled “Chat assistant” breaking feed continuity  
- Morph target on thread nodes  
- Footprint includes thread height  
- `ai.surface.opened` on shell height change  

---

## 14. Allowed evolution (v2 era)

- New `placeholder` / `contextItems` per vertical  
- Resolver via props without altering spatial model  
- Metric publishing bugfixes with qa:events  
- `threadEngagedProgress` tuning after smoke captures  
- Piloto flag `composer-layout=v2` on Appointment only  
- Badge “conversa ativa” on sticky (**TBD**)  

---

## 15. Frozen (GO required)

From v1 — **still frozen:**

- Mode literal additions (`default` \| `overlay` \| `hidden`)  
- z-index **relative** order (morph · composer · drawer · story)  
- Shell `pb-4` / compact footprint geometry  
- Skip-publish-when-hidden semantics  
- Morph timings 480ms / long-press 420ms  
- Chip / morph `data-*` protocol on sticky shell  
- Drawer scroll-lock pattern (ActionDrawer / FeedDrawer — **drawer** sheet)  
- 12 vertical `composerMode` policies — adapt consumption only  

**New frozen (v2):**

- Thread anchor placement (after sections, before footer)  
- Monoscroll (no internal thread scroll)  
- Shell height stable when engaged  
- Thread hidden @ `overlay` and `hidden`  

---

## 16. Deprecated (v1 → do not implement in v2 path)

| ID | v1 behavior | v2 status |
|----|-------------|-----------|
| D-01 | Sheet body expand to ~90vh | **Deprecated** |
| D-02 | Snap `[compact, medium, expanded]` | **Deprecated** |
| D-03 | Drag handle height control | **Deprecated** |
| D-04 | Internal thread scroll in shell | **Deprecated** |
| D-05 | Full-page composer mask when engaged | **Deprecated** |
| D-06 | `collapsed` / `compact-resume-preview` | **Deprecated** |
| D-07 | Auto-grow / ResizeObserver for shell height | **Deprecated** |
| D-08 | `expansionProgress` from sheet height (P-06a expanded) | **Superseded** by `threadEngagedProgress` |
| D-09 | Semantics: composer = conversation room | **Superseded** by input + in-flow thread |

Runtime v1 may retain these behind `composer-layout=v1` until G3.

---

## 17. Glossary (A5)

| Term | Meaning |
|------|---------|
| **Composer sticky shell** | Fixed bottom input surface — `[data-conversation-composer]` |
| **Thread in-flow** | Message turns in main column document flow |
| **Composer sheet (deprecated)** | v1 expandable message container — **not** WS-21 target |
| **Drawer sheet** | ActionDrawer / BusinessFeedDrawer — **unchanged**, unrelated to WS-21 |
| **Engaged** | Session active with ≥1 user send; thread may be visible |
| **Compact footprint** | ~62–124px sticky height — only clearance contributor |

---

## 18. Supersession map (v1 → v2)

| v1 clause (COMPOSER_BEHAVIOR_SPEC) | v2 clause | Action |
|-----------------------------------|-----------|--------|
| Philosophy — “participates in layout” | §1 Philosophy — input surface + thread | **Reframe** |
| DOM — composer shell only | §4.2 DOM + thread anchor | **Extend** |
| Visibility default | §6 + §4 | **Extend** (thread) |
| Clearance metrics | §4.6 | **Narrow** (compact only) |
| Morph — second message / ai.surface | §7 + §11.2 | **Redefine** event semantics |
| Expected checklist | §12 | **Replace** sheet items |
| Instrumentation ai.surface.opened | §11.2 | **Redefine** |
| (implicit v1 runtime sheet) | §3, §5, §16 | **New** explicit |
| Modes table | §6 | **Extend** |
| Feed integration | §10 | **Extend** |
| Anti-patterns | §13 | **Extend** |
| Frozen | §15 | **Extend** |
| Allowed evolution | §14 | **Extend** |

Full continuity-contract supersession: [`composer-continuity-contract-v2-delta.md`](../ai-handoffs/composer-continuity-contract-v2-delta.md).

---

## 19. P0 adjustments incorporated

| ID | Adjustment | Spec section |
|----|------------|--------------|
| A1 | Junction feed↔thread — local gradient, no “Chat” card | §2.3 |
| A2 | Collapsed substitute — scroll up | §5.4 |
| A3 | Overlay hides thread | §6.1 |
| A4 | `ai.surface.opened` = thread visible | §11.2 |
| A5 | Glossary composer sheet vs drawer sheet | §17 |
| A6 | P-06a → `threadEngagedProgress` | §9 |
| A7 | Anchor after sections, before footer | §2.2 |
| A8 | Multi-turn — scroll up to hero allowed | §5.3 |
| A9 | Continuity checklist delta | companion delta doc §4 |

---

## 20. GO boundary

| Milestone | Spec role |
|-----------|-----------|
| **D2 merge** | Behavior contract draft official in repo |
| **G0** | D1 + D2 + P0 paper approved |
| **R0+** | Implementation must conform to this spec |
| **G3** | Promote v2 draft → official; deprecate v1 header |

**This draft does not authorize code changes.**

---

*COMPOSER_BEHAVIOR_SPEC v2 DRAFT · WS-21 · Baseline `433cbba` · Behavior only · No runtime.*
