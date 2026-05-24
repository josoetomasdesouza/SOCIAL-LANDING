# Working Tree Isolation Check — 2026-05-24

**HEAD:** `e002921` (`main` @ origin/main)  
**Modo:** classificação only — **sem commit, sem discard**  
**Contexto:** pré-requisito para branch `workstream/personal-phase3-actiondrawer`

---

## Resumo executivo

| Métrica | Valor |
|---------|-------|
| Modified tracked | **9 files** |
| Untracked (significativos) | **~50+ paths** (incl. `.next/` mass) |
| Trilhas misturadas | **5** |
| Safe for personal migrate branch | **only clean checkout from e002921** |
| Blocker processo | **🔴 SIM** — working tree dirty |

**Regra:** personal Phase 3 branch **deve** partir de `main` limpo @ `e002921`, não do working tree atual.

---

## Modified tracked (9)

| Arquivo | Trilha | Risco | Incluir em personal migrate? |
|---------|--------|-------|------------------------------|
| `components/business/ecommerce/ecommerce-conversation-products-block.tsx` | ecommerce-wip | 🟡 | ❌ |
| `components/business/ecommerce/ecommerce-feed.tsx` | ecommerce-wip | 🟡 | ❌ |
| `components/business/ecommerce/ecommerce-product-feed-card.tsx` | ecommerce-wip | 🔴 perceptivo | ❌ |
| `components/dev/passive-event-provider.tsx` | runtime/shadow | 🟡 | ❌ |
| `lib/surfaces/index.ts` | runtime/shadow | 🟡 | ❌ |
| `docs/ai-handoffs/EVOLUTION_LOG.md` | docs/handoffs | 🟢 | ❌ (PR docs separado) |
| `package.json` | deps/db | 🟡 | ❌ |
| `pnpm-lock.yaml` | deps/db | 🟡 | ❌ |
| `next-env.d.ts` | generated | ⚪ | ❌ |

**Nota:** `post-to-chat-morph-layer.tsx` **não** aparece modified — Tier 1 limpo vs HEAD ✅

---

## Untracked — classificação por trilha

### docs-only (audit + convergence)

```
docs/audit/**          (~25 files — governance, REAL_USAGE, temporal, contracts)
docs/convergence/**    (PERSONAL_PHASE3*, MIGRATION_STRATEGY, etc.)
```

| Ação recomendada | PR `docs/audit-convergence-pack` from clean branch |
|------------------|--------------------------------------------------|
| Personal migrate? | ❌ não misturar |

### ecommerce-wip

(Nenhum untracked ecommerce — changes are **tracked modified** only)

### db-media

```
lib/db/
lib/landing-schema/
drizzle/
drizzle.config.ts
app/api/media/
scripts/*.sql
scripts/*smoke*.mjs
scripts/auth-health-check.mjs
.env.example
pnpm-workspace.yaml
package-lock.json
docs/ai-handoffs/PR3_*.md
docs/ai-handoffs/PR7_*.md
docs/ai-handoffs/SUPABASE_*.md
docs/architecture/
```

| Personal migrate? | ❌ |

### runtime / shadow

```
lib/surfaces/shadow/
```

(Also modified: `lib/surfaces/index.ts`, `passive-event-provider.tsx`)

| Personal migrate? | ❌ |

### build artifacts (ruído)

```
.next/               (massive)
tsconfig.tsbuildinfo
.gitignore           (untracked — review before commit)
```

| Ação | Não commitar; ensure gitignore |
| Personal migrate? | ❌ |

---

## Trilhas misturadas — mapa de contaminação

```text
main @ e002921 (clean published)
    │
    ├── [modified] ecommerce-wip ──────────── trilha A
    ├── [modified] shadow wiring ────────── trilha B
    ├── [modified] package/deps ─────────── trilha C (likely db)
    ├── [untracked] docs audit pack ─────── trilha D
    └── [untracked] db-media infra ──────── trilha E
```

**Nenhuma** dessas trilhas pode entrar na branch personal migrate.

---

## O que deve ficar FORA da migração personal

| Categoria | Paths |
|-----------|-------|
| Ecommerce | `components/business/ecommerce/**` |
| DB/Media | `lib/db/**`, `drizzle/**`, `app/api/media/**` |
| Shadow | `lib/surfaces/shadow/**`, shadow edits in index/provider |
| Tier 1 | all frozen files |
| Other verticals | influencer, institutional, appointment, … |
| Docs bulk | commit separately |
| Build junk | `.next/`, `tsconfig.tsbuildinfo` |

---

## personal-feed.tsx status

| Check | Status |
|-------|--------|
| Modified? | **NO** ✅ |
| Untracked? | **NO** ✅ |
| Matches e002921? | **YES** ✅ |

**Conclusão:** arquivo alvo da migração está **limpo** no index — branch pode editá-lo desde que checkout seja clean.

---

## Ações recomendadas (humano — não executadas)

| # | Ação | Trilha |
|---|------|--------|
| 1 | `git stash push -m "ecommerce-wip"` — ecommerce modified | ecommerce |
| 2 | `git stash push -m "shadow-wiring"` — provider + surfaces/index | shadow |
| 3 | `git checkout -- next-env.d.ts` OR ignore | generated |
| 4 | Manter untracked docs OR branch `workstream/audit-docs` | docs |
| 5 | Manter db untracked local OR branch `workstream/db-media` | db |
| 6 | Confirm `main` clean: `git status` empty | gate |
| 7 | `git checkout -b workstream/personal-phase3-actiondrawer` | migrate |

**Alternativa:** `git worktree add ../SOCIAL-LANDING-personal e002921 -b workstream/personal-phase3-actiondrawer`

---

## Gate checklist — branch personal

| Critério | Status |
|----------|--------|
| HEAD = e002921 | ✅ |
| personal-feed.tsx unmodified | ✅ |
| Working tree clean | ❌ |
| RU-R-03 ACCEPTED | ✅ |
| Spec approved | ✅ |
| Ecommerce not in branch | ⏳ depends on clean checkout |

---

## Referências

- `WORKING_TREE_AUDIT.md` (2026-05-23 histórico)
- `WORKSTREAM_ISOLATION_PLAN.md`
- `PERSONAL_PHASE3_BRANCH_PLAN.md`
