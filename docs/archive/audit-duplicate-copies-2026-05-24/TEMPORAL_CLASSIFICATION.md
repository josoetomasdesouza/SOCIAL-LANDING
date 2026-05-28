# Temporal Classification — Social Landing

**Data:** 2026-05-23  
**Modo:** TEMPORAL OBSERVATION — taxonomia only, **sem enforcement runtime**

> Usar estas tags ao registrar sessões em `SESSION_TIMELINES.md` e ao classificar achados do REAL_USAGE re-run.

---

## Taxonomia

### TEMPORALLY_VALID

**Definição:** Sequência temporal observada é **coerente com intenção perceptiva** e contratos conhecidos. Estado final e trajetória são aceitáveis.

**Critérios:**
- Eventos na ordem funcional esperada
- Transient windows dentro de durações calibradas (420ms, 480ms, ~300ms CSS)
- Perceptual result: smooth ou gracefully interrupted

**Exemplos:**
- morph.started → 480ms RAF → morph.completed
- feed drawer open → overlay → close → restore default
- booking open → hidden → close → default

**Ação:** documentar como baseline temporal — **não corrigir**

---

### TEMPORALLY_TOLERATED

**Definição:** Sequência **não ideal** em snapshot estático, mas **aceita** porque UX final correto ou divergência é observacional only.

**Critérios:**
- Shadow mismatch sem impacto perceptivo
- Event id SD-02 close `none` vs open postId
- DEV Strict Mode duplicate events
- Brief composerMode flicker <1 frame imperceptível

**Exemplos:**
- SD-02 drawer_registry on close
- Stack B drawer without composerMode change
- morph.started few ms before first pixel

**Ação:** observar, acumular timeline — **não normalizar prematuramente**

---

### TRANSIENT_OVERLAP

**Definição:** Dois ou mais subsistemas **ativos simultaneamente** por janela finita — overlap **intencional ou emergente**.

**Critérios:**
- Duração bounded e documentada
- Não causa estado impossível persistente
- Pode ser perceptivamente correto (ex: drawer open while composer overlay)

**Exemplos:**
- morph RAF + feedDrawerOpen (z-index stack)
- hidden composer + open product drawer
- chip hidden (hiddenContextIds) + morph ghost visible

**Ação:** mapear z-index/timing — **preservar** até prova de dano perceptivo

---

### STALE_BUT_SAFE

**Definição:** Evento ou estado **tardio/desalinhado** com autoridade atual, mas **sem efeito** porque unmount, dedupe, ou shadow normalizes.

**Critérios:**
- traceId reset após vertical switch
- composer.mode.changed from===to suppressed
- morph source TTL expired → fallback querySelector
- Close event id stale (SD-02)

**Exemplos:**
- Events after vertical unmount (ignored)
- Shadow normalizes close layer id
- rememberMorphSource 1800ms expiry

**Ação:** documentar stale policy — **não** forçar sync global

---

### PERCEPTUAL_RISK

**Definição:** Sequência temporal **pode** produzir glitch visível — requer captura humana ou device físico.

**Critérios:**
- keyboard + morph overlap
- composerMode oscillation between two effects
- backdrop tap not closing drawer (overflow correct but drawer stuck)
- measurement loop potential

**Exemplos:**
- focus input during morph RAF
- cart close → product open race on composerMode
- feed drawer backdrop mobile

**Ação:** investigar com SESSION capture — **não** patch until reproduced

---

### TEMPORAL_INCONSISTENCY

**Definição:** Ordem temporal **contradiz** contrato observável **com impacto perceptivo** ou impossibilidade lógica persistente.

**Critérios:**
- overflow hidden with zero drawers >2s after close
- chips visible during morph in-flight (CP-05 violation)
- composer hidden while feed default drawer expects overlay **and** user sees wrong layering

**Exemplos:**
- (None confirmed as bug post-P0-03 — RU-01 refuted)

**Ação:** classify bug — **isolated patch** after evidence — not refactor

---

### RACE_CONDITION_RISK

**Definição:** **Latent** hazard from concurrent writers sem ref-count or priority doc — **not necessarily manifest**.

**Critérios:**
- multiple body.overflow writers
- multiple setComposerMode same tick
- two ActionDrawers close order undefined
- no ref-count scroll lock

**Exemplos:**
- realestate property + visit drawers
- ecommerce cart + product simultaneous transition
- BSL feedDrawer + vertical checkout effects

**Ação:** document + temporal mapping — **ref-count is migration-era fix**, not emergency

---

### INTERRUPT_WINDOW

**Definição:** Intervalo onde **interrupção externa** cancela ou redireciona fluxo — **by design**.

**Critérios:**
- scroll/resize during morph → morph.completed via cancel
- long-press release before 420ms → no morph
- finger move cancels timer

**Exemplos:**
- t+425–905 morph scroll cancel window
- t+0–420 long-press accumulation

**Ação:** **preserve** — critical perceptual semantics

---

### OWNERSHIP_TRANSFER

**Definição:** Momento em que **autoridade efetiva** passa de um owner para outro — pode ou não coincidir com evento bus.

**Critérios:**
- state write changes primary controller
- observable behavior shifts (scroll lock, z-index, input focus)

**Exemplos:**
- card long-press → BSL morph queue
- feedDrawerOpen → BSL composer sync
- vertical effect → composerMode hidden
- bridge → observes only (no transfer)

**Ação:** map in OWNERSHIP_TRANSFER_MAPPING.md

---

### CANCELLED_FLOW

**Definição:** Fluxo iniciado mas **terminado antes** do happy-path completion — ainda **válido** se cleanup emite complete/graceful restore.

**Critérios:**
- morph.completed on cancel
- drawer close before scrollIntoView fires
- reduced motion skip animation

**Exemplos:**
- scroll cancel morph
- prefers-reduced-motion: no RAF, silent complete
- user closes drawer during 100ms scrollIntoView delay

**Ação:** **never** treat cancelled as error by default

---

## Matriz de tags combinadas

| Situação comum | Tags |
|----------------|------|
| Normal morph | TEMPORALLY_VALID, INTERRUPT_WINDOW |
| SD-02 on close | TEMPORALLY_TOLERATED, STALE_BUT_SAFE |
| Bridge drawer Stack B | TEMPORALLY_VALID, STALE_BUT_SAFE (composer) |
| Multi-drawer no ref-count | RACE_CONDITION_RISK, TEMPORALLY_TOLERATED |
| Keyboard during morph | PERCEPTUAL_RISK, TRANSIENT_OVERLAP |
| Strict Mode double emit DEV | STALE_BUT_SAFE, TEMPORALLY_TOLERATED |
| Scroll lock QA false positive | STALE_BUT_SAFE (drawer still open) |

---

## O que NÃO fazer com esta taxonomia

- ❌ Auto-promover TEMPORALLY_TOLERATED → bug
- ❌ Collapsar TRANSIENT_OVERLAP into single state reducer
- ❌ Eliminar INTERRUPT_WINDOW for "cleaner" code
- ❌ Use tags as runtime enums (observation only)

---

## Uso no pipeline

```
SESSION capture → tag per window → aggregate in TEMPORAL_RISK_REPORT
                → inform contracts (skeleton only)
                → gate Truth Mapping
```

---

## Referências

- `SESSION_TIMELINES.md`
- `TEMPORAL_RISK_REPORT.md`
- `RUNTIME_GOVERNANCE.md`
