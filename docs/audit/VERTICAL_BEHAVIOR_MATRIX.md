# Vertical Behavior Matrix — Social Landing

**Legenda de status**

| Status | Significado |
|--------|-------------|
| **OK** | Comportamento presente e alinhado ao contrato global |
| **Missing** | Ausente onde deveria existir |
| **Broken** | Presente mas incorreto ou inconsistente |
| **N/A** | Não aplicável nesta vertical |
| **Needs design decision** | Comportamento ambíguo — produto deve decidir |

**Verticals (colunas):** appt · ecom · crs · rest · real · prof · evt · gym · hlth · infl · pers · inst

---

## Matriz principal

| Comportamento | Classificação | appt | ecom | crs | rest | real | prof | evt | gym | hlth | infl | pers | inst |
|---------------|---------------|------|------|-----|------|------|------|-----|-----|------|------|------|------|
| **Long-press PostCard → contexto** | GLOBAL_REQUIRED | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | N/A | OK |
| **Long-press PostCard → morph** | GLOBAL_REQUIRED | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | N/A | OK |
| **Long-press custom (hero/módulos)** | BROKEN_INCONSISTENT | Broken | OK† | OK† | OK† | OK† | OK† | OK† | OK† | OK† | Broken | Broken | Broken |
| **Morph card → composer** | GLOBAL_REQUIRED | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | N/A | OK |
| **Seleção contexto composer (chips)** | GLOBAL_REQUIRED | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| **Tap PostCard → feed drawer** | GLOBAL_OPTIONAL | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | N/A | OK |
| **Abrir ActionDrawer** | GLOBAL_OPTIONAL | OK | OK | OK | OK | OK | OK | OK | OK | OK | N/A | N/A | N/A |
| **Abrir shadcn Drawer** | VERTICAL_SPECIFIC | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | OK | OK | OK |
| **Fechar drawer + scroll unlock** | GLOBAL_REQUIRED | OK | OK | OK | OK | Broken‡ | OK | OK | OK | OK | Needs DD | Needs DD | Needs DD |
| **Scroll após fechar drawer** | GLOBAL_REQUIRED | OK | OK | OK | OK | Broken‡ | OK | OK | OK | OK | Needs DD | Needs DD | Needs DD |
| **`composerMode` overlay (feed drawer)** | BROKEN_INCONSISTENT | Missing | OK | OK | OK | OK | N/A§ | OK | OK | N/A§ | N/A | N/A | N/A |
| **`composerMode` hidden (checkout/booking)** | VERTICAL_SPECIFIC | OK | OK | OK | OK | OK | OK | OK | OK | OK | N/A | N/A | N/A |
| **WhatsApp / contato instrumentado** | GLOBAL_OPTIONAL | OK | N/A | N/A | N/A | Broken | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| **Eventos passivos drawer** | GLOBAL_REQUIRED (demo) | OK | OK | OK | OK | OK | OK | OK | OK | OK | Missing | Missing | Missing |
| **Eventos passivos morph/context** | GLOBAL_REQUIRED (demo) | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | N/A | OK |
| **Surface shadow (DEV)** | GLOBAL_OPTIONAL | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| **Troca vertical (`feed.vertical.changed`)** | GLOBAL_REQUIRED (demo) | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| **Voltar ao selector /demo** | BROKEN_INCONSISTENT | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing |
| **Empty states** | NOT_APPLICABLE | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| **Loading states** | NOT_APPLICABLE | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| **Mobile composer / keyboard** | GLOBAL_REQUIRED | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| **CTA principal vertical** | VERTICAL_SPECIFIC | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| **Cards clicáveis (negócio)** | VERTICAL_SPECIFIC | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| **Cards não clicáveis (decorativo)** | VERTICAL_SPECIFIC | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| **Imagens quebradas / alt warnings** | BROKEN_INCONSISTENT | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | Broken |
| **Console duplicate key warnings** | BROKEN_INCONSISTENT | Broken | Broken | Broken | Broken | Broken | Broken | Broken | Broken | Broken | Broken | Broken | Broken |
| **Fragment prop leak (customContent)** | BROKEN_INCONSISTENT | OK | OK | OK | OK | OK | OK | OK | OK | OK | Broken | Broken | Broken |
| **ConversationSelectionProvider** | BROKEN_INCONSISTENT | OK | OK | OK | OK | OK | OK | OK | OK | OK | Missing | Missing | Missing |

**Abreviações:** appt=appointment · ecom=ecommerce · crs=courses · rest=restaurant · real=realestate · prof=professionals · evt=events · gym · hlth=health · infl=influencer · pers=personal · inst=institutional

---

## Notas por célula

### † Custom modules com `ContextSelectable`

Módulos que usam `ContextSelectable` ou recebem `onToggleConversationContext` via `cloneElement` herdam morph. Módulos em Fragment/div sem wiring → **Broken** ou **Missing** morph.

### ‡ realestate scroll lock (RU-01)

`REAL_USAGE_VALIDATION.md`: após fechar drawer, `body overflow: hidden` pode persistir. **Broken** até confirmação humana.

### § professionals / health

Feed drawer via PostCard; composer overlay não aplicado em service drawer (usa `hidden` em confirmação). **N/A** para overlay feed — drawer de serviço é ActionDrawer separado.

### appointment · composerMode Missing

Feed drawer abre sem `setComposerMode("overlay")`. Shadow SD-01. Booking flow usa overlay/hidden corretamente.

### appointment · hero long-press Broken

`toggleConversationContextItem` direto — contexto sim, morph não.

### Stack B (influencer, personal, institutional)

- Drawers shadcn: sem `drawer.opened/closed`, sem `surface.*` alinhado
- Sem `ConversationSelectionProvider` — contexto local BSL
- **Needs design decision:** migrar para ActionDrawer + provider ou instrumentar shadcn?

### personal · morph N/A

Todas seções `posts: []` + `customContent` only — sem PostCards no feed.

---

## Resumo por vertical

| Vertical | OK | Missing | Broken | N/A | Needs DD |
|----------|-----|---------|--------|-----|----------|
| appointment | 14 | 2 | 2 | 5 | 0 |
| ecommerce | 16 | 1 | 2 | 4 | 0 |
| courses | 16 | 1 | 2 | 4 | 0 |
| restaurant | 16 | 1 | 2 | 4 | 0 |
| realestate | 14 | 1 | 4 | 4 | 0 |
| professionals | 15 | 1 | 2 | 5 | 0 |
| events | 16 | 1 | 2 | 4 | 0 |
| gym | 16 | 1 | 2 | 4 | 0 |
| health | 15 | 1 | 2 | 5 | 0 |
| influencer | 12 | 3 | 3 | 4 | 2 |
| personal | 10 | 3 | 2 | 7 | 2 |
| institutional | 11 | 3 | 3 | 4 | 2 |

*Contagens aproximadas sobre subset auditado — usar como heatmap, não métrica formal.*

---

## Heatmap de risco (prioridade de alinhamento)

```
Alto risco observacional / Tier 1 perception:
  realestate (scroll + whatsapp)
  appointment (composer overlay feed + hero morph)
  influencer, personal, institutional (drawer stack B)

Médio risco:
  duplicate keys (todas)
  Fragment prop leak (stack B)

Baixo risco / by design:
  empty/loading N/A
  CTAs verticais específicos
```

---

## Decisões de design pendentes

| ID | Pergunta | Verticals afetadas |
|----|----------|-------------------|
| DD-01 | Stack B deve migrar para ActionDrawer + provider? | infl, pers, inst |
| DD-02 | Feed drawer deve sempre setar `composerMode: overlay`? | appt vs resto |
| DD-03 | Hero cards custom devem usar morph path? | appt, custom modules |
| DD-04 | WhatsApp sempre via `SocialContactCTA` + evento? | real, infl |
| DD-05 | `/demo` precisa botão “trocar vertical”? | todas |
| DD-06 | Empty/loading states são escopo demo ou produto? | todas |

---

## Referências

- `GLOBAL_BEHAVIOR_AUDIT.md`
- `GLOBAL_CONTRACTS.md`
- `BEHAVIOR_FIX_PRIORITY.md`
