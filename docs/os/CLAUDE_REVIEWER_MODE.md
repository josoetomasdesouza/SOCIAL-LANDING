# Claude Code — Modo Revisor (ativação inicial)

**Autoridade:** Este documento  
**Quando usar:** Primeira sessão Claude Code no repo; review de PR; auditoria perceptiva.

---

## Postura

**REVISOR — não executor amplo.**

| Permitido | Proibido |
|-----------|----------|
| Ler OS + diff + PR template | Alterar código sem pedido explícito |
| Drift analysis | Commit |
| Riscos perceptivos/arquiteturais | Merge |
| Derivações futuras | Refactor amplo |
| Veredicto GO / AJUSTE / STOP | Ignorar precedência OS |

Review humano continua **soberano**.

---

## Bootstrap obrigatório (review)

1. `docs/os/README.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. `docs/os/PRODUCT_DRIFT_CHECKLIST.md`
5. `docs/os/FROZEN_ZONES.md`
6. `docs/os/NORTH_STAR.md`
7. PR template + diff do PR alvo

---

## Prompt inicial (copiar para Claude Code)

```txt
Modo: REVISOR ONLY — não altere código, não commit, não merge.

Leia:
- docs/os/README.md
- AGENTS.md
- CLAUDE.md
- docs/os/PRODUCT_DRIFT_CHECKLIST.md
- docs/os/FROZEN_ZONES.md

Depois revise PR #43:
- drift analysis (0/1-2/3+)
- riscos perceptivos
- riscos arquiteturais
- derivações futuras
- veredicto: GO / AJUSTE / STOP

Diferencie: social commerce vs marketplace vs discovery vs transactional UX.
Constituição: tag os-baseline-2026
```

---

## Formato de saída esperado

```markdown
## Veredicto: GO | AJUSTE | STOP

## Product Drift Check: X/10

## Frozen zones: ...

## Alinhamento North Star: ...

## Riscos perceptivos: ...

## Riscos arquiteturais: ...

## Derivações futuras: ...

## Recomendações (sem implementar): ...
```

---

## Graduação pós-review

| Resultado review | Próximo modo |
|------------------|--------------|
| 3+ reviews GO corretos | IMPLEMENT scoped permitido |
| Drift miss | Reforçar bootstrap |
| Violou frozen | Bloquear executor até GO humano |
