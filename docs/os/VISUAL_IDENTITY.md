# Identidade Visual — Social Landing

**Autoridade:** Este documento  
**Extensão:** [`docs/ai-handoffs/VISUAL_LANGUAGE.md`](../ai-handoffs/VISUAL_LANGUAGE.md), [`docs/audit/BRAND_DNA_SPEC.md`](../audit/BRAND_DNA_SPEC.md)

---

## Postura visual

Social-first, conversacional, contínuo, atmosférico. **Nunca** institucional, dashboard ou ecommerce clássico.

---

## Contratos perceptivos (não regredir)

- Continuidade do feed
- Sensação social-first e conversacional
- Profundidade atmosférica sutil
- Integração natural feed ↔ stories ↔ composer
- Ausência de modal tradicional
- Contenção visual — sofisticação invisível

---

## Proibições visuais

| Evitar | Por quê |
|--------|---------|
| Excesso de glassmorphism | Ostentação |
| Sombras agressivas | Quebra leveza |
| Gradientes fortes | Compete com conteúdo |
| Múltiplas superfícies desnecessárias | Fragmentação |
| Divisorias artificiais | Dashboard feel |
| Cards estilo catálogo ecommerce | Anti social-first |

---

## Constantes congeladas

| Token / valor | Domínio |
|---------------|---------|
| `COMPOSER_SURFACE_COLOR` | Identidade base do composer |
| Z-index hierarchy | Layering seguro |
| Timings morph 480ms | Assinatura motion |
| Long-press 420ms | Gestual calibrado |
| Transições drawer 300ms | Ritmo consistente |

---

## Feed visual

- Coluna central contida (`max-w-lg` → `max-w-[600px]`)
- Fluxo vertical contínuo
- Spacing para respiração sem blocos desconectados
- Seções reconhecíveis sem parecer módulos de dashboard

---

## Brand DNA

Identidade declarativa em `lib/brand-dna/` — read-only em runtime público. Cores/logo primários da marca são protegidos; evolução de copy é permitida com guardrails.
