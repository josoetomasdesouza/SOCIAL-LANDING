# Real Usage Validation — `/demo`

**Baseline tags:** `foundation-observability-v1` (`311bad8`) · `morph-stability-v1` (`a23bd3f`)  
**Data:** 2026-05-23  
**Método:** Uso controlado automatizado (Playwright mobile 390×844 + desktop 1280×800) + amostragem manual de paths críticos  
**Escopo:** Observação apenas — **nenhum código alterado**

---

## Resumo executivo

| Critério | Status |
|----------|--------|
| Experiência visual estável (Tier 1) | ✅ Passa na maioria dos verticals |
| Morph restaurado (RAF visível) | ✅ 25–26 frames animados nos verticals com PostCard morph |
| Eventos coerentes | ⚠️ Coerentes; gaps observacionais no debug panel |
| Sem regressão morph pós-tag | ✅ Confirmado |
| Sem event storm | ✅ Nenhum vertical >6 emits/tipo na sessão |
| Scroll/composer quebrado global | ⚠️ 1 caso isolado (realestate — verificar humano) |

**Veredicto:** Experiência **estável o suficiente** para pausa de features e uso real do `/demo`. **Surface reducer shadow mode** pode avançar em modo **compare-only** (sem runtime). **Não** há blocker Tier 1 que exija hotfix imediato antes de shadow mode — exceto se scroll lock em realestate for confirmado manualmente.

---

## Metodologia

### Checklist executado (por vertical, mobile)

1. Entrar na vertical (`feed.vertical.changed`)
2. Scroll natural (wheel ×2)
3. Tap em primeiro `section article` (drawer)
4. Fechar drawer (`Fechar`) quando visível
5. Long-press em primeiro `[data-post-context-source]`
6. Amostragem morph RAF (30 frames × 16ms)
7. Primeira mensagem no composer (`ai.surface.opened`)
8. WhatsApp (`wa.me`) quando presente
9. Inspeção `document.body.style.overflow`
10. Repetição appointment desktop 1280×800

### Limitações honestas

- **Fluidez / sensação premium:** não avaliadas por automação — requer sessão humana no device real.
- **Appointment morph (sweep):** falso negativo no sweep — primeiro alvo foi card de serviço no topo; path correto (Tutoriais PostCard) confirmado separadamente (**26 frames animados**).
- **Troca de vertical in-app:** `/demo` não expõe botão “voltar”; troca simulada via reload do selector.

---

## Resultados por vertical (mobile 390×844)

| Vertical | Scroll | Drawer O/C | Morph RAF | morph.* | AI 1ª msg | WhatsApp | Notas |
|----------|--------|------------|-----------|---------|-----------|----------|-------|
| appointment | ✅ | ⚠️ sweep falhou tap* | ⚠️ sweep† | ⚠️ | ✅ | ✅ | *path Tutoriais OK manualmente |
| ecommerce | ✅ | ✅ | **26** | ✅ | ✅ | n/a | — |
| courses | ✅ | ✅ | **26** | ✅ | ✅ | n/a | — |
| restaurant | ✅ | ✅ | **25** | ✅ | ✅ | n/a | — |
| realestate | ✅ | ⚠️ close? | **26** | ✅ | ✅ | n/a | **body overflow hidden** |
| professionals | ✅ | ✅ | **25** | ✅ | ✅ | n/a | — |
| events | ✅ | ✅ | **26** | ✅ | ✅ | n/a | — |
| gym | ✅ | ✅ | **26** | ✅ | ✅ | n/a | — |
| health | ✅ | ✅ | **26** | ✅ | ✅ | n/a | — |
| influencer | ✅ | ✅ | **25** | ✅ | ✅ | n/a | console props |
| personal | ✅ | n/a | n/a | n/a | ✅ | n/a | sem PostCard morph |
| institutional | ✅ | ⚠️ | **25** | ✅ | ✅ | n/a | image console warnings |

† **Appointment confirmado manualmente (Tutoriais):** drawer ✅ · morph **26 frames** · `morph.started` / `morph.completed` ✅

**Desktop appointment:** WhatsApp ✅ · morph sweep no serviço (topo) sem evento — usar Tutoriais para demo de morph.

---

## Observações transversais

### Morph (Tier 1)

- **Restaurado** após `morph-stability-v1`: 25–26 frames com `transform` animado na maioria dos verticals com conteúdo morphável.
- **Path correto:** long-press em **PostCard** de seção de conteúdo (vídeo/notícia/etc.), não apenas blocos hero/custom.
- **Cancelamento scroll:** validado previamente no commit `a23bd3f` — `morph.completed` após scroll mid-morph.
- **Reduced motion:** 0 eventos morph com `prefers-reduced-motion: reduce` (validação anterior).

### Eventos vs pixels

| Situação | Tipo |
|----------|------|
| Morph RAF visível + eventos | ✅ Alinhado (maioria) |
| Sweep appointment serviço sem morph event | ⚠️ Alvo errado no automático, não divergência de runtime |
| `morph.started` antes de pixels (design) | observacional — emite no `useLayoutEffect` |

### EventDebugPanel

- Presente em DEV (`z-index: 120`, canto inferior direito).
- **Não cobre composer** na viewport 390×844 (bottom ~828px, composer acima).
- Dropdown **omite** `morph.started`, `morph.completed`, `ai.surface.opened` — visíveis só em “All types”.
- Classificação: **observacional** — não bloqueia uso real; pode distrair em QA.

### Console (DEV)

Warnings recorrentes (pré-existentes, não introduzidos pelas tags):

- `Encountered two children with the same key` — vários verticals
- `Invalid prop onToggleConversationContext on React.Fragment` — appointment (+ custom sections)
- `Unknown event handler onToggleConversationContext` — influencer, personal, institutional

Classificação: **baixo risco** em DEV console; monitorar se correlacionar glitch visual.

---

## Lista de problemas encontrados

| ID | Problema | Classificação | Vertical / área |
|----|----------|---------------|-----------------|
| RU-01 | `body.style.overflow = hidden` persiste após interação drawer | **perceptivo** (confirmar humano) | realestate |
| RU-02 | EventDebugPanel filter incompleto (morph, ai) | observacional | DEV `/demo` |
| RU-03 | React duplicate key warnings | baixo risco | multi |
| RU-04 | `onToggleConversationContext` prop leak em Fragment/DOM | baixo risco | appointment, influencer, personal, institutional |
| RU-05 | Personal vertical sem PostCards — morph N/A no demo | baixo risco | personal |
| RU-06 | Institutional image src/alt console errors | baixo risco | institutional |
| RU-07 | Sem navegação “voltar” ao selector dentro do feed | baixo risco | `/demo` UX |
| RU-08 | Morph em hero/custom blocks ≠ morph PostCard (expectativa usuário) | observacional | appointment hero |

**Blockers:** nenhum confirmado em Tier 1 morph/composer/scroll global.

---

## Critérios de sucesso

| Critério | Resultado |
|----------|-----------|
| Experiência visual estável | ✅ (ressalva realestate scroll) |
| Morph restaurado | ✅ RAF 25–26 frames |
| Eventos coerentes | ✅ sem storm; gaps panel |
| Sem regressão perceptiva morph | ✅ |
| Sem loop/event storm | ✅ |
| Scroll/composer quebrado | ⚠️ isolado realestate |

---

## Recomendações

### Pode avançar para Surface reducer shadow mode?

**Sim — modo compare-only**, desde que:

- `SURFACE_MACHINE_APPLY_TO_TIER1 = false` mantido
- Zero wiring ao runtime composer/drawers
- Working tree local (ecommerce, db) **fora** do escopo

### Precisa corrigir algo antes?

| Prioridade | Item | Ação |
|------------|------|------|
| Opcional antes de shadow | RU-01 realestate scroll lock | Confirmar manualmente; se reproduzir → patch Tier 1 isolado |
| Não bloquear shadow | RU-02 a RU-08 | Documentar; corrigir em PRs futuros separados |

### Deve manter pausa?

**Sim.** Recomendado:

1. **1–3 dias** de uso real humano no `/demo` (mobile físico + desktop)
2. Focar appointment + ecommerce + 1 vertical secundário
3. Anotar sensação premium / delays — automação não cobre
4. Só então iniciar shadow mode **sem pressa de merge**

---

## Roteiro de validação humana (complementar)

```
/demo → Agendamento
  → scroll feed 30s
  → long-press card Tutoriais → morph visível ~480ms
  → tap outro card → drawer → Fechar
  → 1ª mensagem composer
  → Agendar agora → overlay composer
  → WhatsApp em Fale com a casa
  → reload → E-commerce → repetir morph + drawer

Mobile físico:
  → keyboard abre → composer não salta
  → long-press com polegar
  → Event panel fechado durante teste perceptivo
```

---

## Referências

- `docs/audit/STABILIZATION_REPORT.md`
- `docs/audit/EVENT_VALIDATION.md`
- `docs/audit/PERCEPTUAL_VALIDATION.md`
- Tag `morph-stability-v1` → `a23bd3f`
