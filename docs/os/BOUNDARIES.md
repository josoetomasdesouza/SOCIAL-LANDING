# Boundaries — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/foundation/ABSTRACTION_BOUNDARIES.md`](../foundation/ABSTRACTION_BOUNDARIES.md), [`docs/foundation/INTEGRATION_STRATEGY_ANALYSIS.md`](../foundation/INTEGRATION_STRATEGY_ANALYSIS.md)

---

## Fronteiras de abstração

```
UI Tier 1  →  Orchestrator  →  Ports  →  Providers  →  External APIs
```

| Camada | Pode | Não pode |
|--------|------|----------|
| UI Tier 1 | Emitir eventos, chamar orchestrator | Importar SDK, URL hardcoded de provider |
| Orchestrator | Rotear intenção, instrumentar handoff | Lógica de pagamento, OAuth |
| Ports | Contrato tipado, fail-closed | UI, DOM |
| Providers | Implementar port | Vazar para Tier 1 |

---

## Nunca internalizar cedo

1. Payment processing (Stripe stays)
2. WhatsApp message transport
3. Video hosting / CDN
4. Full ecommerce back-office
5. OAuth/crypto implementation
6. Global scheduling infrastructure
7. Large-scale social graph
8. Meta verification bureaucracy

---

## Inevitavelmente nativo

1. Composer + surface orchestration
2. Semantic event model
3. Intent routing
4. Brand identity hub
5. Feed/morph/composer continuity

---

## Regras de handoff

- Evento semântico **antes** de abrir externo (`whatsapp.clicked`, etc.)
- IDs estáveis de intenção — não URLs como identidade
- Legacy `window.open` direto → migrar para port instrumentado

---

## Schema boundary

`lib/landing-schema/` é **isolado da UI**. Não importar em componentes Tier 1 até bridge formal existir.

`lib/types.ts` e `lib/business-types.ts` servem o feed atual — não substituir prematuramente.
