# Pós-WS-11 — Human Continuity Validation

**Data:** 2026-05-31  
**Baseline:** `main` @ `2d0e56d` (WS-11)  
**Tipo:** Observação humana leve — **não** auditoria técnica · **não** QA · **não** framework perceptivo explícito  
**Sessão B:** executar via [`WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md`](WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md) (5 pilares · zero feature)  
**Pergunta:**

> A continuidade contextual é sentida naturalmente sem precisar ser explicada?

---

## Regra da sessão

Não explicar ao participante:

- presença contextual
- linguagem perceptiva
- feed-first
- arrival grammar
- WS-10 / WS-11

A experiência deve funcionar **silenciosamente**.

---

## Limitação honesta desta entrega

| Sessão | Participante | Validade |
|--------|--------------|----------|
| **Proxy A** | Facilitador + walkthrough instrumentado | Baseline comportamental — **não substitui humano externo** |
| **Sessão B** | Pessoa não envolvida no projeto | ✅ **Concluída** — [`WS-13_ETAPA_1_HUMAN_CLOSURE.md`](WS-13_ETAPA_1_HUMAN_CLOSURE.md) |

Esta entrega documenta **Proxy A** + protocolo pronto para **Sessão B**.

---

## Protocolo — Sessão B (humano externo)

### Perfil

- Não envolvido no projeto
- Uso normal de app · mobile-first
- Sem briefing profundo (só: “navegue como visitante”)

### Fluxos (5–8 min cada)

**Fluxo 1 — casual**
1. Abrir Appointment
2. Scrollar feed
3. Abrir chegada (`na Augusta`)
4. Voltar
5. Continuar navegando

**Fluxo 2 — rush**
1. Entrar rápido
2. Abrir booking
3. Voltar
4. Abrir chegada
5. Voltar ao feed

**Fluxo 3 — device pequeno**
1. 320px ou telefone real
2. Navegação casual · sem roteiro

### Observar (silenciosamente)

- hesitação
- naturalidade
- continuidade espontânea
- **não** perguntar “gostou?”

### Perguntas indiretas (depois)

1. “Pareceu uma conversa ou um app?”
2. “O que você sentiu quando voltou da tela?”
3. “Pareceu que perdeu contexto em algum momento?”
4. “Alguma coisa pareceu pesada ou operacional demais?”
5. “O feed parecia continuação ou outra área?”

### Registrar

- 3–5 frases por fluxo
- 1 momento de hesitação (se houver)
- 1 momento de naturalidade (se houver)
- Quebra espontânea (se houver)

---

## Proxy A — observações (facilitador)

**Ambiente:** `/demo` → Agendamento · fluxos instrumentados  
**Evidência:** `ws11h-*.png` · `ws11h-observation-log.json`

### Fluxo 1 — scroll · chegada · retorno · continuar

| Momento | Observação |
|---------|------------|
| Scroll feed | Movimento contínuo — sem salto de “modo app” |
| Abrir chegada | Copy lido como orientação — não como mapa |
| Voltar | **Permanece no mesmo ponto de scroll** (260px) — sem “recomeçar do zero” |
| Continuar | Scroll segue de onde parou — feed como mesma superfície |

**Hesitação:** nenhuma perceptível no retorno pós-chegada (WS-11).  
**Naturalidade:** retorno **invisível** — não há animação ou mensagem explicando o que aconteceu.

### Fluxo 2 — booking rush · chegada · feed (~4.6s)

| Momento | Observação |
|---------|------------|
| Booking | Tom **operacional** — esperado; contraste com chegada |
| Chegada após booking | Retorno a **atmosfera** — alívio perceptivo |
| Feed final | Hero + peek “Agendar Horario” visíveis — mesma “casa” |

**Hesitação:** transição booking → chegada ainda exige reorientação emocional (dois registros na mesma vertical — debt conhecido, não WS).  
**Naturalidade:** fechar chegada não dispara “nova página”.

### Fluxo 3 — 320 casual · dwell

| Momento | Observação |
|---------|------------|
| Hero @ 320 | Comprimido mas **vivo** — linha operacional legível |
| Chegada dwell | Base **respira** — sem composer competindo |
| Retorno | Composer retorna sem anunciar — continuidade silenciosa |

**Hesitação:** nenhuma no par chegada↔retorno.  
**Naturalidade:** drawer lê como **aprofundamento**, não modal.

---

## Respostas às perguntas indiretas (Proxy A)

| Pergunta | Resposta |
|----------|----------|
| Conversa ou app? | **Conversa** no path chegada; **app** só no booking (aceitável) |
| Ao voltar da tela? | “Voltei pro mesmo lugar” — especialmente pós-scroll (WS-11) |
| Perdeu contexto? | **Não** no arco chegada; **leve** na troca booking↔chegada |
| Pesado / operacional? | Chegada leve; booking ainda mais utilitário |
| Feed = continuação? | **Sim** — peek + retorno scroll reforçam mesma superfície |

---

## Critério central

```txt
A pessoa sente continuidade
sem perceber que existe um sistema criando isso.
```

| Avaliador | Veredicto |
|-----------|-----------|
| Proxy A | **Parcial GO** — continuidade sentida; sistema invisible no retorno scroll |
| Sessão B humana | ✅ **Concluída** — protocolo unificado em WS-13 @ `eaf5701` · [`WS-13_ETAPA_1_HUMAN_CLOSURE.md`](WS-13_ETAPA_1_HUMAN_CLOSURE.md) |

---

## Critérios de falha — Proxy A

| Falha | Observado? |
|-------|------------|
| Experiência precisa ser explicada | ❌ não |
| Continuidade mecânica / “esperto demais” | ❌ não — WS-11 invisible |
| Alternância brusca booking↔presença | ⚠️ leve — debt conhecido |
| Feed separado do resto | ❌ não @ 320 pós-10C |

---

## Disciplina pós-marco cultural

Risco emergente identificado:

> Sofisticar demais o invisível — automatizar, antecipar, personalizar, adicionar IA.

Regra proposta para próximos WS:

```txt
Toda feature nova deve parecer inevitável.
Não inteligente.
```

---

## Decisão

| Item | Status |
|------|--------|
| Abrir WS imediato | **NÃO** — pausa pós Sessão B; WS funcional só com GO |
| Proxy A baseline | ✅ documentado |
| Protocolo Sessão B | ✅ executado (WS-13) |
| GO cultural pós-WS-11 | ✅ **confirmado** — continuidade sentida em sessão externa |

---

## Screenshots (Proxy A)

| Fluxo | Arquivos |
|-------|----------|
| F1 scroll/return | `ws11h-f1-01` … `ws11h-f1-05` |
| F2 rush | `ws11h-f2-01` … `ws11h-f2-03` |
| F3 @ 320 | `ws11h-f3-01` … `ws11h-f3-03` |

---

## Sessão B — síntese (via WS-13)

Continuidade contextual sentida em iPhone Safari sem explicação do sistema. Retorno ao feed preserva lugar; chegada e booking não quebram presença de forma bloqueante. M-01 morph feed ↔ drawer com paridade perceptiva confirmada. Único achado adjacente: hero overflow horizontal (higiene layout @ `bf76278`) — fora do escopo continuidade WS-11.

**Fechamento:** [`WS-13_ETAPA_1_HUMAN_CLOSURE.md`](WS-13_ETAPA_1_HUMAN_CLOSURE.md)

## Próximo passo

1. ~~Sessão B humana~~ ✅
2. Pausa curta
3. Deliberar WS-17 — **sem implementação automática**

---

*Humanidade silenciosa — validar que continuidade é sentida, não explicada.*
