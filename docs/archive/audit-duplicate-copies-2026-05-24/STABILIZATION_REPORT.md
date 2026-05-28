# Stabilization Report — Foundation Observability v1

**Tag:** `foundation-observability-v1` → `311bad8`  
**Branch:** `main` (sincronizado com `origin/main`)  
**Data:** 2026-05-23  
**Escopo:** Validação, observação e estabilização — **sem features, redesign, refactor ou alterações de UX**

---

## Veredicto executivo

| Área | Status | Notas |
|------|--------|-------|
| Fundação publicada | ✅ Estável | Commits `ca3c264` + `311bad8`; tag no remote |
| Tier 1 perceptual (HEAD) | ✅ Intacto | Zero diff vs `origin/main` em morph, composer, landing |
| Event bus passivo | ✅ Seguro | Sync, sem mutação, listeners isolados |
| Instrumentação Tier 1 | ✅ Operacional | 10/11 eventos wired; `feed.item.viewed` pendente |
| Event Debug Panel | ⚠️ Gap DEV | Filtros omitem `morph.*` e `ai.surface.opened` |
| Surface shadow | ✅ Alinhado (ecommerce) | Reducer não conectado ao runtime |
| Brand DNA | ✅ Puro | Parser, defaults, signals — zero side effects |
| Rule Engine | ✅ Evaluate-only | 5 regras; bloqueios Tier 1 declarados |
| Working tree local | ⚠️ Contaminado | Alterações perceptivas e WIP fora da fundação |

**Conclusão:** A fundação evolutiva publicada em `311bad8` está **comprovadamente estável para observação passiva**. Tier 1 permanece invisível ao usuário no código publicado. Runtime QA em `/demo` passou 8/8 (2026-05-23). O working tree local contém mudanças que **não fazem parte** desta fase e devem ser isoladas antes de qualquer PR futuro.

---

## Baseline publicada

```
311bad8 fix(events): restore Tier 1 baseline, preserve passive wiring only
ca3c264 chore(events): add observational Tier 1 event wiring
40ae258 Refine composer surface integration (#35)
```

**Diff Tier 1 vs `40ae258` (pré-fundação):** apenas imports + chamadas `observe*` em:

- `business-social-landing.tsx` — `morph.started`, `morph.completed`
- `conversational-ai.tsx` — `ai.surface.opened` (primeira mensagem)

**Diff Tier 1 vs `origin/main`:** **0 linhas** em `post-to-chat-morph-layer.tsx`, `conversational-ai.tsx`, `business-social-landing.tsx`.

---

## Fases executadas

### Fase 1 — Event Validation

Análise estática + matriz de fluxos esperados em `/demo`.  
Ver: [EVENT_VALIDATION.md](./EVENT_VALIDATION.md)

**Resultado:** Nenhum loop infinito, race condition crítica ou vazamento de listener identificado no código publicado. Observações documentadas (duplicação intencional drawer→surface, dedupe composer, trace reset em vertical change).

### Fase 2 — Perceptual Stability

Comparação git HEAD vs `origin/main` + checklist manual.  
Ver: [PERCEPTUAL_VALIDATION.md](./PERCEPTUAL_VALIDATION.md)

**Resultado:** Código publicado preserva morph, composer, scroll capture, z-index, reduced motion guard. **Working tree local altera morph-layer — não validar perceptualmente sobre WIP local.**

### Fase 3 — Event Debug Audit

| Item | Status |
|------|--------|
| Render DEV-only (`NODE_ENV === "development"`) | ✅ |
| z-index panel `z-[120]` | ✅ DEV-only em `/demo` |
| Replay buffer (ring 200) | ✅ Bounded |
| Listener cleanup (`subscribeToEventDebugger`) | ✅ Unsubscribe quando último subscriber |
| Single bus subscription no debugger | ✅ |
| Filter dropdown completeness | ⚠️ 3 tipos ausentes |
| Event storms | ✅ Não observados em análise estática |
| Duplicate subscriptions | ✅ Padrão singleton no debugger |

### Fase 4 — Surface Shadow Validation

- `SURFACE_MACHINE_APPLY_TO_TIER1 = false` — guard explícito
- `deriveEcommerceComposerMode()` espelha `ecommerce-feed.tsx` useEffect (hidden/overlay/default)
- `transitionEcommerceDrawers()` usa `COMPOSER_MODE_SET` — alinhado ao runtime ecommerce
- `surfaceReducer` layer model (`deriveComposerModeFromLayers`) é modelo organizacional futuro; **não substitui** composerMode React
- `emitSurfaceComposerModeObserved()` em `surface-events.ts` — **não wired** ao runtime (shadow-only)

**Divergência conhecida (aceitável):** reducer por layers vs boolean drawers em verticals não-ecommerce — shadow mode futuro deve escolher um caminho antes de conectar.

### Fase 5 — Brand DNA Validation

| Check | Status |
|-------|--------|
| `createDefaultBrandDNA()` defaults | ✅ |
| `parseBrandDNA()` aliases + fallbacks | ✅ |
| `deriveBrandSignals()` read-only | ✅ |
| `BRAND_DNA_PROTECTED_FIELDS` inclui `colors.composerSurface` | ✅ |
| Schema safety (tipos readonly) | ✅ |
| Conexão IA / Goal Engine | ❌ Não conectado (correto) |

### Fase 6 — Rule Engine Validation

| Regra | Scope | Severity |
|-------|-------|----------|
| `brand.dna.protect-composer-surface` | brand.dna | block |
| `brand.dna.protect-core-fields` | brand.dna | block |
| `brand.behavior.no-aggressive-promo` | brand.dna | warn |
| `ai.block-tier1-mutation` | ai.proposal | block |
| `ai.block-auto-publish` | ai.proposal | block |

- `evaluateRules()` — pura, zero mutação, zero side effects ✅
- Targets bloqueados: `morph`, `composer.timing`, `z-index`, `scroll-lock`, `drawer.unify` ✅

### Fase 7 — Working Tree Audit

Ver: [WORKING_TREE_AUDIT.md](./WORKING_TREE_AUDIT.md)

### Fase 8 — Deliverables

- ✅ `STABILIZATION_REPORT.md` (este documento)
- ✅ `EVENT_VALIDATION.md`
- ✅ `PERCEPTUAL_VALIDATION.md`
- ✅ `WORKING_TREE_AUDIT.md`

---

## Critérios de sucesso

| Critério | Publicado (311bad8) |
|----------|---------------------|
| Invisível ao usuário | ✅ |
| Sem regressão Tier 1 | ✅ (git-verified) |
| Sem loops | ✅ |
| Sem race conditions críticas | ✅ |
| Sem degradação estrutural de performance | ✅ (bus sync, buffer 200) |
| Pronto para shadow mode seguro | ✅ (guards + evaluate-only) |

---

## Observações documentadas (NÃO corrigir nesta fase)

1. **`feed.item.viewed`** — helper existe, não wired.
2. **EventDebugPanel** — dropdown não lista `morph.started`, `morph.completed`, `ai.surface.opened` (eventos aparecem em "All types").
3. **Drawer → surface pairing** — cada `drawer.opened/closed` emite também `surface.opened/closed` (by design).
4. **`whatsapp.clicked`** emite cascata `user.intent.signal` (by design).
5. **Vertical switch** — `resetSessionTraceId()` invalida trace anterior (by design).
6. **Composer cleanup on unmount** — feeds resetam `default`; dedupe `from === to` evita emit redundante.
7. **React Strict Mode (DEV)** — remount de drawer com `isOpen=true` pode duplicar eventos drawer (DEV-only edge).
8. **`morph.completed`** — dispara em completion natural, scroll cancel e cleanup do morph layer (published HEAD chama `finish()` no cleanup).

---

## Próximos passos recomendados (pós-estabilização)

1. Executar checklist manual em `/demo` com Event Debug Panel aberto (DEV).
2. **Não commitar** working tree contaminado junto com fundação.
3. Isolar `post-to-chat-morph-layer.tsx` local em PR separado com validação perceptual dedicada.
4. Futuro (fora desta fase): wire `feed.item.viewed`, completar filtros do debug panel.

---

## Referências

- `docs/ARCHITECTURE.md`
- `docs/audit/EVENT_MAP.md`
- `docs/audit/FROZEN_SYSTEMS.md`
- Tag: `foundation-observability-v1`
