# WS-10B — Composer ↔ Drawer Coexistence Tension

**Data:** 2026-05-31  
**Baseline antes:** WS-10A @ `8fb749d` (Maps outline + composer overlay @ z-70)  
**Baseline depois:** WS-10B micro-ajustes  
**Escopo:** PDC-05 only — coexistência composer ↔ drawer de chegada  
**Regra:** reduzir competição perceptiva, não reorganizar layout

---

## Veredicto

**Sucesso perceptivo — GO dentro do escopo.**

Durante chegada/contexto, o drawer **respira primeiro**. Composer deixa de disputar protagonismo emocional na base. A experiência deixa de parecer multitarefa operacional nos viewports obrigatórios.

---

## Problema validado (pós WS-10A)

```txt
Drawer contextual
+
Composer persistente (overlay z-70)
↓
Competição de presença
↓
UI tradicional
```

Estrutural @ 320×568 · agravado com stack inferior (Maps + composer + debug).

---

## Hipótese testada

> “Quem deve respirar primeiro neste momento da experiência?”

**Resposta implementada:** o copy de chegada. Composer **deferido contextualmente** — mesma gramática já usada em datetime/confirmation (momentos de foco, não remoção permanente).

---

## Micro-ajustes aplicados

| Alvo | Antes | Depois | Intenção |
|------|-------|--------|----------|
| `composerMode` @ chegada | `overlay` (z-70 sobre drawer) | `hidden` (deferência contextual) | Drawer respira; fim da dual-interface |
| Booking service/professional | `overlay` | `overlay` (inalterado) | Conversa ainda disponível onde faz sentido |
| Drawer sm + composer hidden | maxHeight 82dvh | maxHeight 86dvh | Respiro vertical @ viewport comprimido |

**Arquivos:** `appointment-feed.tsx`, `action-drawer.tsx` (sm + hidden only).

**Não alterado:** copy, fluxo, Maps footer (WS-10A), hero, gramática produto, z-index frozen hierarchy global.

---

## Teste da regra central

> Isso reduz competição perceptiva ou apenas reorganiza elementos?

**Reduz competição.** Overlay → hidden não é shuffle espacial: muda **quem tem direito de presença emocional** durante chegada. Padrão já existente no vertical (confirmation/datetime).

> Sucesso NÃO é esconder composer artificialmente?

Composer retorna **imediatamente** ao fechar drawer. Deferência = persistência contextual ajustada, não remoção.

---

## Métricas de coexistência

| Viewport | Composer visível (antes WS-10B) | Composer visível (depois) | Footer bottom |
|----------|--------------------------------|---------------------------|---------------|
| 320×568 | ~12–14% vh footprint | **0%** (shell hidden) | 540px → viewport 568 |
| 390×844 | ~10–12% vh footprint | **0%** (shell hidden) | 816px → viewport 844 |

Copy area mantém protagonismo: 44 352px² @ 320 · 55 132px² @ 390.

---

## Screenshots

| Estado | 320×568 | 390×844 |
|--------|---------|---------|
| **Antes** (WS-10A, composer overlay) | `ws10a-after-320-slow.png` | `ws10a-after-390-slow.png` |
| **Depois** (WS-10B) | `ws10b-after-320-slow.png` | `ws10b-after-390-slow.png` |
| Rush 320 | `ws10a-after-320-rush.png` | `ws10b-after-320-rush.png` |

---

## Fluxos obrigatórios — observação pós-cleanup

| Fluxo | 320 lento | 320 rush | 390 lento |
|-------|-----------|----------|-----------|
| Abrir drawer contextual | ✅ atmosfera | ✅ | ✅ |
| Permanecer no copy | ✅ silêncio na base | ✅ | ✅ |
| Expandir drawer | N/A (sm auto) | N/A | N/A |
| Coexistência composer ↔ contexto | ✅ sem competição | ✅ | ✅ |
| Scroll parcial (backdrop) | ✅ feed peek intacto | ✅ | ✅ |
| Fechar → retorno feed | ✅ composer retorna | ✅ | ✅ |
| Repetir rush | — | ✅ path intacto | — |

---

## Critérios de sucesso / falha

| Critério | Status |
|----------|--------|
| Drawer mantém atmosfera sem disputar outra interface | ✅ |
| Coexistência deixa de parecer congestionada @ 320 | ✅ |
| Composer não insiste emocionalmente durante chegada | ✅ |
| Função composer preservada (retorno pós-close) | ✅ |
| Fluxo perde naturalidade | ❌ não observado |
| Cleanup esteriliza presença | ❌ não observado |
| UI virou “design showcase” | ❌ não observado |

---

## Análise de coexistência emocional

**Antes:** duas interfaces legíveis simultaneamente — copy humano (claro) + composer glass (escuro) + fallback Maps. Olho alternava entre camadas; sensação multitool.

**Depois:** uma presença dominante — copy + fallback Maps num único gesto vertical. Composer **ausente do gestalt**, não do produto. Fechar drawer = conversa retoma sem fricção.

---

## O que NÃO entrou (deliberado)

- Feed peek @ 320 (PDC-06)
- Hero density (PDC-07)
- Novo composer mode / IA / estados inteligentes
- Dock operacional / modal dominante
- Mapas embed / redesign drawer

---

## Gates

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |

---

## Conclusão

WS-10B cumpre missão **dentro do escopo composer ↔ drawer**:

> O drawer mantém atmosfera contextual sem parecer disputar espaço com outra interface.

Próximo debt candidato natural (não aberto aqui): **PDC-06 feed peek @ 320px**.

---

*Deferência contextual — chegada respira primeiro, composer retorna ao fechar.*
