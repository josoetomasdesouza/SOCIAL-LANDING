# WS-09B — Observação Perceptiva Pós-Merge

**Data:** 2026-05-31  
**Runtime avaliado:** commit `4e49835` (PR #74 — Hero operacional v0)  
**Viewport:** 390×844  
**Escopo:** observação apenas — sem código, sem WS-09B.1, sem generalização

---

## Veredicto executivo

A Hero Operacional deixou de parecer **experimento isolado** e passou a ler como **camada nativa da vertical Appointment** — mas **não ainda** como invariante do sistema Social Landing inteiro.

O ganho perceptivo pós-integração confirma o piloto: marca mais viva, feed preservado, composer intacto, zero dashboardização. A dívida estrutural (`Stories` antes da `Hero`, intro duplicado) **persiste estável** — não piorou com o merge — e **não exige ação imediata**.

**Decisão recomendada: A — Sistema estabilizou bem pós-merge → aguardar observação orgânica.**

**Prioridade WS-09B.1 (`leadingContent`):** fila média — documentar como dívida perceptiva conhecida; **não executar agora**.

---

## Metodologia

Observação em `/demo` com runtime WS-09B ativo, comparando:

| Contexto | Objetivo |
|--------|----------|
| Vertical **Agendamento** (Barba Negra) | Hero integrada — comportamento pós-merge |
| Verticais **Restaurante** e **E-commerce** | Contraste de sistema — hero ausente, shell inalterado |
| Documentos pré-merge | Delta perceptivo piloto → runtime principal |

Métricas capturadas (390×844):

| Métrica | Appointment | Restaurante | E-commerce |
|---------|-------------|-------------|--------------|
| Hero presente | ✅ | ❌ | ❌ |
| Intro (h) | 76px | 91px | 91px |
| Stories (h) | 144px | 144px | 144px |
| Hero (h / %vh) | 359px / **42vh** | — | — |
| Hero top offset | 220px | — | — |
| Peek 1ª seção | **241px** | 586px | 586px |
| Composer top | 767px | 767px | 767px |

*(Appointment: intro+stories+hero ≈ 579px ≈ **69vh** — levemente acima do teto combinado de 65vh do audit §2.2, mitigado pelo peek forte do feed.)*

---

## 1. Hero como presença inevitável

| Pergunta | Resposta pós-merge |
|----------|-------------------|
| Parece parte natural do sistema? | **Sim, na vertical Appointment.** Ao alternar verticais, Agendamento é claramente a única com camada de presença — integração limpa, não patch visível. |
| Ainda parece seção adicionada? | **Parcialmente.** O `border-b` e o slot `topContent` ainda marcam “bloco inserido” entre stories e seções — mais módulo editorial forte que raiz da página. |
| Marca existe antes do feed? | **Sim**, antes das seções modulares. Status + cover situam a casa antes de “Agendar Horario”. |
| Sistema parece mais vivo? | **Sim**, no topo de Appointment — contraste imediato vs. Restaurante/E-commerce (intro + stories → feed direto). |
| Topo ganhou identidade própria? | **Sim.** Cover full-bleed + overlay operacional dão identidade que o intro slim sozinho nunca deu. |

### Pergunta principal

> “O produto parece incompleto sem a hero agora?”

**Resposta nuanceada:**

- **Vertical Appointment:** sim — voltar ao estado pré-WS-09B (`SocialCompactHero` embutido + CTAs duplicados) pareceria regressão perceptiva; a hero virou **expectativa local** da Barba Negra.
- **Social Landing como plataforma:** não — as outras verticais funcionam sem hero; a assimetria é **aceitável** enquanto o contrato for piloto single-vertical.

**Leitura:** inevitável **dentro do piloto**; ainda não inevitável **como gramática global** do produto.

---

## 2. Relação Stories ↔ Hero (crítico)

| Pergunta | Resposta |
|----------|----------|
| Stories antes da hero ajudam ou atrapalham? | **Ambos.** Stories reforçam ritmo social-native; **atrapalham** o primeiro gesto emocional de presença operacional. |
| Hero perde força por chegar depois? | **Sim, moderadamente.** ~220px (intro 76 + stories 144) precedem a mídia dominante. O olho passa por rings Instagram antes da “casa viva”. |
| Stories roubam o primeiro gesto emocional? | **Sim, levemente.** “Agendar / Cortes / Barba / Ofertas” competem com cover + status — mesmo vocabulário semântico, duas gramáticas (bubble vs. editorial). |
| Sensação de atraso perceptivo? | **Presente, estável.** Não cresceu pós-merge — é a mesma dívida documentada no piloto. |
| Hero deveria ser primeira presença dominante? | **Idealmente sim** (audit §2.1). **Praticamente** o sistema ainda funciona sem reorder. |

### Dívida perceptiva ou funciona bem?

**Dívida perceptiva real, impacto funcional baixo.**

- Virou **dívida contratual** (ordem ideal vs. ordem implementada), não bug.
- Não impede entendimento da marca nem conversão para booking.
- Torna-se **mais visível** quando comparamos Appointment (com hero) vs. outras verticais — reforça que o topo ainda é shell genérico + exceção local.

**Conclusão:** não bloqueia operação; **deve entrar no backlog** como WS-09B.1, não como hotfix.

---

## 3. Intro Slim

| Pergunta | Resposta |
|----------|----------|
| Ainda necessário? | **Sim, como chrome social** — carrinho, avatar, navegação de contexto multi-vertical. Tier 1 intacto; remoção exigiria decisão de produto maior. |
| Redundância intro ↔ overlay hero? | **Sim, perceptível.** Nome “Barba Negra” + logo aparecem 2× em ~300px verticais. Com `description: ""` a redundância **reduziu**, não sumiu. |
| Função absorvida pela hero? | **Parcialmente.** Identidade emocional e status migraram para a hero; intro ficou utilitário puro. |
| Chrome social ou duplicação? | **Transição em curso:** ainda chrome, **tendendo** a duplicação de identidade. Não urgente; resolver naturalmente com WS-09B.1 ou intro ainda mais minimal. |

---

## 4. Feed protagonism

| Pergunta | Resposta |
|----------|----------|
| Feed continua protagonista? | **Sim.** Exploração (serviços, estilos, reviews, bastidores) domina scroll total (~6625px vs. ~5830px em outras verticais). |
| Hero aumentou contexto sem matar exploração? | **Sim.** Contexto no topo; módulos abaixo intactos. Remoção do `SocialCompactHero` duplicado **aliviou** a primeira seção. |
| Feed nasce organicamente? | **Sim.** Highlights → header “Agendar Horario” → cards — mesma coluna, mesma tipografia (`socialPatternClasses`). |
| Usuário desce naturalmente? | **Sim.** Peek de 241px convida scroll; não há “dead end” na dobra. |

### Landing page?

**Não.** Critério crítico atendido:

- Composer visível (top ~767px)
- Feed peek substancial
- Hero capped 42vh
- Sem funil fechado (CTA abre drawer existente, não checkout)

Appointment fica **mais situada**, não **menos explorável**.

---

## 5. Composer position

| Pergunta | Resposta |
|----------|----------|
| Composer continua anchor invisível? | **Sim.** Fixo inferior; não deslocado nem encoberto pela hero. |
| Hero competiu visualmente? | **Não.** Zonas separadas — hero ocupa 220–579px; composer a partir de 767px. |
| Excesso above-the-fold? | **Leve.** 69vh combinado intro+stories+hero — acima do ideal audit, mas mitigado por peek. |
| Ritmo respira? | **Sim.** Tipografia editorial, gaps consistentes, um CTA — mais leve que pré-merge (sem grid 2× CTA + bloco editorial duplicado). |

---

## 6. Percepção geral do produto

### Social Landing agora parece mais…

| Dimensão | Avaliação |
|----------|-----------|
| **Viva** | ✅ Appointment transmite “casa aberta agora” |
| **Sofisticada** | ✅ Mídia editorial + status > template genérico |
| **Inevitável** | ⚠️ Só na vertical piloto — plataforma ainda multi-template |
| **Emocional** | ✅ Cover + headline > descrição config |
| **Operacional** | ✅ Status + CTA contextual sem frieza GBP |

### Não parece…

| Anti-pattern | Status |
|--------------|--------|
| Mais pesada | ❌ — net mais leve vs. pré-merge na 1ª seção |
| Mais complexa | ❌ — mesma profundidade drawer/composer |
| Mais feature-driven | ❌ — uma camada, não dashboard |

**Sensação geral:** Appointment subiu de “vertical demo funcional” para “interface viva contextual da marca” — alinhado à direção estratégica da Era 3, **sem virar produto diferente**.

---

## 7. Necessidade real de WS-09B.1

| Pergunta | Resposta fria |
|----------|---------------|
| `leadingContent` precisa existir **agora**? | **Não.** |
| Sistema funciona bem sem ele? | **Sim** — gates verdes, fluxos intactos, presença validada. |
| Dívida perceptível mas aceitável? | **Sim** — stories-first é subótimo, não disfuncional. |
| Prioridade maior antes? | **Sim** — observação orgânica, eventual 2ª vertical piloto, contrato oficial de hero antes de mexer no shell. |

### WS-09B.1 deve acontecer…

| Timing | Recomendação |
|--------|--------------|
| **Imediatamente** | ❌ Não |
| **Pode esperar** | ✅ Sim — até sinal de fricção real (confusão de ordem, feedback de usuário, 2º piloto) |
| **Ainda não faz sentido** | ❌ Faz sentido **eventualmente** — dívida está mapeada; execução prematura mexe Tier 1 sem pressão |

**Gatilhos para reabrir WS-09B.1:**

1. Segunda vertical receber hero operacional
2. Feedback recorrente de “demora para sentir a marca”
3. Decisão de promover hero de exceção Appointment → contrato oficial do shell

---

## Riscos pós-merge

| Risco | Severidade | Evolução vs. piloto |
|-------|------------|---------------------|
| Assimetria entre verticais | Média | **Nova leitura** — alternar verticais evidencia que hero é exceção, não regra |
| Stories antes da hero | Média | Estável — dívida conhecida |
| Intro + hero redundantes | Baixa | Estável |
| Topo > 65vh combinado | Baixa | Mensurável (69vh) — monitorar se crescer |
| Expectativa de hero em todas verticais | Média | Risco de produto — contrato ainda não oficializado |
| Regressão drawer/composer/feed | — | Não observada |

---

## O que virou contrato vs. o que ainda é provisório

| Status | Item |
|--------|------|
| **Contrato validado (Appointment)** | Hierarquia interna hero; 1 CTA; hard cap 55vh; highlights leves; wire via `topContent`; booking existente |
| **Contrato validado (plataforma)** | Hero não mata feed; composer anchor; anti-dashboard; anti-GBP-clone |
| **Provisório / dívida** | Ordem `Intro → Stories → Hero`; slot `topContent`; intro slim duplicado; status mock estático |
| **Não contrato ainda** | Generalização cross-vertical; `leadingContent`; absorção do intro pelo shell |

---

## Decisão final

### **A) Sistema estabilizou bem pós-merge → aguardar observação orgânica**

**Por quê não B (WS-09B.1 imediato):**

- Dívida stories↔hero é real mas **estável**
- Merge não introduziu regressão perceptiva
- Tier 1 intacto por design — mexer no shell sem 2º piloto é otimização prematura

**Por quê não C (refinar hero antes do shell):**

- Componente hero em si está sólido; refinamentos seriam polish (copy, acentos), não correção estrutural

**Por quê não D (reavaliar estratégia):**

- Hero **não** parece enxertada na vertical piloto; integração é coerente
- Enxertia é **posicional** (slot), não **identitária** (linguagem)

---

## Próximos passos sugeridos (sem implementação)

1. **Observação orgânica** — uso real `/demo` + feedback interno por 2–4 semanas
2. **Formalizar contrato** — promover itens “validados” de `HERO_OPERATIONAL_AUDIT.md` para baseline Era 3.5 quando houver 2º piloto
3. **Reavaliar WS-09B.1** — somente se gatilhos acima dispararem
4. **Não expandir** hero para restaurant/ecommerce até contrato oficial

---

## Referências

- `HERO_OPERATIONAL_AUDIT.md` — gramática e ordem ideal
- `WS-09B_HERO_PILOT_REPORT.md` — implementação e reversão
- `WS-09B_HERO_PILOT_OBSERVATION.md` — GO pré-merge (commit `4e49835`)
- PR #74 — Hero operacional v0 piloto (Appointment / Barba Negra)
