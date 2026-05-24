## Summary

<!-- O que muda e por quê (1–3 frases) -->

---

## Agent bootstrap

- [ ] Li `docs/os/README.md` e bootstrap mínimo (`AGENTS.md`)
- [ ] Respeitei precedência: `docs/os/` → `docs/foundation/` → `docs/audit/` → `docs/ai-handoffs/`
- [ ] Branch isolada — não editei `main` diretamente

Constituição de referência: tag [`os-baseline-2026`](https://github.com/josoetomasdesouza/SOCIAL-LANDING/tree/os-baseline-2026)

---

## Product Drift Check

Conte quantas perguntas abaixo são **sim** ([checklist completo](docs/os/PRODUCT_DRIFT_CHECKLIST.md)):

- [ ] Aumenta burocracia para o usuário?
- [ ] Parece mais SaaS que social-native?
- [ ] Aumenta esforço cognitivo?
- [ ] Reduz fluidez?
- [ ] Quebra continuidade feed → composer?
- [ ] Adiciona complexidade visível?
- [ ] Parece operacional demais (dashboard/admin)?
- [ ] Reduz sensação humana?
- [ ] Reduz sensação social?
- [ ] Reduz profundidade premium?

**Total “sim”:** _ / 10

| Resultado | Ação |
|-----------|------|
| 0 | ✅ GO |
| 1–2 | 🟡 Revisar escopo |
| 3+ | 🛑 Parar — revisar direção |

---

## Frozen zones

Marque zonas tocadas ([referência](docs/os/FROZEN_ZONES.md)):

- [ ] Nenhuma
- [ ] Feed architecture
- [ ] Drawer system
- [ ] Conversational surfaces
- [ ] Morph + motion language
- [ ] Instrumentation
- [ ] Identity system
- [ ] Cross-vertical abstractions

Se marcou alguma frozen zone além de “Nenhuma”:

- [ ] Diff mínimo (não refactor amplo)
- [ ] Revisão estratégica humana obtida (se 🔴)
- [ ] `EVOLUTION_LOG.md` atualizado (se decisão sensível)

---

## OS impact

- [ ] Nenhum — PR não altera direção filosófica
- [ ] Atualizei pilar OS relevante em `docs/os/`
- [ ] Atualizei handoff em `docs/ai-handoffs/`

Pilar(s) afetado(s): <!-- ex: PRIORITIES, FROZEN_ZONES, ou N/A -->

---

## Test plan

- [ ] <!-- passo de validação -->
