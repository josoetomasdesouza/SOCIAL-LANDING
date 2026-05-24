# Filosofia do Produto — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/foundation/EXECUTIVE_PLATFORM_DIRECTION.md`](../foundation/EXECUTIVE_PLATFORM_DIRECTION.md), [`docs/foundation/NATIVE_OWNERSHIP_MAP.md`](../foundation/NATIVE_OWNERSHIP_MAP.md)

---

## Princípio central

O produto é um **sistema operacional adaptativo de marcas** — não um sandbox de experimentos destrutivos.

Marcas vivem em ambientes sociais. A Social Landing traduz essa lógica para uma superfície conversacional que **orquestra** ações reais (contato, compra, agendamento) sem quebrar o fluxo.

---

## O que o produto faz

| Capacidade | Postura |
|------------|---------|
| Composer + superfícies | **Nativo** — core do produto |
| Modelo semântico de eventos | **Nativo** |
| Roteamento de intenção | **Nativo** |
| Hub de identidade | **Nativo** (evolutivo) |
| Pagamentos, WhatsApp transport, CDN | **Externo** — via ports |
| Back-office ecommerce | **Externo** |
| OAuth / crypto | **Externo** |

---

## Regra de ouro de integração

> Own the experience. Rent the rails.

- Ports existem em `lib/integrations` — runtime não deve bypassar para sempre
- Handoffs externos sempre instrumentados (evento antes de navegar)
- Tier 1 nunca importa SDK de provider

---

## Verticais e superfícies

| Superfície | Rota | Isolamento |
|------------|------|------------|
| Social landing estática | `/` | Sem IA conversacional |
| Business landing conversacional | `/demo` | 12 verticais, morph, composer |
| Profile simples | `/[slug]` | Fora do fluxo feed/composer |
| Builder | `/criar` | Isolado (framer-motion) |

**Nunca misturar** stacks de `/criar` com landings sociais/business.

---

## Evolução permitida vs proibida

Ver [`GOVERNANCE.md`](GOVERNANCE.md) e [`docs/audit/EVOLUTION_RULES.md`](../audit/EVOLUTION_RULES.md).

Resumo: copy, keywords, metadados → evoluível. Timings, z-index, composerMode, morph → **congelado**.
