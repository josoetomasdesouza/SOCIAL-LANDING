# P0-02 Fase 1 — Provider Wrap Stack B

**Data:** 2026-05-23  
**Escopo:** `ConversationSelectionProvider` em personal, influencer, institutional  
**UI / drawers / morph:** inalterados

---

## Objetivo

Alinhar Stack B ao contrato global de contexto conversacional **sem migrar drawers** nem alterar layout.

---

## Investigação pré-implementação

| Pergunta | Resposta |
|----------|----------|
| Onde renderizadas? | `app/demo/page.tsx` → `PersonalFeed`, `InfluencerFeed`, `InstitutionalFeed` |
| Provider acima? | **Não** — BSL usava `useConversationSelectionState()` local isolado |
| Composer presente? | **Sim** — via BSL default `ConversationalAI` |
| Wrap no nível feed? | **Sim** — mesmo pattern que `events-feed.tsx` |
| Quebra com provider? | **Não** — smoke OK |
| Fragment prop leak? | **Pré-existente** — não aumentou (1 warning/vertical) |

---

## Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `components/business/personal/personal-feed.tsx` | +import, +hook, +Provider wrap |
| `components/business/influencer/influencer-feed.tsx` | idem |
| `components/business/institutional/institutional-feed.tsx` | idem |

**Diff:** ~+21 linhas / arquivo (import + hook + wrapper JSX)

---

## Pattern aplicado

```tsx
export function XFeed() {
  const conversationSelection = useConversationSelectionState()
  // ... estado drawer existente ...

  return (
    <ConversationSelectionProvider value={conversationSelection}>
      <>
        <BusinessSocialLanding ... />
        {/* shadcn Drawers inalterados */}
      </>
    </ConversationSelectionProvider>
  )
}
```

Identical to Stack A feeds (e.g. `events-feed.tsx`).

---

## Mudança visual

**Nenhuma.** Drawers shadcn, composer, sections, morph paths inalterados.

---

## Validação

| Check | Resultado |
|-------|-----------|
| `/demo` personal | ✅ main + composer |
| `/demo` influencer | ✅ + feed drawer open/close |
| `/demo` institutional | ✅ + feed drawer open/close |
| `demo-event-checklist` | ✅ 8/8 (appointment path) |
| body.overflow pós-interação | `(empty)` |
| Novos erros console | **Não** — institutional image warnings pré-existentes |
| Fragment prop leak | **Estável** (1/vertical, pré-existente) |
| Shadow | Não piorou — drawers ainda sem instrumentação (esperado) |

---

## O que NÃO foi feito (Fase 1)

- [ ] `CustomContentBridge` (Fragment leak)
- [ ] `InstrumentedDrawerBridge`
- [ ] Migração ActionDrawer
- [ ] Wire `onToggleConversationContext` em drawers Stack B
- [ ] `useBodyScrollLock`

---

## Commit isolado

**Seguro:** sim — apenas 3 feeds Stack B.

```
chore(surface): add conversation provider to stack B verticals
```

**Não incluir:** ecommerce, db, docs WIP, shadow code.

---

## Próximos passos P0-02

1. **Fase 1b — QA fix:** `demo-event-checklist.mjs` → `Fechar, exact: true`
2. **Fase 2 — CustomContentBridge:** eliminar Fragment prop leak em customContent
3. **Fase 3 — InstrumentedDrawerBridge** piloto (personal contact drawer)
4. **Fase 4 — migração gradual** shadcn → ActionDrawer (1 vertical/ciclo)

---

## Métrica convergência

| Métrica | Antes | Depois |
|---------|-------|--------|
| Feeds com `ConversationSelectionProvider` | 9/12 | **12/12** |
| shadcn drawers | 7 | 7 (unchanged) |
| Stack B instrumentada | ❌ | ❌ (next phase) |
