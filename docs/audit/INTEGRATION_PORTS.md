# INTEGRATION PORTS — Social Landing

**Implementação:** `lib/integrations/`  
**Fase:** Ports + stub adapters + mocks — sem APIs reais

---

## Estrutura por provider

```
lib/integrations/{provider}/
  types.ts      # DTOs + error codes
  port.ts       # Interface (Port)
  adapter.ts    # Fail-closed stub (NOT_CONFIGURED)
  mock.ts       # Offline/dev mock
```

## Providers

| Provider | Port | Real adapter | Mock |
|----------|------|--------------|------|
| Instagram | `InstagramPort` | `instagramAdapter` | `instagramMockAdapter` |
| WhatsApp | `WhatsAppPort` | `whatsappAdapter` | `whatsappMockAdapter` |
| YouTube | `YouTubePort` | `youtubeAdapter` | `youtubeMockAdapter` |
| Google | `GooglePort` | `googleAdapter` | `googleMockAdapter` |
| Shopify | `ShopifyPort` | `shopifyAdapter` | `shopifyMockAdapter` |
| CRM | `CRMPort` | `crmAdapter` | `crmMockAdapter` |

---

## Padrão fail-closed

Adapters reais retornam:

```typescript
{ code: "NOT_CONFIGURED", message: "..." }
```

até `ENABLE_INTEGRATION_*` flags (futuro).

Mocks retornam `isConfigured(): true` para dev/tests.

---

## Regras de isolamento

1. **UI nunca importa SDK externo** — apenas ports via server layer (futuro)
2. **Deep links** permitidos em UI (`wa.me`, instagram.com) — sem API
3. **WhatsApp mock** alinhado a `observeWhatsAppClicked` eventos
4. **Shopify** — sync produtos only; checkout permanece in-drawer custom

---

## Import

```typescript
import {
  whatsappMockAdapter,
  instagramAdapter,
  INTEGRATION_PROVIDERS,
} from "@/lib/integrations"
```

---

## Próxima fase

- `lib/integrations/webhook/ingress.ts`
- Env flags por provider
- Server actions boundary

Ver `docs/audit/INTEGRATION_STRATEGY.md`.
