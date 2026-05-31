# WS-09B — Observação Perceptiva do Piloto Hero

**Data:** 2026-05-31  
**Baseline avaliado:** branch `workstream/hero-operational-pilot-appointment` (pré-commit)  
**Viewport de referência:** 390×844 (iPhone-class)  
**Contrato:** `HERO_OPERATIONAL_AUDIT.md`  
**Implementação:** `appointment-operational-hero.tsx` via `topContent`

---

## Veredicto

**A marca passa a existir como presença viva antes do feed modular — com ressalva de timing.**

A Hero v0 cumpre o objetivo perceptivo do piloto: a Barba Negra deixa de parecer “template genérico” e passa a ocupar o espaço com mídia, status operacional e convite editorial. Não parece dashboard, clone Google, banner promocional ou landing page separada.

A ressalva principal é **posicional**, não estrutural: a hero chega **depois** do intro slim + stories, o que atrasa a “presença inicial” em ~220px de scroll mental na primeira dobra.

**Recomendação final: A — GO para commit + PR do WS-09B como está.**

Follow-up recomendado (não bloqueante): **WS-09B.1** para slot `leadingContent` additive no shell, se quisermos validar a ordem ideal `Hero → Stories → Feed`.

---

## 1. Presença inicial

| Pergunta | Observação |
|----------|------------|
| A marca parece mais viva logo no início? | **Parcialmente.** O intro slim (logo + nome) e os stories aparecem primeiro; a hero traz a “vida” real (cover, status, headline) só na metade inferior da dobra. |
| A hero chega tarde por estar depois dos stories? | **Sim, moderadamente.** Na carga inicial, ~26% da viewport (≈220px) é intro + stories antes da mídia dominante. O usuário vê “rede social genérica” antes de “casa viva”. |
| O usuário entende a Barba Negra antes de entrar no feed? | **Sim**, desde que olhe a dobra inteira. Nome aparece 2× (intro + overlay na mídia), status “Aberto agora · atendemos até 20h” e headline editorial situam a casa antes de “Agendar Horario” / serviços. |
| A hero parece camada principal ou mais uma seção? | **Entre as duas.** Pela densidade e mídia full-bleed, parece camada principal *dentro do fluxo*. Pela posição (após stories) e `border-b`, ainda parece “bloco forte do feed”, não raiz da página. |

**Leitura:** o piloto valida presença viva **antes das seções operacionais**, não necessariamente antes de tudo. Isso é suficiente para o teste controlado, mas não fecha a ordem ideal do audit.

---

## 2. Hierarquia e regra de ouro

> Hero convida presença. Feed explora universo. Drawer aprofunda intenção. Composer continua conversa.

| Elemento | Avaliação |
|----------|-----------|
| **Hero → presença** | ✅ Mídia + status + headline convidam; CTA único, sem urgência agressiva. |
| **Feed → universo** | ✅ Transição suave: highlights → header “Agendar Horario” → serviços. Peek forte do feed (~241px do header da 1ª seção visível abaixo da hero). |
| **Drawer → intenção** | ✅ CTA reutiliza `handleStartBooking()`; profundidade Hero → Drawer → Composer inalterada. |
| **Composer → conversa** | ✅ Composer permanece anchor inferior; não compete com a hero na dobra (composer top ≈ 767px vs hero bottom ≈ 579px). |

### Intro slim

Ainda faz sentido como **chrome social** (logo, carrinho, avatar), mas com `description: ""` fica mais enxuto. **Risco leve:** redundância de nome/logo (intro + overlay na hero). Aceitável no piloto; ideal futuro seria intro ainda mais mínimo ou hero acima do intro.

### Stories antes da hero

**Atrapalham levemente** a promessa “presença antes do feed”. Os rings Instagram-style puxam atenção para exploração social antes da “casa viva”. **Não quebram** o piloto — reforçam universo — mas **atrasam** o momento de presença operacional.

### Hero acima dos stories?

**Sim, perceptivamente seria melhor** para o contrato §2.1. Não é requisito para validar o componente em si; é limitação do slot `topContent`.

### Feed peek

**Suficiente e positivo.** Com hero capped (~42vh medidos), o header “Agendar Horario” e cards de serviços aparecem na mesma dobra. O feed não parece página separada.

---

## 3. Mobile (390×844)

| Critério | Medição / leitura |
|----------|-------------------|
| Altura da hero | **359px ≈ 42vh** — dentro de 40–55vh; hard cap respeitado. |
| Respiro | ✅ Tipografia editorial (`15px/24`), gaps de 12px, mídia com gradiente — respira. |
| Densidade | ✅ 7 slots perceptivos (mídia, nome, status, headline, CTA, highlights, borda feed) — no teto do audit, mas abaixo de dashboard. |
| CTA | ✅ Um botão filled full-width; legível; não compete com secundários na hero. |
| Highlights | ✅ Pills horizontais leves; parecem continuação editorial, não tabs. |
| Composer | ✅ Não invade a hero; permanece fixo inferior. |
| Peso | ✅ Mais leve que antes (removidos `SocialCompactHero` duplicado + grid 2× CTA no `ScheduleModule`). |

### Anti-padrões (check)

| Padrão proibido | Resultado |
|-----------------|-----------|
| Banner antigo | ❌ Não — mídia editorial com overlay, não strip promocional. |
| Dashboard | ❌ Não — sem grid, métricas, widgets. |
| Google clone | ❌ Não — sem mapa, estrelas centrais, chips utilitários GBP. |
| Landing page comum | ❌ Não — feed e composer visíveis/peek na mesma dobra. |

### Capturas de observação

Avaliação feita em `/demo` → vertical Agendamento, viewport **390×844**, servidor dev local.

**Dobra inicial:** intro slim (logo + “Barba Negra”) → rings de stories → cover da barbearia com status overlay → headline → CTA “Agendar horario” → chips → peek de “Agendar Horario” / serviços → composer inferior.

**Hero alinhada:** mídia ~35–40% da dobra; bloco inferior compacto; transição para feed sem quebra de coluna ou ritmo.

*(Recomendado anexar 2 screenshots mobile equivalentes no PR.)*

---

## 4. Drawer / Composer

| Verificação | Status |
|-------------|--------|
| CTA da hero abre booking | ✅ QA + inspeção manual — drawer de serviço abre via `handleStartBooking()`. |
| Drawer natural | ✅ Mesmo `ActionDrawer` existente; sem nova camada. |
| Composer não compete | ✅ Hero capped; composer fora da zona de conflito vertical. |
| Profundidade | ✅ Hero → scroll **ou** Hero → CTA → Drawer → Composer — máx. 2 saltos. |

**Nota de QA:** step de booking no `demo-event-checklist` foi movido **antes** do fluxo AI para evitar poluição de estado do composer — ajuste de harness, não regressão de produto.

---

## 5. Riscos percebidos

| Risco | Severidade | Comentário |
|-------|------------|------------|
| Hero tardia (após stories) | Média | Limita “presença inicial”; documentado; não invalida piloto. |
| Nome/logo duplicado (intro + hero) | Baixa | Perceptível em scroll curto; mitigável com `leadingContent` futuro. |
| Hero como “seção forte” vs “raiz” | Baixa | Aceitável para v0; slot `topContent` condiciona leitura. |
| Status estático mock | Baixa | Esperado no v0; não simula tempo real (fora de escopo). |
| Highlights com scroll horizontal oculto | Baixa | 5 chips cabem parcialmente; scroll não é óbvio — ok para piloto. |
| Erro React dev (`duplicate key #` em footer links) | Info | Pré-existente / ambiente dev; não introduzido pela hero; não bloqueia piloto. |

---

## 6. Recomendação final

### Opção escolhida: **A — GO para commit + PR do WS-09B como está**

**Por quê:**

1. O piloto responde à pergunta central: *“a marca passa a existir como presença viva antes do feed?”* — **sim**, antes das seções modulares, com peek e continuidade visual.
2. Gates verdes (build, TS, `qa:appointment`, `qa:events`).
3. Tier 1 intacto; diff pequeno e reversível.
4. Anti-padrões H-N evitados na prática perceptiva.
5. A limitação de ordem (`Intro → Stories → Hero`) é **compromisso consciente**, não falha de implementação — cabe no escopo “piloto controlado”.

**Não recomendado agora:**

- **B (ajuste mínimo):** nenhum ajuste de código é necessário para validar a hipótese; polimentos (acentuação copy, intro ainda mais slim) podem ir em PR separado.
- **C (WS-09B.1):** follow-up **após merge**, se quisermos fechar a ordem ideal — não bloqueia este PR.
- **D (reverter):** desnecessário — ganho perceptivo claro vs. estado anterior (`SocialCompactHero` embutido + CTAs duplicados).

---

## 7. Decisão sobre commit + PR

| Ação | Decisão |
|------|---------|
| Commit | **Autorizado** — observação perceptiva concluída com GO. |
| PR | **Autorizado** — abrir PR isolado `workstream/hero-operational-pilot-appointment` com: |
| | • link a este documento + `WS-09B_HERO_PILOT_REPORT.md` |
| | • nota explícita do compromisso `topContent` / ordem vs. audit |
| | • capturas mobile (dobra inicial + hero) como evidência |
| | • lista do evitado + confirmação de riscos não introduzidos |

**Próximo passo sugerido pós-merge:** abrir **WS-09B.1** (slot `leadingContent` additive, 2–3 linhas no BSL, appointment-only) apenas se a equipe quiser fechar a hierarquia ideal antes de generalizar.
