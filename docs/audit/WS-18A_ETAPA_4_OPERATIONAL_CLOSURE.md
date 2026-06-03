# WS-18A Etapa 4 — Fechamento Operacional (Runbook + Gates)

**Data:** 2026-06-03  
**Tipo:** Documentação de fechamento · **zero código**  
**Baseline publicado declarado:** `origin/main` @ `23fec61` (Etapas 1–2)  
**Baseline código Etapa 3:** publicada pelo operador · provider LLM opt-in (verificar hash em `main` após push)  
**Baseline produto perceptivo:** `1c92acc` (inalterado)  
**Charter:** [`WS-18A_OPERATIONAL_AI_MINIMUM.md`](WS-18A_OPERATIONAL_AI_MINIMUM.md)

---

## 1. Auditoria WS-18A Etapa 4

### Objetivo da etapa

Consolidar em documentação oficial o estado **real** do WS-18A após implementação das Etapas 1–3, sem alterar runtime, publication, storage, external reality, Tier 1 ou WS-08C.

### Escopo executado (Etapa 4)

| # | Entregável | Status |
|---|------------|--------|
| 1 | Atualizar `docs/os/WORKSTREAMS.md` | ✅ |
| 2 | Atualizar charter WS-18A (estado pós-Etapa 3) | ✅ |
| 3 | Arquitetura final do provider system | ✅ §3 |
| 4 | Fluxo operacional fixture → LLM → parser → validate → draft write | ✅ §4 |
| 5 | Gates obrigatórios | ✅ §5 |
| 6 | Riscos residuais | ✅ §6 |
| 7 | Decisões irreversíveis | ✅ §7 |
| 8 | Checklist operação humana | ✅ §8 |

### O que Etapa 4 **não** faz

- Novas features · novos primitives · novo provider SDK
- Alteração de CI (`.github/workflows/*`)
- WS-17 · WS-09 enterprise · expansão WS-08C
- Reabertura de filosofia perceptiva

### Realinhamento charter vs implementação

O charter original numerou CLI/parity como Etapa 4 e runbook como Etapa 5. Na prática:

| Charter original | Implementação real | Hash ref |
|------------------|-------------------|----------|
| Etapa 1 Types + fixture | ✅ | `e64912c` |
| Etapa 2 Merge + draft write | ✅ | `23fec61` |
| Etapa 3 Provider LLM | ✅ | commit Etapa 3 |
| Etapa 4 CLI + parity | ✅ antecipado em Etapa 2 | `23fec61` |
| Etapa 5 Runbook + WORKSTREAMS | ✅ **esta Etapa 4 doc** | — |

---

## 2. Análise crítica — inconsistências (pré-Etapa 4)

| # | Inconsistência | Severidade | Resolução Etapa 4 |
|---|----------------|------------|-------------------|
| I-01 | `WORKSTREAMS.md` ainda lista WS-18A como “próximo ciclo” | Alta | Atualizado → **FECHADO** |
| I-02 | Charter WS-18A header: “sem implementação” / gap “IA inexistente” | Alta | Atualizado → estado entregue |
| I-03 | `OPERATIONAL_HANDOFF_BASELINE.md` diz Etapa 3 não commitada | Média | Atualizado conforme briefing operador |
| I-04 | `WS-09A` ainda recomenda WS-18A como próximo | Baixa | Fora de escopo Etapa 4 (não alterar WS-09A) |
| I-05 | Charter cita `merge-into-draft.ts` — código usa `merge-patch.ts` | Baixa | Documentado aqui |
| I-06 | Env `APPOINTMENT_AI_DRY_RUN` no charter — CLI usa `--execute` / `dryRun` default em código | Baixa | Runbook reflete CLI real |
| I-07 | `meta.ai` no envelope — **não** persistido no JSON do draft | Baixa | Risco residual §6 |
| I-08 | Verificar `origin/main` contém commit Etapa 3 se briefing diz “publicada” | Alta | Operador deve confirmar hash em `git log` |

**Nota de verificação (2026-06-03):** `origin/main` @ `23fec61`. Árvore local: Etapa 3 **modified/untracked** em `operational-ai/` (ainda sem commit local). Se briefing indica “publicada”, confirmar remoto/branch e registar hash; caso contrário, **commit Etapa 3 antes do fechamento formal GO pleno**.

---

## 3. Arquitetura final — Provider System

**Módulo raiz:** `lib/runtime/appointment/operational-ai/`  
**Prompt pack:** `prompts/` · versão `ws18a-v1` (`OPERATIONAL_AI_PROMPT_PACK_VERSION`)

### Camadas

```txt
┌─────────────────────────────────────────────────────────────┐
│ CLI  scripts/runtime/generate-appointment-ai-draft.ts        │
│      pnpm runtime:appointment:ai-draft                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│ write-draft.server.ts                                        │
│   resolve live base · generateOperationalAiOutput · validate  │
│   writeAppointmentRuntimeDocumentByKey(runtime/{slug}/draft) │
│   dryRun default · never live key                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│ generate-output.server.ts                                    │
│   resolveOperationalAiProvider() → generatePatch(input)      │
│   mergeOperationalPatch · attachOperationalDraftMeta         │
│   validateOperationalAiOutput · validateAppointmentDraftBundle│
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
    ┌───────────▼──────────┐      ┌───────────▼──────────────┐
    │ provider.fixture.ts   │      │ provider.llm.server.ts    │
    │ generateFixturePatch  │      │ fetch OpenAI-compatible   │
    │ (default, CI-safe)    │      │ parseOperationalAiPatch.. │
    └──────────────────────┘      └───────────┬──────────────┘
                                              │
                                  ┌───────────▼──────────────┐
                                  │ parse-output.server.ts    │
                                  │ envelope { patch } only   │
                                  │ + validatePatchShape      │
                                  └──────────────────────────┘
```

### Interface

```ts
// provider.interface.ts
interface OperationalAiProvider {
  readonly id: OperationalAiProviderId  // "fixture" | "llm"
  generatePatch(input: OperationalAiInput): Promise<OperationalAiPatchGenerationResult>
}
```

### Resolução de provider

| Env `APPOINTMENT_AI_PROVIDER` | Provider | CI |
|-------------------------------|----------|-----|
| unset / `fixture` | `fixtureOperationalAiProvider` | ✅ default |
| `llm` ou `openai` | `llmOperationalAiProvider` | SKIP sem API key |

**LLM env adicional:** `APPOINTMENT_AI_API_KEY` ou `OPENAI_API_KEY` · `APPOINTMENT_AI_MODEL` (default `gpt-4o-mini`) · `APPOINTMENT_AI_BASE_URL` (default OpenAI v1)

### Primitives (inalterados)

| ID | Kind | Snapshot externo |
|----|------|------------------|
| P-01 | `operational_hints_refresh` | — |
| P-02 | `arrival_copy_variation` | — |
| P-03 | `brand_description_polish` | — |
| P-04 | `service_copy_polish` | — |
| P-05 | `external_review_map` | obrigatório |
| P-06 | `story_caption_refresh` | — |
| P-07 | `full_draft_variation` | — |

### Boundaries (inalterados)

| Camada | Path | WS-18A |
|--------|------|--------|
| Composer conversacional | `lib/.../appointment-conversational-search*` | **WS-08C — isolado** |
| Produto perceptivo | `components/**` `app/**` @ `1c92acc` | **intocado** |
| Publication promote | `publication/promote.ts` | **manual only** |
| Live write | `runtime/{slug}/live` | **proibido** |

---

## 4. Fluxo operacional completo

### 4.1 Fixture provider (default)

```txt
1. READ live bundle
   readAppointmentRuntimeDocumentByKey(buildRuntimeLiveKey(slug))

2. GENERATE patch (deterministic)
   generateFixturePatch(input)  // provider.fixture.ts

3. MERGE + META
   mergeOperationalPatch(base, patch)
   attachOperationalDraftMeta → derivedFrom: "ai"

4. VALIDATE
   validateOperationalAiOutput(...)
   validateAppointmentDraftBundle(...)

5. WRITE draft (dry-run default)
   writeAppointmentRuntimeDocumentByKey(buildRuntimeDraftKey(slug), bundle, { dryRun })
```

### 4.2 LLM provider (opt-in)

```txt
1–2. Same READ live base

3. PROMPT
   buildOperationalAiLlmMessages(input)
   system: prompts/system.ts
   primitive: prompts/primitives.ts
   schema: prompts/schema.ts

4. CALL
   POST {APPOINTMENT_AI_BASE_URL}/chat/completions
   response_format: json_object

5. PARSE
   parseOperationalAiPatchResponse(content, adaptationKind)
   → reject prose, extra keys, locked paths

6–7. Same MERGE + VALIDATE + WRITE as fixture
```

### 4.3 Parser — regras de rejeição

| Entrada | Resultado |
|---------|-----------|
| Texto solto / não-JSON | Reject |
| Markdown fences | Strip → parse |
| Top-level ≠ `{ "patch": ... }` | Reject |
| Chaves extras (`explanation`, etc.) | Reject |
| Patch keys fora de operational/arrival/establishment/services/feed | Reject |
| `arrival.drawerTitle` / `mapsQuery` / brand assets | Reject (`validatePatchShape`) |
| Patch vazio | Reject |

### 4.4 Draft write — regras

| Regra | Valor |
|-------|-------|
| Target key | `runtime/{slug}/draft` only |
| `derivedFrom` | `"ai"` |
| Dry-run default | `dryRun ?? true` |
| Execute | CLI `--execute` |
| Draft exists | `--force` on execute |
| Live | **nunca** escrito pela IA |

### 4.5 Pipeline humano pós-IA

```txt
ai-draft (dry-run) → ai-draft --execute [--force]
  → draft-validate
  → [APPOINTMENT_PUBLICATION_PREVIEW=draft + dev]  // opt-in
  → promote --execute   // operador — WS-15A
```

**Regra:** IA propõe draft · operador publica · **nunca** auto-promote.

---

## 5. Gates obrigatórios

### Pré-commit / pré-promote (Appointment operacional)

| Ordem | Comando | Obrigatório |
|-------|---------|-------------|
| 1 | `pnpm typecheck` | ✅ |
| 2 | `pnpm qa:appointment-ai-operational` | ✅ |
| 3 | `pnpm qa:appointment-storage` | ✅ |
| 4 | `pnpm qa:appointment-publication` | ✅ |
| 5 | `pnpm qa:appointment-runtime` | ✅ |
| 6 | `pnpm qa:appointment` | ✅ (dev server) |
| 7 | `pnpm qa:events` | ✅ (dev server) |

### CI GitHub (inalterado — WS-04)

| Workflow | Conteúdo |
|----------|----------|
| `qa-minimum.yml` | build · `ts:budget` · `qa:events` 8/8 |

**Não inclui** gates appointment-operational — protocolo local obrigatório.

### Gate de saída WS-18A (G1–G14)

| # | Critério | Verificação Etapa 4 |
|---|----------|---------------------|
| G1 | IA operacional documentada | este doc + charter atualizado |
| G2 | Server-only; zero client provider | `load-feed.ts` separado; grep |
| G3 | Output = draft only | `write-draft.server.ts` guard |
| G4 | Primitives bounded | `allowed-paths.ts` + parity |
| G5 | `validateAppointmentDraftBundle` | parity + publication smoke |
| G6 | Fixture default; CI sem API key | `resolve-provider` + SKIP LLM |
| G7 | Auto-promote proibido | WS-15A + runbook |
| G8 | Preview draft OFF default | WS-15A |
| G9 | External overlay OFF default | WS-16A |
| G10 | Zero JSX/UI diff WS-18A | escopo código Etapas 1–3 |
| G11 | `qa:appointment` 8/8 | protocolo local |
| G12 | `qa:events` 8/8 | protocolo local |
| G13 | storage + publication PASS | smokes |
| G14 | Draft parece sistema | grammar gate + H-tone checklist §8 |

---

## 6. Riscos residuais

| ID | Risco | Mitigação |
|----|-------|-----------|
| R-01 | LLM nondeterminismo | Parser + validate; falha = sem write |
| R-02 | `meta.ai` só no envelope, não no JSON draft | Aceito; provenance via `derivedFrom: ai` |
| R-03 | `external_review_map` + LLM sem snapshot | CLI exige cache; parity SKIP LLM em CI |
| R-04 | Confusão WS-08C vs WS-18A | Boundaries §3 + WORKSTREAMS |
| R-05 | CI não roda appointment-operational | Aceito; protocolo manual |
| R-06 | Promote acidental pós-draft IA | Checklist §8 · draft-validate obrigatório |
| R-07 | Drift doc se Etapa 3 hash não registado em main | Registrar hash pós-push |

---

## 7. Decisões irreversíveis (WS-18A)

1. IA operacional = **server-only** · infra silenciosa.
2. Write target = **`runtime/{slug}/draft`** apenas · `derivedFrom: "ai"`.
3. **Fixture default** · LLM só com `APPOINTMENT_AI_PROVIDER=llm` + API key.
4. Output LLM = **`{ "patch": OperationalAiPatch }`** — sem texto solto.
5. **Sem auto-promote** · **sem live write** · **sem UI IA**.
6. **WS-08C isolado** — composer mock client ≠ operational AI.
7. **Tier 1 @ `1c92acc` intocado** por WS-18A.
8. Primitives P-01…P-07 · IDs/topology locked por default.
9. CI mínimo inalterado — appointment gates locais.

---

## 8. Checklist — operação humana

### A. Antes de gerar draft IA

- [ ] Live existe: `data/runtime/appointment/barba-negra.v1.json`
- [ ] `pnpm qa:appointment-ai-operational` PASS (última alteração relevante)
- [ ] Provider intencional: fixture (default) ou `APPOINTMENT_AI_PROVIDER=llm` + API key
- [ ] Se `external_review_map`: `pnpm runtime:appointment:sync-external` executado

### B. Gerar draft

```bash
# 1. Dry-run (obrigatório primeiro)
pnpm runtime:appointment:ai-draft --kind=<kind> --brief="<brief>"

# 2. Executar write (só após revisar JSON dry-run)
pnpm runtime:appointment:ai-draft --kind=<kind> --brief="<brief>" --execute --force
```

- [ ] `derivedFrom: ai` no output dry-run
- [ ] Nenhum erro em `validationErrors`
- [ ] `provider` correto (`fixture` ou `llm`)

### C. Antes de promover

- [ ] `pnpm runtime:appointment:draft-validate` PASS
- [ ] Diff revisado: IDs professionals/services/stories/sections intactos
- [ ] Copy soa lugar — não marketing (checklist perceptivo)
- [ ] `pnpm qa:appointment` 8/8 se alteração afeta superfície visível
- [ ] Intenção explícita de publicar — **não** “só testar”

### D. Promover (WS-15A)

```bash
pnpm runtime:appointment:promote              # dry-run
pnpm runtime:appointment:promote -- --execute # backup + live
```

- [ ] Backup criado quando live existia
- [ ] Rebuild/restart se usar `NEXT_PUBLIC_APPOINTMENT_RUNTIME=runtime`

### E. Rollback (se necessário)

```bash
pnpm runtime:appointment:rollback -- --execute
# ou
git checkout -- data/runtime/appointment/barba-negra.v1.json
```

### F. O que NÃO fazer

- [ ] Promover sem revisar draft IA
- [ ] Ativar overlay external default-on sem Sessão B
- [ ] Confundir composer WS-08C com operational AI
- [ ] Editar live diretamente como “atalho de IA”

---

## 9. Critérios de aceite — Etapa 4

| # | Critério |
|---|----------|
| A1 | Apenas ficheiros `docs/**` alterados neste commit |
| A2 | `WORKSTREAMS.md` marca WS-18A como **FECHADO** |
| A3 | Charter WS-18A reflete Etapas 1–3 entregues + runbook oficial |
| A4 | Zero alteração em `lib/`, `components/`, `app/`, `.github/` |
| A5 | Handoff atualizado ou superseded por este doc |
| A6 | Nenhuma proposta de feature nova no texto |

---

## 10. Plano de execução (Etapa 4 — concluído)

| Passo | Ação | Estado |
|-------|------|--------|
| 1 | Análise crítica inconsistências | ✅ |
| 2 | Criar `WS-18A_ETAPA_4_OPERATIONAL_CLOSURE.md` | ✅ |
| 3 | Atualizar `WS-18A_OPERATIONAL_AI_MINIMUM.md` | ✅ |
| 4 | Atualizar `WORKSTREAMS.md` | ✅ |
| 5 | Atualizar `OPERATIONAL_HANDOFF_BASELINE.md` | ✅ |
| 6 | Commit docs-only | Pendente operador |
| 7 | Push + verificar CI | Pendente operador |

---

## 11. Comandos git sugeridos

```bash
cd "/Users/josoetomasdesouza/Documents/New project/SOCIAL-LANDING"

# Staging exclusivo Etapa 4 (docs)
git add \
  docs/audit/WS-18A_ETAPA_4_OPERATIONAL_CLOSURE.md \
  docs/audit/WS-18A_OPERATIONAL_AI_MINIMUM.md \
  docs/audit/OPERATIONAL_HANDOFF_BASELINE.md \
  docs/os/WORKSTREAMS.md

git status   # confirmar: só docs acima

git commit -m "$(cat <<'EOF'
docs: close ws-18a operational ai with runbook and gates

Record provider architecture, operator checklist, and formal WS-18A closure after Etapa 3 LLM opt-in without changing runtime code.
EOF
)"

git push origin main
```

**Não incluir:** `WS-13` docs · `next-env.d.ts` · capturas · `data/runtime/external/`.

---

## 12. Veredito — fechamento formal WS-18A

### Etapa 4 (documentação)

**GO ✅** — Escopo docs cumprido; runbook e gates registrados.

### Workstream WS-18A (conjunto Etapas 0–4)

**GO ✅ FECHADO** — condicionado a:

| Condição | Estado |
|----------|--------|
| Código Etapas 1–3 presente e gates verdes | ✅ (briefing operador) |
| Etapa 3 commit em `main` com hash registado | ⚠️ confirmar em `git log origin/main` |
| Etapa 4 commit docs-only | Pendente |
| Tier 1 / WS-08C / publication / storage não alterados neste fechamento | ✅ |

### Pós-fechamento (fora de WS-18A)

| Item | Status |
|------|--------|
| WS-17 editor | Não iniciado |
| WS-09 enterprise | BLOCKED |
| Expandir CI com appointment gates | Não iniciado |
| LLM provider em produção contínua | Opt-in operador apenas |

---

*WS-18A Etapa 4 — fechamento operacional. LLM é motor de patch, não agente de produto. IA propõe draft; operador publica.*
