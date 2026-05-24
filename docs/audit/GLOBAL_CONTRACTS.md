# Global Contracts — Social Landing

**Propósito:** contratos mínimos de comportamento antes do Runtime Truth Mapping.  
**Natureza:** especificação observável — **não implementação**. Tier 1 não alterado por este documento.

---

## Princípios

1. **GLOBAL_REQUIRED** — violação = bug de plataforma  
2. **GLOBAL_OPTIONAL** — ausência OK se degrada sem quebrar UX  
3. **VERTICAL_SPECIFIC** — contrato local documentado na vertical  
4. Contratos descrevem **o que o usuário percebe**, não detalhes internos

---

## 1. PostCard behavior

### GLOBAL_REQUIRED

| Regra | Comportamento observável |
|-------|--------------------------|
| PC-01 | Tap abre feed drawer quando post está em seção `type: "content"` |
| PC-02 | Long-press (≥420ms) seleciona item no contexto conversacional |
| PC-03 | Long-press dispara morph card → composer quando elegível |
| PC-04 | Durante morph, composer oculta chips até `morph.completed` |
| PC-05 | PostCard em feed drawer é clicável para contexto (sem reabrir drawer) |

### GLOBAL_OPTIONAL

| Regra | Comportamento |
|-------|---------------|
| PC-O1 | Stats (likes/comments) visíveis — decorativo demo |
| PC-O2 | Autor avatar — quando dados existem |

### Morph eligibility

| Elegível | Não elegível |
|----------|--------------|
| PostCard em feed principal | Cards decorativos sem `ContextSelectable` |
| PostCard em feed drawer | Fragment/div custom sem wiring |
| Custom module com `onToggleConversationContext` + morph path | personal feed (sem PostCards) |

### Violações conhecidas

- appointment hero: contexto sem morph (PC-03)
- customContent Fragment: morph path Missing (PC-03)

---

## 2. Drawer behavior

### GLOBAL_REQUIRED

| Regra | Comportamento observável |
|-------|--------------------------|
| DR-01 | Abrir drawer não quebra scroll do feed após fechar |
| DR-02 | Fechar drawer restaura `body` scroll (overflow não preso) |
| DR-03 | Drawer de negócio emite `drawer.opened` / `drawer.closed` em `/demo` |
| DR-04 | Feed drawer open emite `surface.opened` com layer id estável |
| DR-05 | ESC / swipe / backdrop fecham drawer conforme componente |

### GLOBAL_OPTIONAL

| Regra | Comportamento |
|-------|---------------|
| DR-O1 | `composerMode: overlay` durante feed drawer — **recomendado** |
| DR-O2 | `composerMode: hidden` durante checkout/booking multi-step |

### VERTICAL_SPECIFIC

| Regra | Comportamento |
|-------|---------------|
| DR-V1 | Conteúdo e CTAs dentro do drawer são por vertical |
| DR-V2 | shadcn Drawer em stack B — contrato local até DD-01 |

### Violações conhecidas

- realestate: DR-02 (RU-01)
- stack B: DR-03, DR-04 Missing
- appointment feed: DR-O1 Missing (SD-01)

---

## 3. Composer behavior

### GLOBAL_REQUIRED

| Regra | Comportamento observável |
|-------|--------------------------|
| CP-01 | Composer visível no feed default |
| CP-02 | Modos: `default` \| `overlay` \| `hidden` |
| CP-03 | Context chips refletem seleção ativa |
| CP-04 | Input focus respeita keyboard mobile (visualViewport) |
| CP-05 | Morph in-flight: composer não mostra chips prematuramente |

### GLOBAL_OPTIONAL

| Regra | Comportamento |
|-------|---------------|
| CP-O1 | Placeholder/sugestões por vertical |
| CP-O2 | Modo overlay durante drawer — política por vertical |

### Violações conhecidas

- appointment feed drawer: runtime fica `default`, shadow espera `overlay`

---

## 4. Morph eligibility

### GLOBAL_REQUIRED

| Regra | Comportamento observável |
|-------|--------------------------|
| MF-01 | Morph só inicia após long-press válido em elemento elegível |
| MF-02 | Animação visível ≥1 frame antes de complete (Strict Mode safe) |
| MF-03 | Scroll/resize durante morph cancela com complete gracioso |
| MF-04 | `prefers-reduced-motion`: skip animação, complete imediato |
| MF-05 | Emite `morph.started` / `morph.completed` |

### Elegibilidade

```
ELEGÍVEL:
  PostCard + toggleConversationContextItemWithMorph
  Custom module wired via provider/cloneElement morph path

NÃO ELEGÍVEL:
  toggleConversationContextItem (sem queue morph)
  Tap (click) — abre drawer, não morph
  Elementos sem ContextSelectable wiring
```

### Violações conhecidas

- appointment hero: usa path não elegível
- Fragment customContent: wiring quebrado

---

## 5. CTA behavior

### GLOBAL_REQUIRED (demo observability)

| Regra | Comportamento |
|-------|---------------|
| CT-01 | Ações de contato instrumentadas emitem evento passivo quando usam helpers oficiais |
| CT-02 | CTA principal não bloqueia composer permanentemente |

### VERTICAL_SPECIFIC

| Regra | Comportamento |
|-------|---------------|
| CT-V1 | WhatsApp vs email vs form vs link externo |
| CT-V2 | Booking/cart/checkout flows |

### GLOBAL_OPTIONAL

| Regra | Comportamento |
|-------|---------------|
| CT-O1 | `SocialContactCTA` + `observeWhatsAppClicked` |

### Violações conhecidas

- realestate: `window.open` sem evento
- institutional: email only (by design)

---

## 6. Event behavior

### GLOBAL_REQUIRED (`/demo`)

| Regra | Eventos mínimos |
|-------|-----------------|
| EV-01 | `feed.vertical.changed` ao trocar vertical |
| EV-02 | `morph.started` / `morph.completed` em morph path |
| EV-03 | `context.item.selected` / `context.item.deselected` |
| EV-04 | `drawer.opened` / `drawer.closed` em ActionDrawer |
| EV-05 | `surface.opened` / `surface.closed` em surfaces instrumentadas |

### GLOBAL_OPTIONAL

| Regra | Eventos |
|-------|---------|
| EV-O1 | `whatsapp.clicked` |
| EV-O2 | Shadow compare logs (`surface.shadow.divergence`) |

### Gaps observacionais

- shadcn drawers: sem EV-04/EV-05
- realestate WhatsApp: sem EV-O1

---

## 7. Surface behavior

### GLOBAL_REQUIRED (conceptual)

| Regra | Comportamento |
|-------|---------------|
| SF-01 | Uma surface “ativa” por layer id em runtime instrumentado |
| SF-02 | Close normaliza layer id (shadow SD-02 — shadow only hoje) |

### DEV-only (shadow)

| Regra | Comportamento |
|-------|---------------|
| SF-D1 | Shadow nunca aplica estado ao runtime (`SURFACE_SHADOW_APPLY_TO_RUNTIME = false`) |
| SF-D2 | Divergências logadas para decisão antes de truth mapping |

### Violações conhecidas

- SD-01: appointment feed drawer composerMode
- SD-02: close id `feed:video:none` vs open com postId

---

## 8. Mobile behavior

### GLOBAL_REQUIRED

| Regra | Comportamento observável |
|-------|--------------------------|
| MB-01 | Viewport mobile (≤430px) — layout não quebra |
| MB-02 | Composer fixo bottom — não coberto por drawer incorretamente |
| MB-03 | Keyboard open — composer ajusta via visualViewport |
| MB-04 | Touch long-press funciona em PostCards |
| MB-05 | Drawer max-height ~90vh — conteúdo scrollável internamente |

### GLOBAL_OPTIONAL

| Regra | Comportamento |
|-------|---------------|
| MB-O1 | Safe area insets |

### Violações conhecidas

- realestate scroll lock pós-drawer (MB-02 adjacente)

---

## Matriz contrato × classificação

| Contrato | GLOBAL_REQUIRED | GLOBAL_OPTIONAL | VERTICAL_SPECIFIC |
|----------|-----------------|-----------------|-------------------|
| PostCard | PC-01–05 | PC-O1–O2 | — |
| Drawer | DR-01–05 | DR-O1–O2 | DR-V1–V2 |
| Composer | CP-01–05 | CP-O1–O2 | — |
| Morph | MF-01–05 | — | elegibilidade implícita |
| CTA | CT-01–02 | CT-O1 | CT-V1–V2 |
| Event | EV-01–05 | EV-O1–O2 | — |
| Surface | SF-01–02 | SF-D1–D2 | — |
| Mobile | MB-01–05 | MB-O1 | — |

---

## Uso no Runtime Truth Mapping

**Só mapear como “runtime truth” comportamentos que passam nestes contratos**, ou divergências explicitamente marcadas como VERTICAL_SPECIFIC / Needs design decision.

**Não promover a truth:**

- shadow divergences não resolvidas (SD-01, SD-02)
- stack B drawer events Missing
- morph paths Broken

---

## Referências

- `GLOBAL_BEHAVIOR_AUDIT.md`
- `VERTICAL_BEHAVIOR_MATRIX.md`
- `BEHAVIOR_FIX_PRIORITY.md`
