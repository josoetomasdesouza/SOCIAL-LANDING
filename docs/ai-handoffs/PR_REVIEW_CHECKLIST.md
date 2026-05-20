# PR REVIEW CHECKLIST

Checklist minimo antes de merge/PR. Use como pausa obrigatoria de preservacao
sistemica.

Regra final: preservacao sistemica acima de velocidade; contencao acima de
excesso visual; continuidade acima de efeitos isolados.

## 1. Coerencia Sistemica

- [ ] O feed ainda parece continuo, vivo e social-first.
- [ ] O composer continua emergindo naturalmente do feed, sem sensacao de modal.
- [ ] Stories, feed, drawers e composer ainda parecem um unico ambiente.
- [ ] Nenhuma separacao artificial foi criada.
- [ ] A mudanca nao aproximou a experiencia de dashboard, ecommerce classico ou interface institucional.
- [ ] Contratos perceptivos foram preservados: leveza, continuidade, profundidade sutil e sofisticacao invisivel.

## 2. Sistemas Congelados

- [ ] Morph post -> chip nao foi alterado casualmente.
- [ ] Drag physics do sheet nao foi alterado sem validacao.
- [ ] Snap orchestration e thresholds permanecem coerentes.
- [ ] Measurement system continua baseado em medicao real, nao em hacks.
- [ ] Z-index hierarchy foi preservada ou explicitamente mapeada.
- [ ] Overlays e depth layering nao criaram conflitos de camada.
- [ ] Composer auto-grow continua funcionando em retomada e nova resposta.
- [ ] Drawers preservam scroll lock, padding de protecao e relacao com composer.
- [ ] Spacing rhythm de feed/stories/topo nao perdeu cadencia social.
- [ ] `FROZEN_SYSTEMS.md` foi consultado se qualquer item acima foi tocado.

## 3. Qualidade Visual

- [ ] Nao ha overdesign.
- [ ] Nao ha glassmorphism excessivo.
- [ ] Blur, opacity e gradientes continuam sutis.
- [ ] Sombras nao ficaram agressivas.
- [ ] Nao foram adicionadas superficies desnecessarias.
- [ ] O ritmo visual continua natural em mobile e desktop.
- [ ] A profundidade apoia o conteudo, sem virar efeito visual isolado.

## 4. Seguranca Arquitetural

- [ ] O diff e o menor possivel para o objetivo.
- [ ] A mudanca tem uma responsabilidade clara.
- [ ] Nao houve refactor oportunista.
- [ ] Nao houve cleanup de sistemas sensiveis sem necessidade.
- [ ] Nao foram usados timeouts artificiais, offsets magicos ou compensacoes frageis.
- [ ] Rollback seria simples e local.
- [ ] Codigo visual e logica funcional nao foram misturados sem justificativa.
- [ ] Nenhum contrato `data-*`, `composerMode`, timing ou z-index foi alterado sem analise.

## 5. Governanca Evolutiva

- [ ] Branch correta, sem alteracao direta em `main`.
- [ ] Working tree limpo antes do resumo final.
- [ ] Docs de handoff foram atualizados quando a mudanca criou regra, risco ou decisao nova.
- [ ] `EVOLUTION_LOG.md` foi atualizado quando houve decisao sistemica ou perceptiva relevante.
- [ ] Sistemas congelados foram analisados antes de tocar areas sensiveis.
- [ ] O PR explica o que mudou, o que foi preservado e como validar.

## Bloqueadores de merge

Nao mergear se qualquer item abaixo for verdadeiro:

- [ ] A mudanca "funciona", mas quebra continuidade perceptiva.
- [ ] O fix depende de timeout, z-index alto ou offset magico.
- [ ] O composer parece modal tradicional.
- [ ] O feed parece fragmentado em blocos artificiais.
- [ ] A UI ficou mais chamativa que o conteudo.
- [ ] Um sistema congelado foi tocado sem justificativa e validacao.
