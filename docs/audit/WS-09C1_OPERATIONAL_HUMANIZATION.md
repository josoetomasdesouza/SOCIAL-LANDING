# WS-09C.1 — Operational Context Humanization

**Data:** 2026-05-31  
**Viewport:** 390×844  
**Escopo:** copy + hierarquia da linha operacional — Appointment / Barba Negra

---

## Veredicto

A linha deixou de ler como **metadado sobre a imagem** e passou a soar como **alguém explicando o lugar em uma frase** — com bairro humano, disponibilidade do momento e horário sugerido, sem ficha técnica.

**Recomendação: GO** — densidade e shell inalterados; copy e ritmo visual refinados.

---

## Antes (WS-09C) → Depois (WS-09C.1)

| Aspecto | WS-09C | WS-09C.1 |
|---------|--------|----------|
| Copy | `Aberto agora · Centro · encaixe leve hoje · cortes R$45–70` | `Aberto agora · na Augusta · encaixe leve hoje · até 20h` |
| Local | Genérico (“Centro”) | **Micro-lugar** (“na Augusta” — alinhado ao endereço mock) |
| Horário | Ausente na linha | **“até 20h”** — humano, não grade |
| Preço na overlay | R$45–70 | **Removido** — evita ficha técnica; preço fica no feed |
| Layout dot | Flex separado, dot grande com glow | **Inline** com live state, dot menor, sem glow |
| Tipografia | `text-sm`, bloco “lista” | `text-[13px]`, leading 1.55, **drop-shadow** integrado à cena |
| Sensação | Metadado legível | **Fala contextual** |

---

## Screenshots

| Estado | Arquivo |
|--------|---------|
| Antes (WS-09C) | `docs/audit/ws09c1-before-humanization.png` |
| Depois (WS-09C.1) | `docs/audit/ws09c1-after-humanization.png` |

---

## O que ficou mais humano

| Elemento | Por quê |
|----------|---------|
| **“na Augusta”** | Referência de rua/bairro, não rótulo geográfico |
| **“encaixe leve hoje”** | Disponibilidade do momento, não slot de agenda |
| **“até 20h”** | Horário como conversa, não tabela Seg–Sáb |
| **Ritmo inline** | Dot + estado + resto na mesma frase falada |
| **Sem preço na overlay** | Menos plataforma, mais casa |

---

## O que ficou mais útil

- Visitante entende **onde** (Augusta), **como está agora** (encaixe leve), **até quando** (20h)
- Responde: *“esse lugar parece real, acessível e acontecendo agora?”* — **sim**, melhor que WS-09C
- Informação orienta decisão emocional sem exigir drawer

---

## O que foi evitado

- Mapa, coordenadas, telefone, rating
- Segunda linha, badges, chips extras
- Horário completo / grade semanal
- Preço e métricas na hero
- Backend, APIs, Google sync
- Alteração de shell, feed, stories, composer

**Direção futura preservada:** Hero sugere lugar → tap contextual → drawer → Maps (não implementado).

---

## Limite que começou a aparecer

| Limite | Descrição |
|--------|-----------|
| **Comprimento da linha** | ~52 chars na cauda — perto do teto; mais um sinal quebra “frase de amigo” |
| **4 segmentos middot** | Máximo confortável; 5º segmento → enciclopédia |
| **Mock estático** | “encaixe leve hoje” não muda com hora real — ok no piloto |
| **Derivação do lugar** | “na Augusta” manual; futuro pode derivar de `config.address` com regra humana |

**Densidade ideal confirmada:** `liveState` + **3 sinais** (lugar · momento · horário).

---

## Modelo de dados (estruturado, renderizado como 1 linha)

```ts
{
  liveState: "Aberto agora",
  placeHint: "na Augusta",
  momentHint: "encaixe leve hoje",
  hoursHint: "até 20h",
}
```

Campos opcionais (`momentHint`, `hoursHint`) permitem tipologias futuras sem segunda linha.

---

## Critérios de aceite

| Critério | Status |
|----------|--------|
| Hero mais real | ✅ |
| Marca mais presente | ✅ |
| Linha humana | ✅ |
| Informação sem peso | ✅ |
| Elegante / respira | ✅ |
| Não Google Business | ✅ |
| Não dashboard | ✅ |

---

## Gates

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm build` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |
| `pnpm qa:events` | ✅ 8/8 |

---

## Referências

- `WS-09C_OPERATIONAL_CONTEXT_REFINEMENT.md` — contraste e dot (base)
- `HERO_OPERATIONAL_AUDIT.md` §1.5 — status operacional
- Screenshots: `ws09c1-before-humanization.png`, `ws09c1-after-humanization.png`
