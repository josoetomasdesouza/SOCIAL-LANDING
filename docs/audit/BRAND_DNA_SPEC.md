# BRAND DNA SPEC — Social Landing

**Implementação:** `lib/brand-dna/`  
**Fase:** Foundation only — sem IA adaptativa

---

## Objetivo

Declarar identidade de marca de forma **tipada, protegida e derivável** para futura IA contextual e Rule Engine — sem alterar runtime Tier 1.

---

## Modelo `BrandDNA`

```typescript
interface BrandDNA {
  brandId: string
  brandName: string
  version: number
  colors: BrandColorDNA
  typography?: BrandTypographyDNA
  voice: BrandVoiceDNA
  behavior: BrandBehaviorDNA
  updatedAt?: string
}
```

### Voice

| Campo | Valores |
|-------|---------|
| `tone` | warm, premium, playful, institutional, minimal, bold, editorial |
| `intensity` | subtle, balanced, expressive |
| `formality` | informal, neutral, formal |
| `language` | ISO locale (default pt-BR) |

### Behavior

| Campo | Valores |
|-------|---------|
| `ctaStyle` | conversational, direct, soft, premium-minimal |
| `visualStyle` | social-native, editorial, commerce-soft, institutional-lite |
| `aiProfile` | concise, helpful, consultative, sales-assist |
| `preferConversationFirst` | boolean |
| `allowAggressivePromo` | boolean (default false) |

---

## Campos protegidos

```typescript
BRAND_DNA_PROTECTED_FIELDS = ["colors.composerSurface"]
```

`colors.composerSurface` defaults to `rgba(45,50,58,0.96)` — alinhado a `COMPOSER_SURFACE_COLOR` congelado.

Rule Engine **bloqueia** mutações nesses campos via propostas IA.

---

## API

| Função | Propósito |
|--------|-----------|
| `createDefaultBrandDNA()` | Baseline por brandId/name |
| `parseBrandDNAInput()` | Normaliza input parcial (extract-brand future) |
| `createBrandDNASnapshot()` | Read-only frozen copy |
| `deriveBrandSignals()` | Sinais declarativos para Goal/AI future |
| `brandSignalsToRecord()` | Map flat para prompts |

---

## Sinais derivados

Exemplos:

- `voice.tone` (high)
- `behavior.preferConversationFirst` (high)
- `colors.primary` (high)
- `risk.aggressivePromo` (high, se allowAggressivePromo)

**Sinais não executam comportamento** — apenas descrevem.

---

## Integração futura

```
extract-brand / editor → parseBrandDNAInput → Rule Engine → publish snapshot
                                                      ↓
                                              Brand DNA imutável (L1)
```

---

## Proibições (esta fase)

- IA mutando DNA automaticamente
- DNA alterando composer runtime
- DNA substituindo tokens CSS Tier 1
