# Checkout Patterns — Official Stack A

**Status:** ✅ Official post–WS-02.5  
**Baseline:** `673395d` (PR #52)

---

## Approved patterns

### Pattern A — `onRegisterFooter` (preferred commerce)

```txt
Feed state: checkoutDrawerFooter
     ↓
CheckoutFlow(onRegisterFooter={setCheckoutDrawerFooter})
     ↓
useEffect registers footer node; cleanup → null
     ↓
ActionDrawer footer={checkoutDrawerFooter}
     ↓
composerMode === "hidden" → pinned footer
```

**Used by:** e-commerce, courses, events, gym, realestate (visit).

### Pattern B — `footer` prop (health)

```txt
ProfessionalDrawer → ActionDrawer footer={...CTA...}
composerMode hidden while open
```

**Used by:** health professional booking.

### Pattern C — Header cart (restaurant + e-commerce)

```txt
BusinessSocialLanding(
  onHeaderCartClick={() => setCartDrawerOpen(true)}
  headerCartCount={n}
)
```

Cart/checkout drawers use Pattern A internally.

**Restaurant-specific:** fixed bottom “Ver pedido” bar **removed** — header cart only.

---

## Pinned CTA rules

| Rule | Detail |
|------|--------|
| Trigger | `composerMode === "hidden"` + `footer` present |
| Position | Fixed; bottom inset matches composer send slot |
| Scroll | Content padding = footer height + inset |
| Measurement | `ResizeObserver` on pinned footer |
| Cleanup | `onRegisterFooter(null)` on unmount |

### CTA content standards

- Primary action: full-width `Button`, `h-12` typical  
- Price summary above CTA when applicable  
- Disabled state when form incomplete (barbearia, health)  

---

## Vertical matrix

| Vertical | Entry | Checkout component | Footer pattern | Cart |
|----------|-------|------------------|----------------|------|
| E-commerce | Product drawer | `EcommerceCheckout` | A | Header cart |
| Restaurante | Item drawer | Inline checkout steps | A | Header cart |
| Barbearia | Agendar | Calendar in drawer | B-like inline + confirm step | — |
| Gym | Plan CTA | `GymSignupForm` | A | — |
| Imóveis | Property | `ScheduleVisitForm` | A | — |
| Saúde | Professional | Calendar in drawer | B | — |
| Cursos | Course | `CourseCheckout` | A | — |
| Eventos | Ticket | `TicketCheckout` | A | — |

---

## Acceptable differences by vertical

| Difference | Acceptable? | Notes |
|------------|-------------|-------|
| Inline footer vs pinned | Only when composer not hidden | Hidden → must pin |
| Multi-step checkout | ✅ | Restaurant address → payment → confirm |
| Separate confirmation drawer | ✅ | Health, barbearia after book |
| WhatsApp CTA in feed | ✅ | Not checkout — separate instrumentation |
| Stack B checkout | ❌ until migration | Influencer/institutional |

---

## Cart behavior

| Vertical | Cart access | Drawer |
|----------|-------------|--------|
| E-commerce | Header icon + badge | `CartDrawer` → checkout Pattern A |
| Restaurante | Header icon + badge | Same pattern; no bottom bar |
| Others | N/A or vertical-specific | — |

---

## composerMode lifecycle (checkout)

```txt
open checkout drawer → setComposerMode("hidden")
close checkout drawer → setComposerMode("default") + setComposerOffsetClassName(undefined)
unmount feed effect cleanup → restore default
```

**Invariant:** offset class cleared on close (hygiene from #52 batch).

---

## Barbearia — scroll + confirm

| Step | Pattern |
|------|---------|
| Booking drawer | Calendar with `autoScrollToTimes: true` |
| Date selected | Times scroll above pinned “Confirmar agendamento” |
| After confirm | Confirmation drawer / step |

Implementation: `scroll-into-view-with-bottom-inset.ts` + pinned footer height query.

---

## Validation per vertical

| Vertical | Validate |
|----------|----------|
| E-commerce | Product → cart → checkout; CTA not covering totals |
| Restaurante | Add item → header badge → checkout |
| Barbearia | Date → times visible → confirm |
| Gym | Signup CTA pinned |
| Imóveis | Visit form CTA pinned |
| Saúde | Professional footer pinned |

---

## Anti-patterns

- Checkout with composer still `default` (CTA fights composer)  
- Footer inside sheet **and** pinned duplicate  
- Bottom fixed cart bar on restaurant (regression)  
- Missing `onRegisterFooter(null)` cleanup  

---

## Future migrations

When influencer/institutional migrate (WS-06/07):

- Must adopt Pattern A or B semantics  
- Must not introduce third footer model  
- Re-validate against this doc  
