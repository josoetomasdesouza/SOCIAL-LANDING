# RISK REPORT — Social Landing

**Data:** 23/05/2026  
**Fase:** 10 — Risco Estratégico

---

## Sumário executivo

A Social Landing equilibra **magia perceptiva** (morph, composer, feed contínuo) com **dívida estrutural** (dual stacks, duplicação, tipos paralelos). O maior risco estratégico não é técnico — é **perder a alma do produto** enquanto escala funcionalidades, IA e integrações.

**Classificação geral de risco estratégico:** 🟡 **Médio-alto** — produto demo excelente, fundação enterprise incompleta, documentação operacional forte mitiga regressões.

---

## R1 — Virar sistema complexo demais

| Fator | Evidência | Probabilidade | Impacto |
|-------|-----------|---------------|---------|
| Monolitos Tier 1 (~2200 linhas orchestrator+composer) | business-social-landing, conversational-ai | Alta | Alto |
| 12 verticais com lógica própria | `components/business/*/` | Média | Alto |
| Schema + DB + UI + docs paralelos | lib/landing-schema isolado | Média | Médio |
| Engines futuros (Goal, Experience, Evolution) | Planejados | Média | Alto |

**Mitigação:**
- Manter Tier 1 congelado; complexidade nova **fora** da UI perceptiva
- Feature flags default false
- Rule: no new engine without port interface

**Sinal de alerta:** PRs que tocam >5 arquivos business Tier 1 simultaneamente.

---

## R2 — Virar dashboard corporativo

| Fator | Evidência | Probabilidade | Impacto |
|-------|-----------|---------------|---------|
| Histórico de regressão topo feed | EVOLUTION_LOG revert #31 | Média | **Crítico** |
| Duplicação busca/filtro | Documentado como anti-pattern | Média | Alto |
| shadcn sidebar/admin patterns | ui/sidebar exists | Baixa | Médio |
| Editor `/criar` separado | OK if isolated | Baixa | Baixo |

**Mitigação:**
- EXPERIENCE_PRINCIPLES EP-6
- Visual QA obrigatório
- Designer/agent review for navigation patterns

**Sinal de alerta:** Tabs, tables, KPI cards na landing pública.

---

## R3 — Perder simplicidade

| Fator | Evidência | Probabilidade | Impacto |
|-------|-----------|---------------|---------|
| Três drawer implementations | action, business-feed, feed | Alta | Médio |
| composerMode 9× duplicated | vertical feeds | Alta | Médio |
| Dual toast systems | use-toast + sonner | Média | Baixo |
| 22 docs architecture + handoffs | docs/ | Média | Baixo (positivo) |

**Mitigação:**
- Consolidar **por camada** (surface reducer), não por refactor visual
- Documentação ≠ complexidade runtime

**Sinal de alerta:** New developer onboarding >2 days to safe Tier 1 edit.

---

## R4 — Perder magia da experiência

| Fator | Evidência | Probabilidade | Impacto |
|-------|-----------|---------------|---------|
| Morph DOM-coupled | querySelector, data-* | Média | **Crítico** |
| Measurement fragile | ResizeObserver chain | Média | Crítico |
| IA mock → real LLM latency | 700ms simulated today | Alta | Alto |
| Shopify checkout redirect | Not implemented | Média | Crítico se mal feito |

**Mitigação:**
- FROZEN_SYSTEMS protocol
- Streaming IA com first-token <300ms target
- Commerce in-drawer, not redirect

**Sinal de alerta:** User feedback "parece app diferente", "travou", "modal".

---

## R5 — Excesso de IA

| Fator | Evidência | Probabilidade | Impacto |
|-------|-----------|---------------|---------|
| ai_generation.allowed in registry | All major verticals | Alta | Médio |
| No Rule Engine runtime | EVOLUTION_RULES gap | Alta | Alto |
| Conversational surface prominent | Core product | N/A | Risco se mal governado |

**Mitigação:**
- ENABLE_REAL_AI flag
- Human approval for publish
- IA never touches Tier 1
- Brand DNA hard blocks

**Sinal de alerta:** Landing layout muda overnight without audit trail.

---

## R6 — Excesso de automação

| Fator | Evidência | Probabilidade | Impacto |
|-------|-----------|---------------|---------|
| crawl_jobs schema | Ready | Média | Médio |
| extract-brand auto | Active | Baixa | Baixo |
| n8n future | Planned | Média | Alto se unbounded |

**Mitigação:**
- Webhook idempotency
- Rate limits per brand
- Automation proposes L4 only

---

## R7 — UX pesada

| Fator | Evidência | Probabilidade | Impacto |
|-------|-----------|---------------|---------|
| Competing fixed bottom elements | composer+cart+drawer | Média | Alto mobile |
| Unoptimized images | next.config | Alta | Alto prod |
| External Unsplash dependency | All mocks | Alta | Médio |
| No lazy load verticals in demo | demo page | Média | Médio |

**Mitigação:**
- Image CDN + optimization before prod
- Code split vertical feeds
- Performance budget: LCP <2.5s mobile

---

## R8 — Onboarding complexo

| Fator | Evidência | Probabilidade | Impacto |
|-------|-----------|---------------|---------|
| `/criar` multi-flow | page, novo, editor | Média | Médio |
| 12 business models | Selector | Média | Médio |
| No auth UI | ENABLE_AUTH off | Baixa now | Alto later |

**Mitigação:**
- Progressive onboarding: URL extract → preview → publish
- Hide vertical complexity until brand type known
- Single "create landing" happy path

---

## Matriz de risco consolidada

| ID | Risco | P | I | Score | Trend |
|----|-------|---|---|-------|-------|
| R1 | Complexidade | H | H | 🔴 9 | ↑ com engines |
| R2 | Dashboard drift | M | C | 🔴 8 | → estável c/ docs |
| R3 | Simplicidade | H | M | 🟡 6 | ↑ sem reducer |
| R4 | Magia UX | M | C | 🔴 8 | → frozen helps |
| R5 | Excesso IA | H | H | 🔴 9 | ↑ quando LLM |
| R6 | Automação | M | H | 🟡 7 | ↑ integrações |
| R7 | UX pesada | H | H | 🔴 8 | ↑ produção |
| R8 | Onboarding | M | M | 🟡 5 | → |

---

## Riscos invisíveis (top 10)

1. **typescript.ignoreBuildErrors** — bugs em produção silenciosos
2. **Strict Mode morph behavior** — dev ≠ prod perception
3. **Body scroll lock** — stuck scroll após múltiplos drawers
4. **composerMode race** — flicker em transações rápidas
5. **localStorage chat corruption** — perda histórico sem recovery UI
6. **SSRF em extract-brand** — fetch URL arbitrária (auditar)
7. **ID collision** — mock IDs reused across verticals
8. **ThemeProvider unwired** — dark mode inconsistent future
9. **Repository layer empty** — DB enable → logic sprawl
10. **block-registry drift** — capabilities ≠ runtime vertical reality

---

## Cenários de falha catastrófica

| Cenário | Trigger | Consequência |
|---------|---------|--------------|
| **Composer death spiral** | Measurement refactor | Produto inutilizável mobile |
| **Morph removal "cleanup"** | Agent refactor | Perda assinatura produto |
| **LLM direct Tier 1 write** | ENABLE_AUTO_EVOLUTION true | Brand identity chaos |
| **Shopify redirect checkout** | Fast integration | Composer continuity destroyed |
| **DB enable without RLS smoke** | ENABLE_DB=true prod | Data leak |
| **Unified drawer refactor** | DRY initiative | 12 vertical regressions |

---

## Indicadores de saúde (monitorar)

| KPI | Target |
|-----|--------|
| Tier 1 PRs per month | ≤2 |
| Morph success rate (manual QA) | 100% |
| Composer measurement bug reports | 0 |
| Time to safe onboarding dev | <1 day docs reading |
| Published landing rollback events | <1/month |
| IA proposals auto-applied without review | 0 |

---

## Recomendações estratégicas

1. **Congelar Tier 1** — investir em camadas adjacentes (bridge, events, rules)
2. **Remover ignoreBuildErrors** antes de escalar time
3. **Feature flags** para toda capacidade nova
4. **Human gate** em publish e brand identity
5. **Performance pass** antes de marketing push
6. **Manter `/criar` isolado** do runtime social
7. **Não unificar feeds** até schema bridge estável

---

## Conclusão

O maior ativo estratégico da Social Landing é **continuidade perceptiva documentada**. O maior perigo é **confundir preparação para escala com refatoração do coração emotivo do produto**. A estratégia vencedora: **proteger magia, modularizar tudo ao redor**.
