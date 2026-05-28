# Perceptual Validation — Tier 1 Stability

**Baseline publicada:** `311bad8`  
**Método:** Diff git vs `origin/main` + inspeção de código Tier 1 + checklist manual  
**Regra:** Diferenças perceptivas = documentar, **não corrigir** nesta fase

---

## Veredicto git (publicado)

Comparação `origin/main..HEAD`:

| Arquivo Tier 1 | Diff vs origin |
|----------------|----------------|
| `post-to-chat-morph-layer.tsx` | **0 linhas** |
| `conversational-ai.tsx` | **0 linhas** |
| `business-social-landing.tsx` | **0 linhas** |

Wiring observacional está **contido** nos dois commits de fundação; fixup `311bad8` restaurou baseline perceptual.

Diff wiring-only vs pré-fundação (`40ae258..311bad8`):

- `business-social-landing.tsx`: +3 linhas observe morph
- `conversational-ai.tsx`: +1 linha observe ai surface
- **Zero** alterações de CSS, timing, z-index, layout, animação

---

## ⚠️ Aviso: working tree local

O working tree **atual** modifica `post-to-chat-morph-layer.tsx` (não commitado):

| Aspecto | HEAD publicado | Working tree local |
|---------|----------------|-------------------|
| Scroll listener | `{ capture: true }` | `{ capture: false }` |
| removeEventListener scroll | `true` (capture) | sem capture |
| Cleanup effect | chama `finish()` | **não** chama `finish()` (comentário Strict Mode) |

**Validação perceptual deve usar HEAD publicado (`311bad8`), não o working tree local.**

Estas mudanças locais são **contaminação perceptiva perigosa** — ver [WORKING_TREE_AUDIT.md](./WORKING_TREE_AUDIT.md).

---

## Checklist Tier 1 (manual visual)

Executar `/demo` em mobile viewport + desktop. Comparar com memória/baseline pré-fundação ou gravação anterior se disponível.

### Morph
- [ ] Long-press card → morph flutuante → ancora no composer
- [ ] Duração ~400ms (`MORPH_DURATION_MS`) — sensação unchanged
- [ ] Scroll durante morph cancela animação (comportamento conhecido)
- [ ] `prefers-reduced-motion: reduce` → morph **não** inicia (guard em `queueConversationContextMorph`)
- [ ] Preview chip dismissível após morph

### Composer
- [ ] Posição fixa bottom, safe-area intacta
- [ ] Modos default / overlay / hidden por vertical (drawer, booking steps, ecommerce)
- [ ] Máscara gradiente (`COMPOSER_MASK_TOP_OFFSET_PX`) unchanged
- [ ] Input focus / keyboard não regressa

### Scroll
- [ ] Feed scroll nativo
- [ ] Body scroll lock quando drawer aberto (`document.body.style.overflow`)
- [ ] Sem jump ao fechar drawer

### Mobile UX
- [ ] Touch targets
- [ ] Long-press threshold intacto
- [ ] Bottom inset / composer clearance

### Keyboard interaction
- [ ] Enter envia mensagem
- [ ] Focus trap não quebrado em drawers

### Long-press
- [ ] Abre contexto conversacional + morph queue

### Drawer
- [ ] ActionDrawer backdrop + animação slide
- [ ] BusinessFeedDrawer matchFeedWidth
- [ ] z-index drawer vs composer vs feed

### Overlay
- [ ] Feed dim quando composer overlay mode (vertical-specific)

### z-index
- [ ] Morph layer acima do feed
- [ ] Drawer acima do feed
- [ ] Event Debug Panel `z-[120]` — **DEV only**, não afeta prod

### Reduced motion
- [ ] `window.matchMedia("(prefers-reduced-motion: reduce)")` guard ativo em morph queue
- [ ] CSS `@media (prefers-reduced-motion)` onde aplicável (componentes UI)

---

## Inspeção estática (HEAD publicado)

### Morph layer (`post-to-chat-morph-layer.tsx`)
- `easeOutCubic` easing preserved
- `requestAnimationFrame` loop preserved
- Scroll cancel com capture listener preserved
- `finish()` on cleanup preserved (published)

### Business social landing
- `MORPH_DURATION_MS` constant unchanged
- `prefers-reduced-motion` early return preserved (line ~954)
- `pb-*` padding baseline unchanged vs origin
- Hidden context IDs logic unchanged

### Conversational AI
- Composer surface styling unchanged vs origin
- Sheet snap / collapse behavior unchanged
- Apenas emit passivo adicionado no send handler

### Drawers
- Scroll lock effect unchanged
- Visual classes / sizes unchanged
- Observational `useEffect` separado — não altera render path

---

## Event instrumentation vs percepção

A instrumentação é **fire-and-forget**:

- Não altera state React
- Não altera DOM
- Não altera timing de effects (calls são O(1) sync)

**Conclusão:** wiring publicado é perceptualmente neutro por design.

---

## Riscos perceptuais documentados (não corrigir agora)

1. **Working tree morph-layer** — se testado localmente, morph pode parecer diferente (Strict Mode fix WIP).
2. **morph.completed em scroll cancel** — estado final do morph pode completar via `finish()` no cancel; comportamento pré-existente, não introduzido pela fundação.
3. **Event Debug Panel** — botão flutuante DEV em `/demo` apenas; invisible em production build.

---

## Veredicto

| Escopo | Status |
|--------|--------|
| Código publicado (`311bad8`) | ✅ Tier 1 perceptualmente intacto (git-verified) |
| QA manual | ⏳ Pendente execução humana (checklist acima) |
| Working tree local | ❌ Não representa baseline publicada |

**A Social Landing publicada deve parecer exatamente a mesma.** Confirmar com pass manual do checklist antes de declarar estabilização perceptual 100% fechada.
