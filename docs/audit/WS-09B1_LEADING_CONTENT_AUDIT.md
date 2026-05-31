# WS-09B.1 — Leading Content Slot — Auditoria Perceptiva Rápida

**Data:** 2026-05-31  
**Objetivo:** validar viabilidade de `leadingContent` antes de stories  
**Viewport:** 390×844

---

## 1. Ordem perceptiva — comparação

| Layout | Ordem | Leitura |
|--------|-------|---------|
| **Atual (WS-09B)** | Intro → Stories → Hero → Feed | Social-first; marca viva atrasa ~220px |
| **Proposto A** | Intro → Hero → Stories → Feed | **Escolhido** — chrome mínimo + presença antes do gesto social |
| **Proposto B** | Hero → Stories → Feed (sem intro) | Quebra chrome multi-vertical; exigiria Tier 1 maior |
| **Híbrido compacto** | Hero reduzida + Stories | Risco de dupla compressão; não necessário no piloto |

### Decisão de auditoria

**Implementar Proposto A** via slot `leadingContent` additive:

- Preserva identidade Social Landing (intro + stories intactos)
- Coloca mídia dominante como **primeira presença emocional** pós-chrome
- Mantém feed protagonista (peek medido igual)
- Evita landing page (composer + feed peek na dobra)

---

## 2. Stories

| Pergunta | Resposta esperada / medida |
|----------|---------------------------|
| Perdem força? | **Não eliminadas** — descem na dobra inicial, permanecem visíveis com scroll mínimo |
| Ganham contexto? | **Sim** — usuário já sabe “onde está” antes dos rings |
| Devem ficar abaixo da hero? | **Sim** — alinhado ao audit §2.1 (highlights/hero antes de stories) |
| Sobreposição? | **Não** — mantida separação clara |
| Primeiro gesto social? | **Compartilhado** — intro utilitário → hero emocional → stories exploratórios |

Stories deixam de ser o **primeiro** gesto, mas ganham **contexto de marca** — trade-off aceito para Appointment piloto.

---

## 3. Composer

| Pergunta | Resposta |
|----------|----------|
| Continua anchor? | Sim — top ~767px inalterado |
| Hero acima aumenta peso? | Levemente no topo, mas feed peek compensa |
| Competição hero ↔ stories ↔ composer? | Não — zonas verticais distintas |

---

## 4. Feed peek

| Métrica | Antes (`topContent`) | Depois (`leadingContent`) |
|---------|----------------------|---------------------------|
| Hero top | 220px | **76px** |
| Feed peek (1ª seção) | 241px | **241px** |
| Composer top | 767px | 767px |
| Hero %vh | 42% | 42% |

**Critério atendido:** feed continua pressentido na dobra; sem efeito tela fechada.

---

## 5. Viabilidade técnica

| Requisito | Abordagem |
|-----------|-----------|
| Mínimo | 1 prop opcional `leadingContent?: ReactNode` |
| Tier 1 | Additive only — 3 linhas no render; zero impacto em verticais sem slot |
| Escopo | Appointment only |
| Reversível | Remover prop + voltar `topContent` |

**Auditoria: GO para implementação piloto.**
