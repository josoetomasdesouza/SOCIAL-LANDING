# Product Drift Checklist — Social Landing

**Autoridade:** Este documento  
**Uso:** Lint filosófico — toda feature, refactor ou PR de produto deve passar por isto.

---

## Quando usar

- Antes de implementar feature nova
- Antes de refactor em frozen zone
- Antes de merge de PR que toca UX ou arquitetura perceptiva
- Quando um agente propõe “melhoria” não solicitada

---

## Checklist

Responda honestamente para a proposta:

| # | Pergunta | Sim = ⚠️ drift |
|---|----------|----------------|
| 1 | Isso **aumenta burocracia** para o usuário final? | |
| 2 | Isso **parece mais SaaS** do que social-native? | |
| 3 | Isso **aumenta esforço cognitivo**? | |
| 4 | Isso **reduz fluidez**? | |
| 5 | Isso **quebra continuidade** feed → composer? | |
| 6 | Isso **adiciona complexidade visível**? | |
| 7 | Isso **parece operacional demais** (dashboard/admin)? | |
| 8 | Isso **reduz sensação humana**? | |
| 9 | Isso **reduz sensação social**? | |
| 10 | Isso **reduz profundidade premium**? | |

---

## Veredicto

| Respostas “sim” | Ação |
|-----------------|------|
| 0 | ✅ Prosseguir — alinhado com North Star |
| 1–2 | 🟡 Revisar escopo — ajustar antes de implementar |
| 3+ | 🛑 **Parar** — revisar direção, consultar `NORTH_STAR.md` e humano |

---

## Pergunta final (sempre)

> O produto morre por falta de features — ou por **degradação lenta de identidade**?

Esta proposta fortalece identidade ou a dilui?

---

## O que fazer ao falhar

1. **Parar** implementação
2. Reler `NORTH_STAR.md` + `EXPERIENCE_PHILOSOPHY.md`
3. Propor alternativa com diff mínimo
4. Se insistir na direção → revisão estratégica + `EVOLUTION_LOG`

---

## Para agentes

Incluir resultado do checklist no plano antes de codar:

```markdown
## Product Drift Check
- Sim: 0/10 → GO
- Ajustes: ...
```
