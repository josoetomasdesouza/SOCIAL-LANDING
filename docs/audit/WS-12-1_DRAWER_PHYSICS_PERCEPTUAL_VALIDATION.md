# WS-12.1 — Drawer Physics Perceptual Validation

**Data:** 2026-05-31  
**Baseline:** `main` @ `60913bd` (WS-12)  
**Tipo:** validação perceptiva — **não** WS funcional  
**Método:** proxy Playwright + observação de métricas de settle  
**Device real:** pendente (recomendado, não bloqueante)

---

## Veredicto

**GO** — continuidade física confirmada nos três drawers, dois viewports, sem evidência de motion showcase.

---

## Escopo executado

| Drawer | Fluxos |
|--------|--------|
| Arrival | flick · partial · indecisive |
| Booking (longo) | flick · partial · indecisive · scroll-top pull |
| Feed | flick · partial · indecisive · scroll-top pull |

| Viewport | Resultado |
|----------|-----------|
| 390×844 | ✅ todos os casos |
| 320×568 | ✅ todos os casos |

Script: `scripts/visual/ws12-1-drawer-perceptual-validation.mjs`  
Métricas: `docs/audit/ws121-perceptual-metrics.json`

---

## Respostas às perguntas de validação

### 1. O drawer parece físico ou animado demais?

**Físico.** Settle ease-out cubic (~220–280ms) desacelera sem bounce. Mid-settle mostra `translateY` crescente (ex.: arrival @390 → 275px @ ~60ms pós-release) — movimento contínuo, não corte binário.

### 2. O fechamento parece inevitável ou mecânico?

**Inevitável.** Flick down continua após release; drawer permanece visível **184–294ms** (média ~250ms) antes de unmount — tempo alinhado ao settle close de 280ms. Não há sensação de “estado OFF” instantâneo.

### 3. O backdrop acompanha com naturalidade?

**Sim** (arrival + booking). Opacity cai de ~0.49 → ~0.25 durante mid-settle de fechamento, sincronizado com offset do sheet. Feed drawer usa backdrop `inset-0` (DOM diferente) — offset do sheet confirma continuidade; opacity não instrumentada neste proxy.

### 4. O pull parcial parece seguro?

**Sim.** Pull ~32px + release → drawer permanece aberto; `translateY` retorna a ~0 em ~220ms. Sem snap agressivo; sem sensação de erro ou “rejeição”.

### 5. Existe algum drawer específico ainda abrupto?

**Não.** Arrival, booking e feed passaram flick/partial/indecisive/scroll-top em ambos viewports. Booking longo: handoff scroll→pull fecha com momentum (~265–274ms visível pós-release).

### 6. O movimento mantém presença ou chama atenção para si?

**Mantém presença.** Motion é consequência do gesto, não protagonista. Sem bounce, sem overshoot, sem easing “demo”. Critério central atendido:

```txt
O usuário sente continuidade,
mas não percebe a animação como protagonista.
```

---

## Casos obrigatórios — observação

| Caso | @390 | @320 | Nota perceptiva |
|------|------|------|-----------------|
| Flick down rápido | ✅ | ✅ | Visível pós-release; fecha suave |
| Pull parcial lento | ✅ | ✅ | Settle-back natural; permanece aberto |
| Movimento indecisivo | ✅ | ✅ | Sem tremor; `translateY` ≈ 0 ao final |
| Drawer longo + scroll-top | ✅ | ✅ | Pull do topo após scroll; momentum consistente |

---

## Métricas-chave (proxy)

| Drawer | Viewport | Flick visible ms | Partial open | Scroll-top flick ms |
|--------|----------|------------------|--------------|---------------------|
| Arrival | 390 | 294 | ✅ | — |
| Booking | 390 | 262 | ✅ | 274 |
| Feed | 390 | 196 | ✅ | 370 |
| Arrival | 320 | 290 | ✅ | — |
| Booking | 320 | 260 | ✅ | 265 |
| Feed | 320 | 184 | ✅ | 324 |

Comparativo WS-12 pré-fix: flick visible ~0ms → pós-fix ~250ms média.

---

## Captures

Mid-settle e estados intermediários em `docs/audit/`:

- `ws121-390x844-{arrival,booking,feed}-*-midsettle.png`
- `ws121-320x568-{arrival,booking,feed}-*-midsettle.png`
- `ws121-*-scrolltop-flick-end.png`

Representam: sheet ainda visível durante settle (não sumiço abrupto).

---

## Critérios de falha — nenhum acionado

| Falha | Status |
|-------|--------|
| Motion showcase | ❌ não observado |
| Threshold sensível demais | ❌ partial permanece aberto |
| Fecha quando deveria permanecer | ❌ |
| Permanece quando deveria fechar | ❌ |
| Backdrop corta antes | ❌ (action drawers) |
| Algum drawer ainda some | ❌ |

---

## Ajustes finos recomendados

**Nenhum com evidência perceptiva suficiente neste proxy.**

Não alterar thresholds até sessão humana/device-real confirmar ou refutar. Se device-real reportar:

- flick fraco não fecha → revisar `DRAWER_FLICK_CLOSE_VELOCITY_PX_MS` (WS futuro)
- settle “lento” perceptivamente → revisar `DRAWER_SETTLE_CLOSE_MS` (WS futuro)

---

## Limitações

1. **Proxy automatizado** — complementa, não substitui, toque humano em device real.
2. **Feed backdrop** — métrica de opacity não capturada (seletor DOM distinto); continuidade confirmada via transform do sheet.
3. **Sessão B externa** (WS-11) permanece pendente — ortogonal a WS-12.1.

---

## Conclusão

WS-12 entregou continuidade física implícita. WS-12.1 confirma **GO** perceptivo: drawers obedecem momentum/settle sem virar showcase.

Próximo passo opcional: validação em device real (~5 min, mesmos 4 casos). Sem novo escopo funcional até evidência contrária.

---

*Validação perceptiva — continuidade sim, protagonismo não.*
