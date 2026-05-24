# Evolution Model Risk Review — Social Landing

**Data:** 2026-05-23  
**Baseline:** `main` @ `e002921`  
**Escopo:** análise crítica do **método** de evolução — não do runtime em si  
**Código alterado:** nenhum

> Este documento avalia os riscos de **como estamos evoluindo**, não apenas os riscos do runtime. O caminho conservador foi correto até aqui; a pergunta agora é onde ele começa a custar mais do que protege.

---

## Resumo executivo

O modelo atual — governança runtime, observação passiva, contracts skeleton, REAL_USAGE, temporal mapping, Tier 1 congelado — **protegeu com sucesso** comportamento emergente e evitou normalização destrutiva. Isso foi raro e valioso.

O **risco dominante do método** não é regressão técnica imediata. É **assimetria de velocidade**: documentação e observação acumulam mais rápido que decisões executivas e migrações estruturais. Em 2–4 semanas, o custo de oportunidade pode superar o custo de um patch mal isolado.

**Veredicto balanceado:** o modelo **não está conservador demais no Tier 1** — está **conservador demais nas decisões de convergência e isolamento de trilhas**. Governança virou ativo; falta **cadência de decisão** com prazos.

**Top insight:** bridges, skeletons e NO-GO gates são **ferramentas temporárias**. O maior risco é tratá-las como estado terminal.

---

## Top 5 riscos do método

| Rank | ID | Risco | Severidade |
|------|-----|-------|------------|
| 1 | EMR-12 | WIP paralelo contamina decisões | Alta |
| 2 | EMR-03 | Bridges viram arquitetura permanente | Alta |
| 3 | EMR-02 | Documentação sem decisão | Média-Alta |
| 4 | EMR-15 | Stack B convergence adiada indefinidamente | Média-Alta |
| 5 | EMR-11 | Sofisticação técnica vs validação mercado | Média-Alta |

---

## Inventário de riscos (15)

### EMR-01 — Paralisia por governança

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Classificações (OBSERVATION_ONLY … BLOCKED_UNTIL_MAPPING), gates e NO-GO acumulados reduzem willingness de merge qualquer mudança perceptível. |
| **Sinal de alerta** | PRs pequenos ficam >7 dias sem review; time pede "mais um doc" antes de cada patch; agentes recusam tarefas legítimas citando Tier 1. |
| **Impacto** | Throughput zero em convergência; frustração; workarounds locais (working tree dirty). |
| **Probabilidade** | Média — **já parcialmente visível** (muitos docs, REAL_USAGE ainda não executado). |
| **Severidade** | Média |
| **Mitigar** | Time-box gates (ex: 5 dias max em OBSERVATION); lista **allowlist** de mudanças SAFE sem comité; decisão executiva semanal. |
| **Decisão afetada** | Stack B migrate, ref-count scroll lock, P1 fixes |
| **Quando agir** | Quando nenhum PR runtime mergeia em 2 semanas apesar de backlog claro |

---

### EMR-02 — Documentação excessiva sem decisão

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Pacote audit/convergence/contracts/temporal cresce; decisões DD-01 tomadas mas Fase 3 não iniciada; skeletons multiplicam sem status promoted/demoted. |
| **Sinal de alerta** | Ratio docs:commits > 3:1 por 2 semanas; mesmo blocker listado em 5+ docs; NEXT_EVOLUTION_DECISION não revisado após evidência nova. |
| **Impacto** | Ilusão de progresso; onboarding pesado; agentes humanos perdem fio condutor. |
| **Probabilidade** | **Alta** — padrão atual do projeto. |
| **Severidade** | Média-Alta |
| **Mitigar** | Regra: **1 doc novo exige 1 decisão registrada** (GO/NO-GO/DEFER com prazo); consolidar índice único `AUDIT_INDEX.md`; sunset docs obsoletos. |
| **Decisão afetada** | Truth Mapping GO, priorização produto |
| **Quando agir** | **Agora** — antes de mais fases documentais |

---

### EMR-03 — Bridges viram arquitetura permanente

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | `InstrumentedDrawerBridge` + shadcn satisfazem observabilidade; pressão para não migrar porque "já emite eventos". |
| **Sinal de alerta** | Bridges >6 meses; shadow ainda reporta false negatives Stack B; composerMode Stack B nunca sincronizado; "bridge is enough" no discourse. |
| **Impacto** | Truth Mapping permanentemente enviesado; dois lifecycles drawer; ref-count impossível de unificar. |
| **Probabilidade** | Média-Alta se migrate não calendarizado |
| **Severidade** | **Alta** |
| **Mitigar** | TTL explícito bridge (ex: 60 dias pós REAL_USAGE); métrica "drawers nativos vs bridged"; personal migrate como deadline hard. |
| **Decisão afetada** | DD-01 execução, shadow policy, drawer contract |
| **Quando agir** | **≤14 dias** após REAL_USAGE re-run — iniciar personal Fase 3 |

---

### EMR-04 — Contracts skeleton viram falsamente definitivos

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | `docs/audit/contracts/*.md` citados como lei antes de CAPTURED sessions; priority rules inferidas tratadas como spec frozen. |
| **Sinal de alerta** | PR rejeitado citando skeleton; agente cita CONTRACT sem tag SKELETON; ausência de "open questions" updates. |
| **Impacto** | Bloqueio errado de mudanças válidas; confiança falsa para IA/automação futura. |
| **Probabilidade** | Média |
| **Severidade** | Média |
| **Mitigar** | Header obrigatório `Status: SKELETON|EVIDENCED|FROZEN`; promote só após REAL_USAGE + SESSION CAPTURED; link evidência por seção. |
| **Decisão afetada** | CONTRACT_CHANGE class, Goal Engine inputs |
| **Quando agir** | Antes de qualquer automação ler contracts |

---

### EMR-05 — Proteção Tier 1 vira bloqueio evolutivo

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Tier 1 freeze estendido a **qualquer** arquivo percebido como crítico (BSL, feeds, drawers); bugs P1 adiados. |
| **Sinal de alerta** | P1-01 hero morph aberto >30 dias; ref-count scroll lock adiado por "Tier 1 adjacency"; medo de tocar `business-social-landing.tsx` mesmo para P0-03-like patches. |
| **Impacto** | Dívida perceptiva acumula; workarounds em verticals; freeze perde credibilidade. |
| **Probabilidade** | Média |
| **Severidade** | Média |
| **Mitigar** | Tier 1 **controlado** ≠ imutável — lane TIER1_RISK com checklist 1 página; quota: max 1 Tier 1 PR / sprint com QA. |
| **Decisão afetada** | Morph gaps, composer overlay centralization |
| **Quando agir** | Quando P1 perceptivos >3 acumulados sem patch |

---

### EMR-06 — Preservar complexidade que deveria ser eliminada

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Retórica "emergente legítimo" aplicada a **duplicação acidental** (9× composerMode effects, 3× scroll lock copy-paste). |
| **Sinal de alerta** | RACE_CONDITION_RISK documentado repetidamente sem fix plan; "latente" vira desculpa permanente; ref-count sempre DEFER. |
| **Impacto** | Complexidade real cresce; novos devs replicam padrão; incidente eventual em multi-drawer. |
| **Probabilidade** | Média |
| **Severidade** | Média-Alta |
| **Mitigar** | Separar **semantic emergent** vs **accidental duplication** em TEMPORAL_RISK; fix plan obrigatório para TR-R01–R06 com target date. |
| **Decisão afetada** | useBodyScrollLock, composer priority helper |
| **Quando agir** | Na migração Stack B Fase 3 — **não antes**, mas **não depois** da primeira vertical |

---

### EMR-07 — Observabilidade não gerar ação

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Event bus, shadow, timelines acumulam logs; REAL_USAGE re-run **planejado** mas não **executado**; divergences filed, zero triage deadline. |
| **Sinal de alerta** | `__SURFACE_SHADOW__` timeline >500 entries sem summary; SD-01 status unknown post-P0-03; EMR dashboard inexistente. |
| **Impacto** | Custo DEV noise; falsa sensação observability = maturity; decisões continuam no feeling. |
| **Probabilidade** | **Alta** hoje |
| **Severidade** | Média |
| **Mitigar** | REAL_USAGE re-run **deadline**; weekly 30min triage: top 3 divergences → DECISION or DEFER; auto-close observational após 14 dias. |
| **Decisão afetada** | Shadow policy, SD-01/02 resolution |
| **Quando agir** | **Próximos 7 dias** — executar re-run |

---

### EMR-08 — Truth Mapping contaminado Stack A / B

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Mapping "completo" enquanto dual stack existe produz **duas verdades** ou média mentirosa. |
| **Sinal de alerta** | Truth map single table for all verticals; Stack B sem flag enviesado; bridges counted as converged. |
| **Impacto** | Migração errada; automação futura em base falsa; regressões pós-GO. |
| **Probabilidade** | Alta se GO prematuro |
| **Severidade** | **Alta** |
| **Mitigar** | Truth Mapping **scoped**: Stack A GO first; Stack B separate track; explicit BRIDGE_EPOCH in map. |
| **Decisão afetada** | Runtime Truth Mapping scope |
| **Quando agir** | No gate review — recusar "completo" até personal migrated |

---

### EMR-09 — Brand DNA / Goal Engine atrasarem demais

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Foco total em surface runtime; `lib/brand-dna`, rules evaluate-only prontos mas desconectados; produto não valida proposta IA/adaptativa. |
| **Sinal de alerta** | Zero demos Brand DNA; Goal Engine BLOCKED sem revisão date; mercado testa só `/demo` estático. |
| **Impacto** | Plataforma "runtime sofisticada" sem narrativa produto; investimento desbalanceado. |
| **Probabilidade** | Média-Alta |
| **Severidade** | Média (estratégico) |
| **Mitigar** | Trilha **brand-dna-foundation** paralela com weekly demo; Goal Engine **read-only suggest** antes de write; não bloquear surface work. |
| **Decisão afetada** | Roadmap produto, IA autonomia |
| **Quando agir** | Paralelo imediato — **não esperar** Truth Mapping |

---

### EMR-10 — Cursor/agente conservador demais

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Prompts RUNTIME OBSERVATION MODE levam agentes a recusar refactors saudáveis, fixes P1, até docs commits organizados. |
| **Sinal de alerta** | User pede fix claro → agente produz outro plano; zero PRs em sessões longas; "BLOCKED" default. |
| **Impacto** | Humanos desistem; trabalho manual; inconsistência entre sessões. |
| **Mitigar** | Modos explícitos: OBSERVE vs IMPLEMENT (scoped); allowlist tarefas SAFE em prompt; EMR-10 check no governance doc. |
| **Decisão afetada** | Velocidade execução, qualidade handoffs |
| **Quando agir** | **Agora** — próximo prompt IMPLEMENT scoped |

---

### EMR-11 — Sofisticação técnica vs validação mercado

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Runtime multi-layer, shadow, temporal taxonomy impressionam arquitetura mas `/demo` ainda mock; sem usuários reais; ecommerce/db WIP não validados. |
| **Sinal de alerta** | Sem entrevistas/uso externo 30 dias; docs >> features shipped; stakeholders não entendem shadow. |
| **Impacto** | Produto certo, timing errado; competidor valida mais rápido com menos infra. |
| **Probabilidade** | Média-Alta |
| **Severidade** | Média-Alta (negócio) |
| **Mitigar** | Ratio sprint: **50% observability/convergence, 50% produto visível**; demo script mercado separado de QA técnico. |
| **Decisão afetada** | Priorização roadmap, funding narrative |
| **Quando agir** | Próximo sprint planning |

---

### EMR-12 — WIP paralelo contamina decisões

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | ecommerce, db, shadow, morph local no mesmo working tree; decisões tomadas sobre "estado projeto" ambíguo. |
| **Sinal de alerta** | `git status` dirty há >1 semana; relatórios citam untracked como "quase main"; REAL_USAGE on wrong tree. |
| **Impacto** | **Destrói rastreabilidade** — risco #1 do relatório anterior; false regressions; wrong GO/NO-GO. |
| **Probabilidade** | **Alta** — estado atual |
| **Severidade** | **Alta** |
| **Mitigar** | **Dia 1-2:** branches por WORKSTREAM_ISOLATION_PLAN; main limpo só published; stashes nomeados. |
| **Decisão afetada** | **Todas** |
| **Quando agir** | **Imediato** — antes REAL_USAGE |

---

### EMR-13 — Temporal mapping vira burocracia

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | SESSION-XX ARCH-INF proliferam; tags TEMPORALLY_* sem CAPTURED; mapping vira exercício acadêmico. |
| **Sinal de alerta** | >20 sessions ARCH-INF, 0 CAPTURED; temporal docs > code evidence; nenhuma decisão referenciou SESSION-XX. |
| **Impacto** | Custo alto, insight baixo; time ignora docs. |
| **Probabilidade** | Média — **tendência visível** |
| **Severidade** | Média |
| **Mitigar** | Cap **6 sessions** prioritárias (01,02,03,07,17,19); resto só se triage pedir; ARCH-INF expire em 30 dias. |
| **Decisão afetada** | composer priority formalization |
| **Quando agir** | Após 3 CAPTURED sessions ou 30 dias |

---

### EMR-14 — Reducer evitado quando faria sentido local

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Tabu "reducer global" estende-se a **reducers locais** úteis (scroll lock ref-count, composer priority selector, drawer open set). |
| **Sinal de alerta** | TR-R01 documentado 3+ vezes, zero hook; shadow reducer discutido mas `useBodyScrollLock` nunca PR. |
| **Impacto** | Duplicação persiste; medo impede fixes cirúrgicos; baby=bathwater. |
| **Probabilidade** | Média |
| **Severidade** | Média |
| **Mitigar** | Distinção explícita: **global reducer** BLOCKED vs **domain reducer/hook** ALLOWED post-evidence; EMR-14 in RUNTIME_GOVERNANCE. |
| **Decisão afetada** | ref-count, composer priority |
| **Quando agir** | Stack B migrate cycle 1 — incluir useBodyScrollLock |

---

### EMR-15 — Stack B convergence adiada indefinidamente

| Campo | Conteúdo |
|-------|----------|
| **Descrição** | Fase 1–2 "done" gera falsa sensação convergência; Fase 3 sempre "after re-run" sem data; DD-01 executivo sem owner. |
| **Sinal de alerta** | 7 shadcn drawers em main >60 dias pós bridges; nenhum PR ActionDrawer Stack B; migrate personal não scheduled. |
| **Impacto** | Blocker estrutural eterno; EMR-03, EMR-08 amplificados. |
| **Probabilidade** | Média-Alta |
| **Severidade** | **Alta** |
| **Mitigar** | Calendar: personal migrate **T+14** pós re-run; owner nomeado; exit criterion 0 shadcn in personal. |
| **Decisão afetada** | Truth Mapping, drawer contract FROZEN |
| **Quando agir** | **T+7** schedule; **T+14** start migrate |

---

## Riscos aceitáveis (monitorar, não panic)

| ID | Por que aceitável agora |
|----|-------------------------|
| EMR-04 | Skeletons tagged — mitigável com promote discipline |
| EMR-05 | Tier 1 freeze correto pós-estabilização — 4–8 semanas OK |
| EMR-13 | Temporal taxonomy útil se capped |
| EMR-14 | Evitar reducer global ainda correto |
| SD-02 / transient overlaps | TEMPORALLY_TOLERATED — não confundir com EMR |

---

## Riscos críticos (ação obrigatória)

| ID | Ação | Prazo |
|----|------|-------|
| EMR-12 | Isolar branches/workstreams | 48h |
| EMR-07 | Executar REAL_USAGE re-run | 7 dias |
| EMR-03 | Calendar bridge → migrate | 14 dias |
| EMR-08 | Scope Truth Mapping (não "completo") | no gate |
| EMR-15 | Start personal Fase 3 | 14 dias pós re-run |

---

## Gatilhos de ação

| Gatilho | Resposta |
|---------|----------|
| Nenhum PR merge 14 dias | Revisão EMR-01 — relax allowlist SAFE |
| Bridge age >60 dias | EMR-03 — migrate ou escalate |
| REAL_USAGE não run 7 dias pós plan | EMR-07 — cancel new docs, run tests |
| working tree dirty >5 dias | EMR-12 — stop decisions until clean |
| >3 P1 perceptual open 30 dias | EMR-05 — Tier 1 controlled lane |
| 0 CAPTURED sessions 30 dias | EMR-13 — pause temporal docs |
| Stakeholder demo overdue 21 dias | EMR-11 — product sprint slice |

---

## Respostas estratégicas (10 perguntas)

### 1. O modelo atual está conservador demais?

**Parcialmente sim — no lugar errado.**

- **Tier 1 / morph / reducer global:** conservadorismo **adequado**.
- **Convergência Stack B, isolamento WIP, execução REAL_USAGE:** conservadorismo **excessivo**.
- **Documentação:** produzindo mais rápido que decisões — desequilíbrio.

### 2. O que precisa continuar protegido?

- Morph pipeline (RAF, interrupt, Strict Mode semantics)
- composerMode literals e `data-*` protocol
- Shadow compare-only (no apply to runtime)
- Trilha isolation **discipline** (não paralisia)
- Distinção emergente vs bug
- Anti-pattern: global reducer / state unification prematura

### 3. O que pode evoluir em paralelo?

| Trilha | Paralelo? |
|--------|-----------|
| REAL_USAGE re-run | ✅ imediato |
| WIP branch isolation | ✅ imediato |
| Brand DNA demos | ✅ paralelo surface |
| db-media (gated) | ✅ paralelo |
| ecommerce-wip | ✅ branch isolada |
| personal migrate Fase 3 | ✅ após re-run |
| Docs-only governance PR | ✅ agora |
| CAPTURED sessions (3–6) | ✅ após clean main |

### 4. Decisões que não podem adiar muito

1. **Isolar working tree** — 48h
2. **REAL_USAGE re-run** — 7 dias
3. **Bridge TTL + migrate calendar** — 14 dias
4. **Truth Mapping scope** (A first, B later) — antes de qualquer GO
5. **Product demo / mercado** — 21 dias (paralelo)

### 5. Limite saudável observar vs implementar

```
Observar quando:  divergência nova, shadow mismatch, arquitetura desconhecida
Implementar quando: decisão DD tomada + trilha isolada + rollback claro + REAL_USAGE path defined

Regra 70/30 por sprint:
  ~70% execução scoped (migrate, fix P1, product)
  ~30% observação (sessions, shadow triage)
```

**Red flag:** 100% observação por 2 sprints seguidos.

### 6. Quando bridge → migração obrigatória?

| Condição | Obrigatório migrate |
|----------|---------------------|
| Bridge age | >60 dias desde instrumentação |
| REAL_USAGE | re-run pass bridge paths |
| Vertical | após personal pilot pattern proven |
| Event parity | bridge emits same contract as ActionDrawer |
| Owner | named — não "future" |

**Regra:** bridge max **2 release cycles** por drawer. Terceiro cycle = falha de processo (EMR-03).

### 7. Quando Tier 1 deixa de ser congelado?

**Nunca "descongelado" wholesale.** Transição para **Tier 1 controlado**:

| Gate | Critério |
|------|----------|
| Start controlled | REAL_USAGE pass + 4 semanas stable main |
| Per-change | TIER1_RISK checklist, 1 PR/sprint max |
| Full evolution | Truth Mapping Stack A GO + composer contract EVIDENCED |

Freeze absoluto em: morph timings, z-index map, `data-*`, COMPOSER_SURFACE_COLOR.

### 8. Evitar governança → burocracia

- Time-box gates (5–7 dias)
- 1-page checklists replace 20-page gates for SAFE/TIER1_RISK
- Weekly **Decision Log** (3 linhas: decision, owner, date) > new audit doc
- Auto-expire ARCH-INF / observational findings
- Modo agente: OBSERVE vs IMPLEMENT explicit

### 9. Velocidade produto sem destruir runtime

1. Features só em **trilhas isoladas** (ecommerce, brand)
2. Convergence **1 vertical/cycle** — measurable progress
3. P1 perceptual fixes allowed (Tier 1 controlled)
4. Mercado demo script **≠** REAL_USAGE script
5. Nunca merge cross-trilha
6. Celebrate migrate PRs like feature PRs

### 10. Próxima decisão executiva

**DECISÃO:** Declarar **Semana de Execução Observável**:

1. Congelar novos docs audit (except RESULTS)
2. Isolar branches (EMR-12)
3. REAL_USAGE re-run → RESULTS
4. Calendar personal migrate T+7 review / T+14 start
5. Bridge TTL = 60 dias from `e002921`

Owner: humano product/tech lead — não agente.

---

## Recomendações práticas

| # | Ação | Esforço | Impacto |
|---|------|---------|---------|
| 1 | `git worktree` ou branches por trilha | 2h | EMR-12 ↓↓↓ |
| 2 | REAL_USAGE re-run session | 3h | EMR-07, EMR-08 |
| 3 | PR docs-only governance pack | 1h | consolidate |
| 4 | DECISION_LOG.md weekly | 15min/wk | EMR-02 ↓ |
| 5 | Bridge expiry date in MIGRATION_STRATEGY | 30min | EMR-03 ↓ |
| 6 | Promote 3 sessions ARCH-INF → CAPTURED | 2h | EMR-13 ↓ |
| 7 | Allowlist SAFE changes in RUNTIME_GOVERNANCE | 1h | EMR-01 ↓ |
| 8 | Product demo prep (parallel) | 4h | EMR-11 ↓ |

---

## Decisão sugerida — próximos 7 dias

| Dia | Ação | Modo |
|-----|------|------|
| 1–2 | Isolar working tree; main clean @ e002921 | IMPLEMENT (git only) |
| 2 | PR docs audit (governance + chronology + **this review**) | docs-only |
| 3–4 | REAL_USAGE re-run → RESULTS | OBSERVE |
| 4 | 3× SESSION CAPTURED (01, 02, 03) | OBSERVE |
| 5 | Decision log: Truth Mapping scope A-only; bridge TTL; personal migrate date | DECIDE |
| 6–7 | Prep personal Fase 3 PR spec (no code until approved) | PLAN |

**Não fazer esta semana:** reducer global, shadow apply, ecommerce merge to main, new audit phases.

---

## Conclusão

O método conservador **salvou o runtime**. O risco agora é **salvar demais** — especialmente onde observação substitui convergência e decisão.

**Equilíbrio saudável:** proteger semântica perceptiva Tier 1; **acelerar** decisões estruturais com prazo; tratar documentação como **input** com expiry; bridges como **TTL**, não destino.

> *Governança sem cadência de decisão vira museu. Museu não valida mercado.*

---

## Referências

- `RUNTIME_GOVERNANCE.md`
- `WORKSTREAM_ISOLATION_PLAN.md`
- `NEXT_EVOLUTION_DECISION.md`
- `TEMPORAL_RISK_REPORT.md`
- `MIGRATION_STRATEGY.md`
- `BEHAVIOR_FIX_PRIORITY.md`
