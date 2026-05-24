# Filosofia da Experiência — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/audit/EXPERIENCE_PRINCIPLES.md`](../audit/EXPERIENCE_PRINCIPLES.md), [`docs/ai-handoffs/VISUAL_LANGUAGE.md`](../ai-handoffs/VISUAL_LANGUAGE.md)

---

## Sensação alvo

O produto deve parecer:

- **Vivo** — ambiente contínuo, não telas desconectadas
- **Orgânico** — ritmo natural, não dashboard
- **Conversacional** — composer emerge do feed, não sobrepõe como modal
- **Social-first** — feed editorial, stories, seleção tátil
- **Sofisticado de forma invisível** — profundidade sutil, baixa ostentação

---

## Momentos sagrados (nunca regredir)

1. **Primeiro long-press → morph** — momento "wow"
2. **Primeira resposta IA** — prova de utilidade
3. **Abertura do composer** — extensão do feed, não modal
4. **Story → seção** — promessa de navegação social

---

## Continuidade feed → conversa

```
Feed card → long-press 420ms → morph 480ms → chip no composer → conversa
```

Esta cadeia é a **assinatura perceptiva** do produto. Qualquer mudança aqui exige protocolo frozen.

---

## O que cria premium

| Elemento | Mecanismo |
|----------|-----------|
| Continuidade | Morph post→chip |
| Composer emergente | Sheet integrado |
| Feed editorial | Coluna central contida |
| Profundidade | Glass sutil, blur leve |
| Resposta viva | Typing + auto-scroll |
| Seleção tátil | Long-press + haptic |

---

## Anti-padrões de experiência

- Separar feed e composer visualmente como camadas distintas
- Transformar feed em dashboard com módulos
- CTAs isolados como banners institucionais
- Drawers que competem com composer por atenção
- Quebrar scroll lock ou ritmo de transição

---

## Superfícies emocionalmente sensíveis

Tratar como Tier 1 congelado:

- `PostToChatMorphLayer`
- `ConversationalAI`
- `ContextSelectable`
- `BusinessFeedDrawer` / ActionDrawers
- Story viewer fullscreen
