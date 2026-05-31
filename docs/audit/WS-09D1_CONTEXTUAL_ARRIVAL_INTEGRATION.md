# WS-09D.1 — Contextual Arrival Integration

**Data:** 2026-05-31  
**Viewport:** 390×844  
**Escopo:** integração orgânica chegada ↔ hero — Appointment / Barba Negra

---

## Veredicto

A chegada deixou de ser **feature colada** e passou a **nascer do contexto operacional**. Tap em `na Augusta` abre o drawer; copy humano + CTA Maps fecham o fluxo sem mapa quebrado.

**Recomendação: GO** — fluxo hero → contexto → chegada validado após polish visual.

---

## Antes (WS-09D) → Depois (WS-09D.1)

| Aspecto | WS-09D | WS-09D.1 |
|---------|--------|----------|
| Entry point | Link standalone “Como chegar” abaixo do CTA | **`na Augusta` clicável na linha operacional** |
| Ritmo visual | Quebra hierarquia hero | **Continuidade vertical intacta** |
| Drawer título | “Como chegar” | **“Chegar na Augusta”** — nasce do lugar |
| Mapa | Ausente | **Removido** — OSM static quebrava percepção premium |
| Drawer altura | 95dvh (vazio) | **Auto / content-fit** (`size="sm"`) |
| Sensação | hero → feature → externo | **hero → contexto → chegada** |

---

## Polish visual (pós-review)

| Ajuste | Decisão |
|--------|---------|
| Mini mapa OSM | **Removido** — placeholder quebrado pior que ausência |
| Altura do drawer | **`ActionDrawer` sm = auto height**, footer colado ao conteúdo |
| Place hint | Underline mais visível + chevron `›` + `cursor-pointer` |
| CTA principal | **“Abrir no Maps”** mantido no footer |

---

## Implementação

### Hero

- Removidos `contextualActionLabel` / link standalone
- `placeHint` renderizado como texto sublinhado na overlay (`appointment-arrival-place-hint`)
- Micro affordance: underline `white/50`, chevron discreto, hover suave — sem aparência de botão

### Drawer

Ordem perceptiva:

1. Título + endereço (header ActionDrawer)
2. Micro contexto humano (`referenceHint`)
3. Contexto complementar (rota, estacionamento, clima)
4. Abrir no Maps / WhatsApp

---

## Screenshots

| Momento | Arquivo |
|---------|---------|
| Hero integrada (sem link solto) | `docs/audit/ws09d1-hero-integrated-place-hint.png` |
| Drawer compacto (sem mapa) | `docs/audit/ws09d1-arrival-drawer-compact.png` |
| Referência WS-09D (link solto) | `docs/audit/ws09d-hero-arrival-cta.png` |

---

## Observação perceptiva

### A chegada ficou mais orgânica?

**Sim.** O usuário toca no **lugar que já leu** — “na Augusta” — e o drawer responde com “Chegar na Augusta”. Parece o lugar se orientando, não uma ferramenta aberta.

### O mapa ajudou ou pesou?

**Pesou negativamente na v1.** OSM static falhava no preview (ícone de imagem ausente). Removido até haver asset local confiável ou embed intencional.

### O entry point ficou natural?

**Sim, com reforço.** Integrado à frase operacional; affordance levemente mais legível sem virar botão.

### Surgiu sensação utilitária?

**Leve no drawer**, não na hero. Botão “Abrir no Maps” permanece footer — destino final, não experiência principal. Hero continua editorial.

---

## Critérios de aceite

| Critério | Status |
|----------|--------|
| “Como chegar” standalone removido | ✅ |
| Chegada integrada à hero | ✅ |
| Drawer compacto, sem vazio | ✅ |
| Mapa quebrado removido | ✅ |
| Place hint perceptível | ✅ |
| Atmosfera elegante | ✅ |
| Não Google clone | ✅ |
| Fluxo hero → contexto → chegada | ✅ |

---

## Gates

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm build` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |
| `pnpm qa:events` | ✅ 8/8 |

---

## O que continua fora da hero

- Mapa embed interativo, rotas, ETA, trânsito
- Link/botão “Como chegar” separado
- Coordenadas, distância, painéis operacionais

---

## Referências

- `WS-09D_CONTEXTUAL_ARRIVAL_FLOW.md` — drawer base
- `WS-09C1_OPERATIONAL_HUMANIZATION.md` — linha “na Augusta”
