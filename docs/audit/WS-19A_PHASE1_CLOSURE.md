# WS-19A — Fechamento Institucional Fase 1

**Data de fechamento:** 2026-06-04  
**Baseline produção:** `origin/main` @ `72d49ad39b8b82c33eba6d04ceaaa5163218525a`  
**Tipo:** registro institucional · **docs-only** · sem código nesta sessão  
**Autoridade:** Encerramento formal da Fase 1 antes de qualquer discussão de Fase 2

---

## Registro institucional (estado atual)

```txt
WS-19A Fase 1 (implementação stub):     FECHADA ✅
WS-19A Fase 2:                          NÃO ABERTA 🔴
LLM visitante / Kernel endpoint:        NO-GO
Tier 1 / conversational-ai.tsx:         INTOCADO
Composer visual:                        INTOCADO
lib/runtime / publication / storage:  INTOCADOS
WS-18A:                                 ISOLADO · FECHADO
WS-08D V1.1 rules em main:              PROIBIDO · baseline comparativo apenas
V1.1 branch experimento:                fora do main (não promovida)
```

---

## 1. Baseline e merge

| Âncora | Hash | Significado |
|--------|------|-------------|
| **Baseline pré-Fase 1** | `24c3048` | Charter + matriz eval + Selected Context Grounding (docs) |
| **Commit feature Fase 1** | `1de7113a607584282bed22522b7085f853608c01` | `feat(WS-19A): add phase 1 conversation kernel stub` |
| **Merge commit** | `72d49ad39b8b82c33eba6d04ceaaa5163218525a` | Merge PR #78 → `main` |
| **`origin/main` (atual)** | `72d49ad` | Produção pós-Fase 1 |

**PR:** [#78 — feat(WS-19A): phase 1 conversation kernel stub](https://github.com/josoetomasdesouza/SOCIAL-LANDING/pull/78) — **MERGED** @ 2026-06-04T12:49:34Z

**Branch técnica:** `workstream/ws-19a-phase1-kernel-stub` (mergeada; não deletada no remoto)

**V1.1 isolada:** `experiment/ws08d-v1.1-gray-zone` @ `989c51f` (local/remoto experimento) — **não** entrou na PR #78 nem em `main`.

---

## 2. Escopo publicado (12 arquivos — PR #78)

### Criados (9)

| Arquivo | Papel |
|---------|--------|
| `lib/conversation-kernel/types.ts` | Contratos `ModelContextPack`, `KernelResponse`, `SelectedContextItem`, sessão |
| `lib/conversation-kernel/model-context-pack.ts` | Mapeamento chips → `selectedContextItems` |
| `lib/conversation-kernel/rule-kernel-stub.ts` | Kernel determinístico (sem LLM) |
| `lib/conversation-kernel/kernel-response-to-resolver.ts` | Mapper para resolver Tier 1 |
| `lib/conversation-kernel/action-registry.ts` | Registry stub de actions |
| `lib/conversation-kernel/appointment/build-appointment-model-context-pack.ts` | Pack piloto Appointment |
| `lib/mock-data/appointment-conversation-kernel-adapter.ts` | Orquestração `[chip→kernel]` / `[WS-08C→kernel→V1→fallback]` |
| `scripts/convergence/ws19a-kernel-eval-runner.mjs` | Entry `pnpm qa:kernel-stub` |
| `scripts/convergence/ws19a-kernel-eval-runner-core.ts` | 22 evals obrigatórios Fase 1 |

### Modificados (3)

| Arquivo | Papel |
|---------|--------|
| `lib/mock-data/appointment-conversation-resolver-composed.ts` | Wire kernel no resolver composto |
| `components/business/appointment/appointment-feed.tsx` | Pass-through `ModelContextPack` (sem UI) |
| `package.json` | Script `qa:kernel-stub` |

### Arquivos proibidos — confirmado sem diff na PR

- `components/business/conversational-ai.tsx`
- `lib/runtime/**`, `lib/publication/**`, `lib/storage/**`
- `lib/mock-data/appointment-establishment-dialogue-v1.ts`
- `lib/mock-data/appointment-conversational-search.ts`
- `scripts/convergence/appointment-ai-resolver-validation.mjs` (sem alteração de escopo V1.1)
- `app/api/**` (novo endpoint)
- Paths WS-18A
- Regras V1.1 em `main`

---

## 3. Arquitetura em produção (resumo)

```txt
[chip ativo]     → rule-kernel stub (GK-17 — grounding antes de fallback)
[sem chip]       → WS-08C → kernel stub → WS-08D V1 → situated fallback
```

- **Delegação transacional:** `delegate_transactional_resolver` → WS-08C mantém cards/schedule.
- **Selected Context Grounding:** evidência prints #1–#4 coberta no stub (E-M-APT-15…18, E-G18…22, E-X11/E-X12).
- **Cross-model eval:** fixtures RS/HL/EC no runner; adapters de feed **não** implementados (Fase 2).

---

## 4. Gates e CI

### Gates locais (validados na branch pré-merge)

| Gate | Resultado |
|------|-----------|
| `pnpm qa:kernel-stub` | **22/22** |
| `pnpm qa:appointment` | **22/22** (AP-01…07 + AP-D01…14) |
| `pnpm qa:ai-regression` | **26/26** |
| `pnpm qa:events` | **8/8** |
| `pnpm run build` | **OK** |
| `pnpm ts:budget` | **0 novos erros** |

### CI remoto

| Momento | Workflow | Resultado |
|---------|----------|-----------|
| PR #78 | QA Minimum (`build + qa:events`) | **SUCCESS** |
| PR #78 | Vercel Preview | **SUCCESS** |
| Pós-merge `main` @ `72d49ad` | [QA Minimum run 26952747622](https://github.com/josoetomasdesouza/SOCIAL-LANDING/actions/runs/26952747622) | **SUCCESS** (`build`, `ts:budget`, `qa:events` 8/8) |

**Nota:** CI mínimo em `main` não executa `qa:kernel-stub` / `qa:appointment` / `qa:ai-regression` — permanecem gates de release manual até decisão de ampliar CI (Fase 2+).

---

## 5. Evals Fase 1 (obrigatórios — verdes no stub)

`E-G00`, `E-G01`…`E-G10`, `E-G18`…`E-G22`, `E-M-APT-15`…`E-M-APT-18`, `E-X11`, `E-X12`

**Matriz completa (68 evals):** [`WS-19A_CONVERSATION_KERNEL_EVAL_MATRIX.md`](./WS-19A_CONVERSATION_KERNEL_EVAL_MATRIX.md) · [`ws19a-conversation-kernel-eval-matrix.json`](./ws19a-conversation-kernel-eval-matrix.json)

**Evals não exigidos na Fase 1:** E-G11…17, E-M restantes, E-X01…10, E-X15…16 — reservados para Fase 2.

---

## 6. O que permanece fora do escopo (pós-Fase 1)

| Tema | Status |
|------|--------|
| LLM visitante | **NO-GO** |
| Endpoint / API route Kernel | **NO-GO** |
| Tier 1 / Composer visual | **INTOCADO** |
| WS-18A overlap | **PROIBIDO** |
| V1.1 rules como estratégia | **NO-GO** — comparativo em branch experimento |
| Piloto RS/HL/EC adapters | **NÃO INICIADO** (Fase 2) |
| Playwright com chips (prints) | **NÃO INICIADO** (Fase 2) |

---

## 7. Relação com artefatos irmãos

| Artefato | Estado após Fase 1 |
|----------|-------------------|
| [`WS-19A_SOCIAL_LANDING_CONVERSATION_KERNEL.md`](./WS-19A_SOCIAL_LANDING_CONVERSATION_KERNEL.md) | Charter vigente · Fase 1 implementada |
| [`WS-19A_CONVERSATION_KERNEL_EVAL_MATRIX.md`](./WS-19A_CONVERSATION_KERNEL_EVAL_MATRIX.md) | Matriz vigente · stub cobre subset Fase 1 |
| [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md) | V1 produção · V1.1 spec only |
| [`WS-08D_V1_1_GRAY_ZONE_SPEC.md`](./WS-08D_V1_1_GRAY_ZONE_SPEC.md) | Spec histórica · **NO-GO** estratégia |

---

## 8. Veredito e próximo passo

| Decisão | Veredito |
|---------|----------|
| **WS-19A Fase 1** | **FECHADA ✅** — código em `main` @ `72d49ad` |
| **Discutir / abrir Fase 2** | **GO condicional** — apenas após novo **GO humano explícito** institucional |
| **Merge V1.1 experimento** | **NO-GO** |
| **LLM / endpoint** | **NO-GO** até charter amend + evals dedicados |

**Próximo passo institucional (não autorizado automaticamente):**

1. Deliberação produto: `GO WS-19A fase 2` (escopo: evals restantes, Playwright chips, adapters RS/HL/EC, CI ampliado).
2. Publicar `WS-19A_PHASE2_CHARTER_AMEND` se escopo divergir do charter §12.
3. Manter `experiment/ws08d-v1.1-gray-zone` como arquivo morto comparativo.

---

## Related

- [`docs/os/WORKSTREAMS.md`](../os/WORKSTREAMS.md) — WS-19A
- [`OPERATIONAL_HANDOFF_BASELINE.md`](./OPERATIONAL_HANDOFF_BASELINE.md) — handoff operacional
- PR #78 · commit `1de7113` · merge `72d49ad`
