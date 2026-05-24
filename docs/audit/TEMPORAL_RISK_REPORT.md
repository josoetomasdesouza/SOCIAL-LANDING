# Temporal Risk Report — Social Landing

**Data:** 2026-05-23  
**Baseline:** `main` @ `e002921`  
**Modo:** observação e classificação — **não plano de refactor**

---

## Resumo executivo

O runtime apresenta **riscos temporais latentes** concentrados em scroll lock multi-drawer e composerMode competition. **Nenhum risco temporal confirmado como bug perceptivo** pós-P0-03 nos paths documentados. A maioria dos fenômenos classifica-se como TEMPORALLY_VALID ou TEMPORALLY_TOLERATED.

---

## 1. Riscos temporais aceitáveis

| ID | Fenômeno | Janela | Classificação | Notas |
|----|----------|--------|---------------|-------|
| TR-A01 | morph.started antes pixel 0–16ms | <16ms | TEMPORALLY_TOLERATED | MF-02 satisfied at frame 0 |
| TR-A02 | SD-02 close id `none` | close tick | STALE_BUT_SAFE | shadow normalizes |
| TR-A03 | DEV Strict Mode double drawer.opened | remount | STALE_BUT_SAFE | PROD N/A |
| TR-A04 | composer dedupe from===to | 0ms | STALE_BUT_SAFE | intentional |
| TR-A05 | feed drawer scrollIntoView 100ms delay | 100ms | TEMPORALLY_VALID | layout after mount |
| TR-A06 | Stack B drawer without composerMode | session | TEMPORALLY_TOLERATED | until migration |
| TR-A07 | morph scroll cancel → completed | interrupt | CANCELLED_FLOW | preserve MF-03 |
| TR-A08 | hiddenContextIds during morph | 480ms | TRANSIENT_OVERLAP | CP-05 intentional |
| TR-A09 | traceId reset on vertical change | boundary | STALE_BUT_SAFE | by design |
| TR-A10 | mock AI 700ms delay | post-submit | TEMPORALLY_VALID | demo only |

**Veredicto:** **aceitar** — acumular timeline, não normalizar.

---

## 2. Transient states perceptivamente invisíveis

| Transient | Duração | Por que invisible |
|-----------|---------|-------------------|
| hiddenContextIds suppress chip | ~480ms | ghost morph carries visual |
| composerMode overlay set same frame as drawer | 0–16ms | no flicker if one paint |
| body.overflow hidden while drawer animating | ~300ms | expected — no scroll |
| queuedMorph before useLayoutEffect | 1 frame | below perception |
| chip opacity 0→1 post morph | 1 frame | eased |
| shadow morphActive true | 480ms | DEV only comparison |

**Regra:** **NÃO remover** estes transients — são semântica perceptiva.

---

## 3. Overlaps seguros

| Overlap | Componentes | Por que seguro |
|---------|-------------|----------------|
| morph z-65 + composer z-30/60/70 | layer stack | pointer-events-none morph |
| feed drawer + composer overlay | drawer + composer | z-index calibrated |
| story z-100 + composer | story viewer | composer hidden or below |
| drawer open + composer overlay mode | intentional DR-O1 | post-P0-03 |
| ResizeObserver + morph complete | measurement | sequential typical |
| bridge events + shadcn animation | observability | no double control |

**Classificação:** TRANSIENT_OVERLAP — **preservar**

---

## 4. Race windows perigosas (latentes)

| ID | Window | Trigger | Manifest hoje? | Classificação |
|----|--------|---------|----------------|---------------|
| TR-R01 | Multi-drawer overflow | close A while B open | **Não** in tested paths | RACE_CONDITION_RISK |
| TR-R02 | composerMode last-write | cart close + product open same tick | Rare flicker possible | RACE_CONDITION_RISK |
| TR-R03 | BSL vs vertical effect order | feed + checkout edge | Unverified | RACE_CONDITION_RISK |
| TR-R04 | morph + keyboard | focus during RAF | Device unknown | PERCEPTUAL_RISK |
| TR-R05 | backdrop no close mobile | user tap outside | Drawer stuck open — **correct** overflow | PERCEPTUAL_RISK UX |
| TR-R06 | two ActionDrawers realestate | property→visit | Close OK manual | RACE_CONDITION_RISK latent |

**Veredicto:** **documentar + capturar** — ref-count/fix **defer** to migration era, not emergency.

---

## 5. Ownership ambiguities

| Domínio | Ambiguity | Impact |
|---------|-----------|--------|
| composerMode | 9+ writers, implicit priority | Medium — flicker edge |
| scroll lock | no ref-count, no bus event | Medium latent |
| Stack B lifecycle | shadcn owns UI, bridge owns events | High structural — Truth Mapping bias |
| z-index | BSL derives from 2+ flags | Low — stable today |
| morph source | module vs DOM query fallback | Low — TTL bounded |

**Classificação:** OWNERSHIP_TRANSFER documentation required — **not** reducer yet

---

## 6. Flows canceláveis seguros

| Flow | Cancel trigger | Cleanup | Event |
|------|----------------|---------|-------|
| Morph | scroll/resize | finish() + morph.completed | ✅ |
| Long-press | release <420ms | no morph | ✅ |
| Drawer | unmount vertical | overflow cleanup | ✅ |
| Morph | reduced motion | skip RAF | ✅ |
| Composer drag | pointer cancel | snap back | ✅ |

**Regra:** CANCELLED_FLOW must emit complete or restore — **never** silent stuck state.

---

## 7. Flows potencialmente destrutivos (se simplificados)

| Flow | Se simplificado… | Destruição |
|------|------------------|------------|
| Morph interrupt window | remove scroll listener | stuck ghost / chips |
| hiddenContextIds | show chips during morph | CP-05 break, visual clash |
| composerMode priority | single writer without rules | checkout leak overlay |
| Module morph source | move to React state | Strict Mode / perf regression |
| Strict Mode morph cleanup | call finish() in effect cleanup | 0-frame morph (fixed in tag) |
| Shadow apply to runtime | auto-correct mismatch | kills emergent tolerance |
| Global reducer | collapse transients | perceptual flattening |
| Remove bridge before migrate | lose observability | blind spot Stack B |
| Ref-count scroll lock wrong | premature unlock | scroll behind drawer |

**Veredicto:** **proteger** — estas são barreiras contra engenharia simplificadora.

---

## Matriz severidade × ação

| Severidade | Count | Ação permitida |
|------------|-------|----------------|
| Aceitável | 10 | observar |
| Overlap seguro | 6 | preservar |
| Latente | 6 | mapear, não patch urgente |
| Ambiguity | 5 | contracts + temporal map |
| Destrutivo se simplificado | 9 | governance block |

---

## Relação com REAL_USAGE re-run

| TR ID | Teste RU-R |
|-------|------------|
| TR-R01, TR-R06 | RU-R-19 |
| TR-R02, TR-A06 | RU-R-17 |
| TR-R04 | RU-R-14 |
| TR-R05 | RU-R-11 |
| TR-A07 | RU-R-08 |
| TR-A02 | RU-R-02, RU-R-09 |

---

## Conclusão observacional

**Risco temporal dominante hoje:** governança e dual-stack — **não** timing bug em Tier 1.

**Normalização prematura seria mais perigosa que** overlaps tolerados atuais.

---

## Referências

- `TEMPORAL_CLASSIFICATION.md`
- `SESSION_TIMELINES.md`
- `OWNERSHIP_TRANSFER_MAPPING.md`
- `NEXT_EVOLUTION_DECISION.md`
