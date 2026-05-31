# WS-11 — Arrival Return Scroll Continuity

**Data:** 2026-05-31  
**Tipo:** Primeiro WS funcional pós-Etapa 3 — teste do sistema imunológico  
**Baseline:** `main` @ `7af5943` (PERCEPTUAL_LANGUAGE_SYSTEM)  
**Escopo:** micro continuidade contextual · Appointment only · reversível

---

## Objetivo

Validar que o **sistema imunológico perceptivo governa decisões** — não expandir produto.

Micro-melhoria: **restaurar scroll da página ao fechar drawer de chegada**, preservando continuidade feed após ritual de retorno.

---

## Gates §8 — respostas formais (pré-código)

| # | Pergunta | Resposta |
|---|----------|----------|
| **G1** | Aprofunda presença contextual? | **Sim** — retorno ao feed mantém contexto espacial; reforça PERCEPTUAL_INVARIANTS §2 e §5 |
| **G2** | Preserva silêncio? | **Sim** — zero UI nova, zero copy, zero chrome |
| **G3** | Competição emocional indesejada? | **Não** — mecânica invisible |
| **G4** | Transforma conversa em ferramenta? | **Não** |
| **G5** | Explica demais? | **Não** |
| **G6** | Ameaça feed-first editorial? | **Não** — fortalece retorno ao feed no ponto de scroll anterior |
| **G7** | Universaliza sem observação? | **Não** — `preservePageScroll` só em `appointment-arrival` |
| **G8** | O que NÃO será construído? | IA, mapas, booking, composer changes, hero redesign, scroll animado, toast, onboarding, multi-vertical |

**Gate:** ✅ PASS — prosseguir.

---

## Pergunta de escopo

```txt
Se este ajuste desaparecer amanhã,
o produto continua sendo Social Landing?
```

**Sim.** Perda = scroll jump ao fechar chegada (regressão conhecida).

---

## Problema observado

Ao abrir drawer de chegada com página scrollada, `body overflow: hidden` resetava `scrollY` para 0. Ao fechar, usuário caía no topo — **ruptura de continuidade** feed ↔ chegada ↔ feed.

Violava implicitamente:

> closing drawer returns to same scroll context — PERCEPTUAL_INVARIANTS §2

---

## Implementação mínima

| Arquivo | Mudança |
|---------|---------|
| `action-drawer.tsx` | Prop opcional `preservePageScroll` — body lock com `position: fixed` + restore |
| `appointment-arrival-drawer.tsx` | `preservePageScroll` — só chegada |
| `appointment-feed.tsx` | `handleCloseArrival` nomeado (sem lógica extra) |

**Não alterado:** Maps, composer, hero, booking, linguagem, outros drawers.

---

## Validação

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |
| `ws11-arrival-scroll-continuity.mjs` | ✅ lock `-197px` → restore `197` |

Script: `node scripts/visual/ws11-arrival-scroll-continuity.mjs`

---

## Validação perceptiva pós-WS

| Fluxo | Antes | Depois |
|-------|-------|--------|
| Hero fold → chegada → fechar | OK | OK |
| Feed scroll → chegada → fechar | Jump para topo | **Retorna ao scroll anterior** |
| Composer pós-close | Retorna | Retorna (inalterado) |
| Atmosfera chegada | Preservada | Preservada |

```txt
O produto continua parecendo ele mesmo,
só um pouco mais contínuo.
```

---

## Critérios de falha — nenhum acionado

- Super app ❌
- Feature consciente de si ❌
- Competição emocional nova ❌
- Feed perde editorialidade ❌
- Sistema imunológico ignorado ❌ — G1–G8 respondidos antes do código

---

## Veredicto

**GO** — WS-11 valida cultura operacional pós-consolidação.

O primeiro WS funcional:

- passou gates §8
- manteve escopo micro
- reforçou contrato existente (scroll contínuo)
- não expandiu gramática central

---

## Próximo passo

Novos WS funcionais devem repetir: **G1–G8 por escrito → escopo micro → validação perceptiva**.

Etapa 3 permanece referência: [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md)

---

*Ritual de retorno — continuidade invisible, presença intacta.*
