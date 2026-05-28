# P0-01 Scroll Lock Diagnosis — RU-01

**Data:** 2026-05-23  
**Baseline remoto:** `254db1f` (P0-03 publicado)  
**Escopo:** diagnóstico read-only — **nenhum código alterado**

---

## 1. RU-01 confirmado?

### Veredicto: **NÃO reproduzido como bug de scroll lock** nos paths padrão

| Classificação | Resultado |
|---------------|-----------|
| Bug real (overflow preso com drawer fechado) | **Não reproduzido** com close bem-sucedido |
| Falso positivo do sweep original | **Confirmado** |
| Risco arquitetural latente (sem ref-count) | **Sim** — documentado, não manifestado nos testes |

---

## 2. Passos exatos para reproduzir (ou refutar)

### Path A — reproduz o alerta RU-01 original (falso positivo)

1. `/demo` → **Imobiliaria**
2. Tap no primeiro `section article` (Tour Virtual / feed drawer)
3. **Não fechar** o drawer (ou falhar close — ver abaixo)
4. Inspecionar `document.body.style.overflow`

**Resultado:** `hidden` — **esperado enquanto drawer aberto**

### Path B — close falha no automático (causa raiz do RU-01)

O sweep em `REAL_USAGE_VALIDATION.md` usava:

```js
getByRole('button', { name: 'Fechar' })
```

Em realestate com feed drawer aberto, Playwright reporta **strict mode violation — 3 elementos**:

1. `<button aria-label="Fechar">` — close real do `BusinessFeedDrawer`
2. `<article role="button">` — PostCard dentro do drawer (título contém texto que matcha)
3. Outro `<article role="button">` duplicado

**Close não executa → drawer permanece aberto → overflow permanece `hidden`.**

Isso explica a linha da tabela original: `realestate | ⚠️ close? | body overflow hidden`.

### Path C — close bem-sucedido (comportamento correto)

1. `/demo` → Imobiliaria
2. Tap `section article` → feed drawer abre
3. Close: `getByRole('button', { name: 'Fechar', exact: true })`
4. Inspecionar overflow

**Resultado:** `body.style.overflow = ""` · drawer fechado · scroll OK

### Path D — property ActionDrawer (realestate-specific)

1. Tap card imóvel `[data-post-context-source^="property-"]`
2. Close: `.fixed.bottom-0.z-50 button.h-9.w-9` (botão X do ActionDrawer)
3. Inspecionar overflow

**Resultado:** overflow limpo · overlay removido

### Path E — visit ActionDrawer

1. Property → **Agendar visita** (`force: true` — composer pode interceptar tap)
2. Close X no ActionDrawer visita

**Resultado:** overflow limpo

### Path F — controle ecommerce

Mesmo path feed drawer + `Fechar exact` → overflow limpo (mobile + desktop)

---

## 3. Drawer / stack responsável

| Drawer | Stack | Scroll lock | realestate |
|--------|-------|-------------|------------|
| `BusinessFeedDrawer` | BSL / Stack A | `body.style.overflow` direct | ✅ usado (PostCards) |
| `PropertyDetailDrawer` | `ActionDrawer` | idem | ✅ usado |
| Visit scheduling | `ActionDrawer` | idem | ✅ usado |
| shadcn/vaul | Stack B | — | ❌ não usado em realestate |

**Implementação scroll lock (3 cópias idênticas):**

- `components/business/action-drawer.tsx` (L37–46)
- `components/business/business-feed-drawer.tsx` (L245–254)

```tsx
useEffect(() => {
  if (isOpen) document.body.style.overflow = "hidden"
  else document.body.style.overflow = ""
  return () => { document.body.style.overflow = "" }
}, [isOpen])
```

realestate monta **até 2 ActionDrawers** (property + visit) + **1 BusinessFeedDrawer** (BSL) — todos com lock independente, **sem ref-count**.

---

## 4. Estado body/html — antes / durante / depois

| Fase | body.overflow | html.overflow | body classes | pointer-events | overlay DOM |
|------|---------------|---------------|--------------|----------------|-------------|
| Baseline | `(empty)` | `(empty)` | `font-sans antialiased` | `(empty)` | 0 |
| Feed drawer aberto | `hidden` | `(empty)` | unchanged | `(empty)` | feed backdrop |
| Feed drawer fechado (close OK) | `(empty)` | `(empty)` | unchanged | `(empty)` | 0 |
| Property drawer aberto | `hidden` | `(empty)` | unchanged | `(empty)` | action backdrop |
| Property drawer fechado (close OK) | `(empty)` | `(empty)` | unchanged | `(empty)` | 0 |

**Nunca observado:** classes extra em body/html, `pointer-events` inline, overflow em `documentElement`.

---

## 5. Classificação do problema

| Hipótese | Status |
|----------|--------|
| Scroll lock cleanup falhou com drawer fechado | **Refutada** nos paths testados |
| Overflow `hidden` com drawer ainda aberto | **Confirmada** — sweep não fechou drawer |
| Overlay residual montado após close OK | **Não observado** |
| Listener/cleanup pendente | **Não observado** |
| Backdrop click não fecha feed drawer (mobile) | **Observado** — drawer fica aberto (overflow correto) |
| Multi-drawer race (property→visit) com close OK | **Não reproduzido** |
| Seletor QA errado clica dot da galeria | **Observado** em teste amplo — falso STUCK |

---

## 6. Comparação vertical

| Vertical | Feed close OK | overflow pós-close | Notas |
|----------|---------------|-------------------|-------|
| realestate | ✅ (exact Fechar) | `(empty)` | RU-01 era false positive |
| ecommerce | ✅ | `(empty)` | controle |
| appointment | ⚠️ sweep | feed drawer nem sempre presente no path testado | Tutoriais PostCard |

---

## 7. Condições testadas

| Condição | Resultado |
|----------|-----------|
| Mobile 390×844 | OK com close correto |
| Desktop 1280×800 | OK com close correto |
| Botão Fechar (exact) | ✅ unlock |
| Backdrop feed drawer (mobile) | ⚠️ drawer não fecha — overflow permanece (correto) |
| Property X close | ✅ unlock |
| Visit drawer close | ✅ unlock |
| Troca vertical (reload) | Não testado isoladamente — unmount limpa effects |
| Scroll durante drawer | Não reproduziu stuck após close OK |

---

## 8. Risco perceptivo

| Nível | Descrição |
|-------|-----------|
| **P0 real (hoje)** | **Baixo** — não reproduzido com interação humana normal (Fechar/X) |
| **P1 observacional** | Sweep/QA pode continuar reportando falso positivo |
| **P2 arquitetural** | Multi-drawer sem ref-count — risco documentado em `EVENT_MAP.md`, não manifestado |
| **P2 UX** | Backdrop do feed drawer pode não fechar em mobile (drawer permanece) |

**Mobile Safari:** não testado em device físico nesta sessão — recomendado smoke humano curto.

---

## 9. Patch mínimo recomendado

### Não aplicar ainda — priorização sugerida

| Prioridade | Ação | Motivo |
|------------|------|--------|
| **P2 — QA** | Corrigir scripts de validação: `Fechar, exact: true` ou `aria-label` específico | Elimina RU-01 false positive |
| **P2 — hardening** | `useBodyScrollLock` ref-count (Fase compat layer) | Previne race futuro multi-drawer — **não urgente** se RU-01 refutado |
| **P3 — UX** | Investigar backdrop click feed drawer mobile | Drawer não fecha — overflow correto mas UX ruim |
| **P3 — a11y** | PostCards `role="button"` colidem com query "Fechar" | Melhora automação e screen readers |

### Não recomendado agora

- Refactor massivo ActionDrawer
- Patch emergencial só em realestate
- Misturar com P0-02 stack migration

---

## 10. Reclassificação P0-01

| Antes | Depois (pós-diagnóstico) |
|-------|--------------------------|
| P0 blocker — scroll lock realestate | **P2 hardening + QA fix** |
| Blocker Runtime Truth Mapping | **Removido** deste item |

**Gate Runtime Truth Mapping:** RU-01 **não bloqueia** — documentar como inconclusivo em Safari físico até smoke humano.

---

## 11. Critério de aceite desta fase

- [x] Reproduzir ou refutar RU-01
- [x] Identificar stack/drawer
- [x] Documentar estados body/html
- [x] Classificar tipo de falha
- [x] Propor patch sem implementar
- [x] Zero alteração de código

---

## Referências

- `docs/audit/REAL_USAGE_VALIDATION.md` (RU-01 origem)
- `docs/audit/BEHAVIOR_FIX_PRIORITY.md` (P0-01)
- `docs/convergence/P0_EXECUTION_PLAN.md`
- `components/business/action-drawer.tsx`
- `components/business/business-feed-drawer.tsx`
- `components/business/realestate/realestate-feed.tsx`
