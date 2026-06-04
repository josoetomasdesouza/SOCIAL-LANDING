# WS-21 ADR Challenge Review — Red Team

**Data:** 2026-06-04  
**Baseline:** `origin/main` @ `fc799d2`  
**Alvo:** [`WS-21_COMPOSER_HYBRID_ARCHITECTURE_ADR.md`](WS-21_COMPOSER_HYBRID_ARCHITECTURE_ADR.md)  
**Método:** Tentativa deliberada de **derrubar** a tese híbrida (`sticky composer + thread in-flow`)  
**Pergunta central:**

```txt
Existe algo no patrimônio WS-09 → WS-13 que depende EXPLICITAMENTE
do sheet expansivo (~90vh, scroll interno, snap expanded)?
```

---

## Veredicto executivo

| Resultado | Conclusão |
|-----------|-----------|
| **Tese derrubada?** | **Não** — nenhuma dependência funcional **bloqueante** encontrada |
| **ADR maduro para PR doc-only?** | **Sim**, com **3 ressalvas** documentadas abaixo (smoke-fume v2, auto-grow substitute, collapsed UX) |
| **Resposta à pergunta central** | Patrimônio WS-09→WS-13 depende do **composer sticky + modes + morph + smoke-fume compact** — **não** do sheet 90vh como requisito de produto |

```txt
Sticky composer + thread in-flow  →  sustentável
Sheet expansivo como requisito     →  não encontrado no patrimônio
```

---

## 1. Metodologia

Foram revistos:

- Docs WS-09→WS-13, `PERCEPTUAL_INVARIANTS`, `COMPOSER_BEHAVIOR_SPEC`, `CONTINUITY_HANDOFF_AUDIT`
- `composer-surface-material.ts` (smoke-fume / expansionProgress)
- `conversational-ai.tsx` (métricas, collapsed, auto-grow)
- `EVOLUTION_LOG` (commits #29, #30 auto-grow / collapsed)
- Observações WS-13 Session B, WS-14A morph parity, WS-10B coexistence
- Scripts `ws13-session-b-observation.mjs` (ação `expanded-chat`)

Critério de “dependência explícita”: documento frozen, gate humano, ou contrato runtime que **falha** se sheet 90vh deixar de existir — não preferência estética recuperável por adaptação.

---

## 2. O que quebra? (ataques à tese)

### A1 — Smoke-fume + `expansionProgress` (WS-13) ⚠️ **RESSALVA, não bloqueio**

**Ataque:** P-06a em `PERCEPTUAL_INVARIANTS.md` e `WS-13_COMPOSER_SMOKE_SURFACE_REPORT.md` amarram materialidade expandida ao **sheet no máximo**:

```txt
progress = (currentHeight - compact) / (expanded - compact)
→ gradiente, blur 18→26px, máscara de página intensifica
```

Fluxo 5 WS-13 observou: *“Conversa AI abre sheet gradualmente — expansionProgress perceptível.”*

**Veredito:** Dependência **real do mecanismo v1**, não do **objetivo perceptivo**. O objetivo validado foi:

```txt
“O composer ficou mais integrado ou começou a chamar atenção para si?”
```

**Substituto v2:** `expansionProgress` pode migrar para sinal **“thread in-flow visível”** ou **engajamento pós-1º turno**, preservando:

- compact = flat glass `smoke-fume` (pill sticky) — **intocado**
- engaged = gradiente local na junção thread/composer — **adaptação**, não abandono

**Não derruba ADR.** Exige entrada em `PERCEPTUAL_INVARIANTS` P-06a v2 antes de implementação.

---

### A2 — Auto-grow / collapsed / resume (EVOLUTION_LOG #29, #30) ⚠️ **RESSALVA**

**Ataque:** Zona Vermelha documentada — resposta de IA while collapsed **expande sheet**; auto-grow mede conteúdo dentro do shell.

**Veredito:** Dependência do **sistema de medição do sheet**, não do patrimônio WS-09→WS-13 perceptivo. WS-10/11/13 **não** mandatam collapsed state.

**Substituto v2:**

- Thread in-flow cresce no documento → scroll da página traz resposta à vista
- Sticky composer permanece compact → sem “expand when AI arrives”
- Remover collapsed/preview **elimina** a classe de bug que auto-grow corrigia

**Risco real:** usuários habituados a “minimizar chat” via drag-down perdem affordance — ver §4.

---

### A3 — Footprint metrics infladas quando sheet expande 🟡 **Favorável ao ADR**

**Ataque:** `publishComposerScrollMetrics()` usa `getBoundingClientRect()` do shell inteiro — sheet expandido **infla** `footprintPx` (~90vh).

**Veredito:** Comportamento acoplado ao v1; comentários em `composer-scroll-clearance.ts` falam em **“compact composer overlay”**. Sheet expansivo **perturba** clearance, não é requisito dela.

**WS-21:** footprint estável = sticky compact → **melhora** previsibilidade para drawers (WS-10B, CHECKOUT_PATTERNS).

---

### A4 — Morph M-01 perde target se composer não “crescer” ❌ **Ataque falhou**

**Evidência WS-13/14A:**

| Contexto | Footprint observado |
|----------|---------------------|
| Compact idle | ~62px |
| Pós-morph feed | ~124px (chip + chrome) |
| Drawer long-press | ~124px (mesmo chip) |

Morph usa `getComposerChipRect()` / `data-conversation-context-chip` no **shell sticky**, não no corpo 90vh.

**Veredito:** Morph depende de **composer presente + chip no rail** — **não** de sheet expanded. ADR preserva target estável no viewport bottom.

---

### A5 — WS-10B chegada exige overlay/expansion ❌ **Ataque falhou**

WS-10B **rejeitou** overlay z-70 na chegada; solução = `composerMode: hidden`.

Métricas: footprint **0%** na chegada — depende de **hidden**, não de expansion.

Booking service/professional mantém `overlay` — compatível com sticky + thread atrás do drawer.

**Veredito:** Zero dependência de sheet 90vh.

---

### A6 — WS-11 scroll continuity ❌ **Ataque falhou**

WS-11 trata **retorno scroll** após drawer chegada (`preservePageScroll`), não altura do composer.

Composer deferido @ chegada — alinhado com ADR.

---

### A7 — WS-12 drawer physics ❌ **Ataque falhou (homônimo)**

“Sheet” em WS-12 = **ActionDrawer / BusinessFeedDrawer** (`use-drawer-sheet-drag.ts`) — superfície distinta do composer conversacional.

Frozen drawer physics **não** referencia `SHEET_MAX_VIEWPORT_RATIO` do composer.

---

### A8 — Hero / feed-first proíbe conversa inline ❌ **Ataque falhou**

`HERO_OPERATIONAL_AUDIT.md`:

```txt
“Nunca hero + drawer + story viewer + composer expandido simultaneamente”
“Composer expand — Hero não expande; composer nunca empurra hero para modal”
```

Proibição é **composer expandido simultâneo** — exatamente o que WS-21 remove.

Thread in-flow **abaixo** do feed **respeita** hero-first no first paint; empurra conteúdo **após** engajamento — consistente com “exploração antes de utilidade”.

---

### A9 — `AI_PERCEPTUAL_HEALTH` EX-04 ❌ **Ataque invertido**

EX-04 flag: *“Composer covers >50% viewport persistently”* — sheet 90vh **viola** saúde perceptiva.

WS-21 **corrige** alerta existente, não conflita.

---

### A10 — Outras verticais dependem de expansion? ❌ **Ataque falhou**

| Vertical | Dependência real |
|----------|------------------|
| Appointment | `hidden` @ chegada · `overlay` @ booking · resolver — **não** 90vh |
| Ecommerce | `hidden` checkout · `overlay` product drawer |
| Restaurant | `composerOffsetClassName` cart bar |
| Influencer / Institutional | `overlay` when drawer open |

Nenhum spec de vertical exige corpo de chat 90vh. `WS-08D V2` menciona `composerMode: expanded` — **design futuro não mergeado**, não patrimônio frozen.

---

## 3. O que estamos subestimando?

| # | Subestimação | Severidade | Mitigação ADR |
|---|--------------|------------|---------------|
| U1 | **Reescrita P-06a / smoke-fume** — patrimônio Tier 1 nominal | Alta | Fase 6 ADR; capturas side-by-side obrigatórias |
| U2 | **Complexidade de migração** — `conversational-ai.tsx` ~1400 linhas, Zona Vermelha EVOLUTION_LOG | Alta | Piloto Appointment; flag v1/v2; já no ADR |
| U3 | **UX “minimizar conversa”** — drag-down → collapsed hoje | Média | Scroll up = feed; “fechar conversa” explícito; ou sticky-only sem histórico na página |
| U4 | **Thread longa empurra footer + seções Appointment** | Média | Zona conversa após sections editoriais; anchor scroll |
| U5 | **Regressão `qa:appointment`** — selectors assumem shell `[data-conversation-composer]` | Baixa | Shell sticky mantém attribute; validar Playwright |
| U6 | **12 verticais rollout** — ADR subestima Fase 8 | Média | Já sequenciado; Appointment-only até GO |
| U7 | **Confundir “sheet” drawer vs composer** em docs/reviews | Baixa | Glossário no spec v2 |

---

## 4. Benefícios do sheet expansivo que jogamos fora

| Benefício v1 | Valor real | Perda? | Compensação v2 |
|--------------|------------|--------|----------------|
| Conversa isolada do scroll do feed | Médio | Parcial | Monoscroll é **objetivo** ADR |
| Ler feed com “chat aberto” | Baixo | Não | Máscara v1 **escurece** feed anyway |
| Minimizar chat sem apagar (collapsed) | Médio | **Sim** | Scroll to feed / close conversation |
| `expansionProgress` material drama | Médio estético | Sim | Gradiente local engaged |
| Auto-reveal AI reply in shell | Alto funcional | Substituído | Page scroll to thread |
| Drag handle affordance resize | Baixo | Sim | Menos widget = **objetivo** |
| Dual scroll (feed parado, chat scroll) | Discutível | Sim | Single scroll = **objetivo** |

**Única perda perceptiva não trivial:** affordance **“minimizar mas manter sessão”** (collapsed). ADR deve decidir explicitamente na spec v2: equivalente = scroll away + pill sticky com badge, ou dismiss session.

---

## 5. Mapa patrimônio WS-09 → WS-13 vs sheet expansivo

| WS / artefato | Depende de sheet 90vh? | Depende de composer sticky / modes / morph? |
|---------------|------------------------|---------------------------------------------|
| **WS-09** hero contextual | ❌ | ❌ (composer oculto ou compact @ fold) |
| **WS-10** presença / booking observation | ❌ (critica sheet **alto** booking drawer) | 🟡 footprint compact |
| **WS-10B** composer ↔ drawer | ❌ | ✅ **hidden / overlay** |
| **WS-11** scroll return | ❌ | 🟡 deferência hidden |
| **WS-12** drawer physics | ❌ (outro sheet) | 🟡 clearance metrics |
| **WS-13** smoke-fume | 🟡 **expansionProgress** (mecanismo) | ✅ **smoke-fume compact** |
| **WS-13** morph M-01 | ❌ | ✅ **chip target** |
| **WS-14A** runtime wire | ❌ | ✅ morph parity |
| **PERCEPTUAL_INVARIANTS P-06** | 🟡 expanded gradient | ✅ compact flat glass |
| **COMPOSER_BEHAVIOR_SPEC v1** | ✅ describe snap expanded | ✅ modes + morph |
| **CONTINUITY_HANDOFF** | ❌ | ✅ morph + deferência |
| **EVOLUTION_LOG auto-grow** | ✅ implementação v1 | 🟡 substituível |

**Legenda:** ✅ = ADR preserva · ❌ = irrelevante · 🟡 = adaptar spec, não bloquear

---

## 6. Tentativas de arquitetura alternativa (para derrubar híbrido)

| Alternativa | Por que não vence o híbrido |
|-------------|----------------------------|
| **Manter sheet v1** | Mantém problema raiz (painel 90vh) — rejeitado na auditoria |
| **Inline puro ChatGPT** | Conflita feed-first / hero — rejeitado no ADR |
| **Sheet teto 40vh** | Fallback ADR 🟡 — ainda dual scroll; híbrido superior se protótipo OK |
| **Só comportamento, zero container** | Não resolve overlay/mask/handle — insuficiente |
| **Composer fullscreen route** | Viola social-native — anti-padrão PERCEPTUAL_LANGUAGE |

**Nenhuma alternativa derrubou o híbrido** na análise adversarial.

---

## 7. Riscos residuais pós-challenge (addendum ao ADR)

| ID | Risco novo identificado no red team |
|----|-------------------------------------|
| RT-01 | P-06a frozen text contradiz v2 até emendado — **PR doc-only deve citar “supersedes P-06a expanded clause”** |
| RT-02 | Perda collapsed UX sem substituto definido |
| RT-03 | Observação WS-13 “sheet abre gradualmente” invalidada como checklist literal — **rebaseline** fluxo 5 |
| RT-04 | `expanded-chat` step em ws13 scripts — atualizar na Fase 9, não bloqueia ADR |

---

## 8. Critérios para PR doc-only (GO / NO-GO)

### GO se:

- [x] Nenhuma dependência bloqueante WS-09→WS-13 no sheet 90vh
- [x] Morph, modes, drawers, chegada deferida preservados em princípio
- [x] Ressalvas smoke-fume e collapsed documentadas
- [ ] Revisão humana concorda com veredicto deste documento

### NO-GO se:

- [ ] Stakeholder exige collapsed/minimize como patrimônio **inalienável**
- [ ] Protótipo P1 falhar morph antes do PR (prematuro — protótipo é pós-ADR)

**Recomendação:** **GO para PR doc-only** em sequência (PR **D1**):

1. `WS-21_COMPOSER_HYBRID_ARCHITECTURE_ADR.md`
2. `WS-21_ADR_CHALLENGE_REVIEW.md` (este arquivo)
3. `WS-21_P0_P1_PROTOTYPE_PLAN.md`

Branch sugerida: `docs/ws-21-composer-hybrid-adr`

---

## 9. Resposta final à pergunta do humano

```txt
Existe alguma coisa no patrimônio WS-09 → WS-13 que depende
explicitamente do sheet expansivo?
```

**Resposta:** **Não** — como **requisito de produto ou gate perceptivo fechado**.

**Existe** dependência do **mecanismo** `expansionProgress` ↔ altura do sheet (WS-13 smoke-fume) e do **sistema** auto-grow/collapsed (EVOLUTION_LOG) — ambos **substituíveis** sem violar morph, modes, drawers, feed-first ou observação WS-13 de **integração** (vs showcase).

A tese permanece:

```txt
Sticky composer + thread in-flow − sheet expansivo
```

**Status:** Challenge review **não derrubou** o ADR. Direção arquitetural **madura** para PR doc-only, com ressalvas RT-01…RT-04 endereçadas na Fase 1 (spec v2).

---

## 10. Próximo passo recomendado

1. Revisão humana rápida deste documento (15 min)
2. Se concordância → PR doc-only D1 (ADR + Challenge Review + Plano P0/P1)
3. **Não** iniciar protótipo P1 antes do merge doc — ordem ADR → GO → spike
4. Atualizar `OPERATIONAL_HANDOFF_BASELINE.md` **após** merge doc (PR separado, como PR #85)

---

*Red team WS-21 · Baseline `fc799d2` · Sem código · Não autoriza implementação Tier 1.*
