# WS-21 — P0 Paper Prototype

**Status:** ✅ Concluído (sessão 2026-06-04)  
**Baseline:** `433cbba` (pós PR #86)  
**Método:** Wireframes textuais @ 320px / 390px — zero código  
**Veredicto:** **GO** — arquitetura híbrida validada para D2  
**Spec:** Ajustes A1–A9 incorporados em [`COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md`](../runtime/COMPOSER_BEHAVIOR_SPEC_v2_DRAFT.md)

---

## Veredicto executivo

| Pergunta | Resposta |
|----------|----------|
| Híbrido melhora conversa vs sheet 90vh? | **Sim** — sem sensação “app de assistente” |
| Feed-first preservado? | **Sim** @ idle e first paint |
| S-01…S-07 (paper) | **PASS** (S-07 engaged gradient TBD smoke v2) |
| GO para D2? | **Sim** |

---

## Estados wireframed

1. Idle @ fold  
2. Pós-morph (chip sticky, sem thread)  
3. Primeira resposta (thread in-flow)  
4. Multi-turn (monoscroll)  
5. Feed drawer overlay (thread oculta)  
6. Retorno drawer (restore)  
7. Hidden @ chegada (WS-10B)

Ver wireframes completos na transcrição da sessão P0 (2026-06-04).

---

## Ajustes prescritos para D2

| ID | Ajuste |
|----|--------|
| A1 | Junção feed↔thread — gradiente local, sem card “Chat” |
| A2 | Substituto collapsed — scroll up |
| A3 | Overlay oculta thread |
| A4 | `ai.surface.opened` = thread visible |
| A5 | Glossário composer sheet vs drawer sheet |
| A6 | P-06a → `threadEngagedProgress` |
| A7 | Anchor após sections, antes footer |
| A8 | Multi-turn — scroll up ao hero permitido |
| A9 | Delta checklist continuity §11 |

---

## Riscos perceptivos (resumo)

| ID | Risco | Sev |
|----|-------|-----|
| RP-01 | Thread parece bloco ChatGPT | Alta |
| RP-02 | Perda affordance minimize | Média |
| RP-03 | Thread enterra footer | Média |
| RP-04 | Junção feed↔thread abrupta | Média |

Mitigações: spec v2 §2.3, §5.4, §9.

---

*P0 paper · Não autoriza implementação.*
