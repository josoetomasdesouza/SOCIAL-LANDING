# WS-09D — Contextual Arrival Flow

**Data:** 2026-05-31  
**Viewport:** 390×844  
**Escopo:** Appointment / Barba Negra — chegada contextual mínima

---

## Veredicto

A marca passa a **conduzir até a chegada** sem virar app de mapas. O fluxo Hero → interesse → “Como chegar” → drawer editorial → Maps/WhatsApp lê como **acolhimento**, não ferramenta utilitária.

**Recomendação: GO** — piloto Appointment; observar organicamente antes de generalizar.

---

## Fluxo implementado

```txt
Hero (emocional + contexto operacional)
  ↓
CTA secundário discreto: "Como chegar"
  ↓
AppointmentArrivalDrawer (ActionDrawer sm)
  ↓
Abrir no Maps  |  Chamar no WhatsApp
```

**CTA principal preservado:** `Agendar horario` — filled, dominante.

**CTA secundário:** link textual `Como chegar` — abaixo do primário, acima dos highlights.

---

## Implementação (mínima)

| Artefato | Papel |
|----------|--------|
| `appointment-arrival-drawer.tsx` | Drawer leve — copy humana + 2 ações externas |
| `appointment-data.ts` | `barberShopArrivalContext` mock |
| `appointment-operational-hero.tsx` | `contextualActionLabel` + handler opcional |
| `appointment-feed.tsx` | State `arrivalDrawerOpen`, composer overlay |

### Drawer (conteúdo)

- Endereço humano: *Rua Augusta, 1500 — Jardins*
- Referência: cruzamento Paulista, portaria discreta
- Rota leve: vindo da Paulista
- Estacionamento conveniado
- Clima de chegada: movimento tranquilo após 18h
- **Sem** mapa embed, pin, coordenadas, ETA, trânsito

### Maps

Link externo apenas: `google.com/maps/search/?api=1&query=...`  
Maps como **destino final**, não experiência principal.

---

## Screenshots

| Momento | Arquivo |
|---------|---------|
| Hero + CTA “Como chegar” | `docs/audit/ws09d-hero-arrival-cta.png` |
| Drawer de chegada | `docs/audit/ws09d-arrival-drawer.png` |

---

## Observação perceptiva

### A chegada ficou mais natural?

**Sim.** O drawer usa tom de “amigo explicando o caminho” — parágrafos editoriais, não ficha. O visitante não sente abrir Waze/Google como produto principal; sente a casa **recebendo**.

### A marca parece mais acolhedora?

**Sim.** Fecha a lacuna “ok, como chego?” sem quebrar atmosfera da hero. A marca deixa de só convencer e começa a **conduzir**.

### Surgiu sensação Google-like?

**Não na hero.** No drawer, apenas botão “Abrir no Maps” no footer — padrão esperado, não painel de mapas.

### Limite que apareceu

| Limite | Nota |
|--------|------|
| Mock estático | Rotas/estacionamento não dinâmicos — ok no piloto |
| Maps externo | Quebra silenciosa para app nativo — intencional |
| Dois CTAs na hero | Secundário **textual** — monitorar se permanece subordinado |
| Profundidade | Hero → Drawer → Maps (máx. 2 saltos antes de externo) — dentro do contrato |

### O que deve continuar fora da hero

- Mapa embed, distância, trânsito, ETA
- Horários completos, telefone em destaque na overlay
- Grid operacional, widgets
- Logística / tracking / geolocalização dinâmica

**Tudo isso:** drawer profundo, feed ou integração futura — **não hero**.

---

## Critérios de aceite

| Critério | Status |
|----------|--------|
| Marca mais acolhedora | ✅ |
| Chegada natural | ✅ |
| Experiência elegante | ✅ |
| Não app utilitário | ✅ |
| Drawer leve | ✅ |
| CTA não compete com agendamento | ✅ |
| Hero respira | ✅ |

---

## Gates

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm build` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |
| `pnpm qa:events` | ✅ 8/8 |

---

## Reversão

Remover `AppointmentArrivalDrawer`, props contextuais da hero, mock `barberShopArrivalContext`, state `arrivalDrawerOpen`.

---

## Referências

- `WS-09C1_OPERATIONAL_HUMANIZATION.md` — linha operacional “na Augusta”
- `WS-09B1_LEADING_CONTENT_OBSERVATION.md` — ordem perceptiva
- `HERO_OPERATIONAL_AUDIT.md` §4 — hero → drawer, profundidade máxima
