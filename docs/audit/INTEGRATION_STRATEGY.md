# INTEGRATION STRATEGY — Social Landing

**Data:** 23/05/2026  
**Fase:** 8 — Integration Readiness

---

## Estado atual

| Integração | Status | Acoplamento |
|------------|--------|-------------|
| **Supabase** | Scaffolded, gated off | Isolado em `lib/db/` ✅ |
| **Vercel Analytics** | Ativo produção | Baixo ✅ |
| **Google Fonts** | Ativo | Baixo ✅ |
| **Instagram** | URL/deep link only | Mock data ⚠️ |
| **WhatsApp** | `wa.me` links | Component level ⚠️ |
| **YouTube** | Watch URLs | Mock ⚠️ |
| **Facebook/X/LinkedIn/TikTok** | Schema + extract regex | Baixo ⚠️ |
| **Google (OAuth/API)** | Não implementado | — |
| **Shopify** | Não existe | — |
| **CRM** | Não existe | — |
| **n8n** | Não existe | — |
| **IA externa** | Não existe (mock keyword) | — |
| **Webhooks** | Zero routes | — |

---

## Onde falta isolamento

| Problema | Local | Impacto futuro |
|----------|-------|----------------|
| Social links inline em components | `conversion-block`, `social-contact-cta`, `[slug]/page` | Duplicação, drift |
| Extract-brand acoplado a route handler | `app/api/extract-brand/route.ts` | Sem adapter testável |
| Mock checkout sem payment port | Vertical feeds | Shopify/Stripe invasivo |
| Chat resolver inline | `conversational-ai.tsx` | LLM swap difícil |
| Brand types duplicados | `types.ts` vs `landing-schema` | Integração data inconsistente |
| Media upload sem queue | Sync HTTP only | Webhook storm risk |

---

## Adapter layer recomendada

```
lib/integrations/
├── ports/
│   ├── SocialProvider.port.ts
│   ├── Messaging.port.ts      # WhatsApp
│   ├── Commerce.port.ts       # Shopify
│   ├── Media.port.ts          # YouTube
│   ├── CRM.port.ts
│   ├── Automation.port.ts     # n8n
│   └── AI.port.ts
├── adapters/
│   ├── instagram/             # Graph API future
│   ├── whatsapp/              # Business API
│   ├── youtube/               # Data API
│   ├── google/                # OAuth + Business
│   ├── shopify/
│   ├── hubspot/ | pipedrive/  # CRM examples
│   ├── n8n/
│   └── openai/ | anthropic/
├── webhook/
│   ├── ingress.ts             # Verify signature, idempotency
│   ├── handlers/
│   └── event-mapper.ts        # → Domain events
└── registry.ts                # ENABLE_INTEGRATION_* flags
```

**Regra:** UI importa **ports** via server actions/API — nunca SDKs externos direto em components.

---

## Estratégia por integração

### Instagram

| Aspecto | Plano |
|---------|-------|
| **Hoje** | Handles em BrandSocialLinks, render link |
| **Futuro** | Graph API para embed/media sync |
| **Adapter** | `InstagramSocialAdapter` — fetch media → MediaAsset |
| **Risco** | Rate limits, token expiry |
| **Isolamento** | Cron job server, não client |
| **Auth** | OAuth Meta Business, store encrypted in external_sources |

### WhatsApp

| Aspecto | Plano |
|---------|-------|
| **Hoje** | Deep link `wa.me` |
| **Futuro** | Business API para conversas, catálogo |
| **Adapter** | `WhatsAppMessagingAdapter` |
| **Risco** | Confundir com composer UI — **manter separado** |
| **UX** | CTA kind `whatsapp` no schema ✅ |

### YouTube

| Aspecto | Plano |
|---------|-------|
| **Hoje** | Watch URLs em institutional feed |
| **Futuro** | Data API sync vídeos → posts |
| **Adapter** | `YouTubeMediaAdapter` |
| **Risco** | Embed pesado — lazy load obrigatório |

### Google

| Aspecto | Plano |
|---------|-------|
| **Futuro** | OAuth login, Business Profile sync, Analytics |
| **Adapter** | `GoogleAuthAdapter` separado de Supabase auth |
| **Risco** | Dual auth providers — documentado em provider-decision-spec |

### Shopify

| Aspecto | Plano |
|---------|-------|
| **Hoje** | Mock ecommerce cart/checkout |
| **Futuro** | Storefront API / webhooks product sync |
| **Adapter** | `ShopifyCommerceAdapter` implements Commerce.port |
| **Risco** | **Alto** — checkout mock virar Shopify iframe destrói UX |
| **Estratégia** | Sync products → feed posts; checkout via drawer custom + Shopify backend |

### CRM

| Aspecto | Plano |
|---------|-------|
| **Futuro** | Lead capture from conversation, context items |
| **Adapter** | `CRMAdapter` — create contact/deal |
| **Risco** | PII — Safety Layer obrigatório |
| **Event** | `conversation.lead.qualified` → CRM |

### n8n

| Aspecto | Plano |
|---------|-------|
| **Futuro** | Webhook ingress + outbound triggers |
| **Adapter** | `N8nAutomationAdapter` |
| **Pattern** | n8n orquestra; Social Landing emite domain events |
| **Risco** | Event storm — ver abaixo |

### IA externa

| Aspecto | Plano |
|---------|-------|
| **Hoje** | `conversational-search.ts` keyword |
| **Futuro** | `AI.port` — stream tokens, context injection |
| **Risco** | Latência, custo, alucinação |
| **Guard** | Rule Engine + Brand DNA + max tokens |

---

## Riscos de acoplamento externo

1. **SDK no client** — expõe keys, quebra RSC model
2. **Sync blocking render** — feed espera API externa
3. **Webhook sem idempotency** — duplicate posts/orders
4. **OAuth token no localStorage** — inaceitável
5. **Shopify checkout redirect** — quebra composer continuity
6. **CRM write on every message** — spam + cost

---

## Riscos de autenticação futura

| Risco | Mitigação |
|-------|-----------|
| No middleware.ts | Adicionar Supabase session refresh |
| Dual provider (Supabase + Google) | Adapter pattern + single session abstraction |
| Brand member vs visitor | RLS ✅ schema ready |
| Integration tokens per brand | `external_sources` table ✅ |
| Service role leak | Admin client server-only ✅ |

---

## Riscos de webhook / event storm

| Cenário | Mitigação |
|---------|-----------|
| Shopify product update flood | Debounce + batch + queue |
| n8n retry loop | Idempotency key + dedup table |
| WhatsApp message webhook | Rate limit per brand |
| Failed handler retry | Dead letter + alert |

**Recomendação:** ingress único `app/api/webhooks/[provider]/route.ts` com:

- Signature verification
- Idempotency-Key header
- Persist raw payload → process async
- Map to domain events (EVENT_MAP.md)

---

## Readiness score

| Integração | Isolamento | Adapter | Auth | Webhook | Score |
|------------|------------|---------|------|---------|-------|
| Supabase | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | N/A | **75%** infra |
| Instagram | ⭐ | ⭐ | ⭐ | ⭐ | **15%** |
| WhatsApp | ⭐⭐ | ⭐ | ⭐ | ⭐ | **20%** |
| YouTube | ⭐ | ⭐ | ⭐ | ⭐ | **15%** |
| Google | ⭐ | ⭐ | ⭐ | ⭐ | **10%** |
| Shopify | ⭐ | ⭐ | ⭐ | ⭐ | **10%** |
| CRM | ⭐ | ⭐ | ⭐ | ⭐ | **5%** |
| n8n | ⭐ | ⭐ | ⭐ | ⭐ | **5%** |
| IA externa | ⭐⭐ | ⭐ | N/A | ⭐ | **25%** mock |

---

## Roadmap de integração (sem overengineering)

### Fase A — Foundation (antes de qualquer API externa)
1. `lib/integrations/ports/` interfaces
2. Mock adapters implementing ports (swap zero UI change)
3. Webhook ingress skeleton (501 until configured)
4. Domain event bus (EVENT_MAP.md)

### Fase B — Data bridge
1. mock-to-schema adapters wired
2. ENABLE_DB=true in dev
3. Published landing serves schema snapshot

### Fase C — First integrations
1. IA externa via AI.port (feature flagged)
2. WhatsApp deep link → Business API read-only
3. Instagram media import cron

### Fase D — Commerce & automation
1. Shopify product sync
2. n8n event export
3. CRM qualified leads

---

## Conclusão

A preparação de integração é **schema-first** (BrandSocialLinks, external_sources, crawl_jobs) mas **runtime-naive**. Prioridade: **ports + mock adapters + webhook ingress** antes de conectar qualquer API real. Proteger composer/feed de redirects e SDKs client-side.
