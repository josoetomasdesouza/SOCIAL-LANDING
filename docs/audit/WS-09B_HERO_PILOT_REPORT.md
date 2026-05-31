# WS-09B — Hero Operacional V0 Piloto (Appointment / Barba Negra)

**Data:** 2026-05-24  
**Contrato:** `HERO_OPERATIONAL_AUDIT.md`  
**Escopo:** piloto isolado, reversível, sem Tier 1.

---

## 1. O que foi implementado

| Artefato | Descrição |
|----------|-----------|
| `appointment-operational-hero.tsx` | Hero v0 dedicada: mídia dominante → nome → status → headline → 1 CTA → highlights horizontais |
| `appointment-feed.tsx` | Wire via `topContent`; remove `SocialCompactHero` editorial duplicado; remove grid de quick-actions duplicado no `ScheduleModule` |
| `demo-event-checklist.mjs` | Step 5 passa a acionar CTA da hero antes do fluxo AI (evita poluição de estado do composer); steps renumerados 5→6 |

**Config piloto:** `APPOINTMENT_LANDING_CONFIG` com `description: ""` para reduzir redundância com intro utilitária (sem alterar Tier 1).

**CTA principal:** `Agendar horario` → `handleStartBooking()` (fluxo de booking existente, sem backend novo).

**Highlights:** Cortes, Barba, Visagismo, Avaliações, Ambiente — scroll suave para seções do feed ou reutilizam booking existente.

---

## 2. Nota perceptiva (observação do piloto)

### O que melhora

- A Barba Negra **aparece como presença** (cover + nome + status) antes do módulo operacional do feed.
- A hierarquia interna da hero respeita o contrato: mídia → identidade → operação → convite → exploração leve.
- Highlights parecem **continuação editorial**, não tabs de navegação.
- Remoção do bloco editorial duplicado (`SocialCompactHero`) e dos dois CTAs redundantes no `ScheduleModule` **alivia peso** na primeira dobra do feed.

### Compromisso consciente (limitação do piloto)

Sem alterar Tier 1 (`business-social-landing.tsx`), a hero usa o slot **`topContent`**, que renderiza **após** `BusinessFeedIntro` e `BusinessStories`.

Ordem atual:

`Intro (slim)` → `Stories` → **Hero operacional** → `Seções do feed`

Ordem ideal do audit (§2.1):

`Hero` → `Highlights` → `Stories` → `Feed`

**Impacto:** stories ainda precedem a hero na rolagem inicial. O piloto valida presença viva **antes das seções modulares**, não antes das stories. Recomendação futura (fora deste WS): slot `leadingContent` opcional no shell — mudança mínima e additive.

### Feed peek

Com hero entre stories e seções, o peek do feed depende de viewport e scroll. Em viewports altos, o header da seção "Agendar Horario" pode aparecer abaixo da hero (55vh cap). Em viewports baixos, o usuário rola naturalmente para o feed — sem sensação de landing page separada.

---

## 3. O que foi evitado propositalmente

| Evitado | Motivo |
|---------|--------|
| Alteração Tier 1 (BSL, composer, drawer core) | Congelado |
| Nova vertical ou generalização | Piloto Appointment only |
| `leadingContent` no shell | Evitar tocar Tier 1 neste PR |
| Grid de widgets, mapa, métricas, badges excessivos | Anti-patterns H-N01–H-N18 |
| Múltiplos CTAs principais na hero | Contrato §CTA |
| LLM, chatbot, IA explícita na hero | Escopo WS |
| Carrossel / autoplay agressivo | Hero estática com cover única |
| Dashboard visual / clone Google Business | Teste perceptivo, não utilitário |
| Backend, checkout real, Google sync | Fora de escopo |
| Abstração cross-vertical | Componente local `appointment-operational-hero` |
| Novas dependências visuais | Reuso de `socialPatternClasses` + UI existente |
| Restaurant, ecommerce, institutional | Não expandir piloto |

---

## 4. Riscos não introduzidos (confirmação)

| Risco | Status |
|-------|--------|
| Regressão drawer / composer / feed | Não alterados (Tier 1 intacto) |
| Nova cadeia de camadas | Hero → scroll ou booking drawer existente apenas |
| Competição visual com composer | Hero capped 55vh; composer permanece anchor |
| Dashboardização | Sem widgets, mapa ou métricas |
| Reserva real / pagamento | Não tocado |
| TypeScript / build | Validado nos gates do PR |

---

## 5. Reversão

1. Remover `topContent={operationalHero}` e restaurar `SocialCompactHero` + quick-actions no `appointment-feed.tsx`.
2. Deletar `appointment-operational-hero.tsx`.
3. Reverter step 6 em `demo-event-checklist.mjs` se necessário.

Nenhuma migração de dados ou flag global — reversão = revert de 2–3 arquivos.

---

## 6. Regra de ouro preservada

> Hero convida presença. Feed explora universo. Drawer aprofunda intenção. Composer continua conversa.
