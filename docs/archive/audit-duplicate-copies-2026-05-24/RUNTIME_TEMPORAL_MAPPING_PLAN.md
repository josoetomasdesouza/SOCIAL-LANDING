# Runtime Temporal Mapping Plan — Social Landing

**Data:** 2026-05-23  
**Baseline:** `main` @ `e002921`  
**Natureza:** plano de observação temporal — **não implementação**

> O runtime real é **time-oriented**. Snapshots de estado capturam instantes; UX emerge de **sequências**, **overlaps** e **janelas de interrupção**.

---

## Objetivo

Complementar `RUNTIME_STATE_MAP.md` (state-oriented) com mapa **causal e temporal** antes de Runtime Truth Mapping completo.

**Saída futura:** `RUNTIME_TEMPORAL_MAP.md` (preencher após sessões DEV com timeline).

---

## Por que temporal mapping agora

| Fenômeno | Por que snapshot falha |
|----------|------------------------|
| composerMode priority | Feed BSL vs vertical useEffect competem em ms |
| Morph cancel | Scroll event interrompe RAF mid-flight |
| Drawer close id SD-02 | Close emite antes de state null settle |
| Strict Mode DEV | Double mount reordena open/close |
| Keyboard | visualViewport lag vs composer measure |
| Backdrop race | Tap backdrop vs drawer animation |

---

## Dimensões a mapear

### 1. Causal chains

Documentar cadeias causa→efeito observáveis:

```
long-press (420ms)
  → rememberMorphSource (module, TTL 1800ms)
  → toggleConversationContextItemWithMorph
  → queueMorph (BSL)
  → morph.started (useLayoutEffect)
  → RAF ~480ms
  → morph.completed
  → chips visible
```

**Método:** Event Debug Panel + `__SURFACE_SHADOW__.getTimeline()` — export JSON por sessão.

**Prioridade chains:**

| ID | Chain | Vertical test |
|----|-------|---------------|
| TC-01 | long-press → morph → chip | ecommerce |
| TC-02 | tap PostCard → feed drawer → composer overlay | appointment |
| TC-03 | product tap → ActionDrawer → overlay | ecommerce |
| TC-04 | checkout open → hidden → close → restore | ecommerce |
| TC-05 | booking → hidden → complete | appointment |
| TC-06 | Stack B drawer → bridge events | personal contact |

---

### 2. Event ordering

Registrar ordem **strict** esperada vs observada:

| Sequência | Ordem esperada | Tolerância |
|-----------|----------------|------------|
| Feed drawer open | `drawer.opened` → `surface.opened` → `composer.mode.changed` | sync (<16ms) |
| Feed drawer close | `drawer.closed` → `surface.closed` → composer restore | sync |
| Morph | `context.item.selected` → `morph.started` → `morph.completed` | started before first paint |
| Vertical switch | `feed.vertical.changed` → (cleanup effects) | unmount order matters |

**Ferramenta:** timestamp ISO em event bus envelope — diff manual ou script.

---

### 3. Interrupt windows

Janelas onde interrupção é **válida** vs **bug**:

| Janela | Duração | Interrupção válida | Comportamento |
|--------|---------|-------------------|---------------|
| Morph RAF | ~480ms | scroll, resize, viewport | cancel + morph.completed |
| Drawer enter animation | ~300ms | second open same id? | investigar duplicate |
| composerMode transition | 1 frame–300ms | competing setComposerMode | priority rules |
| Long-press threshold | 420ms | finger move cancel | no morph |
| Morph source TTL | 1800ms | second long-press | replace source |

---

### 4. Animation overlap

| Overlap | Permitido? | Notas |
|---------|------------|-------|
| morph + drawer open | ❌ investigar | composer z-index conflict |
| morph + composer drag | ⚠️ | drag should cancel morph? |
| feed drawer + ActionDrawer | ⚠️ | realestate multi-drawer |
| story viewer + composer | ✅ | z-100 vs z-30/60/70 |
| morph + chip rail measure | ✅ | chips hidden CP-05 |

---

### 5. Ownership transfer timing

| Recurso | De | Para | Trigger | Latência |
|---------|-----|------|---------|----------|
| composerMode | feed useEffect | BSL feedDrawer effect | drawer open | documentar |
| scroll lock | drawer A | drawer B | sequential open | race risk |
| morph source | ContextSelectable | MorphLayer | long-press | module sync |
| context chip | card | composer rail | upsert | React commit |

---

### 6. Stale event tolerance

| Evento | Stale quando | Tolerância |
|--------|--------------|------------|
| `composer.mode.changed` from===to | dedupe | 0 — suppressed |
| `drawer.closed` id mismatch SD-02 | postId null on close | shadow normalizes |
| `morph.completed` after unmount | Strict Mode | DEV only |
| `feed.vertical.changed` | events after unmount | ignore |

---

### 7. Cancellation behavior

| Ação | Cancela | Emite |
|------|---------|-------|
| Scroll during morph | RAF | morph.completed |
| Resize during morph | RAF | morph.completed |
| Reduced motion | animation | morph.completed immediate |
| Remove context mid-morph | ? | investigar |
| Close drawer during morph | ? | investigar |

---

### 8. Backdrop race

| Drawer | Backdrop fecha? | Timing |
|--------|-----------------|--------|
| BusinessFeedDrawer mobile | ⚠️ often no | documentar |
| ActionDrawer | yes | sync |
| shadcn Stack B | vaul default | documentar per drawer |

**Teste:** tap backdrop at 0ms, 150ms, 300ms after open.

---

### 9. Keyboard timing

| Fase | Evento | Efeito |
|------|--------|--------|
| focus input | visualViewport resize | composer measure |
| blur | viewport restore | sheet height snap |
| morph + keyboard | overlap | investigar jump |

**Device físico obrigatório** para validação final.

---

### 10. Mobile scroll sequencing

| Sequência | Risco |
|-----------|-------|
| drawer open → body overflow hidden → feed scroll locked | expected |
| drawer close → overflow "" → feed scroll | expected |
| drawer open → user scrolls feed behind | should not scroll |
| iOS Safari bounce | investigar |

---

### 11. Morph start/completion timing

| Milestone | Emission point | Pixel sync |
|-----------|----------------|------------|
| morph.started | useLayoutEffect | before paint |
| first RAF frame | ~16ms | visible |
| morph.completed | end RAF or cancel | chip dest ready |

**Baseline:** 25–26 frames @ 16ms sample in REAL_USAGE.

---

### 12. composerMode transition timing

Priority rules (implicit — **extrair para CONTRACT**):

| Priority | Source | Mode |
|----------|--------|------|
| 1 | checkout/booking confirm | hidden |
| 2 | ActionDrawer product/property | overlay |
| 3 | BSL feedDrawerOpen | overlay |
| 4 | default | default |

**Mapear:** timestamps quando 2 sources ativos simultaneously.

---

### 13. Drawer open/close timing

| Metric | Target |
|--------|--------|
| open → overflow hidden | same frame |
| close → overflow "" | same frame (single drawer) |
| multi-drawer close order | LIFO? documentar |

---

## Metodologia de captura

### Sessão DEV instrumentada

1. Abrir `/demo` + Event Debug Panel + DevTools console
2. Executar chain TC-xx
3. Export: `__SURFACE_SHADOW__.getTimeline()`
4. Screenshot + nota perceptiva
5. Registrar em template:

```markdown
### TC-01 @ timestamp
- Actions: ...
- Event order: [type@ms, ...]
- Overlaps: ...
- Interrupt: none | scroll | ...
- Classification: intentional | tolerance | investigate
```

### Duração recomendada

- **Semana 1:** TC-01–TC-04 (Stack A)
- **Semana 2:** TC-05–TC-06 + keyboard/backdrop
- **Semana 3:** cross-vertical edge cases

---

## Relação com shadow

Shadow compara **estado pós-evento sync**. Temporal mapping captura **entre eventos** e **ordem**.

| Shadow vê | Temporal vê |
|-----------|-------------|
| composer mismatch at drawer.opened | whether overlay set before or after surface.opened |
| drawer registry | close id timing vs state null |
| morphActive boolean | RAF frame count |

**Não substituir shadow — complementar.**

---

## Critérios de done (mapping phase)

- [ ] 6 causal chains documentadas com timestamps
- [ ] Priority rules composerMode confirmadas ou flagged
- [ ] Interrupt windows catalogadas
- [ ] Backdrop behavior matrix por drawer type
- [ ] Stale event policy draft
- [ ] Input para EVENT_ORDERING_CONTRACT.md e OWNERSHIP_CONTRACT.md

---

## O que NÃO fazer nesta fase

- Impor state machine única
- Corrigir races descobertos (documentar only)
- Reducer migration
- Alterar timings Tier 1

---

## Referências

- `RUNTIME_STATE_MAP.md`
- `EVENT_MAP.md`
- `SURFACE_DIVERGENCES.md`
- `docs/audit/contracts/EVENT_ORDERING_CONTRACT.md`
- `docs/audit/contracts/OWNERSHIP_CONTRACT.md`
