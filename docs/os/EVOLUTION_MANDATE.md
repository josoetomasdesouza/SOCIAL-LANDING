# Evolução Obrigatória — Social Landing

**Autoridade:** Este documento  
**Complementa:** [`ANTI_DRIFT.md`](ANTI_DRIFT.md), [`GOVERNANCE.md`](GOVERNANCE.md)

---

## Princípio central

```txt
governança deve acelerar evolução coerente
não substituir evolução
```

O OS protege direção — **não paralisa o produto**.

---

## Runtime soberano

A verdade do produto vive no **runtime vivido**, não na teoria.

| Prevalece | Sobre |
|-----------|-------|
| Feature pequena real | Teoria perfeita |
| Percepção observada | Hipótese elegante |
| Fluxo vivido | Arquitetura bonita |

Conversa brilhante sem runtime = **governança virando contemplação**.

---

## Lei vs jurisprudência

| Camada | Papel | Status |
|--------|-------|--------|
| **Lei** | Constituição OS — princípios, proteção | Estável |
| **Jurisprudência** | Padrões emergentes de casos reais | Formando |
| **Runtime** | Verdade operacional | Soberano |

Constituição existe. País ainda sendo habitado. **Jurisprudência nasce de repetição — não de hipótese precoce.**

---

## Tensão observada ≠ paralisia

Tensões perceptivas **não congelam** evolução do produto.

Ciclo saudável:

```txt
detectar → observar → repetir → nomear → decidir
```

**Observar** não é **parar**. Adiar decisão filosófica ≠ adiar todo progresso.

| Tensão saudável | Conviene (observar) |
|-----------------|---------------------|
| social × commerce | Camada 2 profundidade |
| editorial × conversão | Filosofia futura do funil |
| magia × familiaridade | — |

| Erro estrutural | Resolve (runtime) |
|-----------------|-------------------|
| Dead code confundindo | Deleção (#45) |
| Listagem catálogo | Patch perceptivo (#43) |
| Drift não intencional | Correção imediata |

**Não resolver filosofia com engenharia.** **Não usar filosofia para evitar engenharia.**

---

## O que governança NÃO é

- Impedir evolução
- Burocratizar decisões
- Transformar observação em paralisia
- Refinamento eterno por medo de errar

---

## Throughput coerente

Meta: **evolução contínua sem degradação acumulada**.

Não throughput bruto. Não reflexão infinita.

```txt
pequenos passos reais
+ observação forte
+ correção rápida
+ governança leve
```

Evitar os dois extremos:

| Extremo | Risco |
|---------|-------|
| Caos acelerado | Drift, identidade degradada |
| Cautela excessiva | Produto estagnado, OS teórico |

---

## Entrega por sessão relevante

Toda sessão de trabalho relevante deve produzir **pelo menos um**:

- [ ] Evolução runtime (feature, fix, patch perceptivo)
- [ ] Redução de dívida (dead code, hygiene)
- [ ] Validação perceptiva (review, screenshots, GO humano)
- [ ] Padrão emergente registrado (handoff, nota)
- [ ] Melhoria operacional (OS, template, processo)
- [ ] Clarificação arquitetural (doc, contrato)
- [ ] Aprendizado validado (review com veredicto)

**Reflexão sem entrega = risco de paralisia.**

Exemplo saudável (#43–#45): evolução perceptiva + dívida removida + aprendizado + governança — **com merges**.

---

## Regra anti-contemplação

Se uma tensão foi detectada mas **nenhum** progresso concreto ocorreu em 2+ sessões consecutivas:

1. Revisar se a tensão virou desculpa para não evoluir
2. Separar o que **observa** do que **resolve**
3. Entregar pelo menos hygiene ou validação perceptiva
4. Escalar decisão filosófica ao humano — não adiar runtime indefinidamente

---

## Runtime-first — validação pré-sessão

**Modo operacional ativo.** Antes de meta-conversa longa, validar:

1. Isso destrava runtime real?
2. Isso reduz drift operacional concreto?
3. Isso protege identidade perceptiva relevante?
4. Isso levará a entrega concreta em seguida?
5. Existe evolução prática menor que deveria acontecer antes?

Se **não** para a maioria → runtime pequeno e real.

### Priorizar antes de abstrair

- Runtime perceptivo, comportamento vivo, pequenas evoluções reais
- Correções estruturais concretas, sinais contextuais, simplificação local
- Aprendizado aplicado

### Depois (só quando necessário)

- Novas abstrações, pilares, frameworks
- Discussões filosóficas longas, arquitetura prematura, governança adicional

### Alternância saudável

```txt
runtime → review → hygiene → runtime → OS → runtime
```

Evitar 3+ sessões seguidas apenas de docs/governança/reflexão.

Enforcement Cursor: `.cursor/rules/runtime-first.mdc`

---

## Anti-drift filosófico

Reflexão válida **só** se alterar: o que construir, o que NÃO construir, o que remover, timing, comportamento do agente, review perceptivo, prioridade runtime.

**Desfecho em 1–2 ciclos:** runtime pequeno · observação device · hygiene · redução · não fazer agora.

**3+ sinais** (termos demais, teoria > produto, conversa > software) → interromper meta-conversa.

**Compressão:** `quietude emergente` → `se parecer ansioso, reduzir`.

Runtime saudável no device > narrativa. Filosofia compete com execução → reduzir.

Enforcement Cursor: `.cursor/rules/anti-philosophy-drift.mdc`
