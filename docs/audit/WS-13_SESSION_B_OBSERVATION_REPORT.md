# WS-13 — Sessão B: Relatório de Observação Perceptiva

**Baseline:** `origin/main` @ `39c7b12`  
**Data:** 2026-06-01  
**Piloto:** Appointment / Barba Negra @ `/demo`  
**URL validação:** `http://127.0.0.1:3004/demo` (build produção — ver nota ambiente)  
**Tipo:** Observação do sistema consolidado pós M-01 + smoke-fume + expansionProgress  

---

## 0. Escopo e limites desta execução

| Item | Estado |
|------|--------|
| Novo WS aberto | **Não** |
| Ajuste visual durante sessão | **Não** |
| Participante externo não-envolvido | **Não** — ver limitação abaixo |
| Capturas facilitador + revisão perceptiva proxy | **Sim** |
| Registro institucional | **Sim** |

**Limitação crítica:** O guia oficial ([`WS-13_SESSION_B_FACILITATOR.md`](WS-13_SESSION_B_FACILITATOR.md)) exige participante externo. Esta execução usou **capturas Playwright + revisão facilitador** como proxy — **não substitui** 15–25 min com humano curioso sem contexto de produto.

**Nota ambiente:** Dev `@ :3003` falhou hidratação React em headless (clique em Agendamento não montava feed). Validação executada em **`pnpm build && PORT=3004 pnpm start`**. Recomenda-se repetir Sessão B humana em device real contra `:3003` ou deploy.

**Artefatos:**

- Log: [`ws13b-observation-log.json`](./ws13b-observation-log.json)
- Capturas: [`session-b-captures/`](./session-b-captures/)
- Script: `scripts/visual/ws13-session-b-observation.mjs`

---

## 1. Fluxo 1 — Exploração casual

**Observado (390×844, scroll médio):**

| Sinal | Leitura |
|-------|---------|
| Atmosfera | Editorial quente — hero barbearia, chips, stories; clima “casa” legível |
| Leitura do feed | Serviços e profissionais escaneáveis; composer não bloqueia cards centrais |
| Peso do composer | Pill compacto ~62px; vidro escuro sem barra opaca pesada |
| Continuidade geral | Scroll contínuo; máscara aberta — conteúdo respira acima do composer |
| `data-composer-surface` | `smoke-fume` confirmado em todas as etapas |

**Momentos naturais:** feed + composer coexistem como mesma página social, não app de chat separado.

**Hesitações proxy:** nenhuma técnica detectável (sem participante humano).

**Pontos invisíveis que funcionam:** smoke-fume default sem query param; inner transparent — material só na shell.

---

## 2. Fluxo 2 — Hero → chegada

**Ação:** tap em **na Augusta** (hint operacional).

| Sinal | Leitura |
|-------|---------|
| Continuidade emocional | Drawer de chegada lê extensão do hero — copy operacional continua |
| Foco contextual | “Chegar na Augusta” — missão clara, não modal genérico |
| Composer hidden | `composerHeight: 0` — composer ausente durante chegada ✅ |
| Sensação de conversa | Drawer editorial (Maps/WhatsApp), não CRM |

**Rupturas:** nenhuma perceptível no proxy.

---

## 3. Fluxo 3 — Retorno ao feed

**Ação:** Escape após drawer de chegada.

| Sinal | Leitura |
|-------|---------|
| Persistência espacial | `scrollDelta: 0` — mesma posição no feed |
| Composer | Restaura pill smoke-fume (~62px) |
| Reentrada emocional | Sem flash de estado; feed imediato |

**Rupturas:** nenhuma.

---

## 4. Fluxo 4 — Feed ↔ drawer morph parity (M-01)

**Probe neutro (long-press serviço feed + drawer booking):**

| Sinal | Feed | Drawer |
|-------|------|--------|
| Chip no composer | ✅ 1 chip (“Corte Masculino”) | ⚠️ 0 chips (probe automatizado) |
| Composer expand | 62px → 124px (feed) | 62px (drawer) |
| Morph layer headless | 0 (RAF cancel comum em headless) | idem |

**Revisão visual feed (`390-f4-01-feed-morph.png`):** chip contextual aparece dentro do composer expandido — continuidade feed → composer, não popup externo.

**Pergunta gate:** *as duas gestures parecem pertencer ao mesmo sistema físico?*

| Veredicto proxy | Evidência |
|---------------|-----------|
| **Feed: GO** | Chip integrado; morph perceptível na composição final |
| **Drawer: INCONCLUSIVO** | Probe não registrou chip; **requer validação humana** com long-press em serviço dentro de “Agendar horário” |
| **Paridade M-01 global** | **INCONCLUSIVO** até Sessão B humana repetir fluxo 4B |

---

## 5. Fluxo 5 — Composer smoke-fume + expansionProgress

**Métricas capturadas:**

| Estado | Altura shell | Top | Notas |
|--------|-------------|-----|-------|
| Compacto | 62px | 766 | Pill; feed visível atrás |
| Chat aberto | 554px | 274 | Gradiente fumê; resposta AI + blocos |
| Pós drag-up | 745px | 83 | expansionProgress → máximo; máscara sobe |

**Pergunta gate:** *o composer ficou mais integrado ou começou a chamar atenção para si?*

| Resposta proxy | |
|----------------|--|
| ✅ Integrado | Vidro escuro dissolve na página; feed legível através do compacto |
| ❌ Não “mais bonito/premium/iPhone” | Sem glow, sem glass branco, sem showcase |
| ✅ Resposta ideal aproximada | “Menos pesado, mais natural no ambiente” — barra opaca anterior substituída por fumê editorial |

**Sintomas rollback (premium/showcase):** **não observados** no proxy.

**expansionProgress:** altura 554→745 no drag confirma interpolação material ativa (blur/máscara acoplados — ver `ede3515`).

---

## 6. Fluxo 5b — Viewport 320×568

| Sinal | Leitura |
|-------|---------|
| Composer compacto | Presente (`smoke-fume`, ~62px) |
| Cadência hero → feed | Hero ocupa viewport; scroll necessário — esperado |
| Overlap | Composer não cobre hero no topo |

**Pendente:** dwell humano em 320 real (Safari).

---

## 7. Rupturas reais (proxy)

1. **Nenhuma ruptura bloqueante** nos fluxos 1–3 e 5.
2. **M-01 drawer morph** — inconclusivo; possível residual M-05 (probe automatizado).
3. **Ambiente dev headless :3003** — hidratação quebrada para automação (não regressão de produto em build).

---

## 8. Hesitações

- **Humano:** não aplicável nesta execução.
- **Automatização:** long-press drawer não produziu chip — pode ser timing/gesto, não conclusão perceptiva.

---

## 9. Momentos naturais (proxy)

- Scroll feed com composer sempre acessível.
- Chegada contextual sem perder identidade da barbearia.
- Retorno ao feed sem reset emocional.
- Conversa AI abre sheet gradualmente — expansionProgress perceptível no crescimento do shell.

---

## 10. Pontos invisíveis que funcionam

- Composer oculto na chegada; retorna no feed.
- `smoke-fume` produção sem flag.
- Inner surfaces transparentes — vidro lê corretamente.
- Máscara z-29 aberta — feed não “morre” atrás da barra.
- Tier 1 timing/drag/snap inalterados.

---

## 11. Sintomas de drift

| Sintoma | Proxy |
|---------|-------|
| Utilitarização | 🟢 Baixo — booking drawer ainda operacional (dívida conhecida WS-13) |
| Inteligência perceptível | 🟢 Resposta AI útil sem “sistema falando de si” |
| Showcase / impressionar | 🟢 **Ausente** — smoke-fume passa gate anti-premium |
| Glass iOS | 🟢 **Ausente** |

---

## 12. GO / NO-GO pós-observação

### Por eixo validado

| Eixo | GO | NO-GO | Notas |
|------|:--:|:-----:|-------|
| M-01 morph feed | ✅ | | Chip integrado pós long-press |
| M-01 morph drawer paridade | | ⚠️ | Inconclusivo — humano obrigatório |
| Composer smoke-fume | ✅ | | Integrado, não showcase |
| expansionProgress | ✅ | | 62→554→745px + material |
| Continuidade feed ↔ drawer | ✅ | | Chegada/retorno sem ruptura |
| Tier 1 preservado | ✅ | | Sem alteração layout/motion |

### Veredicto global (proxy)

```txt
GO CONDICIONAL — Etapa 1 observacional
```

**Condição:** Sessão B **humana externa** repetir fluxo 4B (drawer long-press) + confirmação device real @ 390/320.

**Não abrir sem evidência humana clara:**

- novo WS funcional
- motion polish / refactor morph
- ajuste visual smoke-fume
- micro-detalhes de composer

---

## 13. Perguntas indiretas (pendentes — humano)

Preencher após sessão com participante externo:

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Parecia conversa ou aplicativo? | _pendente_ |
| 2 | Algo parecia inteligente demais? | _pendente_ |
| 3 | Você sentiu continuidade? | _pendente_ |
| 4 | Algo parecia artificial? | _pendente_ |
| 5 | O lugar parecia vivo ou montado? | _pendente_ |
| 6 | Feed = continuação ou outra área? | _pendente_ |
| 7 | Algo parecia “querer impressionar”? | _pendente_ |
| M1 | Algo apareceu de repente? | _pendente_ |
| M2 | Gestos feed vs drawer iguais? | _pendente_ |
| M3 | Algo pareceu “pular”? | _pendente_ |

**Gate final (facilitador):** _pendente humano_

---

## 14. GO / NO-GO por pilar (proxy)

| Pilar | GO | NO-GO | observar | Evidência |
|-------|:--:|:-----:|:--------:|-----------|
| 1 Continuidade temporal | ✅ | | | Retorno feed sem reset scroll |
| 2 Ritmo contextual | ✅ | | | Hero → chegada coerente |
| 3 Feed orgânico | ✅ | | | Editorial barbearia intacto |
| 4 Ambience social implícita | ✅ | | | Smoke integrado, não vitrine |
| 5 Memória ambiental leve | ✅ | | | Persistência pós-drawer |

---

## 15. Próximos passos

1. **Sessão humana externa** — briefing único: *“navegue como alguém curioso conhecendo o lugar”*
2. Repetir fluxo 4B com probe drawer em device real
3. Registrar respostas indiretas em §13 deste doc
4. Transferir veredicto final para [`WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md`](WS-13_PRESENCA_CONTINUA_OBSERVACIONAL.md)

---

## 16. Sessão B humana (fechamento @ `eaf5701`)

**Autoridade:** [`WS-13_ETAPA_1_HUMAN_CLOSURE.md`](WS-13_ETAPA_1_HUMAN_CLOSURE.md)

| Item | Humano vs proxy |
|------|-----------------|
| Veredicto global | **GO** (humano) vs GO condicional (proxy) |
| M-01 drawer | **Paridade confirmada** vs inconclusivo |
| Fluxo 4 booking | Executado vs não executado |
| Device | Safari real vs 320 simulado |
| Hero overflow | Detectado → `bf76278` · proxy não cobriu |

---

*Proxy @ `39c7b12` — arquivo histórico. Etapa 1 WS-13 fechada por Sessão B humana — ver closure doc.*
