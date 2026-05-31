# WS-13 — Sessão B: Guia do Facilitador

**Baseline:** `main` @ `b88172c`  
**M-01:** ✅ corrigido tecnicamente — Sessão B confirma se ruptura desapareceu perceptivamente  
**M-05:** observação residual (não bloqueia Sessão B)
**Duração total:** 15–25 min (navegação + perguntas)  
**URL:** `http://localhost:3003/demo` → **Agendamento** (ou deploy público equivalente)  
**Registro final:** [`WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md`](WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md) §Registro

---

## Antes de começar

### Participante ideal

- Não envolvido no projeto
- Sem contexto da linguagem perceptiva
- Uso normal de celular

### Evitar

- Designers/devs do projeto
- Pessoas que já ouviram a tese “prepara chegada”

### Facilitador

- Silencioso durante navegação
- Anota hesitações — não guia
- Não corrige gestos “errados”

---

## Briefing obrigatório (falar só isto)

```txt
navegue como alguém curioso conhecendo o lugar
```

### Nunca explicar

- presença contínua · continuidade · atmosfera
- arrival grammar · intenção do projeto
- WS-10/11/12/13 · pilares · gates

---

## Checklist de ambiente

- [ ] Dev server ou deploy acessível no device do participante
- [ ] `/demo` → tile **Agendamento**
- [ ] Fluxo 5: viewport **320** ou **telefone real**
- [ ] Cronômetro opcional (~3 min por fluxo)
- [ ] Bloco de notas aberto (facilitador)

---

## Fluxo 1 — Exploração casual (~3–5 min)

**Objetivo:** descoberta natural.

**Participante:** explora livremente — scroll, stories se quiser, dwell no hero.

**Facilitador observa:**

| Sinal | Notas |
|-------|-------|
| Ritmo de leitura | |
| Hero — vivo ou banner? | |
| Stories ↔ feed — relação | |
| Sensação editorial | |
| Continuidade do scroll | |
| Hesitação | |
| Naturalidade | |

**Pilares:** feed orgânico · ritmo contextual · ambience social

---

## Fluxo 2 — Chegada contextual (~2–3 min)

**Participante:** toca **`na Augusta`** na linha operacional do hero.

**Facilitador observa:**

| Sinal | Notas |
|-------|-------|
| Continuidade hero → drawer | |
| Drawer = conversa ou modal? | |
| Percepção de “chegada” | |
| Copy vs Maps (hierarquia) | |
| Atmosfera | |
| Hesitação | |

**Pilares:** ritmo contextual · continuidade temporal

---

## Fluxo 3 — Retorno ao feed (~2 min)

**Participante:** fecha drawer (swipe, backdrop ou Escape — o que vier natural).

**Facilitador observa:**

| Sinal | Notas |
|-------|-------|
| Mesmo lugar no feed? | |
| Continuidade espacial | |
| Quebra emocional | |
| Sensação de recomeço | |
| Composer — retorno natural? | |

**Pilares:** continuidade temporal · memória ambiental leve

---

## Fluxo 4 — Booking rápido (~2–3 min)

**Participante:** caminho transacional rápido — ex. **Agendar horário** → olhar drawer → voltar.

**Facilitador observa:**

| Sinal | Notas |
|-------|-------|
| Ruptura presença ↔ operação | |
| Excesso utilitário | |
| Mudança brusca de atmosfera | |
| Reorientação emocional | |

**Pilares:** ritmo contextual · conflito booking↔presença (debt conhecido)

---

## Fluxo 4B — Revalidação M-01: feed vs drawer hold (~3 min)

**Contexto técnico (facilitador only):** M-01 **corrigido** @ `b88172c` — morph unificado feed ↔ drawers. [`WS-13_MORPH_ENTRYPOINT_AUDIT.md`](WS-13_MORPH_ENTRYPOINT_AUDIT.md).

**Objetivo Sessão B:** confirmar que a ruptura **desapareceu perceptivamente** — não reabrir fix.

**Pergunta gate:**

```txt
Os dois gestos parecem a mesma viagem física
ou ainda há sensação de chip colocado no drawer?
```

**Regra:** não explicar morph · viagem · arquitetura · inconsistência técnica ao participante.

### Prioridade 1 — gesto espontâneo

Durante fluxos 1–4, se o participante **segurar** um card por conta própria:

| Onde | Facilitador anota |
|------|-------------------|
| Feed (review, vídeo, serviço na seção) | Viagem visível? Natural? Chip “apareceu do nada”? |
| Booking drawer (serviço/profissional) | Mesmas perguntas — comparar com feed |

Se ambos ocorrerem espontaneamente → **comparar paridade perceptiva feed vs drawer**.

### Prioridade 2 — probe neutro (só se zero long-press espontâneo)

Após perguntas indiretas, **opcional** e **último recurso**:

1. Indicar uma avaliação/review no feed: *“segure um instante nesse card”*
2. Abrir **Agendar horário** → *“segure um serviço aqui”*
3. **Não** comparar verbalmente os dois gestos

**Observar (silenciosamente):**

| Sinal | Feed | Drawer |
|-------|------|--------|
| Ausência de viagem física percebida | | |
| Quebra de continuidade | | |
| Sensação artificial / “colocado” | | |
| Troca abrupta de camada | | |
| Hesitação ou surpresa | | |
| Naturalidade (mesmo sem viagem) | | |

**Perguntas indiretas adicionais (pós-probe, se feito):**

- Algo apareceu de repente em algum momento?
- Os dois gestos pareceram iguais ou diferentes?
- Algo pareceu “pular” na tela?

### Veredicto M-01 (facilitador)

| | ☐ |
|---|---|
| Paridade perceptiva — mesma viagem feed ↔ drawer | |
| Ruptura residual no drawer (chip “colocado”) | |
| Inconclusivo — repetir sessão | |

**Até veredicto:** NO-GO WS funcional · NO-GO motion polish · NO-GO novo fix M-01 (já aplicado).

---

## Fluxo 5 — 320 / device real (~3–5 min)

**Participante:** repetir exploração casual enxuta em **320×568** ou telefone real.

**Facilitador observa:**

| Sinal | Notas |
|-------|-------|
| Cadence vertical hero → feed | |
| Respiro / compressão | |
| Overlap emocional (composer?) | |
| Coexistência de camadas | |

**Pilares:** todos

---

## Perguntas indiretas (pós-navegação)

**Nunca:** “Você gostou?”

| # | Pergunta | Resposta (transcrever tom, não só sim/não) |
|---|----------|---------------------------------------------|
| 1 | Parecia conversa ou aplicativo? | |
| 2 | Algo parecia inteligente demais? | |
| 3 | Você sentiu continuidade? | |
| 4 | Algo parecia artificial? | |
| 5 | O lugar parecia vivo ou montado? | |
| 6 | O feed parecia continuação ou outra área? | |
| 7 | Algo parecia “querer impressionar”? | |

**Se fluxo 4B executado:**

| # | Pergunta M-01 | Resposta |
|---|---------------|----------|
| M1 | Algo apareceu de repente? | |
| M2 | Os dois gestos pareceram iguais ou diferentes? | |
| M3 | Algo pareceu “pular” na tela? | |

---

## Pergunta gate final (facilitador — não ler em voz alta)

```txt
A experiência parece inevitável
ou parece um sistema tentando parecer vivo?
```

Registrar veredicto em 1–2 frases.

---

## Síntese pós-sessão (preencher imediatamente)

### Hipótese M-01

| | ☐ |
|---|---|
| Paridade perceptiva confirmada (fix invisível) | |
| Ruptura residual perceptível | |
| Inconclusivo | |

_Evidência (1–3 frases):_

### Rupturas reais

1.  
2.  

### Continuidade forte

1.  
2.  

### Sintomas de drift

- Utilitarização:  
- Inteligência perceptível:  
- Showcase / impressionar:  

### GO / NO-GO por pilar

| Pilar | GO | NO-GO | observar | Evidência (1 linha) |
|-------|----|-------|----------|---------------------|
| 1 Continuidade temporal | ☐ | ☐ | ☐ | |
| 2 Ritmo contextual | ☐ | ☐ | ☐ | |
| 3 Feed orgânico | ☐ | ☐ | ☐ | |
| 4 Ambience social implícita | ☐ | ☐ | ☐ | |
| 5 Memória ambiental leve | ☐ | ☐ | ☐ | |

### Veredicto global

| | |
|---|---|
| Etapa 1 completa? | ☐ Sim ☐ Não |
| Abrir Etapa 2 micro? | ☐ Sim ☐ Não ☐ Condicionado |
| Abrir WS funcional? | ☐ **NÃO** (default) |

---

## Regra crítica pós-Sessão B

**Não abrir** sem evidência observada:

- novo WS funcional
- motion polish / refactor morph (M-01 já corrigido @ `b88172c`)
- refinamento motion
- IA contextual
- personalização
- feed systems
- ambience systems

---

## Transferir para documento oficial

Copiar síntese para [`WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md`](WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md):

1. §Registro — Sessão B (fluxos 1–5 + respostas indiretas)
2. §Veredicto por pilar
3. §Veredicto global Etapa 1
4. Marcar **Status Sessão B:** ✅ concluída

Atualizar [`WS-11_HUMAN_CONTINUITY_VALIDATION.md`](WS-11_HUMAN_CONTINUITY_VALIDATION.md) §Sessão B com parágrafo resumo.

---

*Sessão B = humano externo. Proxy Playwright não substitui.*
