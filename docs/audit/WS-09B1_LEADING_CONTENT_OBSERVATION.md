# WS-09B.1 — Leading Content — Observação Perceptiva Comparativa

**Data:** 2026-05-31  
**Runtime:** branch `workstream/hero-leading-content-pilot`  
**Viewport:** 390×844  
**Escopo:** Appointment / Barba Negra only

---

## Veredicto

**A reordenação perceptiva funciona.** Mover a hero para `leadingContent` (antes dos stories) torna a Barba Negra **primeira presença emocional** da dobra — sem matar feed, stories, composer ou sensação social-native.

**Recomendação: GO** — manter `leadingContent` no piloto Appointment; **não generalizar** ainda.

---

## O que mudou (implementação mínima)

| Artefato | Mudança |
|----------|---------|
| `business-social-landing.tsx` | Prop opcional `leadingContent` renderizada **entre** `BusinessFeedIntro` e `BusinessStories` |
| `appointment-feed.tsx` | Hero migrada de `topContent` → `leadingContent` |
| Outras verticais | **Zero alteração** |

### Ordem perceptiva

| Estado | Ordem |
|--------|-------|
| **Antes (WS-09B)** | Intro → Stories → Hero → Feed |
| **Depois (WS-09B.1)** | Intro → **Hero** → Stories → Feed |

Intro slim permanece como chrome social (carrinho, avatar, nome utilitário). Hero assume **primeira camada viva** imediatamente abaixo.

---

## Métricas comparativas (390×844)

| Métrica | Antes | Depois | Δ |
|---------|-------|--------|---|
| Hero top | 220px | **76px** | −144px (sobe 144px) |
| Hero height | 359px (42vh) | 359px (42vh) | = |
| Stories top | 76px | **435px** | desce após hero |
| Feed peek (1ª seção) | 241px | **241px** | = |
| Composer top | 767px | 767px | = |
| Intro+Hero+Stories | ~69vh | ~69vh | = (massa igual, ordem melhor) |

**Leitura:** mesma densidade vertical total, **melhor sequência emocional**. Feed peek **preservado** — critério crítico atendido.

---

## Screenshots comparativos

| Estado | Arquivo |
|--------|---------|
| Antes (`topContent`) | `docs/audit/ws09b1-before-fold.png` |
| Depois (`leadingContent`) | `docs/audit/ws09b1-after-fold.png` |

### Antes

Stories dominam o topo visual; cover da barbearia aparece só na metade inferior da dobra.

### Depois

Cover + status “Aberto agora” entram logo após intro slim; stories descem mas permanecem acessíveis; peek de “Agendar Horario” / serviços mantido.

---

## 1. Hero como presença inevitável

| Pergunta | Antes | Depois |
|----------|-------|--------|
| Parece parte natural? | Sim, mas tardia | **Sim, e mais cedo** |
| Marca antes do feed? | Parcial | **Clara** |
| Produto incompleto sem hero? | Sim (Appointment) | **Mais ainda** — ordem reforça expectativa |
| Parece enxertada? | Levemente (slot `topContent`) | **Menos** — entrada emocional coerente |

> A hero deixa de “aparecer no meio do feed” e passa a **abrir a experiência da marca**.

---

## 2. Stories ↔ Hero (crítico)

| Pergunta | Resposta pós-09B.1 |
|----------|-------------------|
| Stories perdem força? | **Levemente na dobra 0** — exigem micro-scroll (~144px) para rings completos |
| Stories ganham contexto? | **Sim** — rings “Agendar / Cortes / Barba” leem como extensão da casa já vista |
| Primeiro gesto social? | Hero emocional primeiro; stories como **segundo acto** — mais narrativo, menos Instagram-clone puro |
| Dívida perceptiva WS-09B? | **Resolvida** para ordem hero-before-stories |

**Trade-off aceito:** stories não são mais o primeiro pixel emocional, mas ganham coerência semântica com a hero.

---

## 3. Intro slim

Intro **permanece necessário** (chrome). Redundância nome/logo com overlay da hero **persiste** — dívida menor, fora do escopo 09B.1.

---

## 4. Feed protagonism

| Critério | Status |
|----------|--------|
| Feed protagonista | ✅ Exploração domina scroll total |
| Hero contextualiza sem matar | ✅ Peek 241px inalterado |
| Nasce organicamente | ✅ Highlights → seção “Agendar Horario” |
| Landing page? | ❌ Composer visível; feed pressentido |

---

## 5. Composer

Anchor inferior **inalterado**. Hero antes dos stories **não** aumenta competição cognitiva com composer — zonas separadas.

---

## 6. Percepção geral

| Dimensão | Antes WS-09B.1 | Depois WS-09B.1 |
|----------|----------------|-----------------|
| Viva | ✅ | ✅✅ |
| Inevitável | ⚠️ | ✅ |
| Social-native | ✅ | ✅ |
| Operacional | ✅ | ✅ |
| Peso / complexidade | Leve | Leve (mesma massa) |

A Social Landing em Appointment agora lê:

```txt
chrome → presença viva → gesto social → exploração → conversa
```

Isso aproxima a gramática do `HERO_OPERATIONAL_AUDIT.md` §2.1 sem virar landing page.

---

## 7. Critérios de aceite

| Critério | Resultado |
|----------|-----------|
| Hero mais inevitável | ✅ |
| Entrada mais viva | ✅ |
| Stories naturais | ✅ (com micro-scroll) |
| Feed protagonista | ✅ |
| Composer dominante | ✅ |
| Sem landing page | ✅ |
| Sem dashboard | ✅ |
| Sem excesso above-fold | ⚠️ ~69vh combinado — igual ao antes; monitorar |

---

## Riscos

| Risco | Severidade | Nota |
|-------|------------|------|
| Stories menos visíveis na dobra 0 | Baixa | Scroll mínimo; ganho de contexto compensa |
| Slot `leadingContent` vira padrão cedo demais | Média | Manter Appointment-only até 2º piloto |
| Alteração Tier 1 (BSL) | Baixa | Additive, 3 linhas, reversível |
| Generalização prematura | Média | **Não expandir** agora |

---

## Gates

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm ts:budget` | ✅ |
| `pnpm build` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |
| `pnpm qa:events` | ✅ 8/8 |

---

## Decisão

**Manter WS-09B.1 no piloto Appointment.**

- `leadingContent` resolve a dívida perceptiva mapeada no pós-merge WS-09B
- Implementação mínima sobrevive aos gates
- **Pausa** antes de generalizar ou refinar intro/hero redundância

**Não fazer agora:**

- Expandir para restaurant/ecommerce
- Absorver intro no shell
- Hero compacta / redesign visual
- Abstração cross-vertical

---

## Referências

- `WS-09B1_LEADING_CONTENT_AUDIT.md` — auditoria pré-implementação
- `WS-09B_POST_MERGE_OBSERVATION.md` — dívida que motivou 09B.1
- `HERO_OPERATIONAL_AUDIT.md` — ordem ideal §2.1
- Screenshots: `ws09b1-before-fold.png`, `ws09b1-after-fold.png`
