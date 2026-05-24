# Shadow Mode Report — Surface Reducer

**Baseline tags:** `foundation-observability-v1` · `morph-stability-v1`  
**Data:** 2026-05-23  
**Modo:** Compare-only · **zero controle de runtime**

---

## Objetivo

Comparar silenciosamente:

```
runtime atual → snapshot → shadow reducer → predicted state → comparison → divergence report
```

**Sem** substituir `composerMode` React, drawers, morph ou transições Tier 1.

---

## Arquitetura

| Módulo | Path | Função |
|--------|------|--------|
| Types | `lib/surfaces/shadow/surface-shadow-types.ts` | Contratos, guards |
| Runtime snapshot | `lib/surfaces/shadow/surface-runtime-snapshot.ts` | Espelho passivo do runtime |
| Comparison + engine | `lib/surfaces/shadow/surface-shadow-comparison.ts` | Reducer shadow + diff |
| Engine re-export | `lib/surfaces/shadow/surface-shadow-engine.ts` | API pipeline |
| DEV debugger | `lib/surfaces/shadow/surface-shadow-debugger.ts` | Timeline, stats, logs |
| Wiring DEV | `components/dev/passive-event-provider.tsx` | Observer no `/demo` |

### Guards de segurança

```typescript
SURFACE_SHADOW_APPLY_TO_RUNTIME = false  // nunca muta runtime
SURFACE_MACHINE_APPLY_TO_TIER1 = false   // pre-existente
isSurfaceShadowModeEnabled()             // NODE_ENV === 'development' only
NEXT_PUBLIC_DISABLE_SURFACE_SHADOW=true  // kill switch
```

---

## Pipeline (Fase 1)

1. **Passive event bus** emite evento Tier 2
2. **Runtime builder** atualiza snapshot autoritativo (composer, drawers, morph, vertical…)
3. **Shadow machine** aplica ações derivadas (`SURFACE_OPEN/CLOSE`, `VERTICAL_SET`)
4. **Comparison** detecta divergências
5. **Debugger** registra timeline + `console.debug` deduplicado

**Zero side effects** no React state real.

---

## Snapshots (Fase 2)

### Runtime (`RuntimeSurfaceSnapshot`)

| Campo | Fonte |
|-------|-------|
| `composerMode` | `composer.mode.changed` |
| `openDrawers` | `drawer.opened/closed` |
| `activeSurfaceIds` | `surface.opened/closed` |
| `vertical` | `feed.vertical.changed` |
| `morphActive` | `morph.started/completed` |
| `aiSurfaceSessionOpen` | `ai.surface.opened` |
| `selectedPostId` | `feed.item.viewed` (se wired) |
| `keyboardVisible` | `visualViewport` probe |
| `mobileViewport` | `innerWidth < 768` |

### Shadow (`ShadowSurfaceSnapshot`)

| Campo | Fonte |
|-------|-------|
| `predictedComposerMode` | `surfaceReducer` layers policy |
| `openLayerIds` | layers com `open: true` |
| `state.revision` | reducer revision counter |

---

## Comparação (Fase 3)

| Kind | Detecta |
|------|---------|
| `composer_mode_mismatch` | runtime `composerMode` ≠ shadow predicted |
| `drawer_registry_mismatch` | drawers abertos diferem entre runtime e shadow |
| `duplicate_drawer_open` | `drawer.opened` com id já aberto |
| `duplicate_composer_transition` | `from === to` (não deveria emitir) |
| `impossible_composer_hidden` | hidden sem cart/checkout |
| `orphan_composer_mode` | overlay sem drawer layer |
| `vertical_desync` | reservado |

---

## DEV Observability (Fase 4)

### Console

```
[surface-shadow] mismatch on drawer.opened @ ... [composer_mode_mismatch] ...
```

Dedupe: 800ms por assinatura de divergência.

### DevTools global

```javascript
window.__SURFACE_SHADOW__.getTimeline()
window.__SURFACE_SHADOW__.getStats()
window.__SURFACE_SHADOW__.clearTimeline()
window.__SURFACE_SHADOW__.getEngineState()
```

### Stats exemplo (appointment, drawer flow)

- `totalComparisons`: 5
- `composer_mode_mismatch`: enquanto drawer aberto (esperado em appointment)
- Alinhado após `drawer.closed` no composerMode

**Sem UI pesada.** Sem dashboard.

---

## Safety Rules (Fase 5)

O shadow reducer:

- ✅ observa eventos passivos
- ✅ calcula estado paralelo
- ✅ compara e loga
- ❌ nunca chama `setState`
- ❌ nunca controla composer/drawer/morph
- ❌ nunca ativo fora DEV

---

## Validação inicial

| Check | Resultado |
|-------|-----------|
| Zero mudança perceptiva | ✅ Tier 1 untouched |
| Pipeline funciona no `/demo` | ✅ `__SURFACE_SHADOW__` populated |
| Divergências detectáveis | ✅ composer + drawer registry |
| Normalização shadow-only | ✅ close id `feed:video:none` → layer aberta |

---

## Critério de sucesso

| Critério | Status |
|----------|--------|
| Zero mudança visual | ✅ |
| Comparação funcionando | ✅ |
| Divergências detectáveis | ✅ |
| Pronto para migração futura segura | ✅ (fase observacional) |

---

## Próximo passo (futuro, fora deste escopo)

1. Acumular divergências por vertical em sessões reais
2. Decidir se política shadow ou runtime deve ceder (PR separado)
3. Só então considerar wiring gradual — **nunca** antes de estabilizar política
