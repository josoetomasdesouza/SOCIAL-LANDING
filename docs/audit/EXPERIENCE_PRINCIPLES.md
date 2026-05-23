# EXPERIENCE PRINCIPLES — Social Landing

**Data:** 23/05/2026  
**Fase:** 6 — Experience Protection

---

## O que cria a sensação premium

| Elemento | Mecanismo | Onde vive |
|----------|-----------|-----------|
| **Continuidade feed → conversa** | Morph post→chip 480ms | PostToChatMorphLayer |
| **Composer emergente** | Sheet integrado, não modal | ConversationalAI |
| **Feed editorial contínuo** | Coluna central, sem blocos dashboard | BusinessSocialLanding |
| **Stories como camada social** | Rings, progress, fullscreen viewer | BusinessStories, StoryViewer |
| **Profundidade sutil** | Glass `rgba(45,50,58,0.96)`, blur leve | COMPOSER_SURFACE_COLOR |
| **Resposta viva da IA** | Typing 700ms + auto-scroll | conversational-ai |
| **Seleção tátil premium** | Long-press 420ms + haptic | ContextSelectable |
| **Ritmo calibrado** | Timings documentados | SYSTEM_ARCHITECTURE.md |
| **Mobile-native feel** | 16px input, visualViewport, touch zones | Composer + stories |

---

## O que cria fluidez

- Sheet drag com snap natural (compact/medium/expanded)
- Transições 300ms consistentes em drawers
- Scroll interno nos drawers sem competir com página
- Auto-grow do composer baseado em **medição real**
- Cancelamento de morph em scroll (evita "rasgo")
- Feed padding que reserva espaço do composer (`pb-48`)

---

## O que cria imersão

- Feed dim overlay quando composer expande
- Gradient mask entre feed e composer
- Story viewer z-100 fullscreen
- Chip rail como "memória visível" da conversa
- Conteúdo long-press vira contexto — sensação de **ambiente único**

---

## Superfícies emocionalmente sensíveis

1. **Primeiro long-press → morph** — momento "wow" do produto
2. **Primeira mensagem IA** — prova de utilidade
3. **Abertura do composer** — deve parecer extensão do feed
4. **Story → seção** — promessa de navegação social
5. **Checkout/cart flows** — risco de virar ecommerce genérico

---

## O que NÃO pode degradar

| Contrato | Degradação inaceitável |
|----------|------------------------|
| Morph | Pular, nascer errado, sumir |
| Composer | Parecer modal/popup externo |
| Feed topo | Virar header corporativo |
| Stories | Virar menu/tabs |
| Timing | Lag perceptível >100ms em interações táteis |
| Scroll | Conteúdo escondido atrás do composer |
| Identidade visual | Cores/tokens arbitrários por vertical |

---

## O que pode destruir a sensação do produto

### Visível
- Excesso de glassmorphism e sombras dramáticas
- Múltiplos CTAs competindo (ecommerce clássico)
- Bordas/divisorias em toda transição
- Modais Radix substituindo drawers custom
- Loading spinners genéricos em superfícies sociais
- Feed grid denso tipo catálogo

### Invisível
- **Micro-latência** em measurement → sheet "pula"
- **Layout shift** quando teclado abre no iOS
- **Z-index war** — morph atrás do composer
- **Scroll lock bug** — página trava após fechar drawer
- **Feature creep** — busca duplicada, filtros dashboard
- **IA verbose** — respostas longas quebram ritmo conversacional
- **Autoplay vídeo** agressivo no feed

---

## Riscos invisíveis de UX

| Risco | Sintoma | Prevenção |
|-------|---------|-----------|
| Measurement regression | Composer corta última mensagem | Frozen measurement system |
| composerMode race | Composer flicker hidden/visible | Surface state reducer |
| Reduced motion ignored | Usuários com vestibular disorder | prefers-reduced-motion ✅ |
| ID collision context | Chip errado selecionado | Namespace IDs por brand+vertical |
| localStorage corrupt | Chat branco/travado | Schema version + try/catch UI |
| External images slow | Feed "vazio" perceptivo | Skeleton + priority hints |
| Too many overlays | Cognitive overload | Max 1 transactional drawer |

---

## Riscos de micro-latência

| Threshold | Impacto |
|-----------|---------|
| <16ms | Imperceptível |
| 16–50ms | Aceitável em drag |
| 50–100ms | Limite para tap feedback |
| >100ms | Quebra sensação "instantânea" social |
| >300ms | Parece loading, não fluidez |

**Zona crítica:** morph start delay, chip appear, sheet snap after drag release, AI first token.

---

## Riscos de excesso de feature

Sinais de alerta:
- Segundo campo de busca no feed
- Tabs horizontais além de stories/categories
- Painel admin embutido na landing pública
- Configurações expostas ao visitante
- Gamification badges no feed
- Pop-ups de newsletter/cookie agressivos

**Regra:** cada feature nova deve provar que **aumenta continuidade social**, não utilidade corporativa.

---

# EXPERIENCE PRINCIPLES (normativos)

### EP-1 — Continuidade sobre separação
Feed, stories e composer são **um ambiente**. Nunca tratar como apps coladas.

### EP-2 — Emergência sobre invasão
Superfícies surgem do contexto (long-press, story, produto). Não invadem com modal genérico.

### EP-3 — Calibração sobre customização
Timings, z-index e cores calibrados **valem mais** que opções de personalização expostas.

### EP-4 — Medição real sobre matemática
Layout do composer vem de DOM medido. Constantes globais são fallback, não regra.

### EP-5 — Silêncio visual premium
Profundidade sutil. Se blur/sombra chama atenção, está forte demais.

### EP-6 — Social-first, never dashboard
Proibido padrões de admin panel, data table, sidebar catalog na landing pública.

### EP-7 — Conversa breve, não manual
IA responde em ritmo conversacional. Respostas longas quebram imersão.

### EP-8 — Mobile é referência
Desktop adapta mobile. Não o contrário.

### EP-9 — Identidade é sagrada
Brand DNA (cores, tom, logo) não muda por automação sem aprovação humana.

### EP-10 — Regressão perceptiva = bug P0
Se parece pior, é bug — mesmo sem erro no console.

### EP-11 — Uma superfície transactional
Máximo um drawer de ação + composer coordenados. Empilhamento = caos.

### EP-12 — Preservar o morph
O morph é assinatura do produto. Não substituir por fade genérico.

---

## Checklist de validação experiencial (qualquer PR UI)

- [ ] Long-press → morph → chip em mobile real
- [ ] Composer drag snaps naturais
- [ ] Último post do feed visível com composer expanded
- [ ] Drawer fecha e scroll restaura
- [ ] Story navigation funciona
- [ ] Não parece dashboard/ecommerce/institucional
- [ ] Reduced motion respeitado
- [ ] Sem layout jump ao abrir teclado

---

## Relação com documentos existentes

- `docs/ai-handoffs/VISUAL_LANGUAGE.md` — regras visuais detalhadas
- `docs/ai-handoffs/FROZEN_SYSTEMS.md` — sistemas que implementam estes princípios
- `EXPERIENCE_PRINCIPLES.md` (este) — **norma estratégica** para decisões futuras

---

## Atualização — Proteção durante evolução estrutural (23/05/2026)

### EP-13 — Observabilidade não é automação

Event bus, surface reducer e rule engine **observam ou avaliam** — nunca alteram Tier 1 perceptivo sem protocolo frozen.

### EP-14 — Fundação ao redor, não dentro

Novos módulos (`lib/events`, `lib/surfaces`, `lib/brand-dna`, `lib/rules`, `lib/integrations`) vivem **fora** do coração emocional (morph, composer sheet, measurement).

### EP-15 — DEV visibility, zero UX impact

Painel de eventos (`EventDebugPanel`) existe apenas em DEV em `/demo` — nunca em produção pública.
