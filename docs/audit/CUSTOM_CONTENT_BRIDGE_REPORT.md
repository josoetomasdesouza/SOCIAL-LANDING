# CustomContentBridge — Stack B Prop Leak Fix

**Data:** 2026-05-23  
**Escopo:** `CustomContentBridge` + injeção segura no BSL

---

## Causa do prop leak

`BusinessSectionComponent` em `business-social-landing.tsx` fazia:

```tsx
cloneElement(section.customContent, {
  onToggleConversationContext,
  isInConversation: isConversationSelected,
})
```

Quando `customContent` era:

| Root | Efeito |
|------|--------|
| `<div>` (Stack B — personal, influencer, institutional) | Props vazavam para DOM → `Unknown event handler` |
| `<>` Fragment (appointment e outros) | Props no Fragment → React warning |
| Componente tipado (Stack A modules) | OK — props consumidas |

Stack B usa quase exclusivamente `<div>` como root de `customContent`, sem consumir as props injetadas.

---

## Solução

### 1. `CustomContentBridge`

Absorve props de conversação; renderiza `children` sem alterar markup.

### 2. `renderSectionCustomContent` (BSL)

- Se root já é `CustomContentBridge` → `cloneElement` no bridge
- Se root é DOM (`string`) ou `Fragment` → envolve com bridge (props no bridge, não no DOM)
- Se root é componente → `cloneElement` legado (Stack A inalterado)

**Stack B feeds não precisaram de edits** — todos os `customContent` com root `<div>` são bridged automaticamente.

---

## Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `components/business/custom-content-bridge.tsx` | **novo** |
| `components/business/business-social-landing.tsx` | `renderSectionCustomContent` + import |

**Não alterados:** personal/influencer/institutional feeds, drawers, composer, morph.

---

## Warnings antes/depois

| Vertical | Antes | Depois |
|----------|-------|--------|
| personal | ~1 `onToggleConversationContext` / Fragment | **0** |
| influencer | ~1 | **0** |
| institutional | ~1 | **0** |
| appointment | ~1 Fragment | **0** |

*(appointment corrigido como efeito colateral do bridge em Fragment — sem mudança de UX)*

---

## Validação

| Check | Resultado |
|-------|-----------|
| `/demo` personal, influencer, institutional | ✅ |
| UI idêntica | ✅ (bridge transparente) |
| shadcn drawers | ✅ |
| `demo-event-checklist` | **8/8** |
| Tier 1 morph/composer | ✅ inalterado |

---

## Commit isolado

**Seguro:** sim — 2 arquivos, sem runtime de drawers/events/surfaces.

```
fix(surface): isolate custom content props in stack B
```

---

## Próximos passos P0-02

1. `InstrumentedDrawerBridge` piloto (personal contact drawer)
2. Migração gradual shadcn → ActionDrawer
3. Runtime Truth Mapping gate
