# Composer vidro fumê — experimento → produção (WS-13)

**Default produção:** `smoke-fume`  
**Gate:** camada fumê integrada vs UI sofisticada demais  
**Invariantes:** [`PERCEPTUAL_INVARIANTS.md`](../../../runtime/PERCEPTUAL_INVARIANTS.md) — P-06

## Regras finais (produção)

| Modo | Quando | Material |
|------|--------|----------|
| **Compacto** | Pill padrão, colapsado, chips sem chat | Vidro escuro plano `rgba(10,14,20,0.82)`, blur 22px — sem gradiente |
| **Expandido** | Corpo da conversa aberto | Gradiente `rgba(30,34,40,0.78) → rgba(8,12,18,0.92)`, blur 22px |
| **Inner surfaces** | Smoke ativo | `transparent` — material só na shell `<section>` |
| **Page mask** | Smoke ativo | Fade branco aberto (feed visível atrás do vidro) |

## Intensidades

| Modo | Superfície | Blur | Percepção |
|------|------------|------|-----------|
| `off` | `rgba(45,50,58,0.95)` | 18px | Barra sólida (baseline opt-out) |
| `smoke-subtle` | `rgba(40,44,50,0.72)` | 14px | Fumê leve, ainda editorial |
| `smoke-fume` | gradiente escuro (expanded) / flat compact | 22px | **Produção** — feed visível atrás |

## Alternar (debug / A/B)

**URL:**
```
/demo?composer-smoke=smoke-fume
/demo?composer-smoke=off
```

**Console:**
```js
localStorage.setItem("sl-composer-smoke-experiment", "smoke-fume"); location.reload()
localStorage.setItem("sl-composer-smoke-experiment", "off"); location.reload()
```

**Inspecionar:** `[data-composer-surface="smoke-fume"]` no composer.

Env: `NEXT_PUBLIC_COMPOSER_SMOKE_EXPERIMENT=smoke-fume|smoke-subtle|off`

Tokens: `lib/ui/composer-surface-material.ts`

## Screenshots @ 390×844 (Appointment, scroll médio)

- `ab-baseline-off.png`
- `ab-smoke-subtle.png`
- `ab-smoke-fume.png`

**Nota:** Headless Chromium pode sub-renderizar `backdrop-filter`; validar no device real / Safari / Chrome mobile.
