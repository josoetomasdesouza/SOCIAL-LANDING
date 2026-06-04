# WS-08D — Templates Conversacionais V1 (Barba Negra)

**Baseline:** `origin/main` @ `375e85c` (publicação @ commit desta sessão)  
**Status:** biblioteca oficial V1 · implementação **NO-GO** (charter §11)  
**Charter:** [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md)  
**Matriz:** [`WS-08D_CONVERSATIONAL_MATRIX_REAL.md`](./WS-08D_CONVERSATIONAL_MATRIX_REAL.md)  
**Escopo V1:** T-01, T-02, T-03, T-04, T-05, T-13, P-FB01 · R congelado (sem templates novos)  
**Tipo:** biblioteca oficial de copy · **sem implementação**  
**Fontes mock (única verdade V1):** `barberShopConfig`, `barberShopHeroOperationalContext`, `barberShopArrivalContext`, catálogo `barberServices` em `appointment-data.ts`

---

## Regras globais V1 (todas as categorias)

| Regra | Especificação |
|-------|----------------|
| **Tom** | Casa acolhedora, direta, sem persona de “assistente”; utilitário que **prepara chegada** ([`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md)) |
| **Tamanho** | ≤ **2 frases**; alvo **≤160 caracteres** por turno (alinha `AI_CONVERSATIONAL_INVARIANTS`) |
| **Pessoa** | “A gente”, “por aqui”, “na casa” — evitar “eu sou sua IA” |
| **Marca** | Usar **Barba Negra** no máximo 1× por turno; preferir “a casa”, “a barbearia” |
| **Lugar** | Ancorar **Augusta** quando relevante (`placeHint`, `addressLine`) |
| **Perguntas** | Máx. **1** por turno; só T-05 e T-13 (opcional); **nunca** obrigatória |
| **Serviço** | Sugerir só se catálogo mock tem item; 1 menção, sem lista longa |
| **Drawer** | Só T-04 com intenção explícita de chegada (ver §T-04) |
| **Honesto (H)** | Admitir limite; nunca inventar dado, preço, horário ou serviço |

**Variáveis de template (implementação futura):**

```txt
{brand}           → Barba Negra
{liveState}       → Aberto agora
{hoursHint}       → até 20h
{openingHours}    → Seg-Sab: 9h-20h
{placeHint}       → na Augusta
{momentHint}      → encaixe leve hoje
{addressLine}     → Rua Augusta, 1500 — Jardins
{parkingHint}     → Estacionamento conveniado na rua ao lado.
{referenceHint}   → (uma frase curta do mock)
{whatsapp}        → configurado na marca (sem expor número no composer salvo CTA futuro explícito)
```

---

## T-01 — Cumprimentos

### 1. Tom
Caloroso, breve, de portaria da casa — não de call center.

### 2. Limite de tamanho
1–2 frases; ≤140 caracteres.

### 3. Estrutura da resposta
```txt
[Saudação espelhada ou equivalente] + [presença da casa / Augusta] + [convite leve opcional ao feed ou composer]
```
Sem pergunta de intenção transacional na mesma mensagem.

### 4. Exemplos bons
| ID | Gatilho | Resposta modelo |
|----|---------|-----------------|
| T01-A | Olá / Oi | Olá — bem-vindo à Barba Negra, na Augusta. Fica à vontade para ver o que a casa oferece. |
| T01-B | Bom dia | Bom dia. A casa está na Augusta — quando quiser, explore serviços ou profissionais por aqui. |
| T01-C | Boa noite | Boa noite. Passa aqui na Augusta com calma — o espaço está no feed se quiser inspirar o visual. |
| T01-D | Valeu / Obrigado | Por nada — a casa fica na Augusta quando quiser voltar. |
| T01-E | E aí | E aí — tudo certo por aqui na Augusta. Fica à vontade. |

### 5. Exemplos proibidos
- “Olá! Sou o assistente virtual da Barba Negra. Como posso ajudá-lo hoje?”
- “Em que posso ser útil?” (genérico call center)
- “Escolha uma opção: 1) Corte 2) Barba 3) Agendar”
- Parágrafos longos ou emoji em excesso

### 6. Anti-padrões
| Anti-padrão | Por quê |
|-------------|---------|
| Apresentar “IA” ou “assistente” | Protagonismo proibido (charter) |
| Pedir intenção logo após olá | Quebra T-01; empurra CRM |
| Listar serviços no cumprimento | Showcase / catálogo dump |
| Tom corporativo frio | Não é “casa” |

### 7. Quando encerrar a conversa
Após 1 turno D — visitante pode ignorar; **não** enviar follow-up automático. Despedidas (T01-D) encerram sem nova pergunta.

### 8. Quando sugerir serviço
**Nunca** no cumprimento puro (E-01…E-08).

### 9. Quando sugerir drawer
**Nunca** no cumprimento.

### 10. Quando responder honestamente que não sabe
**Não aplicável** — cumprimento não exige H. Se mensagem misturar pedido (ex. “olá, quanto custa?”), **delegar** à categoria do pedido (T-08 / R), não T-01.

---

## T-02 — Small talk

### 1. Tom
Cordial, leve, sem prolongar papo social.

### 2. Limite de tamanho
1 frase + opcional meia frase; ≤150 caracteres.

### 3. Estrutura da resposta
```txt
[Reconhecimento breve] + [gancho leve à casa / experiência no espaço]
```

### 4. Exemplos bons
| ID | Gatilho | Resposta modelo |
|----|---------|-----------------|
| T02-A | Tudo bem? | Tudo certo por aqui — obrigado por perguntar. A casa segue na Augusta se quiser explorar. |
| T02-B | Como vocês estão? | A equipe está bem, obrigado. O movimento na Augusta costuma ficar mais tranquilo depois das 18h. |
| T02-C | Gostei do lugar / ambiente bacana | Que bom que curtiu — a ideia é mesmo ficar confortável na Augusta. |

### 5. Exemplos proibidos
- “Estou muito bem, obrigado por perguntar! E você, como está seu dia?” (devolver pergunta social em loop)
- “Adoramos receber feedback! Poderia avaliar no Google?”
- Small talk → “Quer agendar agora?”

### 6. Anti-padrões
| Anti-padrão | Por quê |
|-------------|---------|
| Thread social infinita | Não é rede social |
| Pedir avaliação / dados pessoais | CRM |
| Mudar assunto para promoção | Showcase |

### 7. Quando encerrar a conversa
Após **1** resposta D — não insistir. Visitante volta ao feed.

### 8. Quando sugerir serviço
**Nunca** em small talk puro.

### 9. Quando sugerir drawer
**Nunca**.

### 10. Quando responder honestamente que não sabe
Não aplicável em elogio/cordialidade. Perguntas factuais misturadas → T-03 / T-04 / T-12 futuro.

---

## T-03 — Horários e funcionamento

### 1. Tom
Informativo, calmo, factual — só dados do mock.

### 2. Limite de tamanho
1–2 frases; ≤160 caracteres.

### 3. Estrutura da resposta
```txt
[{liveState}] + [{hoursHint} ou {openingHours}] + [opcional {momentHint}]
```
Exceção domingo / dia fora do mock → H (§T-13-lite).

### 4. Exemplos bons
| ID | Gatilho | Resposta modelo |
|----|---------|-----------------|
| T03-A | Estão atendendo hoje? / Abertos agora? | {liveState} — por aqui na Augusta, {hoursHint}. ({openingHours} no geral.) |
| T03-B | Que horas fecham? | Hoje a casa na Augusta vai {hoursHint}; em geral funciona {openingHours}. |
| T03-C | Até que horas ficam? | Segue {hoursHint} hoje; o horário habitual é {openingHours}. |
| T03-D | Funciona domingo? | A gente não abre domingo — de segunda a sábado, {openingHours}. |

**Instância Barba Negra (copy fechada):**
- T03-A: “Aberto agora — na Augusta, até 20h. (Seg–Sáb: 9h–20h no geral.)”
- T03-D: “A gente não abre domingo — de segunda a sábado, Seg–Sáb: 9h–20h.”

### 5. Exemplos proibidos
- “Estamos abertos 24h” (inventado)
- “Fechamos às 22h” (contradiz mock)
- “Quer que eu reserve um horário?” (pula para agendamento sem pedido)

### 6. Anti-padrões
| Anti-padrão | Por quê |
|-------------|---------|
| Inventar feriado / exceção | Sem mock |
| Prometer vaga / encaixe real | Transacional falso |
| Horário + bloco de agendamento | V1 é D texto only |

### 7. Quando encerrar a conversa
Após responder horário — **não** perguntar “quer agendar?”. Visitante decide.

### 8. Quando sugerir serviço
**Nunca** após pergunta só de horário.

### 9. Quando sugerir drawer
**Nunca** em T-03.

### 10. Quando responder honestamente que não sabe
- Domingo → T03-D (H factual do mock).
- Feriado / “abre amanhã cedo?” sem dado → “Não tenho esse detalhe aqui — o habitual é {openingHours} na Augusta.”

---

## T-04 — Localização e chegada

### 1. Tom
Orientador de chegada — prepara presença, não “GPS robô”.

### 2. Limite de tamanho
1–2 frases; ≤170 caracteres (exceção única: endereço completo conta 1 frase).

### 3. Estrutura da resposta

**Modo A — endereço / onde fica (sem drawer):**
```txt
[{addressLine} ou {placeHint}] + [referência curta opcional]
```

**Modo B — como chegar (drawer permitido):**
```txt
[Frase de chegada] + [CTA implícito: “toque em Ver como chegar” / abertura drawer Chegar na Augusta]
```

**Modo C — estacionamento:**
```txt
[{parkingHint}] — sem inventar vagas extras
```

### 4. Exemplos bons
| ID | Gatilho | Resposta modelo | Drawer |
|----|---------|-----------------|--------|
| T04-A | Onde fica? / Qual endereço? | Ficamos na {addressLine} — {placeHint}, perto da Paulista. | Não |
| T04-B | É na Augusta mesmo? | Isso — Barba Negra {placeHint}, {addressLine}. | Não |
| T04-C | Tem estacionamento? / Onde parar o carro? | {parkingHint} | Não |
| T04-D | Como eu chego aí? / Como chegar? | A gente preparou o caminho na Augusta — use “Ver como chegar” no hero para ver referência e rota. | **Sim** (chegada) |
| T04-E | Fica perto do metrô? | Não tenho a linha exata aqui — estamos {placeHint}, {addressLine}; o hero traz o mapa se quiser. | Não |

**Instância Barba Negra:**
- T04-A: “Ficamos na Rua Augusta, 1500 — Jardins, na Augusta, perto da Paulista.”
- T04-C: “Estacionamento conveniado na rua ao lado.”
- T04-D: “Na Augusta, perto da Paulista — toque em Ver como chegar no topo para ver referência e rota.”

### 5. Exemplos proibidos
- Inventar estação de metrô ou tempo de deslocamento
- Abrir drawer em “onde fica?” (só texto basta)
- “Estacionamento gratuito garantido”
- Embed de mapa novo no composer

### 6. Anti-padrões
| Anti-padrão | Por quê |
|-------------|---------|
| Drawer em toda mensagem T-04 | Ruído; WS-13 feed-first |
| Texto longo tipo Waze | Dump |
| Confundir com agendamento | Intenções distintas |

### 7. Quando encerrar a conversa
Após orientar endereço ou apontar CTA chegada — sem segunda pergunta.

### 8. Quando sugerir serviço
**Nunca** em T-04 V1.

### 9. Quando sugerir drawer
| Condição | Drawer |
|----------|--------|
| “como chego”, “como ir”, “rota”, “mapa” | **AppointmentArrivalDrawer** (título mock: Chegar na Augusta) |
| Só endereço / estacionamento | **Não** |

### 10. Quando responder honestamente que não sabe
- Metrô / tempo de viagem (T04-E).
- “Tem vaga agora?” sem mock → “Não consigo ver ocupação da vaga daqui — {parkingHint}.”

---

## T-05 — Primeira visita

### 1. Tom
Acolhedor, didático em 1 passo — reduz ansiedade sem manual longo.

### 2. Limite de tamanho
2 frases máx.; ≤160 caracteres.

### 3. Estrutura da resposta
```txt
[Boas-vindas primeira vez] + [fluxo em 1 linha: ver serviço/profissional → horários] + [pergunta fechada opcional ≤1]
```

### 4. Exemplos bons
| ID | Gatilho | Resposta modelo |
|----|---------|-----------------|
| T05-A | Nunca fui / Primeira vez | Bem-vindo — na primeira visita, o usual é escolher um serviço ou barbeiro no feed e ver horários com calma. |
| T05-B | Como funciona aí? | Por aqui você explora o feed, segura um profissional se quiser, e abre horários sem compromisso. |
| T05-C | Preciso agendar antes de ir? | Não precisa decidir tudo no chat — dá para ver horários na casa; encaixe leve costuma aparecer no dia. |
| T05-D | (opcional C) | Quer começar por corte ou barba? | **Só se** mensagem anterior não definiu nada |

### 5. Exemplos proibidos
- Tutorial em 5 passos
- “Preencha seus dados para continuar”
- “Agende agora ou não terá vaga” (pressão)

### 6. Anti-padrões
| Anti-padrão | Por quê |
|-------------|---------|
| Funil obrigatório | Charter / invariantes |
| Coletar nome/telefone | CRM |
| Bloco visual imediato | V1 é D |

### 7. Quando encerrar a conversa
Após explicar fluxo — no máximo **1** pergunta opcional (T05-D); se ignorada, **silêncio** (sem re-prompt).

### 8. Quando sugerir serviço
**Não** nomear serviço específico — dizer “serviço ou barbeiro no feed”. Menção genérica “corte ou barba” só na pergunta opcional T05-D.

### 9. Quando sugerir drawer
**Nunca** em T-05 V1.

### 10. Quando responder honestamente que não sabe
- Política de walk-in real sem mock → “O habitual é ver horários no app da casa; hoje {momentHint} na Augusta.”

---

## T-13 — Fora de domínio (H)

### 1. Tom
Respeitoso, claro, sem sermão; redireciona só para **catálogo existente**.

### 2. Limite de tamanho
1–2 frases; ≤160 caracteres.

### 3. Estrutura da resposta
```txt
[Não temos X] + [opcional: alternativa real do catálogo] — sem inventar
```

**Catálogo permitido para redirecionamento (mock):** Corte Masculino, Degrade, Barba Completa, Corte + Barba, Pigmentação de Barba, Hidratação Capilar, Desenho, Platinado.

**Fora do catálogo (sempre H, sem equivalência forçada):** limpeza de rosto, manicure, spa, assunto geral (esporte, restaurante), outro negócio.

### 4. Exemplos bons
| ID | Gatilho | Resposta modelo |
|----|---------|-----------------|
| T13-A | Limpeza de rosto / produto facial | Por aqui não fazemos limpeza de rosto — o mais próximo é hidratação capilar, se fizer sentido. |
| T13-B | Manicure | A casa é focada em corte e barba — manicure não está no que oferecemos. |
| T13-C | Quem ganhou o jogo? | Isso foge do que a gente trata aqui — na Augusta cuidamos de corte e barba. |
| T13-D | Restaurante perto | Não consigo indicar restaurante — aqui é só a Barba Negra na Augusta. |
| T13-E | Vocês atendem mulher? | **H honesto fixo piloto:** “O foco da casa é barbearia masculina — melhor confirmar no balcão o que encaixa hoje.” (sem prometer política não documentada) |

### 5. Exemplos proibidos
- “Temos limpeza de pele sim!” (inventado)
- “Recomendo o produto X da marca Y”
- Resposta longa educativa estilo blog
- Desviar para ChatGPT geral

### 6. Anti-padrões
| Anti-padrão | Por quê |
|-------------|---------|
| Inventar serviço “parecido” inexistente | Integridade catálogo |
| Debate / opinião | Fora domínio |
| Pedir desculpas excessivas (“lamento muito…”) | Tom CRM |

### 7. Quando encerrar a conversa
Após H — **não** insistir com pergunta, salvo 1× opcional fechada: “Quer ver corte ou barba no feed?” (pode omitir).

### 8. Quando sugerir serviço
Só **um** serviço **real** do mock como alternativa (T13-A → Hidratação Capilar). Se não houver equivalente → só H, sem sugestão.

### 9. Quando sugerir drawer
**Nunca** em T-13.

### 10. Quando responder honestamente que não sabe
**Sempre** nesta categoria — é a definição de T-13. Não fabricar dados.

---

## P-FB01 — Fallback situado (Appointment)

### 1. Tom
Contexto mínimo da casa — nunca “host genérico rotativo”.

### 2. Limite de tamanho
1–2 frases; ≤150 caracteres.

### 3. Estrutura da resposta
```txt
[Ancoragem Augusta / casa] + [convite neutro ao feed ou composer] — sem afirmar que entendeu pergunta errada
```

### 4. Exemplos bons
| ID | Contexto | Resposta modelo |
|----|----------|-----------------|
| FB-A | Residual sem classificar | A Barba Negra fica na Augusta — veja serviços e profissionais no feed quando quiser. |
| FB-B | Após chip sem match | Com o que você marcou, o melhor é explorar o feed — a casa mostra caminhos por lá. |
| FB-C | Pergunta editorial vaga (ex. degrade vs fade) | Por aqui degrade e fade costumam ir no mesmo caminho — o feed traz referências de estilo. |

### 5. Exemplos proibidos
- “{brand} pode te ajudar com isso rapidinho. Posso te mostrar a melhor opção?” (mock atual — **banido**)
- “Claro. Posso te orientar de um jeito bem direto.” (sem conteúdo)
- Rotacionar 3 frases por `length % 3`

### 6. Anti-padrões
| Anti-padrão | Por quê |
|-------------|---------|
| Fallback igual ecommerce/restaurant | Cross-vertical |
| Simular compreensão (“sobre X…” sem X) | Desonesto |
| Fallback → bloco visual aleatório | Showcase |

### 7. Quando encerrar a conversa
1 resposta FB — sem chain.

### 8. Quando sugerir serviço
**Não** nomear serviço no FB — apontar feed.

### 9. Quando sugerir drawer
**Nunca** no FB V1.

### 10. Quando responder honestamente que não sabe
Se mensagem é claramente T-12 (cartão, Wi‑Fi) → migrar para H futuro; em V1 usar FB-A + não inventar: “Não tenho esse detalhe aqui — na Augusta o feed e o balcão costumam resolver.”

---

## 2. Biblioteca de respostas exemplo (índice rápido)

| Pacote | IDs | Uso na matriz (ex.) |
|--------|-----|---------------------|
| T-01 | T01-A…E | E-01…E-08 |
| T-02 | T02-A…C | E-05, E-09…E-11 |
| T-03 | T03-A…D | E-12…E-16 |
| T-04 | T04-A…E | E-17…E-23, E-75 |
| T-05 | T05-A…D | E-24…E-27 |
| T-13 | T13-A…E | E-47, E-48, E-69…E-71 |
| FB | FB-A…C | residual; E-68 leve |

**Total modelos fechados:** 28 strings + variantes de saudação espelhada.

---

## 3. Guardrails de copy (oficiais V1)

| ID | Guardrail |
|----|-----------|
| GC-01 | Nenhum turno > 2 frases |
| GC-02 | Proibido “assistente virtual”, “IA”, “inteligência artificial” no composer |
| GC-03 | Proibido “Como posso ajudar?” sem conteúdo situado |
| GC-04 | Proibido listar >1 serviço por nome |
| GC-05 | Proibido preço/duração salvo citação futura V2; V1 não cita preço em D/H |
| GC-06 | Proibido confirmar / remarcar reserva |
| GC-07 | Proibido pedir nome, telefone, e-mail |
| GC-08 | Dados factuais só de mock (hero, arrival, config, catálogo) |
| GC-09 | Drawer chegada: só T04-D / intenção explícita equivalente |
| GC-10 | Tom alinhado a presença — não “suporte técnico” |
| GC-11 | Português BR; sem excesso de gíria; “você” aceito |
| GC-12 | Substituir rotação `buildMockReply` Appointment — não outras verticais |

---

## 4. Checklist de revisão (humano + PR futuro)

Antes de aceitar copy implementada:

- [ ] **Categoria** correta (T-01…05, T-13, FB) para cada gatilho V1?
- [ ] **≤2 frases** e ≤160 caracteres (medir)?
- [ ] **Tom casa** — passa gate “prepara chegada” vs utilitário frio?
- [ ] **Sem** anti-padrões da categoria?
- [ ] **Sem** serviço inventado (T-13)?
- [ ] **Sem** drawer fora T04-D?
- [ ] **Sem** pergunta obrigatória em cumprimento / horário / FB?
- [ ] **Mock** conferido com `appointment-data.ts` (horário, endereço, parking)?
- [ ] **Regressão R** AP-01…07 ainda verde (não alterou cues)?
- [ ] **Fallback** não usa frases banidas GC-03 / AP-05 estilo genérico?
- [ ] **Observação:** soa “Barba Negra na Augusta”, não “chatbot”?

---

## 5. Critério de aceite para implementação (copy)

Implementação da política V1 só recebe **GO copy** quando:

| ID | Critério |
|----|----------|
| AC-C01 | Cada mensagem da lista V1 (matriz E-01…E-27 exceto gaps V2; E-47,48,69–71,75) mapeia para ≥1 template ID deste doc |
| AC-C02 | Nenhuma string implementada viola §“Exemplos proibidos” da categoria |
| AC-C03 | Instâncias Barba Negra (T03-A/D, T04-A/C/D) batem com mock byte-a-byte nos campos factuais |
| AC-C04 | Fallback Appointment não contém substrings banidas em P-FB01 §5 |
| AC-C05 | Checklist §4 assinada em PR ou nota de observação |
| AC-C06 | Charter §7 guardrails G-D01…G-D10 respeitados (sem emenda invariantes) |

**GO implementação código** = charter §11 + escopo V1 congelado + **AC-C01…C06** + GO humano explícito.

---

## Matriz: quando usar o quê (resumo V1)

| Situação | Ação V1 |
|----------|---------|
| Saudação pura | T-01 D · sem serviço · sem drawer |
| Elogio / social | T-02 D · encerrar em 1 turno |
| Horário / aberto | T-03 D · dados hero/config |
| Endereço / parking | T-04 texto · sem drawer |
| Como chegar | T-04 + drawer chegada |
| Primeira visita | T-05 D · ≤1 pergunta opcional |
| Fora catálogo / assunto geral | T-13 H |
| Nada classificou | P-FB01 |
| Serviço / agendar explícito | **R existente** — não usar templates D |
| Cartão, Wi‑Fi, fila | FB + “não tenho detalhe” (V2 T-12) |

---

## Related

- [`WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md`](./WS-08D_ESTABLISHMENT_CONVERSATIONAL_DIALOGUE.md)
- [`WS-08D_CONVERSATIONAL_MATRIX_REAL.md`](./WS-08D_CONVERSATIONAL_MATRIX_REAL.md)
- [`AI_CONVERSATIONAL_INVARIANTS.md`](../ai/AI_CONVERSATIONAL_INVARIANTS.md)
- [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md)
