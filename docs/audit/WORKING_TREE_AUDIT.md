# Working Tree Audit — Contamination Separation

**HEAD publicado:** `311bad8` (`foundation-observability-v1`)  
**Estado:** Working tree **dirty** — conteúdo local não faz parte da fundação publicada  
**Data:** 2026-05-23

---

## Resumo executivo

| Categoria | Risco | Ação recomendada |
|-----------|-------|------------------|
| Perceptivo perigoso | 🔴 Alto | PR separado ou descartar local |
| Ecommerce WIP | 🟡 Médio | PR separado (feature) |
| DB / Schema infra | 🟢 Baixo (isolado) | PR futuro, manter local |
| Docs / handoffs | 🟢 Baixo | Commit separado ou local |
| Build artifacts | ⚪ Ruído | Descartar / gitignore |
| Package churn | 🟡 Médio | Revisar antes de PR deps |

**Regra:** Não misturar working tree com tag `foundation-observability-v1`.

---

## 1. Experimental

Arquivos untracked de infraestrutura futura — **não conectados ao runtime Tier 1**:

```
lib/db/
lib/landing-schema/
drizzle/
drizzle.config.ts
scripts/
app/api/media/
docs/architecture/
.env.example
.gitignore (untracked)
pnpm-workspace.yaml
package-lock.json
```

| Item | Descrição | Recomendação |
|------|-----------|--------------|
| `lib/db/` | Drizzle/Supabase prep | PR futuro "infra/db-foundation" |
| `lib/landing-schema/` | Schema landing | PR futuro acoplado a db |
| `drizzle/` + config | Migrations | Nunca commitar sem review DB |
| `app/api/media/` | Media API WIP | PR separado com checklist PR7 |
| `scripts/` | Ops scripts | PR separado |
| `.env.example` | Template env | PR docs/infra |

**Contaminação perigosa:** baixa — gated off, não importado por Tier 1 publicado.

---

## 2. Perceptivo (PERIGOSO)

### `components/business/post-to-chat-morph-layer.tsx` (modified)

**9 linhas changed** — altera comportamento Tier 1:

- Remove `capture: true` do scroll listener
- Remove `finish()` no cleanup do effect
- Comentário explícito sobre React Strict Mode

**Risco:** morph pode não cancelar em scroll capturado; cleanup diverge do published HEAD.

| Opção | Quando |
|-------|--------|
| **Descartar** (`git checkout HEAD -- file`) | Se WIP Strict Mode não está pronto para review |
| **PR separado** "fix(morph): strict mode cleanup" | Após validação perceptual dedicada + FROZEN_SYSTEMS review |

**NUNCA** incluir no mesmo PR da fundação observability.

---

## 3. Ecommerce

### Modified (tracked)
```
components/business/ecommerce/ecommerce-conversation-products-block.tsx  (+2/-1)
components/business/ecommerce/ecommerce-feed.tsx                         (+2/-1)
components/business/ecommerce/ecommerce-product-feed-card.tsx            (+177/-?)
```

**Natureza:** WIP feature/perceptual ecommerce — product card refactor significativo.

| Recomendação |
|--------------|
| PR separado "feat(ecommerce): product card …" |
| Não mergear com foundation tag |
| Validar composer modes ecommerce isoladamente |

---

## 4. DB / Schema

Ver secção Experimental. Adicional:

```
docs/ai-handoffs/SUPABASE_DEV_CREATE_AND_APPLY_GUIDE.md  (untracked)
docs/ai-handoffs/PR3_DEV_MIGRATION_OPERATOR_CHECKLIST.md (untracked)
docs/ai-handoffs/PR7_MEDIA_API_E2E_DEV_CHECKLIST.md    (untracked)
```

**Recomendação:** PR docs-only ou manter local até operador executar migração.

---

## 5. Safe future PR

Conteúdo seguro para PRs futuros **desde que isolado**:

| PR sugerido | Conteúdo |
|-------------|----------|
| `docs/evolution-log` | `docs/ai-handoffs/EVOLUTION_LOG.md` (+802 lines modified) |
| `chore/deps` | `package.json`, `pnpm-lock.yaml` — revisar diff deps |
| `infra/db-foundation` | lib/db + drizzle + landing-schema |
| `feat/media-api` | app/api/media + scripts |
| `docs/architecture` | docs/architecture/ |

**package.json changes (+16/-?):** provavelmente deps para db/drizzle — validar antes de commit.

---

## 6. Dangerous contamination

### Matriz de risco

| Arquivo/Área | Tipo | Por que é perigoso |
|--------------|------|-------------------|
| `post-to-chat-morph-layer.tsx` | Tier 1 morph | Altera animação/cancel/cleanup |
| `ecommerce-product-feed-card.tsx` | UX feature | Large diff perceptual |
| `.next/` | Build artifact | Ruído, possível leak paths |
| `tsconfig.tsbuildinfo` | Cache | Não commitar |
| `next-env.d.ts` | Generated | Trivial, pode ignorar ou revert |
| Local + published mixed commit | Process | Reintroduz fixup failure mode |

### O que NÃO fazer

- ❌ `git add .` na stabilização
- ❌ Amend foundation commits com WIP local
- ❌ PR único "foundation + ecommerce + morph fix"

---

## Diff quantitativo (working tree vs HEAD)

```
Modified tracked (8 files):
  ecommerce/* (3)
  post-to-chat-morph-layer.tsx
  docs/ai-handoffs/EVOLUTION_LOG.md
  next-env.d.ts
  package.json
  pnpm-lock.yaml

Untracked (~15 paths):
  .env.example, .gitignore, .next/, app/api/media/,
  docs/architecture/, docs/ai-handoffs/*checklists*,
  drizzle*, lib/db/, lib/landing-schema/, scripts/,
  package-lock.json, pnpm-workspace.yaml, tsconfig.tsbuildinfo
```

---

## Recomendações finais

### Descartar (ou gitignore)
- `.next/`
- `tsconfig.tsbuildinfo`
- `package-lock.json` (se pnpm é canonical)

### Permanecer local (até PR dedicado)
- `lib/db/`, `lib/landing-schema/`, drizzle, scripts
- Ecommerce WIP
- Morph Strict Mode WIP (ou descartar se experimental)

### PR separado imediato (baixo risco)
- Docs handoffs/checklists
- `EVOLUTION_LOG.md`

### Nunca descartar sem backup
- `EVOLUTION_LOG.md` (+802 lines) — histórico evolutivo
- Drizzle migrations se já aplicadas em dev DB

---

## Estado remoto

```
origin/main     = 311bad8 ✅
foundation-observability-v1 (remote tag) = 311bad8 ✅
```

Working tree local **≠** tag publicada. Estabilização referencia **apenas** commits publicados.

---

## Veredicto

Working tree contém **contaminação perceptiva ativa** (`post-to-chat-morph-layer.tsx`) e **WIP paralelo** (ecommerce, db). Fundação evolutiva publicada está limpa; isolamento antes de próximos merges é **obrigatório** para preservar critérios de sucesso da estabilização.
