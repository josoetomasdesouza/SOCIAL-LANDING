# System State — Social Landing

**Autoridade:** Este documento  
**Versão:** 1.0  
**Data:** 2026-05-24  
**Snapshot:** pós-estabilização Tier 1; PR #52 aberto (`fix/drawer-perceptual-hygiene`)

---

## Legenda de classificação

| Classe | Significado |
|--------|-------------|
| **Stable** | Comportamento validado; mudança exige protocolo de frozen zone |
| **Semi-stable** | Funcional no happy path; gaps de paridade conhecidos |
| **Experimental** | WIP, off-main ou sem validação perceptual completa |
| **Deprecated** | Mantido por compatibilidade; destino é remoção/migração |
| **Blocked** | Não iniciar até gate anterior fechado |

---

## Stable

| Área | Evidência | Paths principais |
|------|-----------|------------------|
| Feed baseline Tier 1 | RU-R 8/8 checklist | `components/business/business-social-landing.tsx` |
| Composer overlay + morph | Re-run estável | `components/business/conversational-ai.tsx`, `post-to-chat-morph-layer.tsx` |
| Event bus + instrumentation | Scripts QA | `lib/events/`, `pnpm qa:events` |
| Conversation selection provider | 12/12 feeds | `conversation-selection-context.tsx` |
| E-commerce vertical (referência) | Resolver + exploration memory | `ecommerce/ecommerce-feed.tsx` |
| Personal Phase 3 convergence | 9/9 script | `personal/personal-feed.tsx` |
| Stack A drawers (10 verticais) | ActionDrawer instrumentado | `action-drawer.tsx` + feeds Stack A |

---

## Semi-stable

| Área | Gap conhecido | Próximo workstream |
|------|---------------|-------------------|
| Drawer/composer hygiene (PR #52) | Aberto; não mergeado na `main` | WS-02 |
| Restaurant checkout footer | `footer` estático vs `onRegisterFooter` | WS-03 |
| Health / professionals / appointment confirmation | CTA inline no scroll | WS-03 |
| Appointment hero morph | Toggle sem `WithMorph` | WS-03 |
| Real estate WhatsApp | `window.open` sem instrumentação | WS-03 |
| QA scripts | Existem localmente; sem CI GitHub | WS-04 |
| TypeScript build | `ignoreBuildErrors: true` | WS-05 |

---

## Experimental

| Área | Estado | Notas |
|------|--------|-------|
| Influencer feed (Stack B) | `InstrumentedDrawerBridge` | WS-06 — próxima vertical GO |
| Institutional feed (Stack B) | Idem | WS-07 — após influencer |
| DB / media stack | Off-main, WIP | WS-09 — PR isolado |
| Storage schema alignment doc | Arquivo vazio | `docs/architecture/social-landing-storage-schema-alignment.md` |
| E-commerce product card WIP | Branch `workstream/ecommerce-product-card` | Peel antes de merge |
| Shadow compare-only | DEV tooling | Não aplicar ao runtime |
| Visual observation scripts | Untracked local | `scripts/visual/ecommerce-*.mjs` |

---

## Deprecated

| Área | Substituto | Remoção prevista |
|------|------------|------------------|
| Restaurant bottom cart bar | Header cart (`onHeaderCartClick`) | Removido em PR #52 — validar pós-merge |
| `InstrumentedDrawerBridge` (Stack B) | `ActionDrawer` | Após WS-06 + WS-07 |
| Docs audit duplicados (`* 2.md`) | Versões canônicas em `docs/audit/` | Era 1 hygiene |

---

## Blocked

| Item | Bloqueado até | Razão |
|------|---------------|-------|
| WS-06 Influencer migration | WS-02 merge PR #52 + WS-01 peel | Baseline drawer unstable on main |
| WS-07 Institutional migration | WS-06 estabilizado | Sequência 1 vertical/ciclo |
| WS-08 AI resolver expansion | Era 2 (Stack) concluída | Drawer/composer deve convergir primeiro |
| WS-09 DB/Storage merge | GO humano + PR isolado | Contaminação runtime |
| Identity layer | Eras 1–4 | `PRIORITIES.md` NO-GO |
| BookingPort / payment real | Produto futuro | Fora de escopo convergência |

---

## Known risks

| ID | Risco | Severidade | Mitigação |
|----|-------|------------|-----------|
| KR-01 | Árvore suja local — WIPs misturados | 🔴 Alta | WS-01 peel protocol |
| KR-02 | Dual stack drawer (A vs B) | 🔴 Alta | WS-06, WS-07 |
| KR-03 | PR #52 não mergeado — drift main vs branch | 🟡 Média | WS-02 merge + re-run |
| KR-04 | Sem CI GitHub — regressão silenciosa | 🟡 Média | WS-04 |
| KR-05 | `ignoreBuildErrors` — erros TS ocultos | 🟡 Média | WS-05 |
| KR-06 | AI só e-commerce — expectativa desalinhada | 🟢 Baixa | Comunicar; WS-08 |
| KR-07 | Docs duplicados (`* 2.md`) — fonte ambígua | 🟡 Média | WS-01 dedupe |
| KR-08 | Frozen zone touch sem protocolo | 🔴 Alta | `FREEZE_ZONES.md` + revisão humana |
| KR-09 | Success-induced acceleration (2+ verticais/PR) | 🔴 Alta | `WORKSTREAMS.md` — 1 WS por branch |
| KR-10 | Db WIP half-landed | 🟡 Média | WS-09 isolado |

---

## Como atualizar este documento

1. Após cada merge significativo na `main`
2. Após re-run `REAL_USAGE_RE_RUN_RESULTS.md`
3. Ao abrir/fechar workstream (registrar em `EVOLUTION_LOG.md`)
4. Nunca alterar classificação **Stable → Experimental** sem evidência de regressão documentada
