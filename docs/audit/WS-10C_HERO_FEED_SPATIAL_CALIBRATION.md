# WS-10C — Hero / Feed Spatial Calibration @ 320

**Data:** 2026-05-31  
**Baseline antes:** WS-10B.1 @ `1dea6e3`  
**Baseline depois:** WS-10C micro-ajustes estruturais  
**Escopo:** PDC-06 + PDC-07 only @ 320×568  
**Regra:** continuidade hero/feed — não comprimir alma do hero

---

## Veredicto

**GO — sucesso perceptivo dentro do escopo travado.**

O feed passa a existir como **promessa perceptiva** (~87px peek vs ~26px antes) sem o hero perder presença (cover, linha operacional, `na Augusta` intactos). 390×844 **inalterado**.

---

## Pergunta central

> Como fazer o feed existir perceptivamente sem enfraquecer o hero?

**Resposta:** calibrar **cadence vertical** no viewport estreito — densidade inferior do hero + transição hero → stories → feed — sem reduzir cover nem linguagem.

---

## Micro-ajustes aplicados

| Alvo | Antes | Depois (@ ≤360px) | Intenção |
|------|-------|-------------------|----------|
| Hero min/max cap | 40–55vh | **36–50vh** | Contenção calibrada, não remoção |
| Cover flex | 38% max 38vh | **36% max 34vh** | Preserva atmosfera, libera cadence |
| Painel inferior gap/py | gap-3 py-3 | **gap-2 py-2** | PDC-07 densidade |
| CTA | h-11 | **h-10** | Cadence, função intacta |
| Pills | py-1.5 | **py-1** | Respiração inferior |
| Stories strip (appointment) | py-5 | **py-3.5** | Transição hero → feed |
| Sections wrapper (appointment) | py-6 | **pt-4 pb-6** | Primeira seção sobe |

**Arquivos:** `appointment-operational-hero.tsx`, `appointment-feed.tsx`, `business-social-landing.tsx` (props opcionais — só appointment usa).

**Não alterado:** Maps, composer, drawer, booking, copy, IA, novos componentes.

---

## Teste da regra central

> Isso aumenta continuidade hero/feed ou apenas comprime o hero?

**Continuidade.** Hero @ 320: 52.5% → **45.2% vh** — presença mantida; ganho veio de **cadence inferior + transição**, não de amputar cover ou linha operacional.

---

## Métricas before/after

| Métrica | Antes (10B.1) | Depois (10C) | Δ |
|---------|---------------|--------------|---|
| feedPeekPx @ 320 | **26** | **87** | **+61px** |
| heroPctVh @ 320 | 52.5% | 45.2% | −7.3pp |
| feedPeekPx @ 390 | 241 | **241** | 0 |
| heroPctVh @ 390 | 42.5% | **42.5%** | 0 |
| Linha operacional visível | ✅ | ✅ | — |
| `na Augusta` tapável | ✅ | ✅ | — |

---

## Screenshots

| Fluxo | Antes | Depois |
|-------|-------|--------|
| 320 slow fold | `ws10b1-320-01-hero.png` | `ws10c-after-320-01-hero-fold.png` |
| 320 scroll leve | — | `ws10c-after-320-02-scroll-light.png` |
| 320 pós-chegada | `ws10b1-320-04-feed-return.png` | `ws10c-after-320-03-feed-return.png` |
| 320 rush | `ws10b1-320-rush-02-scroll.png` | `ws10c-after-320-rush-02-scroll.png` |
| 390 slow | `ws10b1-390-01-hero.png` | `ws10c-after-390-01-hero-fold.png` |

---

## Fluxos obrigatórios — observação

### 320×568 · lento

| # | Observação |
|---|------------|
| Entrada hero | Cover + linha falada + `na Augusta` — **alma intacta** |
| Feed como promessa | **"Agendar Horario"** visível no fold — feed deixa de ser fantasma |
| Scroll leve | Continuação, não troca de app |
| `na Augusta` → retorno | Arco 10A/10B preservado |

### 320×568 · rush (~2.9s)

| # | Observação |
|---|------------|
| Hero flash | Feed peek **já presente** no fold — rush não começa cego |
| Scroll rush | Feed legível — sensação lista ainda possível em velocidade extrema (limite conhecido) |

### 390×844 · lento

| # | Observação |
|---|------------|
| Regressão | **Nenhuma** — métricas idênticas |
| Presença | Mantida |

---

## 5 critérios observados

| Critério | Status |
|----------|--------|
| Feed existe como promessa sem matar hero | ✅ |
| Hero mantém alma / linha operacional | ✅ |
| `na Augusta` natural | ✅ |
| Não virou landing comum / layout hack | ✅ |
| 390 preservado | ✅ |

---

## Critérios de falha — nenhum acionado

- Hero perdeu alma ❌
- Linha operacional comprimida demais ❌
- Feed virou lista utilitária no fold ❌ (só header peek)
- Appointment normalizado ❌

---

## Gates

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |

---

## Conclusão

WS-10C cumpre missão com escopo travado:

```txt
O feed passa a existir como promessa perceptiva
sem o hero perder presença.
```

**Stack perceptivo Appointment @ 320:** hero contextual → peek feed → stories → seção — cadence mais contínua.

**Próximo passo sugerido:** observação humana breve; **não** abrir WS-10D sem decisão — núcleo local + estrutural @ 320 calibrado.

---

*Calibragem espacial — feed promete, hero permanece.*
