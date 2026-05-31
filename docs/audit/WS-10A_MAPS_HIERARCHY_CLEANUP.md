# WS-10A — Perceptual Debt Cleanup · Maps Hierarchy Tension

**Data:** 2026-05-31  
**Baseline pós:** `main` + WS-10A micro-ajustes  
**Escopo:** PDC-01 only — dominância Maps/footer no drawer de chegada  
**Regra:** reduzir ruído perceptivo, não “deixar mais bonito”

---

## Veredicto

**Sucesso perceptivo parcial — GO com limite.**

O bloco Maps deixou de **sequestrar emocionalmente** o drawer. Copy humano retoma protagonismo visual; Maps permanece acessível como **fallback operacional**, não CTA primário.

Ruptura residual: **composer + debug panel** na base (PDC-05 — fora de escopo WS-10A).

---

## Problema validado (S1/S2/S3)

```txt
Copy humano
↓
Maps sólido preto + composer
↓
UI tradicional
```

Estrutural · reproduzível · independente de velocidade · agravado @ 320px.

---

## Micro-ajustes aplicados

| Alvo | Antes | Depois | Intenção |
|------|-------|--------|----------|
| Maps CTA | `primaryAction` sólido preto, h-11 | `outline` h-10, font-normal, bg claro, border/50 | Fallback, não protagonista |
| WhatsApp | outline h-11 | outline h-10, tom muted secundário | Paridade fallback |
| Footer gap | gap-2 | gap-1.5 + content `pb-1` | Cadence copy → ações |
| Footer chrome (sm) | border/50, pt-3 pb-4 | border/30, pt-2 pb-3 | Menos peso divisório |

**Arquivos:** `appointment-arrival-drawer.tsx`, `action-drawer.tsx` (somente `size="sm"` — só chegada).

**Não alterado:** copy, fluxo, mapas embed, IA, gramática `na Augusta`, hero, booking.

---

## Comparação área visual (proxy)

| Viewport | Context area | Maps area | Context > Maps |
|----------|--------------|-----------|----------------|
| 390 slow **antes** (S1) | 17 184 | 15 752 | ✅ marginal |
| 390 slow **depois** | 17 184 | 14 320 | ✅ claro |
| 320 slow **depois** | 13 824 | 11 520 | ✅ claro |

Maps height @ 320: **7.7% → 7.0% vh** — redução leve; ganho principal é **contraste emocional** (sem bloco preto).

---

## Screenshots

| Estado | 390×844 | 320×568 |
|--------|---------|---------|
| **Antes** | `ws10-s1-04-arrival-drawer-detail.png` | `ws10-s3-05-arrival-copy-dwell.png` |
| **Depois** | `ws10a-after-390-slow.png` | `ws10a-after-320-slow.png` |
| Rush 320 | — | `ws10a-after-320-rush.png` |

---

## Testes perceptivos pós-cleanup

### 390×844 · lento

| Pergunta | Antes | Depois |
|----------|-------|--------|
| Drawer = conversa? | Parcial | **Sim** |
| Maps sequestra? | Sim | **Reduzido** |
| Chegada sentida com Maps visível? | Frágil | **Sim** |

### 320×568 · lento

| Pergunta | Antes | Depois |
|----------|-------|--------|
| Presença sobrevive? | Sim (com ruptura) | **Sim — ruptura menor** |
| Base claustrofóbica? | Sim | **Parcial** (composer permanece) |
| Maps domina? | Crítico | **Moderado** |

### 320×568 · rush

| Pergunta | Resultado |
|----------|-----------|
| Path hero→chegada intacto? | ✅ |
| Maps ainda primeiro contraste no footer? | ⚠️ Sim, mas outline — não preto |

---

## Critérios de sucesso / falha

| Critério | Status |
|----------|--------|
| Usuário sente chegada mesmo com Maps na tela | ✅ |
| Maps não sequestra emocionalmente | ✅ melhorado |
| Função preservada | ✅ |
| Drawer não virou hub operacional | ✅ |
| Minimalismo extremo / CTA escondido | ❌ não aplicado |
| Composer overlap resolvido | ☐ fora de escopo |
| Feed/hero humanidade | ✅ inalterados |

---

## O que NÃO entrou (deliberado)

- Mapas embed / ETA / IA
- Redesign drawer inteiro
- Novo componente
- Composer hide durante chegada (PDC-05 — WS futuro)
- Feed peek 320 (PDC-06 — estrutural)

---

## Gates

| Gate | Resultado |
|------|-----------|
| `pnpm typecheck` | ✅ |
| `pnpm qa:appointment` | ✅ 8/8 |

---

## Conclusão

WS-10A cumpre missão **dentro do escopo Maps hierarchy**:

> O usuário continua sentindo chegada/contexto mesmo quando Maps existe na tela.

Próximo debt candidato natural (não aberto aqui): **PDC-05 composer coexistence @ 320px**.

---

*Cleanup perceptivo — silêncio restaurado no footer, função intacta.*
