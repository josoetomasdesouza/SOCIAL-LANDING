# WS-21C — VALIDATED

**Status:** ✅ Checkpoint · descoberta WS-21 encerrada  
**Merge:** PR #93 → `785d0c0`  
**Baseline anterior:** `724d880` (WS-21 R0–R2)  
**Data:** 2026-06-05

---

## Premissa consolidada (não reabrir)

```txt
Idle   = Landing-first
Engaged = Conversation-centered   (gatilho: primeira mensagem enviada)
```

**Hierarquia engaged:** Conversa → Contexto → Ação

---

## O que WS-21 respondeu vs WS-21C

| Fase | Pergunta | Resposta |
|------|----------|----------|
| WS-21 R0–R2 | Onde a conversa vive? | Thread in-flow, monoscroll, junction, clearance |
| **WS-21C** | **Quem manda na tela?** | **A conversa** |

Até R2 o ganho era **estrutural**. WS-21C entregou ganho **perceptivo** — perceptível sem explicar arquitetura.

```txt
Antes:  Landing com conversa
Depois: Conversa com contexto
```

---

## O que mudou perceptivamente

| Elemento | Engaged (pós-#93) |
|----------|-------------------|
| **Hero** | Cartão de contexto — cover ~11vh, CTA/chips ocultos, contraste reduzido |
| **Stories / sections** | Orbita — opacity ~38–46%, saturate/contrast reduzidos (appointment + v2) |
| **Thread** | Sala — gradiente, respiro vertical (`mt-7`), junção reforçada |
| **User turn** | Editorial in-flow — sem bubble messenger |
| **AI turn** | Interlocutor — acento lateral, peso tipográfico |
| **Composer** | Base da sala — topo achatado, sombra ascendente; chip rail quieto |
| **Idle** | **Inalterado** |

**Pilot:** `/demo?composer-layout=v2` → Agendamento (Barba Negra)

---

## Evidência visual

Capturas @ 390×844 — `docs/audit/ws21c-engaged-prototype/`

| Estado | Antes (main @ 724d880) | Depois (WS-21C) |
|--------|------------------------|-----------------|
| Idle | `before-idle-390.png` | `after-idle-390.png` (equivalente) |
| Engaged @ T+2s | `before-engaged-390.png` | `after-engaged-390.png` |

Re-capturar: `node scripts/visual/ws21c-engaged-perceptual-capture.mjs`

**Teste de validação humana:**

> Se alguém que nunca viu o projeto compara before/after engaged, percebe que a conversa virou protagonista?

**Resposta registrada:** Sim.

---

## Sinais E-01…E-10 (pós-WS-21C)

| ID | Sinal | Antes R2 | Pós-#93 |
|----|-------|----------|---------|
| E-01 | Modo legível | FAIL | **PASS** |
| E-02 | Sala definida | FAIL | **PASS** |
| E-03 | Ancoragem conversa | parcial | **PASS** |
| E-04 | Recuo catálogo | FAIL | **PASS** |
| E-05 | Paridade turnos | FAIL | **PASS** |
| E-06 | Presença composer integrada | FAIL | **PARTIAL** |
| E-07 | Marca no diálogo | FAIL | **PARTIAL** (visual ↑; copy unchanged) |
| E-08 | Contexto invocável | PASS | **PASS** |
| E-09 | Ação in-flow | parcial | **PASS** |
| E-10 | Anti-widget | FAIL | **PARTIAL** |

**Proibidos resolvidos:** X-03 messenger bubble · X-04 FAQ plain · X-06 catálogo denso igual idle  
**Proibidos residuais:** X-05 composer ilia (leve)

---

## O que ainda falta (refinamento — não bloqueia)

1. Composer ainda parece um pouco ilha (smoke-fume / E-06)
2. Voz da marca depende de copy/resolver (E-07)
3. Hero recuado explícito só no scroll up revisitado
4. User turn pode evoluir para linguagem editorial mais forte

**Não é descoberta.** Trabalho futuro parte da premissa validada acima.

---

## Stack WS-21 completo (main)

| Fase | Commit | Entrega |
|------|--------|---------|
| R0 | `f5bd45f` | `composer-layout=v1\|v2` flag |
| R1 | `99b5b07` | Thread portal in-flow |
| R2 | `724d880` | Junction smoke-fume v2 |
| **C** | **`785d0c0`** | **Protótipo perceptivo engaged** |

---

## Rollback

- Runtime: omitir `composer-layout=v2` (default v1)
- Código: revert `785d0c0`

---

*Checkpoint · Não autoriza R3 automático · Premissa engaged fechada para novos workstreams.*
